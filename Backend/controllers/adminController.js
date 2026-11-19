const db = require('../config/db');
const RegisterAdminDTO = require('../dto/RegisterAdminDTO');
const LoginAdminDTO = require('../dto/LoginAdminDTO');
const adminAuthService = require('../services/adminAuthServiceImpl');
const adminService = require('../services/adminService');

/**
 * Controller for Admin Endpoints
 * Bridges HTTP layer with Admin Business Logic Service layer
 */

// ---------------- AUTHENTICATION ---------------- //

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
    
    // Log successful admin login
    await adminService.logAudit({
      adminId: result.admin.id,
      adminName: result.admin.fullName,
      action: 'ADMIN_LOGIN',
      entityType: 'auth',
      entityId: result.admin.id,
      entityName: result.admin.fullName,
      description: `Administrator ${result.admin.fullName} logged in successfully.`,
      severity: 'info',
      ipAddress: req.ip || req.connection.remoteAddress,
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Error in loginAdmin:', error.message);
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

// ---------------- ECOSYSTEM STATS ---------------- //

// GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const stats = await adminService.getEcosystemStats();
    return res.status(200).json({
      success: true,
      // Comprehensive ecosystem summary (for new dashboard cards)
      ...stats,
      // Backwards-compatibility fields for legacy dashboard hooks
      totalUsers: stats.citizens.total,
      totalLawyers: stats.lawyers.total,
      totalCases: stats.cases.total,
      flaggedCases: 0,
      pendingLawyers: 0,
    });
  } catch (error) {
    console.error('getStats error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------- CITIZEN MANAGEMENT ---------------- //

// GET /api/admin/citizens
const getCitizens = async (req, res) => {
  try {
    const result = await adminService.getCitizens({
      search: req.query.search,
      status: req.query.status,
      district: req.query.district,
      page: req.query.page,
      limit: req.query.limit,
    });
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error('getCitizens error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/citizens/:id
const getCitizenById = async (req, res) => {
  try {
    const citizen = await adminService.getCitizenById(req.params.id);
    return res.status(200).json({ success: true, citizen });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: error.message });
  }
};

// PUT /api/admin/citizens/:id/status
const updateCitizenStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;
    const adminId = req.user ? req.user.id : null;
    const adminName = req.user ? req.user.name || req.user.full_name : 'Admin';

    const result = await adminService.updateCitizenStatus(req.params.id, {
      status,
      reason,
      adminId,
      adminName,
    });
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: error.message });
  }
};

// DELETE /api/admin/citizens/:id
const deleteCitizen = async (req, res) => {
  try {
    const { reason } = req.body || {};
    const adminId = req.user ? req.user.id : null;
    const adminName = req.user ? req.user.name || req.user.full_name : 'Admin';

    const result = await adminService.deleteCitizen(req.params.id, {
      reason,
      adminId,
      adminName,
    });
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: error.message });
  }
};

// ---------------- LAWYER MANAGEMENT ---------------- //

// GET /api/admin/lawyers
const getLawyers = async (req, res) => {
  try {
    const result = await adminService.getLawyers({
      search: req.query.search,
      status: req.query.status,
      specialty: req.query.specialty,
      district: req.query.district,
      page: req.query.page,
      limit: req.query.limit,
    });
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error('getLawyers error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/lawyers/:id
const getLawyerById = async (req, res) => {
  try {
    const lawyer = await adminService.getLawyerById(req.params.id);
    return res.status(200).json({ success: true, lawyer });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: error.message });
  }
};

// PUT /api/admin/lawyers/:id/status
const updateLawyerStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;
    const adminId = req.user ? req.user.id : null;
    const adminName = req.user ? req.user.name || req.user.full_name : 'Admin';

    const result = await adminService.updateLawyerStatus(req.params.id, {
      status,
      reason,
      adminId,
      adminName,
    });
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: error.message });
  }
};

// DELETE /api/admin/lawyers/:id
const deleteLawyer = async (req, res) => {
  try {
    const { reason } = req.body || {};
    const adminId = req.user ? req.user.id : null;
    const adminName = req.user ? req.user.name || req.user.full_name : 'Admin';

    const result = await adminService.deleteLawyer(req.params.id, {
      reason,
      adminId,
      adminName,
    });
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: error.message });
  }
};

