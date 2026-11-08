import {test} from 'node:test';
import assert from 'node:assert/strict';
import {seed, normalizeState, type Member} from '../lib/domain.ts';
import {loadDemoPack} from '../lib/demo.ts';
import {applyAction} from '../lib/actions.ts';
import {appointmentReminders, reminderEmails} from '../lib/reminders.ts';

const now = '2026-11-04T10:00:00.000Z';
function world() {
  const s = normalizeState((() => { const x = seed('owner', 'owner@example.test'); loadDemoPack(x, 'uzice', x.members.filter(m => m.id === 'owner'), now, 'System'); return x; })());
  return {s, builder: s.members.find(m => m.id === 'demo-contractor-5')! as Member};
}

test('accepting with an appointment books the visit in one step', () => {
  const {s, builder} = world();
  const t = s.tickets.find(x => x.id === 'UZ-DEMO-017')!;
  applyAction(s, builder, builder, {action: 'job', id: t.id, job: 'accept', appointment: '2026-11-05T08:00:00.000Z'}, now, 'owner');
  assert.equal(t.status, 'Acknowledged');
  assert.equal(t.appointment, '2026-11-05T08:00:00.000Z');
  assert.equal(t.workStage, 'Appointment scheduled');
  assert.throws(() => applyAction(s, builder, builder, {action: 'job', id: 'UZ-DEMO-016', job: 'accept', appointment: '2020-01-01T08:00:00.000Z'}, now, 'owner'));
});

test('reminders go out once the day before and once on the day, and again after a new appointment', () => {
  const {s, builder} = world();
  const t = s.tickets.find(x => x.id === 'UZ-DEMO-017')!;
  applyAction(s, builder, builder, {action: 'job', id: t.id, job: 'accept', appointment: '2026-11-05T08:00:00.000Z'}, now, 'owner');
  t.reporterEmail = 'tenant@example.com';
  for (const x of s.tickets) if (x.id !== t.id) delete x.appointment;
  const first = appointmentReminders(s, now);
  assert.equal(first.length, 1); assert.equal(first[0].kind, 'tomorrow');
  assert.ok(s.notifications.some(n => n.recipient === builder.id && n.text.startsWith('Podsetnik: Sutra')));
  assert.equal(appointmentReminders(s, now).length, 0, 'not twice');
  assert.equal(appointmentReminders(s, '2026-11-05T05:00:00.000Z')[0].kind, 'today');
  const mails = reminderEmails(first, 'https://www.majstormile.com');
  assert.ok(mails.some(m => m.to === 'tenant@example.com' && /majstor dolazi sutra/.test(m.subject)));
  assert.ok(mails.every(m => !m.to.endsWith('.invalid')));
  t.appointment = '2026-11-05T12:00:00.000Z'; delete t.reminders;
  assert.equal(appointmentReminders(s, now).length, 1, 'a new time is reminded again');
});

test('after acceptance the tenant gets the tradesperson contact on the tracking page and by email', async () => {
  const {s, builder} = world();
  const {publicStatus} = await import('../lib/public-report.ts');
  const {acceptedEmail} = await import('../lib/reminders.ts');
  const t = s.tickets.find(x => x.id === 'UZ-DEMO-017')!;
  t.publicCode = 'ABCDE-23456'; t.reporterEmail = 'tenant@example.com'; builder.phone = '064 111 2222';
  assert.equal(publicStatus(s, 'ABCDE-23456')!.contact, undefined, 'no contact before acceptance');
  applyAction(s, builder, builder, {action: 'job', id: t.id, job: 'accept', appointment: '2026-11-05T08:00:00.000Z'}, now, 'owner');
  assert.equal(publicStatus(s, 'ABCDE-23456')!.contact!.phone, '064 111 2222');
  const m = acceptedEmail(s, t, 'https://www.majstormile.com')!;
  assert.equal(m.to, 'tenant@example.com');
  assert.match(m.text, /064 111 2222/); assert.match(m.text, /track\/ABCDE-23456/);
});

test('an apartment owner (Resident) sees only their own reports, can create one and is told when a firm accepts', async () => {
  const {s, builder} = world();
  const {canSee} = await import('../lib/domain.ts');
  const {residentView} = await import('../lib/jobs.ts');
  const marija = s.members.find(m => m.id === 'demo-resident')!;
  assert.equal(marija.role, 'Resident'); assert.equal(marija.name, 'Vlasnik stana – Marija Ilić');
  const mine = s.tickets.filter(t => canSee(t, marija));
  assert.deepEqual(mine.map(t => t.reportedBy), mine.map(() => 'demo-resident'));
  assert.ok(mine.length >= 1);
  applyAction(s, marija, marija, {action: 'create', title: 'Curi slavina', note: 'Kaplje slavina u kupatilu', address: 'Petra Ćelovića 10, 31000 Užice', team: marija.teams[0], source: 'Field inspection'}, now, 'owner');
  const created = s.tickets[0];
  assert.equal(created.reportedBy, marija.id); assert.equal(created.source, 'Resident report');
  assert.ok(canSee(created, marija));
  const v = residentView({...created, cost: {estimate: 100}} as never, marija);
  assert.equal(v.cost, undefined);
  const zoran = s.members.find(m => m.id === 'demo-resident-3')!;
  applyAction(s, builder, builder, {action: 'job', id: 'UZ-DEMO-017', job: 'accept', appointment: '2026-11-05T08:00:00.000Z'}, now, 'owner');
  assert.ok(s.notifications.some(n => n.recipient === zoran.id && n.ticket === 'UZ-DEMO-017' && /preuzela/.test(n.text)));
  assert.throws(() => applyAction(s, marija, marija, {action: 'assign', id: created.id, analyst: 'demo-analyst'}, now, 'owner'));
});
