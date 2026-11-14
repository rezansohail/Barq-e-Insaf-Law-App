const express = require('express');
const router = express.Router();
const {
  registerCitizen,
  loginCitizen,
  getMe,
  getCitizenById,
  updateCitizenProfile,
  getCitizenCases,
  createCitizenCase,
  updateCitizenCase,
  getCitizenConsultations,
  createCitizenConsultation,
  getCitizenVault,
  addCitizenVaultItem,
  deleteCitizenVaultItem,
  getAllNgos,
} = require('../controllers/citizenController');
const { protect } = require('../middleware/auth');

// ── AUTHENTICATION ROUTES ──
router.post('/register', registerCitizen);
router.post('/login',    loginCitizen);

// ── PROTECTED CURRENT USER ──
router.get('/me', protect, getMe);

// ── NGO / MEDIA DIRECTORY (FOR CITIZENS) ──
router.get('/ngos', getAllNgos);

// ── CITIZEN PROFILE BY ID ──
router.get('/:id',         getCitizenById);
router.put('/:id',         updateCitizenProfile);
router.put('/:id/profile', updateCitizenProfile);

// ── CITIZEN ACTIVE CASES & CASE BUILDER ──
router.get('/:id/cases',  getCitizenCases);
router.post('/:id/cases', createCitizenCase);
router.put('/:id/cases/:caseId', updateCitizenCase);

// ── CITIZEN CONSULTATION REQUESTS ──
router.get('/:id/consultations',  getCitizenConsultations);
router.post('/:id/consultations', createCitizenConsultation);

// ── EVIDENCE VAULT (PRIVATE ENCRYPTED REPOSITORY) ──
router.get('/:id/vault',          getCitizenVault);
router.post('/:id/vault',         addCitizenVaultItem);
router.delete('/:id/vault/:itemId', deleteCitizenVaultItem);

module.exports = router;
