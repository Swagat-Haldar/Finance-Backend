/**
 * AUTH MIDDLEWARE
 * WHY:
 * - Protect routes
 * - Verify JWT token
 *
 * WHERE USED:
 * - Protected routes (records, dashboard, etc.)
 */

const { verifyToken } = require('../utils/jwt');

const authMiddleware = (req, res, next) => {
  try {
    /**
     * Extract token from header
     */
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    /**
     * Format: Bearer TOKEN
     */
    const token = authHeader.split(' ')[1];

    const decoded = verifyToken(token);

    /**
     * Attach user info to request
     */
    req.user = decoded;

    next();
  } catch (error) {
    res.status(401).json({
      message: "Invalid or expired token"
    });
  }
};

module.exports = authMiddleware;