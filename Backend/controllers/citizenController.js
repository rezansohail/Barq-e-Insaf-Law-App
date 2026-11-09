const RegisterCitizenDTO = require('../dto/RegisterCitizenDTO');
const LoginCitizenDTO = require('../dto/LoginCitizenDTO');
const citizenService = require('../services/citizenServiceImpl');

/**
 * Controller for Citizen Endpoints
 * Bridges HTTP layer with Business Logic Service layer
 */

// POST /api/citizens/register
const registerCitizen = async (req, res) => {
  try {
    const dto = new RegisterCitizenDTO(req.body);
    const result = await citizenService.registerCitizen(dto);
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

// POST /api/citizens/login
const loginCitizen = async (req, res) => {
  try {
    const dto = new LoginCitizenDTO(req.body);
    const result = await citizenService.loginCitizen(dto);
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

// GET /api/citizens/me
const getMe = async (req, res) => {
  try {
    const citizen = await citizenService.getCitizenById(req.user.id);
    return res.status(200).json({
      success: true,
      citizen,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  registerCitizen,
  loginCitizen,
  getMe,
};
