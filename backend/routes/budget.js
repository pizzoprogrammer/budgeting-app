const express = require('express');
const Budget = require('../models/Budget');
const authMiddleware = require('../middleware/auth');
const router = express.Router();
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

// Add or update budget for a category
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { category, type, amount, currency, month, year } = req.body;

    if (!category || !type || !amount || !month || !year) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if budget already exists for this user + month + category
    let budget = await Budget.findOne({ userId: req.userId, category, type, month, year });

    if (budget) {
      budget.amount = amount; // Update amount
      if (currency) budget.currency = currency;
      await budget.save();
      return res.json({ message: 'Budget updated', budget });
    }

    // Create new budget
    const budgetData = { userId: req.userId, category, type, amount, month, year };
    if (currency) budgetData.currency = currency;
    budget = new Budget(budgetData);
    await budget.save();

    res.json({ message: 'Budget created', budget });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all budgets for a user for a month
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) return res.status(400).json({ error: 'Month and year required' });

    const budgets = await Budget.find({ userId: req.userId, month, year });
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: Check budget status for the month*****
// GET: Check monthly budget dashboard (income + expense)
 router.get('/status', authMiddleware, async (req, res) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) {
      return res.status(400).json({ error: 'Month and year required' });
    }

    const userObjectId = new mongoose.Types.ObjectId(req.userId);

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    const defaultExpenseCategories = ['food', 'rent', 'shopping', 'utilities', 'entertainment', 'transport', 'Others'];
    const defaultIncomeCategories = ['salary', 'wages', 'freelance', 'business', 'kindcheque', 'investments', 'gifts', 'others'];

    const budgets = await Budget.find({ userId: userObjectId, month, year });

    // EXPENSE aggregation
    const expenseTransactions = await Transaction.aggregate([
      {
        $match: {
          userId: userObjectId,   
          type: 'expense',
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" }
        }
      }
    ]);
    const expenseActualMap = {};
    expenseTransactions.forEach(item => {
    expenseActualMap[item._id] = item.total;
    });


    // INCOME aggregation
    const incomeTransactions = await Transaction.aggregate([
      {
        $match: {
          userId: userObjectId,   
          type: 'income',
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" }
        }
      }
]);
    const incomeActualMap = {};
    incomeTransactions.forEach(item => {
    incomeActualMap[item._id] = item.total;
});

   const expenseBudgetMap = {};
   const incomeBudgetMap = {};

   budgets.forEach(budget => {
   if (budget.type === 'expense') {
    expenseBudgetMap[budget.category] = budget.amount;
   } else if (budget.type === 'income') {
    incomeBudgetMap[budget.category] = budget.amount;
 }  
});
     //Map categories to budget vs actual
    const mapCategories = (categories, actualMap = {}, budgetMap = {}) => {
    return categories.map((category) => {
    const actual = actualMap[category] || 0;
    const budgeted = budgetMap[category] || 0;

    const remaining = budgeted - actual;

    return {
  category,
  budgeted,
  actual,
  remaining,
  percentageUsed: budgeted > 0 
    ? Math.round((actual / budgeted) * 100)
    : 0,
  overspent: actual > budgeted && budgeted > 0
 };

});
};

     
    const expenseStatus = mapCategories(
    defaultExpenseCategories,
    expenseActualMap,
    expenseBudgetMap
);

    const incomeStatus = mapCategories(
    defaultIncomeCategories,
    incomeActualMap,
    incomeBudgetMap
);


    const totalIncome = incomeStatus.reduce((acc, cur) => acc + cur.actual, 0);
    const totalExpense = expenseStatus.reduce((acc, cur) => acc + cur.actual, 0);

    res.json({
      month: Number(month),
      year: Number(year),
      totals: {
        totalIncome,
        totalExpense,
        savings: totalIncome - totalExpense
      },
      income: incomeStatus,
      expenses: expenseStatus
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// Delete a budget
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Budget.findByIdAndDelete(req.params.id);
    res.json({ message: 'Budget deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
