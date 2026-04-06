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
/**
 * @openapi
 * /dashboard/summary:
 *   get:
 *     tags: [Dashboard]
 *     summary: Summary totals (income, expense, net balance)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Summary numbers }
 *       401: { description: Missing/invalid token }
 *       403: { description: Forbidden }
 */
router.get(
  '/summary',
  authMiddleware,
  allowRoles(ROLES.VIEWER, ROLES.ANALYST, ROLES.ADMIN),
  dashboardController.summary
);

/**
 * @openapi
 * /dashboard/category:
 *   get:
 *     tags: [Dashboard]
 *     summary: Category-wise totals
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Category totals }
 *       401: { description: Missing/invalid token }
 */
router.get(
  '/category',
  authMiddleware,
  allowRoles(ROLES.VIEWER, ROLES.ANALYST, ROLES.ADMIN),
  dashboardController.category
);

/**
 * @openapi
 * /dashboard/trends:
 *   get:
 *     tags: [Dashboard]
 *     summary: Trends buckets (month or week)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: granularity
 *         schema: { type: string, enum: [month, week], default: month }
 *     responses:
 *       200: { description: Trends buckets }
 *       401: { description: Missing/invalid token }
 */
router.get(
  '/trends',
  authMiddleware,
  allowRoles(ROLES.VIEWER, ROLES.ANALYST, ROLES.ADMIN),
  dashboardController.trends
);

/**
 * @openapi
 * /dashboard/recent:
 *   get:
 *     tags: [Dashboard]
 *     summary: Recent activity feed
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10, maximum: 100 }
 *     responses:
 *       200: { description: Recent records }
 *       401: { description: Missing/invalid token }
 */
router.get(
  '/recent',
  authMiddleware,
  allowRoles(ROLES.VIEWER, ROLES.ANALYST, ROLES.ADMIN),
  dashboardController.recent
);

module.exports = router;