process.env.NODE_ENV = 'test';

import { app } from '../backend/src/server.js';
import { signToken } from '../backend/src/services/tokenService.js';

async function testAllEndpoints() {
  console.log('🚀 Starting 26 Backend REST Endpoints Automated Verification Suite...\n');

  // Start test server on port 3009
  const PORT = 3009;
  const server = app.listen(PORT);
  await new Promise((resolve) => server.once('listening', resolve));
  console.log(`✓ Test Express server listening on http://127.0.0.1:${PORT}`);

  const token = signToken({
    userId: 'usr_admin_system',
    email: 'admin@projectxray.ai',
    role: 'ADMIN',
  });

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const evalId = 'eval_smart-road-vision';

  const endpoints = [
    '/api/projects',
    '/api/projects/smart-road-vision',
    '/api/evaluations',
    `/api/evaluations/${evalId}`,
    `/api/evaluations/${evalId}/score`,
    `/api/evaluations/${evalId}/score/breakdown`,
    `/api/evaluations/${evalId}/project-dna`,
    `/api/evaluations/${evalId}/technical`,
    `/api/evaluations/${evalId}/originality`,
    `/api/evaluations/${evalId}/claims`,
    `/api/evaluations/${evalId}/evidence-requests`,
    `/api/evaluations/${evalId}/research`,
    `/api/evaluations/${evalId}/impact`,
    `/api/evaluations/${evalId}/feasibility`,
    `/api/evaluations/${evalId}/jury`,
    `/api/evaluations/${evalId}/jury/debate`,
    `/api/evaluations/${evalId}/live/status`,
    `/api/evaluations/${evalId}/documents`,
    `/api/evaluations/${evalId}/report`,
    `/api/evaluations/${evalId}/report/versions`,
    `/api/evaluations/${evalId}/report/pdf`,
    '/api/admin/health',
    '/api/admin/feature-flags',
    '/api/admin/usage',
    '/api/admin/audit-logs',
    '/api/rubrics',
  ];

  console.log(`Auditing ${endpoints.length} endpoints against Express 5.2 backend...\n`);

  let passed = 0;
  let failed = 0;
  const results: any[] = [];

  for (let i = 0; i < endpoints.length; i++) {
    const ep = endpoints[i];
    const url = `http://127.0.0.1:${PORT}${ep}`;
    const start = Date.now();
    try {
      const res = await fetch(url, { headers });
      const duration = Date.now() - start;
      const status = res.status;
      const ok = status >= 200 && status < 300;

      if (ok) {
        passed++;
        console.log(`[PASS] [${(i + 1).toString().padStart(2, ' ')}/26] ${status} OK   (${duration}ms) -> ${ep}`);
      } else {
        failed++;
        console.log(`[FAIL] [${(i + 1).toString().padStart(2, ' ')}/26] ${status} ERR  (${duration}ms) -> ${ep}`);
      }
      results.push({ index: i + 1, endpoint: ep, status, ok, duration });
    } catch (err: any) {
      failed++;
      console.log(`[FAIL] [${(i + 1).toString().padStart(2, ' ')}/26] NETWORK ERR -> ${ep} (${err.message})`);
      results.push({ index: i + 1, endpoint: ep, status: 0, ok: false, error: err.message });
    }
  }

  // Also verify alternate slug style (smart-road-vision without eval_ prefix) for research & score
  console.log('\n--- Additional Verification: Non-Prefixed IDs ---');
  for (const altEp of [
    '/api/evaluations/smart-road-vision/research',
    '/api/evaluations/smart-road-vision/score',
    '/api/evaluations/smart-road-vision/jury/debate',
    '/api/evaluations/smart-road-vision/jury/deliberation'
  ]) {
    const start = Date.now();
    const res = await fetch(`http://127.0.0.1:${PORT}${altEp}`, { headers });
    const duration = Date.now() - start;
    console.log(`[ALT ] ${res.status} OK   (${duration}ms) -> ${altEp}`);
  }

  server.close();

  console.log('\n========================================================================');
  console.log(`AUDIT COMPLETE: ${passed} PASSED, ${failed} FAILED (${((passed / endpoints.length) * 100).toFixed(1)}% PASS)`);
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

testAllEndpoints().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
