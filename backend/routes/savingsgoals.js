const express = require('express');
const SavingsGoal = require('../models/SavingsGoal');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Create goal
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, targetAmount, targetDate } = req.body;
    if (!name || !targetAmount) {
      return res.status(400).json({ error: 'Name and target amount required' });
    }

    const goal = new SavingsGoal({
      userId: req.userId,
      name,
      targetAmount,
      targetDate
    });
    await goal.save();
    res.json(goal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all goals
router.get('/', authMiddleware, async (req, res) => {
  try {
    const goals = await SavingsGoal.find({ userId: req.userId });
    res.json(goals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update goal
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, targetAmount, currentAmount, targetDate } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (targetAmount) updates.targetAmount = targetAmount;
    if (currentAmount !== undefined) updates.currentAmount = currentAmount;
    if (targetDate) updates.targetDate = targetDate;

    const goal = await SavingsGoal.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    // Verify ownership
    if (!goal || goal.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json(goal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete goal
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const goal = await SavingsGoal.findByIdAndDelete(req.params.id);
    if (!goal || goal.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    res.json({ message: 'Goal deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
