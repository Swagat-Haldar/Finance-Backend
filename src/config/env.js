/**
 * This file centralizes all environment variable access.
 * WHY:
 * - Avoid using process.env everywhere (cleaner & maintainable)
 * - Makes it easy to validate required env variables later
 * WHERE USED:
 * - server.js (port)
 * - future: DB config, JWT secrets, etc.
 */

require('dotenv').config();

const ENV = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  /**
   * Mounts /test/* RBAC demo routes. Off by default; tests set ENABLE_TEST_ROUTES=true.
   */
  ENABLE_TEST_ROUTES: process.env.ENABLE_TEST_ROUTES === 'true'
};

module.exports = ENV;