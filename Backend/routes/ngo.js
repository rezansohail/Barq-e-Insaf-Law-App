const express = require('express');
const router = express.Router();
const {
  registerNgo,
  loginNgo,
  getNgoMe,
} = require('../controllers/ngoController');
const { protect, allowRoles } = require('../middleware/auth');

// Public NGO / Media Auth Routes
router.post('/register', registerNgo);
router.post('/login',    loginNgo);

// Protected NGO / Media Routes
router.get('/me', protect, allowRoles('ngo', 'admin'), getNgoMe);

module.exports = router;