// GET /api/admin/pending-lawyers (Backwards Compatibility)
const getPendingLawyers = async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT 
        l.*,
        json_build_object('id', u.id, 'name', u.name, 'email', u.email, 'phone', u.phone) AS user
      FROM lawyers l
      LEFT JOIN users u ON l.user_id = u.id
      WHERE l.verification_status = 'pending'
    `);
    return res.json(rows);
  } catch (error) {
    console.error('getPendingLawyers error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// PUT /api/admin/lawyers/:id/verify (Backwards Compatibility)
const verifyLawyer = async (req, res) => {
  try {
    const { status } = req.body;
    const isApproved = status === 'approved';
    const { rows } = await db.query(
      `UPDATE lawyers
       SET verification_status = $1,
           is_verified = $2,
           status = CASE WHEN $2 = TRUE THEN 'active' ELSE 'suspended' END
       WHERE id = $3
       RETURNING *`,
      [status, isApproved, req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Lawyer not found' });
    }
    return res.json(rows[0]);
  } catch (error) {
    console.error('verifyLawyer error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// ---------------- NGO MANAGEMENT ---------------- //

// GET /api/admin/ngos
const getNgos = async (req, res) => {
  try {
    const result = await adminService.getNgos({
      search: req.query.search,
      status: req.query.status,
      district: req.query.district,
      page: req.query.page,
      limit: req.query.limit,
    });
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error('getNgos error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/ngos/:id
const getNgoById = async (req, res) => {
  try {
    const ngo = await adminService.getNgoById(req.params.id);
    return res.status(200).json({ success: true, ngo });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: error.message });
  }
};

// PUT /api/admin/ngos/:id/status
const updateNgoStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;
    const adminId = req.user ? req.user.id : null;
    const adminName = req.user ? req.user.name || req.user.full_name : 'Admin';

    const result = await adminService.updateNgoStatus(req.params.id, {
      status,
      reason,
      adminId,
      adminName,
    });
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: error.message });
  }
};

// DELETE /api/admin/ngos/:id
const deleteNgo = async (req, res) => {
  try {
    const { reason } = req.body || {};
    const adminId = req.user ? req.user.id : null;
    const adminName = req.user ? req.user.name || req.user.full_name : 'Admin';

    const result = await adminService.deleteNgo(req.params.id, {
      reason,
      adminId,
      adminName,
    });
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: error.message });
  }
};

// ---------------- MEDIA MANAGEMENT ---------------- //

// GET /api/admin/media
const getMedia = async (req, res) => {
  try {
    const result = await adminService.getMedia({
      search: req.query.search,
      status: req.query.status,
      district: req.query.district,
      page: req.query.page,
      limit: req.query.limit,
    });
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error('getMedia error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/media/:id
const getMediaById = async (req, res) => {
  try {
    const media = await adminService.getMediaById(req.params.id);
    return res.status(200).json({ success: true, media });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: error.message });
  }
};

// PUT /api/admin/media/:id/status
const updateMediaStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;
    const adminId = req.user ? req.user.id : null;
    const adminName = req.user ? req.user.name || req.user.full_name : 'Admin';

    const result = await adminService.updateMediaStatus(req.params.id, {
      status,
      reason,
      adminId,
      adminName,
    });
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: error.message });
  }
};

// DELETE /api/admin/media/:id
const deleteMedia = async (req, res) => {
  try {
    const { reason } = req.body || {};
    const adminId = req.user ? req.user.id : null;
    const adminName = req.user ? req.user.name || req.user.full_name : 'Admin';

    const result = await adminService.deleteMedia(req.params.id, {
      reason,
      adminId,
      adminName,
    });
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: error.message });
  }
};

// ---------------- SYSTEM AUDIT LOGS ---------------- //

// GET /api/admin/audit-logs
const getAuditLogs = async (req, res) => {
  try {
    const result = await adminService.getAuditLogs({
      page: req.query.page,
      limit: req.query.limit,
      entityType: req.query.entity_type || req.query.entityType,
      action: req.query.action,
      search: req.query.search,
    });
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error('getAuditLogs error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/admin/audit-logs (Manual/Service log injection)
const createAuditLog = async (req, res) => {
  try {
    const { action, entityType, entityId, entityName, description, severity, details } = req.body;
    const adminId = req.user ? req.user.id : null;
    const adminName = req.user ? req.user.name || req.user.full_name : 'Admin';

    const log = await adminService.logAudit({
      adminId,
      adminName,
      action,
      entityType,
      entityId,
      entityName,
      description,
      severity,
      ipAddress: req.ip,
      details,
    });
    return res.status(201).json({ success: true, log });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------- ADMIN NOTIFICATIONS ---------------- //

// GET /api/admin/notifications
const getNotifications = async (req, res) => {
  try {
    const result = await adminService.getNotifications({
      unreadOnly: req.query.unreadOnly || req.query.unread_only,
      page: req.query.page,
      limit: req.query.limit,
    });
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error('getNotifications error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/admin/notifications/:id/read
const markNotificationRead = async (req, res) => {
  try {
    const notification = await adminService.markNotificationRead(req.params.id);
    return res.status(200).json({ success: true, notification });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: error.message });
  }
};

// PUT /api/admin/notifications/mark-all-read
const markAllNotificationsRead = async (req, res) => {
  try {
    const result = await adminService.markAllNotificationsRead();
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------- FLAGGED CASES ---------------- //

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
    return res.json(rows);
  } catch (error) {
    console.error('getFlaggedCases error:', error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  // Auth
  registerAdmin,
  loginAdmin,
  getAdminMe,
  // Stats
  getStats,
  // Citizens
  getCitizens,
  getCitizenById,
  updateCitizenStatus,
  deleteCitizen,
  // Lawyers
  getLawyers,
  getLawyerById,
  updateLawyerStatus,
  deleteLawyer,
  getPendingLawyers,
  verifyLawyer,
  // NGOs
  getNgos,
  getNgoById,
  updateNgoStatus,
  deleteNgo,
  // Media
  getMedia,
  getMediaById,
  updateMediaStatus,
  deleteMedia,
  // Audit Logs
  getAuditLogs,
  createAuditLog,
  // Notifications
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  // Flagged Cases
  getFlaggedCases,
};
