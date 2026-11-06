import {test} from 'node:test';
import assert from 'node:assert/strict';
import {seed, normalizeState, type State} from '../lib/domain.ts';
import {loadDemoPack} from '../lib/demo.ts';
import {applyAction} from '../lib/actions.ts';
import {purgeExpiredContacts, findPersonInJobs, personalDataExport, contactDays, DEFAULT_CONTACT_DAYS} from '../lib/privacy.ts';

const now = '2026-11-04T10:00:00.000Z';
function world() {
  const s = seed('owner', 'owner@example.test');
  loadDemoPack(s, 'northeim', s.members.filter(m => m.id === 'owner'), now, 'System');
  const n = normalizeState(s);
  return {s: n, admin: n.members.find(m => m.role === 'Admin')!, lead: n.members.find(m => m.id === 'demo-lead')!, analyst: n.members.find(m => m.id === 'demo-analyst')!};
}
const later = (days: number) => new Date(Date.parse(now) + days * 86_400_000).toISOString();
const act = (s: State, m: any, body: Record<string, unknown>, at = now) => applyAction(s, m, m, body, at, 'owner');

test('contact details stay while a job is open and for the retention period after closing', () => {
  const {s} = world();
  const closed = s.tickets.find(t => t.status === 'Verified closed')!;
  closed.closedAt = now;
  const open = s.tickets.find(t => t.status === 'Detected')!;
  assert.equal(contactDays(s), DEFAULT_CONTACT_DAYS);
  purgeExpiredContacts(s, later(89));
  assert.ok(closed.contactPhone, 'still within 90 days of closing');
  const n = purgeExpiredContacts(s, later(91));
  assert.ok(n >= 1);
  for (const k of ['contactName', 'contactPhone', 'access', 'reporterEmail']) assert.equal((closed as any)[k], undefined, k);
  assert.ok(closed.personalDataRemovedAt);
  assert.ok(closed.address && closed.title, 'the job record itself is kept');
  assert.equal(closed.history.at(-1)!.action, 'Personal data removed');
  assert.ok(open.contactPhone, 'open jobs keep their contact');
  assert.equal(purgeExpiredContacts(s, later(200)), 0, 'nothing left to remove a second time');
});

test('admins set the retention period within limits', () => {
  const {s, admin, lead} = world();
  act(s, admin, {action: 'retention', contactDays: 30});
  assert.equal(contactDays(s), 30);
  assert.throws(() => act(s, admin, {action: 'retention', contactDays: 3}));
  assert.throws(() => act(s, admin, {action: 'retention', contactDays: 5000}));
  assert.throws(() => act(s, lead, {action: 'retention', contactDays: 60}), /not permitted/);
});

test('a person is found by email or by any spelling of their phone number', () => {
  const {s} = world();
  const t = s.tickets.find(x => x.id === 'NOM-DEMO-001')!; // Anna Becker, 05551 900 101
  t.reporterEmail = 'anna.becker@example.de';
  assert.ok(findPersonInJobs(s, '+49 5551 900101').some(x => x.id === t.id));
  assert.ok(findPersonInJobs(s, '05551/900-101').some(x => x.id === t.id));
  assert.ok(findPersonInJobs(s, 'Anna.Becker@example.de').some(x => x.id === t.id));
  assert.equal(findPersonInJobs(s, '123').length, 0, 'too short to search');
  const out = personalDataExport(s, '05551 900 101', now);
  assert.ok(out.jobs.length >= 2, 'Anna reported two jobs in the demo');
  assert.equal(out.jobs[0].contactName, 'Anna Becker');
});

test('an erasure request removes contact details from every job of that person', () => {
  const {s, admin, analyst} = world();
  assert.throws(() => act(s, analyst, {action: 'erasePerson', query: '05551 900 101'}), /not permitted/);
  act(s, admin, {action: 'erasePerson', query: '05551 900 101'});
  assert.equal(findPersonInJobs(s, '05551 900 101').length, 0);
  assert.throws(() => act(s, admin, {action: 'erasePerson', query: '05551 900 101'}), /No contact details/);
});

test('a team manager can erase the contact on one job; a case manager cannot', () => {
  const {s, lead, analyst} = world();
  const t = s.tickets.find(x => x.id === 'NOM-DEMO-003')!;
  t.analyst = analyst.id;
  assert.throws(() => act(s, analyst, {action: 'erasePersonalData', id: t.id}), /not permitted/);
  act(s, lead, {action: 'erasePersonalData', id: t.id});
  assert.equal(t.contactPhone, undefined);
  assert.match(t.history.at(-1)!.note, /Art\. 17/);
});
