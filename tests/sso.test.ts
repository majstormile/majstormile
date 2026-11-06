import {test} from 'node:test';
import assert from 'node:assert/strict';
import {seed, normalizeState} from '../lib/domain.ts';
import {applyAction} from '../lib/actions.ts';
import {bindSsoMember, ssoPolicy, isSsoProvider, awaitingSso} from '../lib/sso.ts';
import {resetMemberPassword} from '../lib/users.ts';

const now = '2026-11-03T10:00:00.000Z';
const policy = ssoPolicy({});
const uid = () => crypto.randomUUID();
function world() {
  const s = normalizeState(seed('owner', 'owner@example.test'));
  const admin = s.members[0];
  applyAction(s, admin, admin, {action: 'member', name: 'Petra Klein', email: 'Petra.Klein@hausverwaltung.de', role: 'Analyst', teams: [s.teams[0]], contractor: '', active: true, sso: true}, now, 'owner');
  const petra = s.members.find(m => m.email === 'petra.klein@hausverwaltung.de')!;
  return {s, admin, petra};
}

test('an admin can add an SSO member without a sign-in account', () => {
  const {petra} = world();
  assert.equal(petra.sso, true);
  assert.equal(petra.authUserId, undefined);
  assert.ok(awaitingSso(petra));
});

test('a normal member still needs a sign-in account', () => {
  const {s, admin} = world();
  assert.throws(() => applyAction(s, admin, admin, {action: 'member', name: 'No Login', email: 'nologin@x.de', role: 'Auditor', teams: [], contractor: '', active: true}, now, 'owner'), /user ID is required/);
});

test('two waiting SSO members do not collide on the empty account id', () => {
  const {s, admin} = world();
  applyAction(s, admin, admin, {action: 'member', name: 'Jan Vogel', email: 'jan.vogel@hausverwaltung.de', role: 'Auditor', teams: [], contractor: '', active: true, sso: true}, now, 'owner');
  assert.equal(s.members.filter(awaitingSso).length, 2);
});

test('the first Microsoft sign-in with the same email binds the membership once', () => {
  const {s, petra} = world();
  const id = uid();
  const bound = bindSsoMember(s, {userId: id, email: 'PETRA.KLEIN@hausverwaltung.de', provider: 'azure'}, now, policy);
  assert.equal(bound?.id, petra.id);
  assert.equal(petra.authUserId, id);
  assert.match(s.events[0].action, /SSO sign-in linked for Petra Klein \(azure\)/);
  // A second, different account with the same email cannot take it over.
  assert.equal(bindSsoMember(s, {userId: uid(), email: 'petra.klein@hausverwaltung.de', provider: 'azure'}, now, policy), undefined);
  assert.equal(petra.authUserId, id);
});

test('SAML sign-ins count as SSO; email and phone sign-ins never bind', () => {
  assert.ok(isSsoProvider('sso:6c1e0f1a-0000-4000-8000-000000000000', policy));
  assert.ok(isSsoProvider('google', policy));
  assert.ok(!isSsoProvider('email', policy));
  assert.ok(!isSsoProvider('phone', policy));
  assert.ok(!isSsoProvider(undefined, policy));
  const {s, petra} = world();
  assert.equal(bindSsoMember(s, {userId: uid(), email: petra.email, provider: 'email'}, now, policy), undefined);
  assert.equal(petra.authUserId, undefined);
});

test('allowed domains and allowed providers are enforced', () => {
  const {s, petra} = world();
  const strict = ssoPolicy({SSO_ALLOWED_DOMAINS: 'firma.de', SSO_PROVIDERS: 'azure'});
  assert.equal(bindSsoMember(s, {userId: uid(), email: petra.email, provider: 'azure'}, now, strict), undefined);
  const ok = ssoPolicy({SSO_ALLOWED_DOMAINS: 'hausverwaltung.de', SSO_PROVIDERS: 'azure'});
  assert.equal(bindSsoMember(s, {userId: uid(), email: petra.email, provider: 'google'}, now, ok), undefined);
  assert.ok(bindSsoMember(s, {userId: uid(), email: petra.email, provider: 'azure'}, now, ok));
});

test('suspended, demo or non-SSO members are never bound', () => {
  const {s, admin, petra} = world();
  applyAction(s, admin, admin, {action: 'memberUpdate', memberId: petra.id, name: petra.name, email: petra.email, role: 'Analyst', teams: petra.teams, contractor: '', active: false}, now, 'owner');
  assert.equal(petra.sso, true, 'editing keeps the SSO flag');
  assert.equal(bindSsoMember(s, {userId: uid(), email: petra.email, provider: 'azure'}, now, policy), undefined);
  const demo = s.members.find(m => m.demo)!;
  assert.equal(bindSsoMember(s, {userId: uid(), email: demo.email, provider: 'azure'}, now, policy), undefined);
});

test('an account that already has a membership cannot claim a second one', () => {
  const {s} = world();
  assert.equal(bindSsoMember(s, {userId: 'owner', email: 'petra.klein@hausverwaltung.de', provider: 'azure'}, now, policy), undefined);
});

test('SSO members have no password to reset', async () => {
  const {s, admin, petra} = world();
  bindSsoMember(s, {userId: uid(), email: petra.email, provider: 'azure'}, now, policy);
  const deps = {createLogin: async () => '', inviteLogin: async () => '', createSsoLogin: async () => '', setPassword: async () => {}, deleteLogin: async () => {}};
  await assert.rejects(resetMemberPassword(s, admin, admin, petra.id, now, 'owner', deps, async () => true), /SSO/);
});
