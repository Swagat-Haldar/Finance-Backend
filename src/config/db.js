/**
 * Prisma Client Setup
 * WHY:
 * - Centralized DB client instance
 * - Avoids multiple DB connections
 * WHERE USED:
 * - services (all DB operations)
 */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

// Create single instance
const prisma = new PrismaClient();

/**
 * OPTIONAL: Graceful shutdown
 * WHY:
 * - Prevents open DB connections
 * - Good backend practice
 */
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

module.exports = prisma;