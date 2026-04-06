/**
 * JWT UTILITY
 * WHY:
 * - Stateless authentication
 * - No need to store sessions in DB
 *
 * WHERE USED:
 * - auth.service.js (login)
 * - auth.middleware.js (verify token)
 */

const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || "fallback_secret";

/**
 * Generate JWT token
 */
const generateToken = (payload) => {
  return jwt.sign(payload, SECRET, { expiresIn: '1h' });
};

/**
 * Verify JWT token
 */
const verifyToken = (token) => {
  return jwt.verify(token, SECRET);
};

module.exports = {
  generateToken,
  verifyToken
};