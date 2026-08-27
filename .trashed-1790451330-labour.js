const express = require('express');
const router = express.Router();
const { load, save } = require('../db');

const VALID_SKILLS = [
  'Construction Labour', 'Dukaan Helper', 'Restaurant/Kitchen',
  'Loading-Unloading', 'Painter', 'Electrician', 'Cooking', 'House Cleaning'
];

// POST /api/labour  - create a labour profile
router.post('/', (req, res) => {
  const { name, age, gender, area, qualification, experience, skill, wage, isStudent, phone } = req.body;

  if (!name || !age || !area || !skill || !wage) {
    return res.status(400).json({ ok: false, error: 'name, age, area, skill and wage are required' });
  }
  if (!VALID_SKILLS.includes(skill)) {
    return res.status(400).json({ ok: false, error: `skill must be one of: ${VALID_SKILLS.join(', ')}` });
  }

  const db = load();
  const profile = {
    id: 'L' + Date.now(),
    name, age: Number(age), gender: gender || 'Other', area,
    qualification: qualification || null, experience: experience || null,
    skill, wage: Number(wage), isStudent: !!isStudent, phone: phone || null,
    verified: false, planActive: false, createdAt: new Date().toISOString()
  };
  db.labourers.push(profile);
  save(db);
  res.status(201).json({ ok: true, profile });
});

// GET /api/labour  - list profiles, e.g. for the business "swipe deck"
// optional query: ?skill=Painter
router.get('/', (req, res) => {
  const db = load();
  let results = db.labourers;
  if (req.query.skill) {
    results = results.filter(l => l.skill === req.query.skill);
  }
  res.json({ ok: true, count: results.length, results });
});

// GET /api/labour/:id
router.get('/:id', (req, res) => {
  const db = load();
  const profile = db.labourers.find(l => l.id === req.params.id);
  if (!profile) return res.status(404).json({ ok: false, error: 'Not found' });
  res.json({ ok: true, profile });
});

// POST /api/labour/:id/activate-plan  { plan: "week"|"month"|"year" }
router.post('/:id/activate-plan', (req, res) => {
  const db = load();
  const profile = db.labourers.find(l => l.id === req.params.id);
  if (!profile) return res.status(404).json({ ok: false, error: 'Not found' });
  profile.planActive = true;
  profile.plan = req.body.plan || 'month';
  profile.verified = true;
  save(db);
  res.json({ ok: true, profile });
});

module.exports = router;
