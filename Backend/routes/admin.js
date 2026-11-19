const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/adminController');
const { protect, allowRoles } = require('../middleware/auth');

// 1. Public Admin Auth Routes
router.post('/register', registerAdmin);
router.post('/login',    loginAdmin);

// 2. Protected Routes (Require Bearer JWT Token with role = 'admin')
const adminAuth = [protect, allowRoles('admin')];

// Profile & Stats
router.get('/me',    ...adminAuth, getAdminMe);
router.get('/stats', ...adminAuth, getStats);

// Citizen Management
router.get('/citizens',            ...adminAuth, getCitizens);
router.get('/citizens/:id',        ...adminAuth, getCitizenById);
router.put('/citizens/:id/status', ...adminAuth, updateCitizenStatus);
router.delete('/citizens/:id',     ...adminAuth, deleteCitizen);

// Lawyer Management
router.get('/lawyers',             ...adminAuth, getLawyers);
router.get('/lawyers/:id',         ...adminAuth, getLawyerById);
router.put('/lawyers/:id/status',  ...adminAuth, updateLawyerStatus);
router.delete('/lawyers/:id',      ...adminAuth, deleteLawyer);
router.get('/pending-lawyers',     ...adminAuth, getPendingLawyers);
router.put('/lawyers/:id/verify',  ...adminAuth, verifyLawyer);

// NGO Management
router.get('/ngos',            ...adminAuth, getNgos);
router.get('/ngos/:id',        ...adminAuth, getNgoById);
router.put('/ngos/:id/status', ...adminAuth, updateNgoStatus);
router.delete('/ngos/:id',     ...adminAuth, deleteNgo);

// Media Management
router.get('/media',            ...adminAuth, getMedia);
router.get('/media/:id',        ...adminAuth, getMediaById);
router.put('/media/:id/status', ...adminAuth, updateMediaStatus);
router.delete('/media/:id',     ...adminAuth, deleteMedia);

// Audit & System Activity Logs
router.get('/audit-logs',  ...adminAuth, getAuditLogs);
router.post('/audit-logs', ...adminAuth, createAuditLog);

// Notifications & Alerts
router.get('/notifications',               ...adminAuth, getNotifications);
router.put('/notifications/:id/read',       ...adminAuth, markNotificationRead);
router.put('/notifications/mark-all-read', ...adminAuth, markAllNotificationsRead);

// Flagged Cases
router.get('/flagged-cases', ...adminAuth, getFlaggedCases);

module.exports = router;
