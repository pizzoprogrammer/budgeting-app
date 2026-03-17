
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const adminRoutes = require('./routes/admin');
const budgetRoutes = require('./routes/budget');
const savingsGoalsRoutes = require('./routes/savingsgoals');

const app = express();
app.use(cors());
app.use(express.json());

// Trim trailing whitespace/newline from request URL (helps when clients include newline in the URL)
app.use((req, _res, next) => {
  if (typeof req.url === 'string') {
    req.url = req.url.replace(/[\s\u0000]+$/g, '');
  }
  next();
});

// Simple request logger to help diagnose 404s
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - body: ${JSON.stringify(req.body)}`);
  next();
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err));


app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/savingsgoals', savingsGoalsRoutes);

app.get("/", (_req, res) => {
  res.send("API is running");
});


app.listen(5000, () => console.log('Server running on port 5000'));