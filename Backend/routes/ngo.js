const express = require('express');
const router = express.Router();
const {
  registerNgo,
  loginNgo,
  getNgoMe,
  getAllNgos,
  getSindhHeatmap,
  getPublicDocket,
  getAidRequests,
  offerAssistance,
  updateCaseAidStatus,
  createNgoStory,
  getNgoStories,
  getNgoStoryById,
  exportInstitutionalReport,
} = require('../controllers/ngoController');
const { protect, allowRoles } = require('../middleware/auth');

// ── PUBLIC NGO / INSTITUTIONAL ROUTES ──
router.post('/register',          registerNgo);
router.post('/login',             loginNgo);
router.get('/',                   getAllNgos);
router.get('/analytics/heatmap',  getSindhHeatmap);
router.get('/docket',             getPublicDocket);
router.get('/stories',            getNgoStories);
router.get('/stories/:id',        getNgoStoryById);
router.post('/reports/export',    exportInstitutionalReport);

// ── PROTECTED NGO DESK (NCHD) ──
router.get('/me',                                 protect, allowRoles('ngo', 'admin'), getNgoMe);
router.get('/leads',                              protect, allowRoles('ngo', 'admin'), getAidRequests);
router.get('/aid-requests',                       protect, allowRoles('ngo', 'admin'), getAidRequests);
router.post('/cases/:caseId/offer-assistance',    protect, allowRoles('ngo', 'admin'), offerAssistance);
router.put('/cases/:caseId/status',               protect, allowRoles('ngo', 'admin'), updateCaseAidStatus);
router.post('/stories',                           protect, allowRoles('ngo', 'admin'), createNgoStory);

module.exports = router;
