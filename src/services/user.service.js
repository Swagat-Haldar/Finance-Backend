/**
 * USER MANAGEMENT (admin)
 */

const prisma = require('../config/db');

const listUsers = async () => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true
    }
  });
  return users;
};

const updateUserById = async (targetUserId, data) => {
  const existing = await prisma.user.findUnique({
    where: { id: targetUserId }
  });

  if (!existing) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  const payload = {};
  if (data.name !== undefined) payload.name = data.name;
  if (data.role !== undefined) payload.role = data.role;
  if (data.status !== undefined) payload.status = data.status;

  const updated = await prisma.user.update({
    where: { id: targetUserId },
    data: payload,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true
    }
  });

  return updated;
};

module.exports = {
  listUsers,
  updateUserById
};
