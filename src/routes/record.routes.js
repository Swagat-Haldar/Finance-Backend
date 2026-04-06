/**
 * RECORD ROUTES
 * WHY:
 * - Define API endpoints
 * - Apply auth + RBAC
 */

const express = require('express');
const router = express.Router();

const recordController = require('../controllers/record.controller');
const authMiddleware = require('../middleware/auth.middleware');
const allowRoles = require('../middleware/role.middleware');
const { ROLES } = require('../utils/constants');
const validate = require('../middleware/validation.middleware');
const { recordSchema, recordUpdateSchema } = require('../validations/record.validation');

/**
 * Create record → ADMIN only
 */
router.post(
  '/',
  authMiddleware,
  allowRoles(ROLES.ADMIN),
  validate(recordSchema),
  recordController.create
);

/**
 * Get records → ANALYST + ADMIN (viewers: dashboard only)
 */
router.get(
  '/',
  authMiddleware,
  allowRoles(ROLES.ANALYST, ROLES.ADMIN),
  recordController.getAll
);

/**
 * Update record → ADMIN only
 */
router.patch(
  '/:id',
  authMiddleware,
  allowRoles(ROLES.ADMIN),
  validate(recordUpdateSchema),
  recordController.update
);

/**
 * Delete record → ADMIN only
 */
router.delete(
  '/:id',
  authMiddleware,
  allowRoles(ROLES.ADMIN),
  recordController.remove
);

module.exports = router;