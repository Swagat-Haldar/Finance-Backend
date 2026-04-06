/**
 * AUTH CONTROLLER
 * WHY:
 * - Handles HTTP request/response only
 * - Delegates logic to service layer
 */

const authService = require('../services/auth.service');

/**
 * Register API
 */
const register = async (req, res) => {
  try {
    const user = await authService.registerUser(req.body);

    res.status(201).json({
      message: "User registered successfully",
      userId: user.id
    });
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
};

/**
 * Login API
 */
const login = async (req, res) => {
  try {
    const result = await authService.loginUser(req.body);

    res.status(200).json({
      message: "Login successful",
      token: result.token
    });
  } catch (error) {
    const status = error.status || 401;
    res.status(status).json({
      message: error.message
    });
  }
};

module.exports = {
  register,
  login
};