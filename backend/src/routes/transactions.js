const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/transactions
router.get('/', async (req, res) => {
  try {
    const { month, year, type, category, page = 1, limit = 50 } = req.query;
    const filter = { user: req.user._id };

    if (month && year) {
      filter.date = {
        $gte: new Date(year, month - 1, 1),
        $lte: new Date(year, month, 0, 23, 59, 59),
      };
    } else if (year) {
      filter.date = {
        $gte: new Date(year, 0, 1),
        $lte: new Date(year, 11, 31, 23, 59, 59),
      };
    }

    if (type) filter.type = type;
    if (category) filter.category = category;

    const total = await Transaction.countDocuments(filter);
    const transactions = await Transaction.find(filter)
      .sort({ date: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({ transactions, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch {
    res.status(500).json({ message: 'Erro ao obter transações' });
  }
});

// GET /api/transactions/summary
router.get('/summary', async (req, res) => {
  try {
    const { month, year } = req.query;
    const filter = { user: req.user._id };

    if (month && year) {
      filter.date = {
        $gte: new Date(year, month - 1, 1),
        $lte: new Date(year, month, 0, 23, 59, 59),
      };
    }

    const summary = await Transaction.aggregate([
      { $match: filter },
      { $group: { _id: '$type', total: { $sum: '$value' }, count: { $sum: 1 } } },
    ]);

    const result = { income: 0, expense: 0, incomeCount: 0, expenseCount: 0 };
    summary.forEach(s => {
      if (s._id === 'income') { result.income = s.total; result.incomeCount = s.count; }
      else { result.expense = s.total; result.expenseCount = s.count; }
    });
    result.balance = result.income - result.expense;

    const categoryBreakdown = await Transaction.aggregate([
      { $match: { ...filter, type: 'expense' } },
      { $group: { _id: '$category', total: { $sum: '$value' } } },
      { $sort: { total: -1 } },
    ]);

    res.json({ ...result, categoryBreakdown });
  } catch {
    res.status(500).json({ message: 'Erro ao obter resumo' });
  }
});

// GET /api/transactions/annual
router.get('/annual', async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    const data = await Transaction.aggregate([
      { $match: { user: req.user._id, date: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: { month: { $month: '$date' }, type: '$type' }, total: { $sum: '$value' } } },
      { $sort: { '_id.month': 1 } },
    ]);

    const months = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      income: 0,
      expense: 0,
      balance: 0,
    }));

    data.forEach(d => {
      const m = months[d._id.month - 1];
      if (d._id.type === 'income') m.income = d.total;
      else m.expense = d.total;
      m.balance = m.income - m.expense;
    });

    res.json({ year: parseInt(year), months });
  } catch {
    res.status(500).json({ message: 'Erro ao obter dados anuais' });
  }
});

// POST /api/transactions
router.post('/', [
  body('value').isFloat({ min: 0.01 }).withMessage('Valor deve ser maior que 0'),
  body('date').isISO8601().withMessage('Data inválida'),
  body('category').trim().notEmpty().withMessage('Categoria é obrigatória'),
  body('type').isIn(['income', 'expense']).withMessage('Tipo inválido'),
  body('description').optional().trim().isLength({ max: 500 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    const { value, date, category, description, type } = req.body;
    const transaction = await Transaction.create({ user: req.user._id, value, date, category, description, type });
    res.status(201).json({ transaction });
  } catch {
    res.status(500).json({ message: 'Erro ao criar transação' });
  }
});

// PUT /api/transactions/:id
router.put('/:id', [
  body('value').optional().isFloat({ min: 0.01 }),
  body('date').optional().isISO8601(),
  body('category').optional().trim().notEmpty(),
  body('type').optional().isIn(['income', 'expense']),
  body('description').optional().trim().isLength({ max: 500 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!transaction) return res.status(404).json({ message: 'Transação não encontrada' });
    res.json({ transaction });
  } catch {
    res.status(500).json({ message: 'Erro ao atualizar transação' });
  }
});

// DELETE /api/transactions/:id
router.delete('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!transaction) return res.status(404).json({ message: 'Transação não encontrada' });
    res.json({ message: 'Transação eliminada' });
  } catch {
    res.status(500).json({ message: 'Erro ao eliminar transação' });
  }
});

module.exports = router;
