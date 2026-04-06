/**
 * AUTH ROUTES
 * WHY:
 * - Defines API endpoints
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validation.middleware');
const { registerSchema, loginSchema } = require('../validations/auth.validation');


/**
 * Register user
 */
router.post('/register', validate(registerSchema), authController.register);

/**
 * Login user
 */
router.post('/login', validate(loginSchema), authController.login);

module.exports = router;