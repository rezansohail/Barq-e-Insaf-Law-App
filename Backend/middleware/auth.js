const jwt = require('jsonwebtoken');
const db = require('../config/db');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET);

      // 0. Check Admin role
      if (decoded.role === 'admin') {
        const adminRes = await db.query(
          'SELECT id, full_name AS name, email, role, district, phone, user_id FROM admins WHERE id = $1 OR user_id = $1',
          [decoded.id]
        );
        if (adminRes.rows.length > 0) {
          req.user = { ...adminRes.rows[0], role: 'admin' };
          return next();
        }
      }

      // 1. Check Media Partner role
      if (decoded.role === 'media') {
        const mediaRes = await db.query(
          'SELECT id, full_name AS name, channel_name, email, role, district, phone FROM media WHERE id = $1',
          [decoded.id]
        );
        if (mediaRes.rows.length > 0) {
          req.user = { ...mediaRes.rows[0], role: 'media' };
          return next();
        }
      }

      // 2. Check NGO role
      if (decoded.role === 'ngo') {
        const ngoRes = await db.query(
          'SELECT id, full_name AS name, email, role, district, phone FROM ngos WHERE id = $1',
          [decoded.id]
        );
        if (ngoRes.rows.length > 0) {
          req.user = { ...ngoRes.rows[0], role: 'ngo' };
          return next();
        }
      }

      // 3. Check Users table by decoded.userId or decoded.id
      const targetId = decoded.userId || decoded.id;
      let result = await db.query(
        'SELECT id, name, email, role, district, phone FROM users WHERE id = $1',
        [targetId]
      );

      if (result.rows.length === 0) {
        result = await db.query(
          'SELECT id, name, email, role, district, phone FROM users WHERE id = $1',
          [decoded.id]
        );
      }

      if (result.rows.length === 0) {
        if (decoded.role) {
          req.user = { id: decoded.id, role: decoded.role, email: decoded.email };
          return next();
        }
        return res.status(401).json({ message: 'User not found' });
      }

      req.user = result.rows[0];
      if (decoded.role && req.user.role !== decoded.role) {
        req.user.role = decoded.role;
      }
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. ${req.user.role} cannot access this.`,
      });
    }
    next();
  };
};

const optionalProtect = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET);

      if (decoded.role === 'media') {
        const mediaRes = await db.query(
          'SELECT id, full_name AS name, channel_name, email, role, district, phone FROM media WHERE id = $1',
          [decoded.id]
        );
        if (mediaRes.rows.length > 0) {
          req.user = { ...mediaRes.rows[0], role: 'media' };
          return next();
        }
      }

      if (decoded.role === 'ngo') {
        const ngoRes = await db.query(
          'SELECT id, full_name AS name, email, role, district, phone FROM ngos WHERE id = $1',
          [decoded.id]
        );
        if (ngoRes.rows.length > 0) {
          req.user = { ...ngoRes.rows[0], role: 'ngo' };
          return next();
        }
      }

      req.user = { id: decoded.id || 3, role: decoded.role || 'ngo', email: decoded.email };
    } catch (_) {
      // Continue even if token fails verification in optional mode
    }
  }
  next();
};

module.exports = { protect, allowRoles, optionalProtect };
