import {test} from 'node:test';
import assert from 'node:assert/strict';
import {serverKeyProblem, unusualServerKey} from '../lib/server-key.ts';

test('a real-looking secret key passes', () => {
  assert.equal(serverKeyProblem('sb_secret_AbCdEf0123456789_xyz-AB'), '');
  assert.equal(serverKeyProblem('eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIn0.sig'), '');
});

test('common copy mistakes are named', () => {
  assert.match(serverKeyProblem('PASTE_YOUR_sb_secret_KEY_HERE'), /placeholder/);
  assert.match(serverKeyProblem('sb_secret_abc••••••••'), /hidden/);
  assert.match(serverKeyProblem('sb_secret_abc…'), /hidden/);
  assert.match(serverKeyProblem('sb_secret_abc\ndef'), /line breaks/);
  assert.match(serverKeyProblem('SUPABASE_SECRET_KEY=sb_secret_abc'), /variable name/);
  assert.match(serverKeyProblem('sb_publishable_H2b-9rtTOuaty'), /publishable/);
  // Unusual formats are only logged, not refused (test setups and other key types).
  assert.equal(serverKeyProblem('integration-test-secret-only'), '');
  assert.ok(unusualServerKey('integration-test-secret-only'));
  assert.ok(!unusualServerKey('sb_secret_abc'));
});
