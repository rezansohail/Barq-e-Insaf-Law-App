const express = require('express');
const router = express.Router();
const {
  registerNgo,
  loginNgo,
  getNgoMe,
} = require('../controllers/ngoController');
const { getAllNgos } = require('../controllers/citizenController');
const { protect, allowRoles } = require('../middleware/auth');

// Public NGO / Media Routes
router.post('/register', registerNgo);
router.post('/login',    loginNgo);
router.get('/',          getAllNgos);

// Protected NGO / Media Routes
router.get('/me', protect, allowRoles('ngo', 'admin'), getNgoMe);

module.exports = router;
