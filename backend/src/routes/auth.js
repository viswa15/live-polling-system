// src/routes/auth.js
import express from 'express';
import passport from 'passport';
import User from '../models/User.js';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new teacher
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }
  try {
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }
    user = new User({ username, password });
    await user.save();
    res.status(201).json({ msg: 'Registration successful. Please log in.' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/auth/login
// @desc    Login a teacher
router.post('/login', passport.authenticate('local'), (req, res) => {
  res.json({ id: req.user.id, username: req.user.username });
});

// @route   GET /api/auth/status
// @desc    Check if user is authenticated
router.get('/status', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ isAuthenticated: true, user: { id: req.user.id, username: req.user.username } });
  } else {
    res.json({ isAuthenticated: false, user: null });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout a teacher
router.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.json({ msg: 'Logout successful' });
  });
});

export default router;