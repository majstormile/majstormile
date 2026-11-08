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
