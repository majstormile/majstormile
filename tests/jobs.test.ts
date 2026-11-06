import {test} from 'node:test';
import assert from 'node:assert/strict';
import {seed, normalizeState, canSee, type Member, type State} from '../lib/domain.ts';
import {loadDemoPack} from '../lib/demo.ts';
import {applyAction} from '../lib/actions.ts';
import {canAccept, eligibleContracts, contractorView} from '../lib/jobs.ts';
import {nextStep} from '../lib/workflow.ts';

const now = '2026-11-04T10:00:00.000Z';
function world() {
  const s = seed('owner', 'owner@example.test');
  loadDemoPack(s, 'northeim', s.members.filter(m => m.id === 'owner'), now, 'System');
  const n = normalizeState(s);
  const who = (id: string) => n.members.find(m => m.id === id)!;
  return {s: n, admin: n.members.find(m => m.role === 'Admin')!, analyst: who('demo-analyst'), lead: who('demo-lead'),
    painter: who('demo-contractor'), plumber: who('demo-contractor-2'), builder: who('demo-contractor-5')};
}
const act = (s: State, m: Member, body: Record<string, unknown>) => applyAction(s, m, m, body, now, 'owner');
const job = (s: State, m: Member, id: string, body: Record<string, unknown>) => act(s, m, {action: 'job', id, ...body});
const photo = (by: string, at = now) => ({id: 'p-' + at, name: 'done.jpg', mime: 'image/jpeg', bytes: 1000, sha256: 'h-' + at, purpose: 'repair' as const, capturedAt: at, uploadedAt: at, uploadedBy: by, quality: 'clear' as const, visibility: 'shared' as const});

test('an open job is offered to every firm with an active contract for its trade, and only to them', () => {
  const {s, builder, painter} = world();
  const t = s.tickets.find(x => x.id === 'NOM-DEMO-017')!;
  assert.equal(t.status, 'Notice prepared');
  assert.equal(t.contractor, '');
  assert.deepEqual(t.offeredTo, ['Bau & Putz Leinetal (Demo)']);
  assert.ok(canSee(t, builder));
  assert.ok(canAccept(t, builder));
  assert.equal(canSee(t, painter), false, 'a painter does not see a drywall job');
});

test('before accepting, the contractor sees the job but not the tenant contact, price or other firms', () => {
  const {s, builder} = world();
  const t = s.tickets.find(x => x.id === 'NOM-DEMO-017')!;
  t.cost = {estimate: 250};
  const view = contractorView(t, builder);
  assert.equal(view.address, t.address);
  assert.equal(view.unit, t.unit);
  assert.equal(view.contactPhone, undefined);
  assert.equal(view.contactName, undefined);
  assert.equal(view.access, undefined);
  assert.equal(view.cost, undefined);
  assert.deepEqual(view.offeredTo, ['Bau & Putz Leinetal (Demo)'], 'only their own firm is listed');
  assert.ok(canAccept(view, builder), 'the browser can still show the Accept button');
});

test('accepting assigns the job to the firm, shows the contact and tells the case manager', () => {
  const {s, builder, analyst} = world();
  const t = s.tickets.find(x => x.id === 'NOM-DEMO-017')!;
  job(s, builder, t.id, {job: 'accept'});
  assert.equal(t.status, 'Acknowledged');
  assert.equal(t.contractor, 'Bau & Putz Leinetal (Demo)');
  assert.equal(t.contractId, 'CT-NOM-106');
  assert.equal(t.acceptedBy, builder.id);
  assert.equal(t.offeredTo, undefined);
  assert.equal(t.history.at(-1)!.action, 'Job accepted');
  assert.equal(t.history.at(-1)!.visibility, 'shared');
  assert.ok(s.notifications.some(n => n.recipient === analyst.id && n.ticket === t.id && /accepted/.test(n.text)));
  const view = contractorView(t, builder);
  assert.equal(view.contactPhone, t.contactPhone);
  assert.equal(view.cost, undefined, 'prices are never shown to the contractor');
});

test('the first firm to accept wins; a second acceptance is refused', () => {
  const {s, builder, admin} = world();
  const t = s.tickets.find(x => x.id === 'NOM-DEMO-017')!;
  // A second drywall firm with its own contract.
  s.contracts.push({...s.contracts.find(c => c.id === 'CT-NOM-106')!, id: 'CT-X', contractor: 'Zweite Firma (Test)'});
  act(s, admin, {action: 'member', name: 'Zweite', email: 'zweite@example.test', role: 'Contractor', teams: [], contractor: 'Zweite Firma (Test)', active: true, authUserId: crypto.randomUUID()});
  const second = s.members.at(-1)!;
  t.offeredTo = ['Bau & Putz Leinetal (Demo)', 'Zweite Firma (Test)'];
  job(s, second, t.id, {job: 'accept'});
  assert.equal(t.contractor, 'Zweite Firma (Test)');
  assert.equal(t.contractId, 'CT-X');
  assert.throws(() => job(s, builder, t.id, {job: 'accept'}), /not accessible|already been accepted/);
});

