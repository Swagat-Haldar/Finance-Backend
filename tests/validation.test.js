/**
 * VALIDATION TEST
 *
 * WHAT THIS TESTS:
 * - Invalid input rejected
 * - Valid input accepted
 */

const http = require('http');
const app = require('../src/app');

const PORT = 9000;

const server = app.listen(PORT, async () => {
  console.log("Validation Test Server Running...");

  /**
   * Test 1: Invalid register (missing email)
   */
  const invalidData = JSON.stringify({
    name: "Test",
    password: "123456"
  });

  const req1 = http.request({
    hostname: 'localhost',
    port: PORT,
    path: '/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': invalidData.length
    }
  }, (res1) => {
    if (res1.statusCode === 400) {
      console.log("✅ Invalid input rejected");

      /**
       * Test 2: Valid register
       */
      const validData = JSON.stringify({
        name: "Valid User",
        email: `valid-${Date.now()}@test.com`,
        password: "123456"
      });

      const req2 = http.request({
        hostname: 'localhost',
        port: PORT,
        path: '/auth/register',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': validData.length
        }
      }, (res2) => {
        if (res2.statusCode === 201) {
          console.log("✅ Valid input accepted");
          console.log("✅ VALIDATION TEST PASSED");
        } else {
          console.error("❌ Validation failed");
        }

        server.close();
      });

      req2.write(validData);
      req2.end();

    } else {
      console.error("❌ Invalid input not rejected");
      server.close();
    }
  });

  req1.write(invalidData);
  req1.end();
});