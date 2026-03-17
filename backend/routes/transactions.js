const express = require('express');
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const router = express.Router();

// Add transaction (user only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { amount, category, type, currency } = req.body;
    if (amount === undefined || amount === null || !category || !type) {
      return res.status(400).json({ error: 'Amount, category and type are required' });
    }
    const txData = { userId: req.userId, amount, category, type };
    // allow a currency override, otherwise default defined by schema
    if (currency) txData.currency = currency;
    const transaction = new Transaction(txData);
    await transaction.save();
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all transactions
router.get('/', authMiddleware, async (req, res) => {
  const transactions = await Transaction.find({ userId: req.userId });
  res.json(transactions);
});


// Admin-only: view all transactions
router.get('/all', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.find().populate('userId', 'name email');
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});
// Monthly summary
router.get('/summary/monthly', authMiddleware, async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ error: 'Month and year are required' });
    }

    const userObjectId = new mongoose.Types.ObjectId(req.userId);

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1); // first day of next month

    const summary = await Transaction.aggregate([
      {
        $match: {
          userId: userObjectId,
          date: { $gte: start, $lt: end }
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' }
        }
      }
    ]);

    let income = 0;
    let expense = 0;

    summary.forEach(item => {
      if (item._id === 'income') income = item.total;
      if (item._id === 'expense') expense = item.total;
    });

    res.json({
      month: Number(month),
      year: Number(year),
      income,
      expense,
      savings: income - expense
    });

  } catch (err) {
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});


// Expense breakdown by category(expense only)
router.get('/summary/category/expense', authMiddleware, async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ error: 'Month and year are required' });
    }
    const userObjectId = new mongoose.Types.ObjectId(req.userId);

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    const breakdown = await Transaction.aggregate([
      {
        $match: {
          userId: userObjectId,
          type: 'expense',
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' }
        }
      }
    ]);

    res.json({
      month: Number(month),
      year: Number(year),
      breakdown
    });

  } catch (err) {
    res.status(500).json({ error: 'Failed to generate expense breakdown' });
  }
});

// Income breakdown by category (income)
router.get('/summary/category/income', authMiddleware, async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ error: 'Month and year are required' });
    }
    const userObjectId = new mongoose.Types.ObjectId(req.userId);

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    const breakdown = await Transaction.aggregate([
      {
        $match: {
          userId: userObjectId,
          type: 'income',
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' }
        }
      }
    ]);

    res.json({
      month: Number(month),
      year: Number(year),
      breakdown
    });

  } catch (err) {
    res.status(500).json({ error: 'Failed to generate income breakdown' });
  }
});



// Delete transaction
router.delete('/:id', authMiddleware, async (req, res) => {
  await Transaction.findByIdAndDelete(req.params.id);
  res.json({ message: 'Transaction deleted' });
});


module.exports = router;