const express = require('express');
const router = express.Router();
const {
  registerCitizen,
  loginCitizen,
  getMe,
} = require('../controllers/citizenController');
const { protect } = require('../middleware/auth');

// Public routes for Citizen Authentication (From Citizen Portal)
router.post('/register', registerCitizen);
router.post('/login', loginCitizen);

// Protected Citizen Profile
router.get('/me', protect, getMe);

module.exports = router;
