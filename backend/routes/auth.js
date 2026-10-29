const router = require('express').Router();
const bcrypt = require('bcryptjs'), jwt = require('jsonwebtoken');
const { User } = require('../models');
const { auth, wrap } = require('../middleware');
const sign = u => jwt.sign({ id: String(u._id), role: u.role, name: u.name }, process.env.JWT_SECRET, { expiresIn: '7d' });
const out = u => ({ id: u._id, name: u.name, email: u.email, role: u.role, language: u.language });

router.post('/register', wrap(async (req, res) => {
  const { name, email, password, language } = req.body;
  if (!name || !/^\S+@\S+\.\S+$/.test(email || '') || (password || '').length < 6) return res.status(400).json({ message: 'Name, valid email and 6+ character password required' });
  const u = await User.create({ name, email, language, password: await bcrypt.hash(password, 10), role: 'farmer' });
  res.status(201).json({ token: sign(u), user: out(u) });
}));
router.post('/login', wrap(async (req, res) => {
  const u = await User.findOne({ email: (req.body.email || '').toLowerCase() });
  if (!u || !(await bcrypt.compare(req.body.password || '', u.password))) return res.status(401).json({ message: 'Wrong email or password' });
  res.json({ token: sign(u), user: out(u) });
}));
router.get('/me', auth, wrap(async (req, res) => res.json(out(await User.findById(req.user.id)))));
module.exports = router;