test('declining a firm-specific job sends it back to the case manager', () => {
  const {s, lead} = world();
  const t = s.tickets.find(x => x.id === 'NOM-DEMO-006')!; // offered to Elektrotechnik Wieter
  const electrician = s.members.find(m => m.contractor === 'Elektrotechnik Wieter (Demo)')!;
  assert.throws(() => job(s, electrician, t.id, {job: 'decline', note: ''}), /reason/);
  job(s, electrician, t.id, {job: 'decline', note: 'Keine Kapazität diese Woche'});
  assert.equal(t.status, 'Confirmed');
  assert.equal(t.contractor, '');
  assert.equal(t.contractId, undefined);
  assert.equal(canSee(t, electrician), false);
  assert.ok(s.notifications.some(n => n.recipient === lead.id && /declined/.test(n.text)), 'the team manager is told');
});

test('progress: appointment, start, waiting for parts, then finished with a photo', () => {
  const {s, painter} = world();
  const t = s.tickets.find(x => x.id === 'NOM-DEMO-007')!; // accepted by the painter
  assert.equal(t.status, 'Acknowledged');
  assert.throws(() => job(s, painter, t.id, {job: 'progress', stage: 'Appointment scheduled'}), /date and time/);
  assert.throws(() => job(s, painter, t.id, {job: 'progress', stage: 'Appointment scheduled', appointment: '2028-01-01T09:00:00.000Z'}), /12 months/);
  job(s, painter, t.id, {job: 'progress', stage: 'Appointment scheduled', appointment: '2026-11-06T08:00:00.000Z'});
  assert.equal(t.appointment, '2026-11-06T08:00:00.000Z');
  assert.match(t.history.at(-1)!.note, /Visit on 2026-11-06T08:00:00.000Z/);
  job(s, painter, t.id, {job: 'progress', stage: 'Work started'});
  assert.equal(t.status, 'Repair in progress');
  assert.equal(t.startedAt, now);
  assert.throws(() => job(s, painter, t.id, {job: 'progress', stage: 'Waiting for parts', note: ''}), /few words/);
  job(s, painter, t.id, {job: 'progress', stage: 'Waiting for parts', note: 'Farbe nachbestellt'});
  assert.equal(t.workStage, 'Waiting for parts');
  assert.equal(t.status, 'Repair in progress');
  assert.throws(() => job(s, painter, t.id, {job: 'progress', stage: 'Work finished'}), /photo/);
  t.evidence!.push(photo(painter.id));
  job(s, painter, t.id, {job: 'progress', stage: 'Work finished', note: 'Fertig gestrichen'});
  assert.equal(t.status, 'Awaiting verification');
  assert.equal(t.completedBy, painter.id);
  assert.throws(() => job(s, painter, t.id, {job: 'progress', stage: 'Progress update', note: 'noch etwas'}), /accepted the job/);
});

test('another firm cannot report on a job, and contractors cannot change stages directly', () => {
  const {s, plumber, painter} = world();
  const t = s.tickets.find(x => x.id === 'NOM-DEMO-007')!;
  assert.throws(() => job(s, plumber, t.id, {job: 'progress', stage: 'Work started'}), /not accessible/);
  assert.throws(() => act(s, painter, {action: 'transition', id: t.id, status: 'Repair in progress', note: 'Starting the job now, as agreed.'}), /not permitted/);
});

test('staff release a confirmed job to one firm or to all firms of the trade', () => {
  const {s, analyst, plumber} = world();
  const t = s.tickets.find(x => x.id === 'NOM-DEMO-015')!; // heating, confirmed
  t.analyst = analyst.id;
  const note = 'Checked with the tenant, boiler shows error F28.';
  assert.throws(() => act(s, analyst, {action: 'transition', id: t.id, status: 'Notice prepared', note, contract: 'open'}), /Confirm the address/);
  assert.throws(() => act(s, analyst, {action: 'transition', id: t.id, status: 'Notice prepared', note, contract: 'CT-NOM-101', scopeConfirmed: true}), /active contract for this trade/);
  act(s, analyst, {action: 'transition', id: t.id, status: 'Notice prepared', note, contract: 'open', scopeConfirmed: true});
  assert.equal(t.contractor, '');
  assert.deepEqual(t.offeredTo, ['Rhume Sanitär & Heizung (Demo)']);
  assert.ok(s.notifications.some(n => n.recipient === plumber.id && /New job/.test(n.text)));
  assert.match(t.history.at(-1)!.note, /all contractors for this trade/);
  assert.equal(nextStep(t, plumber).mine, true);
  assert.equal(nextStep(t, plumber).target, 'job');
});

test('a trade without any contract cannot be released to all firms', () => {
  const {s, analyst} = world();
  const t = s.tickets.find(x => x.id === 'NOM-DEMO-016')!; // carpentry, no carpentry contract
  t.status = 'Confirmed'; t.analyst = analyst.id;
  assert.equal(eligibleContracts(s, t, now).length, 0);
  assert.throws(() => act(s, analyst, {action: 'transition', id: t.id, status: 'Notice prepared', note: 'Window hinge broken, needs a carpenter.', contract: 'open', scopeConfirmed: true}), /No contractor has an active contract/);
});
