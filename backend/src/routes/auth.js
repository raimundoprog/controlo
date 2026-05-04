const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Category = require('../models/Category');
const authMiddleware = require('../middleware/auth');

const DEFAULT_CATEGORIES = [
  { name: 'Rendas', color: '#ef4444', icon: 'home', isDefault: true },
  { name: 'Subscrições', color: '#8b5cf6', icon: 'repeat', isDefault: true },
  { name: 'Dentista', color: '#06b6d4', icon: 'heart-pulse', isDefault: true },
  { name: 'Médico', color: '#10b981', icon: 'stethoscope', isDefault: true },
  { name: 'Comida', color: '#f59e0b', icon: 'utensils', isDefault: true },
  { name: 'Transporte', color: '#3b82f6', icon: 'car', isDefault: true },
  { name: 'Lazer', color: '#ec4899', icon: 'music', isDefault: true },
  { name: 'Outros', color: '#6b7280', icon: 'tag', isDefault: true },
  { name: 'Salário', color: '#22c55e', icon: 'briefcase', isDefault: true },
  { name: 'Rendimentos Extra', color: '#84cc16', icon: 'trending-up', isDefault: true },
];

const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// POST /api/auth/register
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Nome é obrigatório').isLength({ max: 50 }),
  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('A password deve ter pelo menos 6 caracteres'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    const { name, email, password } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ message: 'Email já registado' });

    const user = await User.create({ name, email, password });

    // Create default categories — if this fails, remove the user so the email can be reused
    try {
      const categories = DEFAULT_CATEGORIES.map(c => ({ ...c, user: user._id }));
      await Category.insertMany(categories);
    } catch (catErr) {
      console.error('[register] categories failed, rolling back user:', catErr);
      await User.deleteOne({ _id: user._id });
      return res.status(500).json({ message: 'Erro ao criar categorias. Tente novamente.', detail: catErr.message });
    }

    const token = generateToken(user._id);
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('[register]', err);
    res.status(500).json({ message: 'Erro ao registar utilizador', detail: err.message });
  }
});

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
  body('password').notEmpty().withMessage('Password é obrigatória'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Email ou password incorretos' });
    }

    const token = generateToken(user._id);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('[login]', err);
    res.status(500).json({ message: 'Erro ao fazer login', detail: err.message });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: { id: req.user._id, name: req.user.name, email: req.user.email } });
});

module.exports = router;
