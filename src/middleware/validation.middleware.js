/**
 * VALIDATION MIDDLEWARE
 *
 * WHY:
 * - Reusable validation logic
 * - Keeps controllers clean
 *
 * HOW:
 * - Accepts Joi schema
 * - Validates req.body
 */

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: error.details[0].message
      });
    }

    next();
  };
};

module.exports = validate;