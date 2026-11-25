const db = require('../config/db');
const { triggerTranslate } = require('../utils/triggerTranslate');

// POST /api/cases
const createCase = async (req, res) => {
  try {
    const { title, type, description, district, court } = req.body;

    const { rows } = await db.query(
      `INSERT INTO cases (citizen_id, title, type, description, district, court)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [req.user.id, title, type, description, district, court]
    );

    // Auto-trigger translation for new case record
    triggerTranslate(req.body);

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('createCase error:', error);
    res.status(500).json({ message: error.message });
  }
};

// GET /api/cases/my
const getMyCases = async (req, res) => {
  try {
    const sql = `
      SELECT 
        c.*,
        json_build_object('id', u.id, 'name', u.name, 'email', u.email) AS lawyer
      FROM cases c
      LEFT JOIN users u ON c.lawyer_id = u.id
      WHERE c.citizen_id = $1
      ORDER BY c.created_at DESC
    `;
    const { rows } = await db.query(sql, [req.user.id]);
    res.json(rows);
  } catch (error) {
    console.error('getMyCases error:', error);
    res.status(500).json({ message: error.message });
  }
};

// GET /api/cases/:id
const getCaseById = async (req, res) => {
  try {
    const sql = `
      SELECT 
        c.*,
        json_build_object('id', cu.id, 'name', cu.name, 'email', cu.email, 'phone', cu.phone) AS citizen,
        json_build_object('id', lu.id, 'name', lu.name, 'email', lu.email) AS lawyer
      FROM cases c
      LEFT JOIN users cu ON c.citizen_id = cu.id
      LEFT JOIN users lu ON c.lawyer_id = lu.id
      WHERE c.id = $1
    `;
    const { rows } = await db.query(sql, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Case not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('getCaseById error:', error);
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/cases/:id/status
const updateCaseStatus = async (req, res) => {
  try {
    const { status, hearing_date, notes } = req.body;

    const { rows } = await db.query(
      `UPDATE cases
       SET status = COALESCE($1, status),
           hearing_date = COALESCE($2, hearing_date),
           notes = COALESCE($3, notes)
       WHERE id = $4
       RETURNING *`,
      [status, hearing_date, notes, req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Case not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('updateCaseStatus error:', error);
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/cases/:id/assign
const assignLawyer = async (req, res) => {
  try {
    const { lawyerId } = req.body;

    const { rows } = await db.query(
      `UPDATE cases
       SET lawyer_id = $1, status = 'active'
       WHERE id = $2
       RETURNING *`,
      [lawyerId, req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Case not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('assignLawyer error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createCase, getMyCases, getCaseById, updateCaseStatus, assignLawyer };
