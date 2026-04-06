/**
 * USER ROUTES — admin only
 */

const express = require('express');
const router = express.Router();

const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');
const allowRoles = require('../middleware/role.middleware');
const validate = require('../middleware/validation.middleware');
const { ROLES } = require('../utils/constants');
const { updateUserSchema } = require('../validations/user.validation');

/**
 * @openapi
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: List users (ADMIN only)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Array of users (no passwords)
 *       401:
 *         description: Missing/invalid token
 *       403:
 *         description: Forbidden (not ADMIN)
 */
router.get(
  '/',
  authMiddleware,
  allowRoles(ROLES.ADMIN),
  userController.list
);

/**
 * @openapi
 * /users/{id}:
 *   patch:
 *     tags: [Users]
 *     summary: Update a user (ADMIN only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               name: { type: string, example: "New Name" }
 *               role: { type: string, enum: [VIEWER, ANALYST, ADMIN] }
 *               status: { type: string, enum: [ACTIVE, INACTIVE] }
 *     responses:
 *       200:
 *         description: Updated user
 *       400:
 *         description: Validation error / cannot deactivate self
 *       401:
 *         description: Missing/invalid token
 *       403:
 *         description: Forbidden (not ADMIN)
 *       404:
 *         description: User not found
 */
router.patch(
  '/:id',
  authMiddleware,
  allowRoles(ROLES.ADMIN),
  validate(updateUserSchema),
  userController.update
);

module.exports = router;
