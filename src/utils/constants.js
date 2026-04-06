/**
 * ROLE CONSTANTS
 * WHY:
 * - Avoid hardcoding strings everywhere
 * - Prevent typos (e.g., "ADMIN" vs "admin")
 *
 * WHERE USED:
 * - role.middleware.js
 * - services/controllers
 */

const ROLES = {
  VIEWER: "VIEWER",
  ANALYST: "ANALYST",
  ADMIN: "ADMIN"
};

module.exports = {
  ROLES
};