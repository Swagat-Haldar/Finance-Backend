/**
 * RBAC TEST
 * - Viewer cannot access admin route
 * - Admin can access admin route
 */

const http = require('http');
const app = require('../src/app');

const PORT = 6000;

let adminToken = '';
let viewerToken = '';

const server = app.listen(PORT, () => {
  console.log('RBAC Test Server Running...');

  const login = (email, password, callback) => {
    const loginData = JSON.stringify({ email, password });
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

    const req = http.request(loginOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        const parsed = JSON.parse(data);
        callback(parsed.token);
      });
    });
    req.write(loginData);
    req.end();
  };

  const registerAndLogin = (userData, callback) => {
    const registerData = JSON.stringify(userData);

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
        const loginData = JSON.stringify({
          email: userData.email,
          password: userData.password
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

          res2.on('data', (chunk) => {
            data += chunk;
          });

          res2.on('end', () => {
            const parsed = JSON.parse(data);
            callback(parsed.token);
          });
        });

        req2.write(loginData);
        req2.end();
      });
    });

    req1.write(registerData);
    req1.end();
  };

  login('finance-admin@example.com', 'Admin123!', (token) => {
    adminToken = token;

    registerAndLogin(
      {
        name: 'Viewer User',
        email: `viewer-rbac-${Date.now()}@test.com`,
        password: '123456'
      },
      (token2) => {
        viewerToken = token2;

        const options = {
          hostname: 'localhost',
          port: PORT,
          path: '/test/admin',
          method: 'GET',
          headers: {
            Authorization: `Bearer ${viewerToken}`
          }
        };

        const req = http.request(options, (res) => {
          if (res.statusCode === 403) {
            console.log('✅ Viewer blocked from admin route');

            const adminOptions = {
              hostname: 'localhost',
              port: PORT,
              path: '/test/admin',
              method: 'GET',
              headers: {
                Authorization: `Bearer ${adminToken}`
              }
            };

            const req2 = http.request(adminOptions, (res2) => {
              if (res2.statusCode === 200) {
                console.log('✅ Admin access granted correctly');
                console.log('✅ RBAC TEST PASSED');
              } else {
                console.error('❌ Admin access failed');
              }

              server.close();
            });

            req2.end();
          } else {
            console.error('❌ RBAC TEST FAILED');
            server.close();
          }
        });

        req.end();
      }
    );
  });
});
