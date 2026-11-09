const express = require('express');
const router = express.Router();
const {
  registerLawyer,
  loginLawyer,
  getLawyers,
  getLawyerById,
  rateLawyer,
} = require('../controllers/lawyerController');
const { protect } = require('../middleware/auth');

// Public routes for Lawyer Authentication (From Lawyer Portal)
router.post('/register', registerLawyer);
router.post('/login', loginLawyer);

// Lawyer discovery and profile routes
router.get('/', getLawyers);
router.get('/:id', getLawyerById);
router.post('/:id/rate', protect, rateLawyer);

module.exports = router;
