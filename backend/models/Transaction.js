// models/Transaction.js
const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  currency: { type: String, default: 'USD' }, // ISO currency code, e.g. USD, EUR
  date: { type: Date, default: Date.now },
  note: { type: String },
  recurring: { type: Boolean, default: false }
});

module.exports = mongoose.model('Transaction', TransactionSchema);