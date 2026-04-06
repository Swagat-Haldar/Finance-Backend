/**
 * Seeds a known admin account for local dev and integration tests.
 * Email must pass Joi auth validation (.local TLD is rejected by Joi).
 * Credentials: finance-admin@example.com / Admin123!
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const SEED_ADMIN_EMAIL = 'finance-admin@example.com';

async function main() {
  const password = await bcrypt.hash('Admin123!', 10);

  await prisma.user.upsert({
    where: { email: SEED_ADMIN_EMAIL },
    update: {
      role: 'ADMIN',
      status: 'ACTIVE',
      password
    },
    create: {
      email: SEED_ADMIN_EMAIL,
      name: 'Seed Admin',
      password,
      role: 'ADMIN',
      status: 'ACTIVE'
    }
  });

  console.log(`Seed: ${SEED_ADMIN_EMAIL} ready (password: Admin123!)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
