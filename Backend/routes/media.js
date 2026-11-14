const express = require('express');
const router = express.Router();
const {
  registerMedia,
  loginMedia,
  getMediaMe,
  getAllMedia,
} = require('../controllers/mediaController');
const { protect, allowRoles } = require('../middleware/auth');

// Public Media Partner Routes
router.post('/register', registerMedia);
router.post('/login',    loginMedia);
router.get('/',          getAllMedia);

// Protected Media Partner Routes
router.get('/me', protect, allowRoles('media', 'admin'), getMediaMe);

module.exports = router;
