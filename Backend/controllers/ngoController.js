const RegisterNgoDTO = require('../dto/RegisterNgoDTO');
const LoginNgoDTO = require('../dto/LoginNgoDTO');
const ngoService = require('../services/ngoServiceImpl');

/**
 * Controller for NGO / Media Endpoints
 * Bridges HTTP layer with Business Logic Service layer
 */

// POST /api/ngo/register
const registerNgo = async (req, res) => {
  try {
    const dto = new RegisterNgoDTO(req.body);
    const result = await ngoService.registerNgo(dto);
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

// POST /api/ngo/login
const loginNgo = async (req, res) => {
  try {
    const dto = new LoginNgoDTO(req.body);
    const result = await ngoService.loginNgo(dto);
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

// GET /api/ngo/me
const getNgoMe = async (req, res) => {
  try {
    const ngo = await ngoService.getNgoById(req.user.id);
    return res.status(200).json({
      success: true,
      ngo,
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
  registerNgo,
  loginNgo,
  getNgoMe,
};
