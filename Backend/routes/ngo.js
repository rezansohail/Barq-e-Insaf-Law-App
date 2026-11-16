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
  downloadInstitutionalReport,
} = require('../controllers/ngoController');
const { protect, allowRoles, optionalProtect } = require('../middleware/auth');

// ── PUBLIC NGO / INSTITUTIONAL ROUTES ──
router.post('/register',                  registerNgo);
router.post('/login',                     loginNgo);
router.get('/',                           getAllNgos);
router.get('/analytics/heatmap',          getSindhHeatmap);
router.get('/docket',                     getPublicDocket);
router.get('/stories',                    getNgoStories);
router.get('/stories/:id',                getNgoStoryById);
router.post('/reports/export',            exportInstitutionalReport);
router.get('/reports/download/:filename', downloadInstitutionalReport);

// ── PROTECTED / DESK (NCHD) ──
router.get('/me',                                 protect, allowRoles('ngo', 'admin'), getNgoMe);
router.get('/leads',                              optionalProtect, getAidRequests);
router.get('/aid-requests',                       optionalProtect, getAidRequests);
router.post('/cases/:caseId/offer-assistance',    optionalProtect, offerAssistance);
router.post('/cases/:caseId/assist',              optionalProtect, offerAssistance);
router.put('/cases/:caseId/status',               optionalProtect, updateCaseAidStatus);
router.post('/stories',                           optionalProtect, createNgoStory);

module.exports = router;
