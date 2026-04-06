/**
 * DASHBOARD TEST
 * - Summary, category, trends, recent, weekly trends
 */

const http = require('http');
const app = require('../src/app');

const PORT = 8000;

let adminToken = '';

const server = app.listen(PORT, () => {
  console.log('Dashboard Test Server Running...');

  const loginData = JSON.stringify({
    email: 'finance-admin@example.com',
    password: 'Admin123!'
  });

  const reqLogin = http.request(
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
        adminToken = JSON.parse(data).token;

        const records = [
          { amount: 1000, type: 'INCOME', category: 'Salary' },
          { amount: 500, type: 'EXPENSE', category: 'Food' },
          { amount: 2000, type: 'INCOME', category: 'Freelance' }
        ];

        let created = 0;

        records.forEach((rec) => {
          const body = JSON.stringify({
            ...rec,
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
                'Content-Length': body.length,
                Authorization: `Bearer ${adminToken}`
              }
            },
            () => {
              created += 1;
              if (created === records.length) {
                runDashboardTests();
              }
            }
          );

          reqCreate.write(body);
          reqCreate.end();
        });

        function runDashboardTests() {
          http.get(
            {
              hostname: 'localhost',
              port: PORT,
              path: '/dashboard/summary',
              headers: { Authorization: `Bearer ${adminToken}` }
            },
            (res) => {
              if (res.statusCode === 200) {
                console.log('✅ Summary working');
              } else {
                console.error('❌ Summary failed');
              }
            }
          );

          http.get(
            {
              hostname: 'localhost',
              port: PORT,
              path: '/dashboard/category',
              headers: { Authorization: `Bearer ${adminToken}` }
            },
            (res) => {
              if (res.statusCode === 200) {
                console.log('✅ Category breakdown working');
              } else {
                console.error('❌ Category failed');
              }
            }
          );

          http.get(
            {
              hostname: 'localhost',
              port: PORT,
              path: '/dashboard/trends',
              headers: { Authorization: `Bearer ${adminToken}` }
            },
            (res) => {
              if (res.statusCode === 200) {
                console.log('✅ Trends (monthly default) working');
              } else {
                console.error('❌ Trends failed');
              }
            }
          );

          http.get(
            {
              hostname: 'localhost',
              port: PORT,
              path: '/dashboard/trends?granularity=week',
              headers: { Authorization: `Bearer ${adminToken}` }
            },
            (res) => {
              if (res.statusCode === 200) {
                console.log('✅ Trends (weekly) working');
              } else {
                console.error('❌ Weekly trends failed');
              }
            }
          );

          http.get(
            {
              hostname: 'localhost',
              port: PORT,
              path: '/dashboard/recent?limit=5',
              headers: { Authorization: `Bearer ${adminToken}` }
            },
            (res) => {
              if (res.statusCode === 200) {
                console.log('✅ Recent activity working');
                console.log('✅ DASHBOARD TEST PASSED');
              } else {
                console.error('❌ Recent failed');
              }

              server.close();
            }
          );
        }
      });
    }
  );

  reqLogin.write(loginData);
  reqLogin.end();
});
