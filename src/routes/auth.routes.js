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
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user (always VIEWER)
 *     description: Public registration always creates a VIEWER. Admins promote via PATCH /users/:id.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string, example: "Jane Doe" }
 *               email: { type: string, format: email, example: "jane@example.com" }
 *               password: { type: string, example: "123456" }
 *     responses:
 *       201:
 *         description: Registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 userId: { type: string }
 *       400:
 *         description: Validation error / user exists
 */
/**
 * Register user
 */
router.post('/register', validate(registerSchema), authController.register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login and get JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email, example: "finance-admin@example.com" }
 *               password: { type: string, example: "Admin123!" }
 *     responses:
 *       200:
 *         description: Token returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 token: { type: string }
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Account inactive
 */
/**
 * Login user
 */
router.post('/login', validate(loginSchema), authController.login);

module.exports = router;