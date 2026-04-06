/**
 * USER CONTROLLER (admin)
 */

const userService = require('../services/user.service');

const list = async (req, res) => {
  try {
    const users = await userService.listUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

const update = async (req, res) => {
  try {
    const adminId = req.user.id;
    const targetId = req.params.id;

    if (targetId === adminId && req.body.status === 'INACTIVE') {
      return res.status(400).json({
        message: 'You cannot deactivate your own account'
      });
    }

    const user = await userService.updateUserById(targetId, req.body);
    res.status(200).json(user);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

module.exports = {
  list,
  update
};
