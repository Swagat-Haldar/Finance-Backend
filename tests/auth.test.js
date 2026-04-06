/**
 * AUTH TEST
 * WHAT IT TESTS:
 * - Register API
 * - Login API
 */

const http = require('http');
const app = require('../src/app');

const PORT = 5000;

const server = app.listen(PORT, async () => {
  console.log("Auth Test Server Running...");

  const email = `auth-${Date.now()}@test.com`;

  /**
   * Step 1: Register User
   */
  const registerData = JSON.stringify({
    name: "Auth User",
    email,
    password: "123456"
  });

  const registerOptions = {
    hostname: 'localhost',
    port: PORT,
    path: '/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': registerData.length
    }
  };

  const req1 = http.request(registerOptions, (res1) => {
    res1.on('data', () => {});

    res1.on('end', () => {
      console.log("Register API called");

      /**
       * Step 2: Login User
       */
      const loginData = JSON.stringify({
        email,
        password: "123456"
      });

      const loginOptions = {
        hostname: 'localhost',
        port: PORT,
        path: '/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': loginData.length
        }
      };

      const req2 = http.request(loginOptions, (res2) => {
        let data = '';

        res2.on('data', chunk => {
          data += chunk;
        });

        res2.on('end', () => {
          const parsed = JSON.parse(data);

          if (res2.statusCode === 200 && parsed.token) {
            console.log("✅ TEST PASSED: Auth working correctly");
          } else {
            console.error("❌ TEST FAILED");
          }

          server.close();
        });
      });

      req2.write(loginData);
      req2.end();
    });
  });

  req1.write(registerData);
  req1.end();
});