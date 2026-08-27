const express = require('express');
const router = express.Router();
const { load, save } = require('../db');

// POST /api/business  - create a business profile
router.post('/', (req, res) => {
  const { shopName, ownerName, businessType, address, phone } = req.body;
  if (!shopName || !ownerName || !address) {
    return res.status(400).json({ ok: false, error: 'shopName, ownerName and address are required' });
  }
  const db = load();
  const profile = {
    id: 'B' + Date.now(),
    shopName, ownerName, businessType: businessType || 'Retail', address,
    phone: phone || null, freeHiresLeft: 2, createdAt: new Date().toISOString()
  };
  db.businesses.push(profile);
  save(db);
  res.status(201).json({ ok: true, profile });
});

// GET /api/business/:id
router.get('/:id', (req, res) => {
  const db = load();
  const profile = db.businesses.find(b => b.id === req.params.id);
  if (!profile) return res.status(404).json({ ok: false, error: 'Not found' });
  res.json({ ok: true, profile });
});

module.exports = router;
