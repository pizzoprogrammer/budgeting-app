const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, currency } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ 
      name, 
      email, 
      password: hashedPassword, 
      role: role || 'user', // defaults to user
      currency: currency || 'USD'
    });
    await user.save();
    res.json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    if (!req.body || !req.body.email || !req.body.password) {
      return res.status(400).json({ error: 'Missing required fields: email, password' });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    // Include role in JWT payload
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // return currency so client can use it
    res.json({ token, role: user.role, currency: user.currency, name: user.name, email: user.email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// fetch current user profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// update user preferences (currency, password, etc.)
router.patch('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const updates = {};
    
    // Update currency if provided
    if (req.body.currency) {
      updates.currency = req.body.currency;
    }

    // Update password only if oldPassword is provided and matches
    if (req.body.password) {
      if (!req.body.oldPassword) {
        return res.status(400).json({ error: 'Old password is required to change password' });
      }

      // Verify old password
      const isOldPasswordMatch = await bcrypt.compare(req.body.oldPassword, user.password);
      if (!isOldPasswordMatch) {
        return res.status(401).json({ error: 'Old password is incorrect' });
      }

      // New password and old password must be different
      if (req.body.password === req.body.oldPassword) {
        return res.status(400).json({ error: 'New password must be different from old password' });
      }

      updates.password = await bcrypt.hash(req.body.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(req.userId, updates, { new: true }).select('-password');
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;