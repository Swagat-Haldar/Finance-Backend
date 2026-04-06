/**
 * USER ADMIN VALIDATION
 */

const Joi = require('joi');

const updateUserSchema = Joi.object({
  name: Joi.string().min(3),
  role: Joi.string().valid('VIEWER', 'ANALYST', 'ADMIN'),
  status: Joi.string().valid('ACTIVE', 'INACTIVE')
}).min(1);

module.exports = {
  updateUserSchema
};
