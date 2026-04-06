/**
 * PASSWORD HASHING UTILITY
 * WHY:
 * - Never store plain passwords (security best practice)
 * - bcrypt adds salt → protects against rainbow table attacks
 *
 * WHERE USED:
 * - auth.service.js (register, login)
 */

const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10; // standard secure value

/**
 * Hash password before storing in DB
 */
const hashPassword = async (plainPassword) => {
  return await bcrypt.hash(plainPassword, SALT_ROUNDS);
};

/**
 * Compare input password with stored hash
 */
const comparePassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

module.exports = {
  hashPassword,
  comparePassword
};