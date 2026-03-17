const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },  // e.g., Food, Rent, Entertainment
  type: { type: String, enum: ['income', 'expense'], required: true },
  amount: { type: Number, required: true }, // Budget limit for the month
  currency: { type: String, default: 'USD' }, // store currency per budget
  month: { type: Number, required: true },  // 1-12
  year: { type: Number, required: true },   // e.g., 2026
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Budget', BudgetSchema);
