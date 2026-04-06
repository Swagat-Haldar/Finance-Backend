/**
 * DB TEST FILE
 * WHAT THIS TESTS:
 * - Prisma connection works
 * - User creation works
 * - Data retrieval works
 *
 * WHY IMPORTANT:
 * - Ensures DB layer is functional before building APIs
 */

const prisma = require('../src/config/db');


async function runTest() {
  try {
    console.log("Running DB Test...");

    await prisma.user.deleteMany({
        where: { email: "test@example.com" }
    });

    /**
     * STEP 1: Create User
     */
    const user = await prisma.user.create({
      data: {
        name: "Test User",
        email: "test@example.com",
        password: "hashedpassword", // actual hashing in next phase
        role: "ADMIN",
        status: "ACTIVE"
      }
    });

    console.log("User created:", user.email);

    /**
     * STEP 2: Fetch User
     */
    const fetchedUser = await prisma.user.findUnique({
      where: { email: "test@example.com" }
    });

    /**
     * Assertions
     */
    if (fetchedUser && fetchedUser.email === "test@example.com" && fetchedUser.role === "ADMIN") {
      console.log("✅ TEST PASSED: DB working correctly");
    } else {
      console.error("❌ TEST FAILED");
    }

  } catch (error) {
    console.error("❌ DB TEST ERROR:", error.message);
  }
  /**
   * Do not $disconnect() here: the same Prisma singleton backs later HTTP tests in npm test.
   */
}

runTest();