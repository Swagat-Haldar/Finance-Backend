/**
 * Manual-style E2E checks (prints results in console).
 * This is not a unit test framework; it is a deterministic walkthrough.
 */

const http = require('http');
const { URL } = require('url');
const { spawnSync } = require('child_process');
const path = require('path');
require('dotenv').config();

process.env.ENABLE_TEST_ROUTES = 'true';

// Ensure seeded admin exists so /auth/login is deterministic.
{
  const root = path.join(__dirname, '..');
  const r = spawnSync('npx', ['prisma', 'db', 'seed'], {
    cwd: root,
    env: process.env,
    encoding: 'utf-8',
    shell: true
  });
  if (r.status !== 0) {
    console.error('Seed failed; cannot run manual E2E checks.');
    if (r.error) console.error('spawnSync error:', r.error);
    if (r.stdout) console.error('stdout:\n', r.stdout);
    if (r.stderr) console.error('stderr:\n', r.stderr);
    process.exit(1);
  }
}

const app = require('../src/app');

const PORT = 8123;

function request({ method, path, token, body, query }) {
  return new Promise((resolve, reject) => {
    const url = new URL(`http://localhost:${PORT}${path}`);
    if (query) {
      for (const [k, v] of Object.entries(query)) url.searchParams.set(k, v);
    }

    const payload = body ? JSON.stringify(body) : null;

    const req = http.request(
      {
        hostname: 'localhost',
        port: PORT,
        path: url.pathname + url.search,
        method,
        headers: {
          ...(payload
            ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
            : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          let parsed = null;
          try {
            parsed = data ? JSON.parse(data) : null;
          } catch {
            parsed = data;
          }
          resolve({ status: res.statusCode, body: parsed });
        });
      }
    );

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function run() {
  const server = app.listen(PORT, async () => {
    const results = [];
    const add = (name, pass, details) => results.push({ name, pass, details });

    try {
      // 1) Health
      {
        const r = await request({ method: 'GET', path: '/health' });
        add('GET /health returns 200', r.status === 200 && r.body?.status === 'OK', r.body);
      }

      // 2) Register a viewer (registration always yields VIEWER)
      const viewerEmail = `viewer-${Date.now()}@example.com`;
      const registerViewer = await request({
        method: 'POST',
        path: '/auth/register',
        body: { name: 'Viewer', email: viewerEmail, password: '123456' }
      });
      add('POST /auth/register succeeds', registerViewer.status === 201, registerViewer.body);

      // 3) Admin login (seeded admin)
      const adminLogin = await request({
        method: 'POST',
        path: '/auth/login',
        body: { email: 'finance-admin@example.com', password: 'Admin123!' }
      });
      add('POST /auth/login returns token for seeded admin', adminLogin.status === 200 && !!adminLogin.body?.token, adminLogin.body);
      const adminToken = adminLogin.body?.token;
      if (!adminToken) {
        throw new Error('Seeded admin login failed; stopping manual E2E.');
      }

      // 4) Find viewer user from admin list
      const usersList = await request({ method: 'GET', path: '/users', token: adminToken });
      const viewerUser = Array.isArray(usersList.body) ? usersList.body.find((u) => u.email === viewerEmail) : null;
      add('GET /users lists created viewer', usersList.status === 200 && viewerUser, usersList.status);
      if (!viewerUser) {
        console.error('Debug: viewer registration email:', viewerEmail);
        console.error('Debug: GET /users status:', usersList.status);
        console.error('Debug: GET /users body:', JSON.stringify(usersList.body, null, 2));
        throw new Error('Could not find registered viewer in GET /users response.');
      }

      // 5) Promote viewer -> ANALYST
      const promote = await request({
        method: 'PATCH',
        path: `/users/${viewerUser.id}`,
        token: adminToken,
        body: { role: 'ANALYST' }
      });
      add('PATCH /users/:id role -> ANALYST', promote.status === 200 && promote.body?.role === 'ANALYST', promote.body);

      // 6) Analyst login
      const analystLogin = await request({
        method: 'POST',
        path: '/auth/login',
        body: { email: viewerEmail, password: '123456' }
      });
      add('Login works for promoted analyst', analystLogin.status === 200 && !!analystLogin.body?.token, analystLogin.body);
      const analystToken = analystLogin.body?.token;

      // 7) Viewer cannot list records (should be 403 since viewer stays viewer in this login)
      // Create a fresh viewer (not promoted)
      const viewer2Email = `viewer-${Date.now()}-2@example.com`;
      const registerViewer2 = await request({
        method: 'POST',
        path: '/auth/register',
        body: { name: 'Viewer2', email: viewer2Email, password: '123456' }
      });
      add('POST /auth/register viewer2 succeeds', registerViewer2.status === 201, registerViewer2.body);
      const viewer2Login = await request({
        method: 'POST',
        path: '/auth/login',
        body: { email: viewer2Email, password: '123456' }
      });
      const viewer2Token = viewer2Login.body?.token;
      const viewer2List = await request({ method: 'GET', path: '/records', token: viewer2Token });
      add('Viewer cannot GET /records', viewer2List.status === 403, viewer2List.body);

      // 8) Analyst can list records; admin can create
      const softDeleteNote = `softdelete-note-${Date.now()}`;
      const createRecord = await request({
        method: 'POST',
        path: '/records',
        token: adminToken,
        body: {
          amount: 1000,
          type: 'INCOME',
          category: 'Salary',
          date: new Date().toISOString(),
          notes: softDeleteNote
        }
      });
      add('ADMIN can POST /records', createRecord.status === 201, createRecord.body);
      const recordId = createRecord.body?.record?.id;
      if (!recordId) throw new Error('Record creation did not return record.id');

      const listAnalyst = await request({
        method: 'GET',
        path: '/records',
        token: analystToken,
        query: { type: 'INCOME', category: 'Salary', page: '1', limit: '5', q: 'sal' }
      });
      add('ANALYST can GET /records (with filters)', listAnalyst.status === 200 && listAnalyst.body?.items && 'total' in listAnalyst.body, listAnalyst.body);

      // 9) PATCH /records/:id partial update schema should allow notes-only
      const patchRecord = await request({
        method: 'PATCH',
        path: `/records/${recordId}`,
        token: adminToken,
        body: { notes: 'updated-note' }
      });
      add('ADMIN can PATCH /records/:id with partial body', patchRecord.status === 200, patchRecord.body);

      // 9) Soft delete validation
      const deleteRecord = await request({
        method: 'DELETE',
        path: `/records/${recordId}`,
        token: adminToken
      });
      add('ADMIN can soft delete /records/:id', deleteRecord.status === 200, deleteRecord.body);

      const listAfterDelete = await request({
        method: 'GET',
        path: '/records',
        token: adminToken,
        query: { q: softDeleteNote, page: '1', limit: '10' }
      });
      add(
        'Soft-deleted record excluded from GET /records',
        listAfterDelete.status === 200 && listAfterDelete.body?.total === 0,
        listAfterDelete.body
      );

      const recentAfterDelete = await request({
        method: 'GET',
        path: '/dashboard/recent',
        token: adminToken,
        query: { limit: '25' }
      });
      add(
        'Soft-deleted record excluded from /dashboard/recent',
        recentAfterDelete.status === 200 &&
          Array.isArray(recentAfterDelete.body?.items) &&
          !recentAfterDelete.body.items.some((i) => i.id === recordId),
        recentAfterDelete.body
      );

      // 10) Dashboard checks for any role (viewer allowed)
      const dashboardSummary = await request({ method: 'GET', path: '/dashboard/summary', token: viewer2Token });
      add('Viewer can access /dashboard/summary', dashboardSummary.status === 200 && dashboardSummary.body?.netBalance !== undefined, dashboardSummary.body);

      const dashboardTrendsMonth = await request({ method: 'GET', path: '/dashboard/trends', token: viewer2Token });
      add('Dashboard trends default (month) works', dashboardTrendsMonth.status === 200 && !!dashboardTrendsMonth.body?.buckets, dashboardTrendsMonth.body);

      const dashboardTrendsWeek = await request({ method: 'GET', path: '/dashboard/trends', token: viewer2Token, query: { granularity: 'week' } });
      add('Dashboard trends granularity=week works', dashboardTrendsWeek.status === 200 && !!dashboardTrendsWeek.body?.buckets, dashboardTrendsWeek.body);

      const recent = await request({ method: 'GET', path: '/dashboard/recent', token: viewer2Token, query: { limit: '3' } });
      add('Dashboard recent works', recent.status === 200 && Array.isArray(recent.body?.items), recent.body);

      // 11) Inactive user cannot login
      const deactivate = await request({
        method: 'PATCH',
        path: `/users/${viewerUser.id}`,
        token: adminToken,
        body: { status: 'INACTIVE' }
      });
      add('Admin can deactivate user', deactivate.status === 200 || deactivate.status === 400, deactivate.body);

      const inactiveLogin = await request({
        method: 'POST',
        path: '/auth/login',
        body: { email: viewerEmail, password: '123456' }
      });
      add('INACTIVE user login is rejected', inactiveLogin.status === 403, inactiveLogin.body);

      // 12) Rate limiting sanity check (spam /auth/login until 429 appears)
      let hit429 = false;
      let first429 = null;
      for (let i = 0; i < 70; i++) {
        const r = await request({
          method: 'POST',
          path: '/auth/login',
          body: { email: 'finance-admin@example.com', password: 'wrong-password' }
        });
        if (r.status === 429) {
          hit429 = true;
          first429 = r.body;
          break;
        }
      }
      add('Rate limiting returns 429 on /auth/login flood', hit429, first429);

      // Print summary
      const failed = results.filter((r) => !r.pass);
      console.log('\n=== Manual E2E Results ===');
      for (const r of results) {
        console.log(`${r.pass ? '✅' : '❌'} ${r.name}`);
      }
      console.log(`\nTotal: ${results.length}, Failed: ${failed.length}\n`);
      server.close(() => process.exit(failed.length ? 1 : 0));
    } catch (e) {
      console.error('Manual E2E crashed:', e);
      server.close(() => process.exit(1));
    }
  });
}

run();

