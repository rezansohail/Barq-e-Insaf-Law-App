const express = require('express');
const router = express.Router();
const {
  registerMedia,
  loginMedia,
  getMediaMe,
  getAllMedia,
  getSindhHeatmap,
  getPublicCourtDocket,
  getCitizenMediaLeads,
  updateCaseMediaStatus,
  createMediaStory,
  getMediaStories,
  getMediaStoryById,
  exportPressReport,
  downloadPressReport,
} = require('../controllers/mediaController');
const { protect, allowRoles, optionalProtect } = require('../middleware/auth');

// ── PUBLIC MEDIA / JOURNALISM ROUTES ──
router.post('/register',                  registerMedia);
router.post('/login',                     loginMedia);
router.get('/',                           getAllMedia);
router.get('/analytics/heatmap',          getSindhHeatmap);
router.get('/docket',                     getPublicCourtDocket);
router.get('/stories',                    getMediaStories);
router.get('/stories/:id',                getMediaStoryById);
router.post('/reports/export',            exportPressReport);
router.get('/reports/download/:filename', downloadPressReport);

// ── PROTECTED / DESK (KTN NEWS) ──
router.get('/me',                         protect, allowRoles('media', 'admin'), getMediaMe);
router.get('/leads',                      optionalProtect, getCitizenMediaLeads);
router.put('/cases/:caseId/status',       optionalProtect, updateCaseMediaStatus);
router.post('/stories',                   optionalProtect, createMediaStory);

module.exports = router;
