/**
 * ROLE-BASED ACCESS CONTROL MIDDLEWARE
 *
 * WHY:
 * - Enforces permissions at backend level
 * - Prevents unauthorized actions even if frontend is bypassed
 *
 * HOW:
 * - Accepts allowed roles
 * - Checks if logged-in user's role is included
 *
 * WHERE USED:
 * - Protected routes (records, users, admin actions)
 */

const { ROLES } = require('../utils/constants');

/**
 * Factory function → returns middleware
 */
const allowRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      /**
       * req.user is attached by auth.middleware
       */
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          message: "Unauthorized: No user found"
        });
      }

      /**
       * Check if user's role is allowed
       */
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({
          message: "Forbidden: Access denied"
        });
      }

      next();
    } catch (error) {
      res.status(500).json({
        message: "Role middleware error"
      });
    }
  };
};

module.exports = allowRoles;