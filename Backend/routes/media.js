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
} = require('../controllers/mediaController');
const { protect, allowRoles } = require('../middleware/auth');

// ── PUBLIC MEDIA / JOURNALISM ROUTES ──
router.post('/register',          registerMedia);
router.post('/login',             loginMedia);
router.get('/',                   getAllMedia);
router.get('/analytics/heatmap',  getSindhHeatmap);
router.get('/docket',             getPublicCourtDocket);
router.get('/stories',            getMediaStories);
router.get('/stories/:id',        getMediaStoryById);
router.post('/reports/export',    exportPressReport);

// ── PROTECTED MEDIA NEWSROOM DESK (KTN NEWS) ──
router.get('/me',                         protect, allowRoles('media', 'admin'), getMediaMe);
router.get('/leads',                      protect, allowRoles('media', 'admin'), getCitizenMediaLeads);
router.put('/cases/:caseId/status',       protect, allowRoles('media', 'admin'), updateCaseMediaStatus);
router.post('/stories',                   protect, allowRoles('media', 'admin'), createMediaStory);

module.exports = router;
