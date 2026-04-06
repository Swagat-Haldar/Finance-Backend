/**
 * Runs prisma seed then integration tests sequentially (shared SQLite DB).
 */

const { spawnSync } = require('child_process');
const path = require('path');

const root = path.join(__dirname, '..');
const env = { ...process.env, ENABLE_TEST_ROUTES: 'true' };

function runNode(file) {
  const filePath = path.join(__dirname, file);
  const r = spawnSync(process.execPath, [filePath], {
    cwd: root,
    env,
    encoding: 'utf-8',
    stdio: ['inherit', 'pipe', 'pipe']
  });
  if (r.stdout) process.stdout.write(r.stdout);
  if (r.stderr) process.stderr.write(r.stderr);

  const output = `${r.stdout || ''}${r.stderr || ''}`;
  const sawFailureMarker = output.includes('❌');
  const code = r.status === null ? 1 : r.status;
  if (sawFailureMarker || code !== 0) {
    return 1;
  }
  return 0;
}

function runNpx(args) {
  const r = spawnSync('npx', args, {
    cwd: root,
    stdio: 'inherit',
    env,
    shell: true
  });
  return r.status === null ? 1 : r.status;
}

if (runNpx(['prisma', 'db', 'seed']) !== 0) {
  console.error(
    '\nSeed failed. Ensure DATABASE_URL is set and schema is applied, e.g.:\n  npx prisma migrate dev\n  npx prisma db seed\n'
  );
  process.exit(1);
}

const tests = [
  'db.test.js',
  'server.test.js',
  'auth.test.js',
  'validation.test.js',
  'rbac.test.js',
  'record.test.js',
  'dashboard.test.js'
];

let exitCode = 0;
for (const file of tests) {
  const code = runNode(file);
  if (code !== 0) exitCode = 1;
}

process.exit(exitCode);
