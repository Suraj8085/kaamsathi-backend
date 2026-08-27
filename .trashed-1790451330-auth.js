const express = require('express');
const router = express.Router();
const { load, save } = require('../db');

// POST /api/auth/send-otp   { phone }
router.post('/send-otp', (req, res) => {
  const { phone } = req.body;
  if (!phone || phone.length !== 10) {
    return res.status(400).json({ ok: false, error: 'Valid 10-digit phone number required' });
  }
  const db = load();
  // Demo mode: OTP is always 1234 so the app is testable without an SMS provider.
  // Replace this with a real SMS gateway (MSG91, Twilio, etc.) before going live.
  const code = '1234';
  db.otps[phone] = { code, expiresAt: Date.now() + 5 * 60 * 1000 };
  save(db);
  res.json({ ok: true, message: 'OTP sent', demoOtp: code });
});

// POST /api/auth/verify-otp   { phone, code }
router.post('/verify-otp', (req, res) => {
  const { phone, code } = req.body;
  const db = load();
  const record = db.otps[phone];
  if (!record) return res.status(400).json({ ok: false, error: 'Send OTP first' });
  if (Date.now() > record.expiresAt) return res.status(400).json({ ok: false, error: 'OTP expired' });
  if (record.code !== code) return res.status(400).json({ ok: false, error: 'Incorrect OTP' });

  delete db.otps[phone];
  save(db);
  // In production, issue a real JWT/session token here.
  res.json({ ok: true, token: `demo-token-${phone}` });
});

module.exports = router;
