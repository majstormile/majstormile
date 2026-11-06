import {test} from 'node:test';
import assert from 'node:assert/strict';
import {seed, normalizeState} from '../lib/domain.ts';
import {loadDemoPack} from '../lib/demo.ts';
import {applyResidentReport, publicStatus, makePublicCode, normalizeCode} from '../lib/public-report.ts';

const now = '2026-10-14T10:00:00.000Z';
function world() {
  const s = seed('owner', 'owner@example.test');
  loadDemoPack(s, 'northeim', s.members.filter(m => m.id === 'owner'), now, 'System');
  return normalizeState(s);
}
const code = makePublicCode(n => new Uint8Array(n).map((_, i) => i * 7));

test('codes are readable and normalise from loose input', () => {
  assert.match(code, /^[2-9A-HJKMNP-Z]{5}-[2-9A-HJKMNP-Z]{5}$/);
  assert.equal(normalizeCode(code.toLowerCase().replace('-', ' ')), code);
});

test('a report for a new address creates a new Detected job with its address details', () => {
  const s = world(), before = s.tickets.length;
  const {ticket, merged} = applyResidentReport(s, {address: 'Bergstraße 4a, 37154 Northeim', unit: '1. OG links', access: 'Klingel Weber', contactName: 'Ines Weber', contactPhone: '05551 1234', trade: 'Plumbing', description: 'Tap in the bathroom drips', dangerous: false, email: 'a@b.rs'}, now, {ticketId: 'PL-2026-NEW', code});
  assert.equal(merged, false);
  assert.equal(s.tickets.length, before + 1);
  assert.equal(ticket.status, 'Detected');
  assert.equal(ticket.source, 'Resident report');
  assert.equal(ticket.severity, 'Standard');
  assert.equal(ticket.publicCode, code);
  assert.equal(ticket.reporterEmail, 'a@b.rs');
  assert.equal(ticket.road, 'Bergstraße');
  assert.equal(ticket.unit, '1. OG links');
  assert.equal(ticket.contactPhone, '05551 1234');
  assert.equal(ticket.lat, undefined);
  assert.equal(ticket.lng, undefined);
});

test('dangerous reports are urgent', () => {
  const s = world();
  const {ticket} = applyResidentReport(s, {address: 'Bergstraße 4a, 37154 Northeim', description: 'Water pouring from the ceiling', dangerous: true}, now, {ticketId: 'PL-2026-URG', code});
  assert.equal(ticket.severity, 'Urgent');
});

test('a report for the same building, apartment and trade is added to the open job, not duplicated', () => {
  const s = world();
  const open = s.tickets.find(t => !['Verified closed', 'Rejected', 'Duplicate'].includes(t.status))!;
  const before = s.tickets.length, obs = open.observations;
  // Written differently: "Str." for "Straße", no postcode, other case.
  const address = open.address!.split(',')[0].replace('straße', 'str.').toUpperCase();
  const {ticket, merged} = applyResidentReport(s, {address, unit: open.unit, trade: open.trade, description: 'Still there', dangerous: true}, now, {ticketId: 'PL-2026-DUP', code});
  assert.equal(merged, true);
  assert.equal(ticket.id, open.id);
  assert.equal(s.tickets.length, before);
  assert.equal(ticket.observations, obs + 1);
  assert.equal(ticket.severity, 'Urgent');
  assert.ok(ticket.publicCode);
});

test('another apartment or another trade in the same building is a separate job', () => {
  const s = world();
  const open = s.tickets.find(t => t.id === 'NOM-DEMO-001')!;
  assert.equal(applyResidentReport(s, {address: open.address!, unit: 'Dachgeschoss', trade: open.trade, description: 'Also dripping', dangerous: false}, now, {ticketId: 'PL-2026-U2', code}).merged, false);
  assert.equal(applyResidentReport(s, {address: open.address!, unit: open.unit, trade: 'Electrical', description: 'Socket dead', dangerous: false}, now, {ticketId: 'PL-2026-T2', code}).merged, false);
});

test('public status shows steps and dates but no internal notes', () => {
  const s = world();
  const {ticket} = applyResidentReport(s, {address: 'Bergstraße 4a, 37154 Northeim', contactPhone: '0151 99999', description: 'Private detail about my neighbour', dangerous: false, email: 'secret@example.rs'}, now, {ticketId: 'PL-2026-PUB', code});
  const p = publicStatus(s, ticket.publicCode!.toLowerCase())!;
  assert.equal(p.steps.length, 7);
  assert.equal(p.steps[0].state, 'current');
  assert.equal(p.outcome, 'in-progress');
  const text = JSON.stringify(p);
  assert.ok(!text.includes('neighbour'));
  assert.ok(!text.includes('secret@example.rs'));
  assert.ok(!text.includes(ticket.id));
  assert.ok(!text.includes('0151 99999'));
});

test('once a contractor accepts, the tenant sees the firm and the appointment', () => {
  const s = world();
  const t = s.tickets.find(x => x.id === 'NOM-DEMO-007')!;
  t.publicCode = code;
  const p = publicStatus(s, code)!;
  assert.equal(p.contractor, 'Malerwerkstatt Leinetal (Demo)');
  assert.ok(p.appointment);
  assert.equal(p.workStage, 'Appointment scheduled');
  const offered = s.tickets.find(x => x.id === 'NOM-DEMO-017')!;
  offered.publicCode = 'ZZZZZ-22222';
  assert.equal(publicStatus(s, 'ZZZZZ-22222')!.contractor, undefined);
});

test('unknown or malformed codes return nothing', () => {
  const s = world();
  assert.equal(publicStatus(s, 'ZZZZZ-ZZZZZ'), null);
  assert.equal(publicStatus(s, "'; drop"), null);
});
