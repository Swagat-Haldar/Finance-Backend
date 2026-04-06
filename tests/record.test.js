/**
 * RECORD API TEST
 * - Admin can create record
 * - Viewer cannot create record
 * - Viewer cannot list records (403)
 * - Analyst/Admin can list records
 */

const http = require('http');
const app = require('../src/app');

const PORT = 7000;

let adminToken = '';
let viewerToken = '';
let analystToken = '';

const server = app.listen(PORT, () => {
  console.log('Record Test Server Running...');

  const login = (email, password, callback) => {
    const loginData = JSON.stringify({ email, password });
    const req2 = http.request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': loginData.length
        }
      },
      (res2) => {
        let data = '';
        res2.on('data', (chunk) => {
          data += chunk;
        });
        res2.on('end', () => {
          const parsed = JSON.parse(data);
          callback(parsed.token);
        });
      }
    );
    req2.write(loginData);
    req2.end();
  };

  const registerAndLogin = (userData, callback) => {
    const registerData = JSON.stringify(userData);

    const req1 = http.request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/auth/register',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': registerData.length
        }
      },
      (res1) => {
        res1.on('data', () => {});
        res1.on('end', () => {
          login(userData.email, userData.password, callback);
        });
      }
    );

    req1.write(registerData);
    req1.end();
  };

  const promoteToAnalyst = (userId, callback) => {
    const patchBody = JSON.stringify({ role: 'ANALYST' });
    const req = http.request(
      {
        hostname: 'localhost',
        port: PORT,
        path: `/users/${userId}`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': patchBody.length,
          Authorization: `Bearer ${adminToken}`
        }
      },
      (res) => {
        let data = '';
        res.on('data', (c) => {
          data += c;
        });
        res.on('end', () => {
          callback(res.statusCode, data);
        });
      }
    );
    req.write(patchBody);
    req.end();
  };

  login('finance-admin@example.com', 'Admin123!', (token) => {
    adminToken = token;

    const recordData = JSON.stringify({
      amount: 1000,
      type: 'INCOME',
      category: 'Salary',
      date: new Date().toISOString()
    });

    const reqCreate = http.request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/records',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': recordData.length,
          Authorization: `Bearer ${adminToken}`
        }
      },
      (resCreate) => {
        let data = '';
        resCreate.on('data', (chunk) => {
          data += chunk;
        });
        resCreate.on('end', () => {
          const parsed = JSON.parse(data);

          if (resCreate.statusCode === 201) {
            console.log('✅ Record created by admin');

            const analystEmail = `analyst-rec-${Date.now()}@rec.com`;
            registerAndLogin(
              {
                name: 'Analyst',
                email: analystEmail,
                password: '123456'
              },
              (aToken) => {
                analystToken = aToken;

                http.request(
                  {
                    hostname: 'localhost',
                    port: PORT,
                    path: '/users',
                    method: 'GET',
                    headers: { Authorization: `Bearer ${adminToken}` }
                  },
                  (resList) => {
                    let raw = '';
                    resList.on('data', (c) => {
                      raw += c;
                    });
                    resList.on('end', () => {
                      const users = JSON.parse(raw);
                      const analystUser = users.find((u) => u.email === analystEmail);
                      promoteToAnalyst(analystUser.id, (status) => {
                        if (status !== 200) {
                          console.error('❌ Promote analyst failed');
                          server.close();
                          return;
                        }
                        login(analystEmail, '123456', (newAToken) => {
                          analystToken = newAToken;

                          registerAndLogin(
                            {
                              name: 'Viewer',
                              email: `viewer-rec-${Date.now()}@rec.com`,
                              password: '123456'
                            },
                            (viewerTok) => {
                              viewerToken = viewerTok;

                              const reqFail = http.request(
                                {
                                  hostname: 'localhost',
                                  port: PORT,
                                  path: '/records',
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    'Content-Length': recordData.length,
                                    Authorization: `Bearer ${viewerToken}`
                                  }
                                },
                                (resFail) => {
                                  if (resFail.statusCode === 403) {
                                    console.log('✅ Viewer blocked from creating record');

                                    const reqViewerGet = http.request(
                                      {
                                        hostname: 'localhost',
                                        port: PORT,
                                        path: '/records',
                                        method: 'GET',
                                        headers: {
                                          Authorization: `Bearer ${viewerToken}`
                                        }
                                      },
                                      (rg) => {
                                        if (rg.statusCode === 403) {
                                          console.log('✅ Viewer blocked from listing records');
                                        } else {
                                          console.error('❌ Viewer should not list records');
                                        }
                                        tryAnalystGet();
                                      }
                                    );
                                    reqViewerGet.end();
                                  } else {
                                    console.error('❌ RBAC failed');
                                    server.close();
                                  }
                                }
                              );

                              reqFail.write(recordData);
                              reqFail.end();
                            }
                          );
                        });
                      });
                    });
                  }
                ).end();
              }
            );
          } else {
            console.error('❌ Record creation failed');
            server.close();
          }
        });
      }
    );

    function tryAnalystGet() {
      const reqGet = http.request(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/records',
          method: 'GET',
          headers: {
            Authorization: `Bearer ${analystToken}`
          }
        },
        (resGet) => {
          if (resGet.statusCode === 200) {
            console.log('✅ Analyst can list records');
            console.log('✅ RECORD TEST PASSED');
          } else {
            console.error('❌ Analyst fetch failed');
          }
          server.close();
        }
      );

      reqGet.end();
    }

    reqCreate.write(recordData);
    reqCreate.end();
  });
});
