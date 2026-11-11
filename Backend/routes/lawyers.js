const express = require('express');
const router = express.Router();
const {
  registerLawyer,
  loginLawyer,
  getLawyers,
  getLawyerById,
  updateLawyerProfile,
  getLawyerRequests,
  createLawyerRequest,
  acceptLawyerRequest,
  declineLawyerRequest,
  getLawyerCases,
  getLawyerSchedule,
  updateLawyerSchedule,
  rateLawyer,
} = require('../controllers/lawyerController');

// Public Auth routes
router.post('/register', registerLawyer);
router.post('/login', loginLawyer);

// Public Lawyer Directory / Search
router.get('/', getLawyers);

// Specific Lawyer ID Routes (Profile & Dashboard)
router.get('/:id', getLawyerById);
router.put('/:id/profile', updateLawyerProfile);
router.put('/:id', updateLawyerProfile);

// Consultation Requests
router.get('/:id/requests', getLawyerRequests);
router.post('/:id/requests', createLawyerRequest);
router.put('/:id/requests/:requestId/accept', acceptLawyerRequest);
router.put('/:id/requests/:requestId/decline', declineLawyerRequest);

// Active Cases
router.get('/:id/cases', getLawyerCases);

// Office Hours & Schedule
router.get('/:id/schedule', getLawyerSchedule);
router.put('/:id/schedule', updateLawyerSchedule);

// Lawyer Rating
router.post('/:id/rate', rateLawyer);

module.exports = router;
