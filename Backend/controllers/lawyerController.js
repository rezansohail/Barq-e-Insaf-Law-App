const RegisterLawyerDTO = require('../dto/RegisterLawyerDTO');
const LoginLawyerDTO = require('../dto/LoginLawyerDTO');
const lawyerService = require('../services/lawyerServiceImpl');
const { triggerTranslate } = require('../utils/triggerTranslate');

/**
 * Controller for Lawyer Endpoints
 * Bridges HTTP layer with Business Logic Service layer
 */

// POST /api/lawyers/register
const registerLawyer = async (req, res) => {
  try {
    const dto = new RegisterLawyerDTO(req.body);
    const result = await lawyerService.registerLawyer(dto);
    // Auto-trigger translation for new lawyer account
    triggerTranslate(req.body);
    return res.status(201).json({
      success: true,
      ...result,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
      errors: error.errors || null,
    });
  }
};

// POST /api/lawyers/login
const loginLawyer = async (req, res) => {
  try {
    const dto = new LoginLawyerDTO(req.body);
    const result = await lawyerService.loginLawyer(dto);
    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
      errors: error.errors || null,
    });
  }
};

// GET /api/lawyers
const getLawyers = async (req, res) => {
  try {
    const lawyers = await lawyerService.getLawyers({
      specialty: req.query.specialty,
      district: req.query.district,
    });
    res.json(lawyers);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message });
  }
};

// GET /api/lawyers/:id
const getLawyerById = async (req, res) => {
  try {
    const lawyer = await lawyerService.getLawyerById(req.params.id);
    res.json(lawyer);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message });
  }
};

// PUT /api/lawyers/:id/profile or PUT /api/lawyers/:id
const updateLawyerProfile = async (req, res) => {
  try {
    const updatedLawyer = await lawyerService.updateLawyerProfile(req.params.id, req.body);
    res.json({
      success: true,
      message: 'Profile updated successfully',
      lawyer: updatedLawyer,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message });
  }
};

// GET /api/lawyers/:id/requests
const getLawyerRequests = async (req, res) => {
  try {
    const requests = await lawyerService.getLawyerRequests(req.params.id, req.query);
    res.json(requests);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message });
  }
};

// POST /api/lawyers/:id/requests (Citizen requests consultation)
const createLawyerRequest = async (req, res) => {
  try {
    const result = await lawyerService.createLawyerRequest(req.params.id, req.body);
    res.status(201).json({
      success: true,
      ...result,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message });
  }
};

// PUT /api/lawyers/:id/requests/:requestId/accept
const acceptLawyerRequest = async (req, res) => {
  try {
    const result = await lawyerService.acceptLawyerRequest(req.params.id, req.params.requestId, req.body);
    res.json(result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message });
  }
};

// PUT /api/lawyers/:id/requests/:requestId/decline
const declineLawyerRequest = async (req, res) => {
  try {
    const { reason, declineReason } = req.body;
    const finalReason = reason || declineReason;
    const result = await lawyerService.declineLawyerRequest(req.params.id, req.params.requestId, finalReason);
    res.json(result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message });
  }
};

// GET /api/lawyers/:id/cases
const getLawyerCases = async (req, res) => {
  try {
    const cases = await lawyerService.getLawyerCases(req.params.id);
    res.json(cases);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message });
  }
};

// GET /api/lawyers/:id/schedule
const getLawyerSchedule = async (req, res) => {
  try {
    const schedule = await lawyerService.getLawyerSchedule(req.params.id);
    res.json(schedule);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message });
  }
};

// PUT /api/lawyers/:id/schedule
const updateLawyerSchedule = async (req, res) => {
  try {
    const result = await lawyerService.updateLawyerSchedule(req.params.id, req.body);
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message });
  }
};

// POST /api/lawyers/:id/rate
const rateLawyer = async (req, res) => {
  try {
    const result = await lawyerService.rateLawyer(req.params.id);
    res.json(result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message });
  }
};

module.exports = {
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
};
