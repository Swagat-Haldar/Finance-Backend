/**
 * AUTH VALIDATION SCHEMAS
 *
 * WHY:
 * - Prevent invalid data before reaching business logic
 * - Avoid unnecessary DB calls
 *
 * WHERE USED:
 * - auth.routes.js via validation middleware
 */

const Joi = require('joi');

/**
 * Register validation schema
 */
const registerSchema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

/**
 * Login validation schema
 */
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

module.exports = {
  registerSchema,
  loginSchema
};