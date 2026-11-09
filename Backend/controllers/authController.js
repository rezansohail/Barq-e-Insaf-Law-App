const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET, { expiresIn: '30d' });
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role = 'citizen', phone, district, sbcNumber, specialty } = req.body;

    // Check if user exists
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user in PostgreSQL
    const userResult = await db.query(
      `INSERT INTO users (name, email, password, role, phone, district)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, role, phone, district`,
      [name, email, hashedPassword, role, phone, district]
    );

    const user = userResult.rows[0];

    // If lawyer, create lawyer profile
    if (role === 'lawyer') {
      if (!sbcNumber || !specialty) {
        return res.status(400).json({ message: 'SBC number and specialty required' });
      }
      await db.query(
        `INSERT INTO lawyers (user_id, name, email, phone, license_number, sbc_number, specialty, district, specialization, city)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $7, $8)`,
        [user.id, name, email, phone, sbcNumber, sbcNumber, specialty, district]
      );
    } else {
      // Create citizen record if not lawyer
      await db.query(
        `INSERT INTO citizens (full_name, email, phone, city)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (email) DO NOTHING`,
        [name, email, phone, district]
      );
    }

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user.id),
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user.id),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json(req.user);
};

module.exports = { register, login, getMe };
