const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const pool = require('../config/db');
require('dotenv').config();

const router = express.Router();

const PASSWORD_RULES_MSG =
  'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.';

const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

// -------------------- SIGNUP --------------------
router.post(
  '/signup',
  [
    body('name').trim().notEmpty().withMessage('Name is required.'),
    body('email').trim().isEmail().withMessage('A valid email address is required.'),
    body('regNumber').optional({ checkFalsy: true }).trim(),
    body('password')
      .matches(strongPasswordRegex)
      .withMessage(PASSWORD_RULES_MSG)
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
    }

    const { name, email, password, regNumber } = req.body;

    try {
      const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [
        email.toLowerCase()
      ]);
      if (existing.length > 0) {
        return res.status(409).json({ message: 'An account with this email already exists.' });
      }

      const passwordHash = await bcrypt.hash(password, 12);

      const [result] = await pool.query(
        'INSERT INTO users (name, reg_number, email, password_hash) VALUES (?, ?, ?, ?)',
        [name, regNumber || null, email.toLowerCase(), passwordHash]
      );

      const token = jwt.sign(
        { id: result.insertId, email: email.toLowerCase() },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      return res.status(201).json({
        message: 'Account created successfully.',
        token,
        user: { id: result.insertId, name, email: email.toLowerCase(), regNumber: regNumber || null }
      });
    } catch (err) {
      console.error('Signup error:', err);
      return res.status(500).json({ message: 'Server error during signup.' });
    }
  }
);

// -------------------- LOGIN --------------------
router.post(
  '/login',
  [
    body('email').trim().isEmail().withMessage('A valid email address is required.'),
    body('password').notEmpty().withMessage('Password is required.')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { email, password } = req.body;

    try {
      const [rows] = await pool.query(
        'SELECT id, name, reg_number, email, password_hash FROM users WHERE email = ?',
        [email.toLowerCase()]
      );

      if (rows.length === 0) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }

      const user = rows[0];
      const isMatch = await bcrypt.compare(password, user.password_hash);

      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }

      const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      });

      return res.json({
        message: 'Login successful.',
        token,
        user: { id: user.id, name: user.name, email: user.email, regNumber: user.reg_number }
      });
    } catch (err) {
      console.error('Login error:', err);
      return res.status(500).json({ message: 'Server error during login.' });
    }
  }
);

module.exports = router;
