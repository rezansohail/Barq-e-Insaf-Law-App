const RegisterLawyerDTO = require('../dto/RegisterLawyerDTO');
const LoginLawyerDTO = require('../dto/LoginLawyerDTO');
const lawyerService = require('../services/lawyerServiceImpl');

/**
 * Controller for Lawyer Endpoints
 * Bridges HTTP layer with Business Logic Service layer
 */

// POST /api/lawyers/register
const registerLawyer = async (req, res) => {
  try {
    const dto = new RegisterLawyerDTO(req.body);
    const result = await lawyerService.registerLawyer(dto);
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

// POST /api/lawyers/:id/rate
const rateLawyer = async (req, res) => {
  try {
    const { rating } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    const updated = await lawyerService.rateLawyer(req.params.id, Number(rating));
    res.json(updated);
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
  rateLawyer,
};
