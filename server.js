const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 4000;
const DEMO_OTP = '1234';

// ---------- MongoDB connection ----------
// IMPORTANT: set this in Render's Environment Variables as MONGODB_URI
// (never hardcode real credentials directly in code you push to GitHub)
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB se connect ho gaya ✅'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use(cors());
app.use(express.json());

// ---------- Schemas ----------
const otpSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  code: String
});

const labourSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true },
  name: String,
  age: String,
  area: String,
  qual: String,
  exp: String,
  skill: String,
  wage: Number,
  isStudent: Boolean,
  phone: String,
  plan: {
    type: { type: String },
    activatedAt: String
  },
  createdAt: { type: String, default: () => new Date().toISOString() }
});

const businessSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true },
  name: String,
  area: String,
  businessType: String,
  ownerName: String,
  phone: String,
  createdAt: { type: String, default: () => new Date().toISOString() }
});

const contactSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true },
  businessId: String,
  labourId: String,
  action: String,
  createdAt: { type: String, default: () => new Date().toISOString() }
});

const Otp = mongoose.model('Otp', otpSchema);
const Labour = mongoose.model('Labour', labourSchema);
const Business = mongoose.model('Business', businessSchema);
const Contact = mongoose.model('Contact', contactSchema);

// Skills list — static, doesn't need to be in DB
const SKILLS = [
  { value: "construction", label: "Construction Labour", icon: "🧱" },
  { value: "painter", label: "Painter", icon: "🎨" },
  { value: "electrician", label: "Electrician", icon: "💡" },
  { value: "plumber", label: "Plumber", icon: "🔧" },
  { value: "carpenter", label: "Carpenter", icon: "🪚" },
  { value: "driver", label: "Driver", icon: "🚗" },
  { value: "cook", label: "Cook", icon: "🍳" },
  { value: "cleaner", label: "Cleaner", icon: "🧹" },
  { value: "security", label: "Security Guard", icon: "🛡️" },
  { value: "farmer", label: "Farm Labour", icon: "🌾" }
];

// ---------- health check ----------
app.get('/', (req, res) => {
  res.json({ ok: true, service: 'kaamsathi-backend', message: 'Server chal raha hai (MongoDB)' });
});

// ---------- AUTH ----------
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'phone required' });

    await Otp.findOneAndUpdate(
      { phone },
      { phone, code: DEMO_OTP },
      { upsert: true }
    );

    res.json({ success: true, message: `OTP bheja gaya ${phone} par (demo OTP: ${DEMO_OTP})` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { phone, code } = req.body;
    if (!phone || !code) return res.status(400).json({ error: 'phone aur code required' });

    const record = await Otp.findOne({ phone });
    if (!record || record.code !== code) {
      return res.status(401).json({ error: 'Galat ya expired OTP' });
    }

    await Otp.deleteOne({ phone });

    const token = `demo-token-${uuidv4()}`;
    res.json({ success: true, token, phone });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ---------- LABOUR PROFILES ----------
app.post('/api/labour', async (req, res) => {
  try {
    const profile = new Labour({
      name: req.body.name || '',
      age: req.body.age || '',
      area: req.body.area || '',
      qual: req.body.qual || '',
      exp: req.body.exp || '',
      skill: req.body.skill || '',
      wage: req.body.wage || 0,
      isStudent: !!req.body.isStudent,
      phone: req.body.phone || '',
      plan: null
    });
    await profile.save();
    res.status(201).json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/labour', async (req, res) => {
  try {
    const filter = req.query.skill ? { skill: req.query.skill } : {};
    const results = await Labour.find(filter).sort({ createdAt: -1 });
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/labour/:id', async (req, res) => {
  try {
    const profile = await Labour.findOne({ id: req.params.id });
    if (!profile) return res.status(404).json({ error: 'Labour profile nahi mila' });
    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/labour/:id/activate-plan', async (req, res) => {
  try {
    const { plan } = req.body;
    const validPlans = ['week', 'month', 'year'];
    if (!validPlans.includes(plan)) {
      return res.status(400).json({ error: 'plan valid nahi hai (week/month/year)' });
    }

    const profile = await Labour.findOneAndUpdate(
      { id: req.params.id },
      { plan: { type: plan, activatedAt: new Date().toISOString() } },
      { new: true }
    );
    if (!profile) return res.status(404).json({ error: 'Labour profile nahi mila' });
    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ---------- BUSINESS PROFILES ----------
app.post('/api/business', async (req, res) => {
  try {
    const profile = new Business({
      name: req.body.name || '',
      area: req.body.area || '',
      businessType: req.body.businessType || '',
      ownerName: req.body.ownerName || '',
      phone: req.body.phone || ''
    });
    await profile.save();
    res.status(201).json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/business/:id', async (req, res) => {
  try {
    const profile = await Business.findOne({ id: req.params.id });
    if (!profile) return res.status(404).json({ error: 'Business profile nahi mila' });
    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ---------- CONTACTS ----------
app.post('/api/contacts', async (req, res) => {
  try {
    const { businessId, labourId, action } = req.body;
    if (!businessId || !labourId || !['contact', 'skip'].includes(action)) {
      return res.status(400).json({ error: 'businessId, labourId, action (contact/skip) required' });
    }
    const record = new Contact({ businessId, labourId, action });
    await record.save();
    res.status(201).json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ---------- SKILLS ----------
app.get('/api/skills', (req, res) => {
  res.json(SKILLS);
});

// ---------- fallback 404 ----------
app.use((req, res) => {
  res.status(404).json({ error: 'Route nahi mila' });
});

app.listen(PORT, () => {
  console.log(`KaamSathi backend chal raha hai: http://localhost:${PORT}`);
});
