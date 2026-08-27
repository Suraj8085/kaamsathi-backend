const express = require('express');
const router = express.Router();
const { load, save } = require('../db');

// POST /api/contacts  { businessId, labourId, action: "contact" | "skip" }
router.post('/', (req, res) => {
  const { businessId, labourId, action } = req.body;
  if (!businessId || !labourId || !['contact', 'skip'].includes(action)) {
    return res.status(400).json({ ok: false, error: 'businessId, labourId and action (contact|skip) are required' });
  }
  const db = load();
  const business = db.businesses.find(b => b.id === businessId);
  const labourer = db.labourers.find(l => l.id === labourId);
  if (!business || !labourer) {
    return res.status(404).json({ ok: false, error: 'businessId or labourId not found' });
  }

  if (action === 'contact') {
    if (business.freeHiresLeft > 0) business.freeHiresLeft -= 1;
    db.contacts.push({
      id: 'C' + Date.now(), businessId, labourId, createdAt: new Date().toISOString()
    });
  }
  save(db);
  res.json({ ok: true, freeHiresLeft: business.freeHiresLeft, labourerPhone: action === 'contact' ? labourer.phone : null });
});

module.exports = router;
