/**
 * TEST ROUTES FOR RBAC
 *
 * WHY:
 * - Verify role-based access works correctly
 * - Used only for testing purpose
 */

const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth.middleware');
const allowRoles = require('../middleware/role.middleware');
const { ROLES } = require('../utils/constants');

/**
 * VIEWER + ANALYST + ADMIN → allowed
 */
router.get(
  '/view',
  authMiddleware,
  allowRoles(ROLES.VIEWER, ROLES.ANALYST, ROLES.ADMIN),
  (req, res) => {
    res.json({ message: "View access granted" });
  }
);

/**
 * ADMIN ONLY
 */
router.get(
  '/admin',
  authMiddleware,
  allowRoles(ROLES.ADMIN),
  (req, res) => {
    res.json({ message: "Admin access granted" });
  }
);

/**
 * ANALYST + ADMIN
 */
router.get(
  '/analyst',
  authMiddleware,
  allowRoles(ROLES.ANALYST, ROLES.ADMIN),
  (req, res) => {
    res.json({ message: "Analyst access granted" });
  }
);

module.exports = router;