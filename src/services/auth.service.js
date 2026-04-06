/**
 * AUTH SERVICE (BUSINESS LOGIC)
 * WHY:
 * - Keeps controller clean
 * - Handles DB + logic separately
 *
 * WHERE USED:
 * - auth.controller.js
 */

const prisma = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/hash');
const { generateToken } = require('../utils/jwt');

/**
 * Register user
 */
const registerUser = async (data) => {
  const { name, email, password } = data;

  /**
   * Check if user already exists
   */
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  /**
   * Hash password before storing
   */
  const hashedPassword = await hashPassword(password);

  /**
   * Public registration is always VIEWER. Admins promote via PATCH /users/:id.
   */
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "VIEWER",
      status: "ACTIVE"
    }
  });

  return user;
};

/**
 * Login user
 */
const loginUser = async (data) => {
  const { email, password } = data;

  /**
   * Find user by email
   */
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  /**
   * Compare password
   */
  const isMatch = await comparePassword(password, user.password);

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  if (user.status === "INACTIVE") {
    const err = new Error("Account is inactive");
    err.status = 403;
    throw err;
  }

  /**
   * Generate JWT token
   */
  const token = generateToken({
    id: user.id,
    role: user.role
  });

  return { token };
};

module.exports = {
  registerUser,
  loginUser
};