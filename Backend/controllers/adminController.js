const db = require('../config/db');
const RegisterAdminDTO = require('../dto/RegisterAdminDTO');
const LoginAdminDTO = require('../dto/LoginAdminDTO');
const adminAuthService = require('../services/adminAuthServiceImpl');

/**
 * Controller for Admin Endpoints
 * Bridges HTTP layer with Business Logic Service layer
 */

// POST /api/admin/register
const registerAdmin = async (req, res) => {
  try {
    const dto = new RegisterAdminDTO(req.body);
    const result = await adminAuthService.registerAdmin(dto);
    return res.status(201).json({
      success: true,
      ...result,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
      errors: error.errors || null,
    });
  }
};

// POST /api/admin/login
const loginAdmin = async (req, res) => {
  try {
    const dto = new LoginAdminDTO(req.body);
    const result = await adminAuthService.loginAdmin(dto);
    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
      errors: error.errors || null,
    });
  }
};

// GET /api/admin/me
const getAdminMe = async (req, res) => {
  try {
    const admin = await adminAuthService.getAdminById(req.user.id);
    return res.status(200).json({
      success: true,
      admin,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const [usersRes, lawyersRes, casesRes, flaggedRes, pendingRes] = await Promise.all([
      db.query('SELECT COUNT(*)::int AS count FROM users'),
      db.query('SELECT COUNT(*)::int AS count FROM lawyers WHERE is_verified = TRUE'),
      db.query('SELECT COUNT(*)::int AS count FROM cases'),
      db.query('SELECT COUNT(*)::int AS count FROM cases WHERE is_flagged = TRUE'),
      db.query("SELECT COUNT(*)::int AS count FROM lawyers WHERE verification_status = 'pending'"),
    ]);

    res.json({
      totalUsers:     usersRes.rows[0].count,
      totalLawyers:   lawyersRes.rows[0].count,
      totalCases:     casesRes.rows[0].count,
      flaggedCases:   flaggedRes.rows[0].count,
      pendingLawyers: pendingRes.rows[0].count,
    });
  } catch (error) {
    console.error('getStats error:', error);
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/pending-lawyers
const getPendingLawyers = async (req, res) => {
  try {
    const sql = `
      SELECT 
        l.*,
        json_build_object('id', u.id, 'name', u.name, 'email', u.email, 'phone', u.phone) AS user
      FROM lawyers l
      LEFT JOIN users u ON l.user_id = u.id
      WHERE l.verification_status = 'pending'
    `;
    const { rows } = await db.query(sql);
    res.json(rows);
  } catch (error) {
    console.error('getPendingLawyers error:', error);
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/admin/lawyers/:id/verify
const verifyLawyer = async (req, res) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'

    const { rows } = await db.query(
      `UPDATE lawyers
       SET verification_status = $1,
           is_verified = ($1 = 'approved')
       WHERE id = $2
       RETURNING *`,
      [status, req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Lawyer not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('verifyLawyer error:', error);
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/flagged-cases
const getFlaggedCases = async (req, res) => {
  try {
    const sql = `
      SELECT 
        c.*,
        json_build_object('id', u.id, 'name', u.name, 'email', u.email) AS citizen
      FROM cases c
      LEFT JOIN users u ON c.citizen_id = u.id
      WHERE c.is_flagged = TRUE
    `;
    const { rows } = await db.query(sql);
    res.json(rows);
  } catch (error) {
    console.error('getFlaggedCases error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
  getAdminMe,
  getStats,
  getPendingLawyers,
  verifyLawyer,
  getFlaggedCases,
};
