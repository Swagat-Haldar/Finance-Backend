/**
 * USER ROUTES — admin only
 */

const express = require('express');
const router = express.Router();

const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');
const allowRoles = require('../middleware/role.middleware');
const validate = require('../middleware/validation.middleware');
const { ROLES } = require('../utils/constants');
const { updateUserSchema } = require('../validations/user.validation');

router.get(
  '/',
  authMiddleware,
  allowRoles(ROLES.ADMIN),
  userController.list
);

router.patch(
  '/:id',
  authMiddleware,
  allowRoles(ROLES.ADMIN),
  validate(updateUserSchema),
  userController.update
);

module.exports = router;
