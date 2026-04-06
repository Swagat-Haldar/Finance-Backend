/**
 * GLOBAL ERROR HANDLER
 *
 * WHY:
 * - Centralized error handling
 * - Avoid repeating try/catch everywhere
 *
 * WHERE USED:
 * - app.js (last middleware)
 */

const errorHandler = (err, req, res, next) => {
  /**
   * Default error response
   */
  const status = err.status || 500;

  res.status(status).json({
    message: err.message || "Internal Server Error"
  });
};

module.exports = errorHandler;