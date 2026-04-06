/**
 * RECORD VALIDATION SCHEMA
 *
 * WHY:
 * - Ensures financial data is valid
 * - Prevents incorrect calculations later
 */

const Joi = require('joi');

const recordSchema = Joi.object({
  amount: Joi.number().positive().required(),
  type: Joi.string().valid("INCOME", "EXPENSE").required(),
  category: Joi.string().min(2).required(),
  date: Joi.date().required(),
  notes: Joi.string().allow('', null).optional()
});

const recordUpdateSchema = Joi.object({
  amount: Joi.number().positive(),
  type: Joi.string().valid("INCOME", "EXPENSE"),
  category: Joi.string().min(2),
  date: Joi.date(),
  notes: Joi.string().allow('', null).optional()
}).min(1);

module.exports = {
  recordSchema,
  recordUpdateSchema
};