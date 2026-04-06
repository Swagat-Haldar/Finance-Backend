/**
 * DASHBOARD ROUTES
 *
 * WHY:
 * - Define endpoints
 * - Apply auth + RBAC
 */

const express = require('express');
const router = express.Router();

const dashboardController = require('../controllers/dashboard.controller');
const authMiddleware = require('../middleware/auth.middleware');
const allowRoles = require('../middleware/role.middleware');
const { ROLES } = require('../utils/constants');

/**
 * All roles can access dashboard
 */
router.get(
  '/summary',
  authMiddleware,
  allowRoles(ROLES.VIEWER, ROLES.ANALYST, ROLES.ADMIN),
  dashboardController.summary
);

router.get(
  '/category',
  authMiddleware,
  allowRoles(ROLES.VIEWER, ROLES.ANALYST, ROLES.ADMIN),
  dashboardController.category
);

router.get(
  '/trends',
  authMiddleware,
  allowRoles(ROLES.VIEWER, ROLES.ANALYST, ROLES.ADMIN),
  dashboardController.trends
);

router.get(
  '/recent',
  authMiddleware,
  allowRoles(ROLES.VIEWER, ROLES.ANALYST, ROLES.ADMIN),
  dashboardController.recent
);

module.exports = router;