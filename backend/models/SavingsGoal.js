const mongoose = require('mongoose');

const SavingsGoalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true }, // e.g., "Emergency Fund", "Vacation"
  targetAmount: { type: Number, required: true },
  currentAmount: { type: Number, default: 0 },
  targetDate: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SavingsGoal', SavingsGoalSchema);
