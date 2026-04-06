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
/**
 * @openapi
 * /records:
 *   post:
 *     tags: [Records]
 *     summary: Create a financial record (ADMIN only)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, type, category, date]
 *             properties:
 *               amount: { type: number, example: 1000 }
 *               type: { type: string, enum: [INCOME, EXPENSE] }
 *               category: { type: string, example: "Salary" }
 *               date: { type: string, format: date-time, example: "2026-04-06T00:00:00.000Z" }
 *               notes: { type: string, nullable: true }
 *     responses:
 *       201: { description: Created }
 *       400: { description: Validation error }
 *       401: { description: Missing/invalid token }
 *       403: { description: Forbidden (not ADMIN) }
 *   get:
 *     tags: [Records]
 *     summary: List records (ANALYST, ADMIN)
 *     description: Supports filtering, search, and pagination. Soft-deleted records are excluded.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [INCOME, EXPENSE] }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Search term across category and notes
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50, maximum: 100 }
 *     responses:
 *       200: { description: Paginated list }
 *       401: { description: Missing/invalid token }
 *       403: { description: Forbidden (VIEWER blocked) }
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
/**
 * @openapi
 * /records/{id}:
 *   patch:
 *     tags: [Records]
 *     summary: Partially update a record (ADMIN only)
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
 *               amount: { type: number }
 *               type: { type: string, enum: [INCOME, EXPENSE] }
 *               category: { type: string }
 *               date: { type: string, format: date-time }
 *               notes: { type: string, nullable: true }
 *     responses:
 *       200: { description: Updated }
 *       400: { description: Validation error }
 *       401: { description: Missing/invalid token }
 *       403: { description: Forbidden (not ADMIN) }
 *   delete:
 *     tags: [Records]
 *     summary: Soft delete a record (ADMIN only)
 *     description: Marks the record with deletedAt; it will be excluded from lists and dashboard calculations.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Deleted (soft) }
 *       401: { description: Missing/invalid token }
 *       403: { description: Forbidden (not ADMIN) }
       400: { description: Not found / unauthorized }
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