const RegisterMediaDTO = require('../dto/RegisterMediaDTO');
const LoginMediaDTO = require('../dto/LoginMediaDTO');
const mediaService = require('../services/mediaServiceImpl');

/**
 * Controller for Media Partner Endpoints
 * Bridges HTTP layer with Business Logic Service layer
 */

// POST /api/media/register
const registerMedia = async (req, res) => {
  try {
    const dto = new RegisterMediaDTO(req.body);
    const result = await mediaService.registerMedia(dto);
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

// POST /api/media/login
const loginMedia = async (req, res) => {
  try {
    const dto = new LoginMediaDTO(req.body);
    const result = await mediaService.loginMedia(dto);
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

// GET /api/media/me
const getMediaMe = async (req, res) => {
  try {
    const media = await mediaService.getMediaById(req.user.id);
    return res.status(200).json({
      success: true,
      media,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/media
const getAllMedia = async (req, res) => {
  try {
    const mediaList = await mediaService.getAllMedia(req.query);
    return res.status(200).json(mediaList);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  registerMedia,
  loginMedia,
  getMediaMe,
  getAllMedia,
};
