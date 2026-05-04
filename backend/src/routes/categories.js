const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Category = require('../models/Category');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/categories
router.get('/', async (req, res) => {
  try {
    // Return unique categories by name across all users
    const categories = await Category.aggregate([
      { $sort: { isDefault: -1, name: 1 } },
      { $group: { _id: '$name', doc: { $first: '$$ROOT' } } },
      { $replaceRoot: { newRoot: '$doc' } },
      { $sort: { isDefault: -1, name: 1 } },
    ]);
    res.json({ categories });
  } catch {
    res.status(500).json({ message: 'Erro ao obter categorias' });
  }
});

// POST /api/categories
router.post('/', [
  body('name').trim().notEmpty().withMessage('Nome é obrigatório').isLength({ max: 50 }),
  body('color').optional().matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).withMessage('Cor inválida'),
  body('icon').optional().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    const { name, color, icon } = req.body;
    if (await Category.findOne({ user: req.user._id, name })) {
      return res.status(400).json({ message: 'Categoria já existe' });
    }

    const category = await Category.create({
      user: req.user._id,
      name,
      color: color || '#6366f1',
      icon: icon || 'tag',
      isDefault: false,
    });
    res.status(201).json({ category });
  } catch {
    res.status(500).json({ message: 'Erro ao criar categoria' });
  }
});

// DELETE /api/categories/:id
router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id });
    if (!category) return res.status(404).json({ message: 'Categoria não encontrada' });
    if (category.isDefault) return res.status(400).json({ message: 'Não é possível eliminar categorias padrão' });
    await Category.deleteOne({ _id: req.params.id });
    res.json({ message: 'Categoria eliminada' });
  } catch {
    res.status(500).json({ message: 'Erro ao eliminar categoria' });
  }
});

module.exports = router;
