const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 4000;
const DB_PATH = path.join(__dirname, 'data', 'db.json');
const DEMO_OTP = '1234';

app.use(cors());
app.use(express.json());

function readDB() {
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw);
}
function writeDB(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

app.get('/', (req, res) => {
  res.json({ ok: true, service: 'kaamsathi-backend', message: 'Server chal raha hai' });
});

app.post('/api/auth/send-otp', (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'phone required' });
  const db = readDB();
  db.otps[phone] = DEMO_OTP;
  writeDB(db);
  res.json({ success: true, message: `OTP bheja gaya ${phone} par (demo OTP: ${DEMO_OTP})` });
});

app.post('/api/auth/verify-otp', (req, res) => {
  const { phone, code } = req.body;
  if (!phone || !code) return res.status(400).json({ error: 'phone aur code required' });
  const db = readDB();
  const expected = db.otps[phone];
  if (!expected || expected !== code) {
    return res.status(401).json({ error: 'Galat ya expired OTP' });
  }
  delete db.otps[phone];
  writeDB(db);
  const token = `demo-token-${uuidv4()}`;
  res.json({ success: true, token, phone });
});

app.post('/api/labour', (req, res) => {
  const db = readDB();
  const profile = {
    id: uuidv4(),
    name: req.body.name || '',
    age: req.body.age || '',
    area: req.body.area || '',
    qual: req.body.qual || '',
    exp: req.body.exp || '',
    skill: req.body.skill || '',
    wage: req.body.wage || 0,
    isStudent: !!req.body.isStudent,
    plan: null,
    createdAt: new Date().toISOString()
  };
  db.labour.push(profile);
  writeDB(db);
  res.status(201).json(profile);
});

app.get('/api/labour', (req, res) => {
  const db = readDB();
  let results = db.labour;
  if (req.query.skill) {
    results = results.filter(l => l.skill === req.query.skill);
  }
  res.json(results);
});

app.get('/api/labour/:id', (req, res) => {
  const db = readDB();
  const profile = db.labour.find(l => l.id === req.params.id);
  if (!profile) return res.status(404).json({ error: 'Labour profile nahi mila' });
  res.json(profile);
});

app.post('/api/labour/:id/activate-plan', (req, res) => {
  const { plan } = req.body;
  const validPlans = ['week', 'month', 'year'];
  if (!validPlans.includes(plan)) {
    return res.status(400).json({ error: 'plan valid nahi hai (week/month/year)' });
  }
  const db = readDB();
  const profile = db.labour.find(l => l.id === req.params.id);
  if (!profile) return res.status(404).json({ error: 'Labour profile nahi mila' });
  profile.plan = { type: plan, activatedAt: new Date().toISOString() };
  writeDB(db);
  res.json(profile);
});

app.post('/api/business', (req, res) => {
  const db = readDB();
  const profile = {
    id: uuidv4(),
    name: req.body.name || '',
    area: req.body.area || '',
    businessType: req.body.businessType || '',
    createdAt: new Date().toISOString()
  };
  db.business.push(profile);
  writeDB(db);
  res.status(201).json(profile);
});

app.get('/api/business/:id', (req, res) => {
  const db = readDB();
  const profile = db.business.find(b => b.id === req.params.id);
  if (!profile) return res.status(404).json({ error: 'Business profile nahi mila' });
  res.json(profile);
});

app.post('/api/contacts', (req, res) => {
  const { businessId, labourId, action } = req.body;
  if (!businessId || !labourId || !['contact', 'skip'].includes(action)) {
    return res.status(400).json({ error: 'businessId, labourId, action (contact/skip) required' });
  }
  const db = readDB();
  const record = {
    id: uuidv4(),
    businessId,
    labourId,
    action,
    createdAt: new Date().toISOString()
  };
  db.contacts.push(record);
  writeDB(db);
  res.status(201).json(record);
});

app.get('/api/skills', (req, res) => {
  const db = readDB();
  res.json(db.skills);
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route nahi mila' });
});

app.listen(PORT, () => {
  console.log(`KaamSathi backend chal raha hai: http://localhost:${PORT}`);
});
