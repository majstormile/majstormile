import {test} from 'node:test';
import assert from 'node:assert/strict';
import {seed, normalizeState, contractCovers, openTicketsAt, TRADES, isTrade} from '../lib/domain.ts';
import {loadDemoPack, DEMO_PACKS} from '../lib/demo.ts';
import {applyResidentReport} from '../lib/public-report.ts';
import {applyAction} from '../lib/actions.ts';

const now = '2026-11-03T10:00:00.000Z';
function world() {
  const s = seed('owner', 'owner@example.test');
  loadDemoPack(s, 'northeim', s.members.filter(m => m.id === 'owner'), now, 'System');
  return normalizeState(s);
}

test('bricklaying and wall repairs are trades with German names', () => {
  assert.ok(isTrade('Masonry'));
  assert.ok(isTrade('Drywall'));
});

test('every demo ticket and contract names a known trade', () => {
  const p = DEMO_PACKS.northeim;
  for (const t of p.tickets) assert.ok(isTrade(t.trade), t.id);
  for (const c of p.contracts) assert.ok(isTrade(c.trade), c.id);
  const s = world();
  for (const t of s.tickets) assert.ok((TRADES as readonly string[]).includes(t.trade!), t.id);
});

test('a contract only covers tickets of its own trade', () => {
  const c = {trade: 'Plumbing', road: 'Kastanienallee'};
  assert.equal(contractCovers(c, {road: 'Kastanienallee', trade: 'Plumbing'}), true);
  assert.equal(contractCovers(c, {road: 'Kastanienallee', trade: 'Locksmith'}), false);
  // Contracts and tickets without a trade keep street-only matching; spelling of "Straße" does not matter.
  assert.equal(contractCovers({road: 'Kastanienallee'}, {road: 'Kastanienallee', trade: 'Painting'}), true);
  assert.equal(contractCovers(c, {road: 'Kastanienallee'}), true);
  assert.equal(contractCovers({road: 'Mühlenstraße'}, {road: 'Mühlenstr.'}), true);
  assert.equal(contractCovers({road: 'Mühlenstraße'}, {road: 'Mühlengasse'}), false);
});

test('demo tickets are only tagged to contracts of the same trade', () => {
  const s = world();
  for (const t of s.tickets) {
    if (!t.contractId) continue;
    const c = s.contracts.find(x => x.id === t.contractId)!;
    assert.equal(c.trade, t.trade, t.id);
  }
});

test('open jobs at the same address but of another trade are not offered for merging', () => {
  const s = world();
  const leak = s.tickets.find(t => t.id === 'NOM-DEMO-001')!;
  assert.ok(openTicketsAt(s, {address: leak.address!, unit: leak.unit}, 'Plumbing').some(t => t.id === leak.id));
  assert.ok(openTicketsAt(s, {address: 'Mühlenstr. 10'}, 'Plumbing').some(t => t.id === leak.id), 'no unit given matches any apartment');
  assert.ok(!openTicketsAt(s, {address: leak.address!, unit: leak.unit}, 'Locksmith').some(t => t.id === leak.id));
  assert.ok(!openTicketsAt(s, {address: 'Mühlenstraße 12, 37154 Northeim'}, 'Plumbing').some(t => t.id === leak.id), 'the house next door is a different building');
});

test('a tenant report merges only into an open job of the same trade', () => {
  const s = world();
  const leak = s.tickets.find(t => t.id === 'NOM-DEMO-001')!;
  const before = s.tickets.length;
  const lock = applyResidentReport(s, {address: leak.address!, unit: leak.unit, description: 'Wohnungstür lässt sich nicht abschließen', dangerous: false, trade: 'Locksmith'}, now, {ticketId: 'HW-2026-LOCK0001', code: 'AAAAA-BBBBB'});
  assert.equal(lock.merged, false);
  assert.equal(lock.ticket.trade, 'Locksmith');
  assert.equal(s.tickets.length, before + 1);
  const again = applyResidentReport(s, {address: leak.address!, unit: leak.unit, description: 'Immer noch Wasser an der Decke', dangerous: true, trade: 'Plumbing'}, now, {ticketId: 'HW-2026-LEAK0002', code: 'CCCCC-DDDDD'});
  assert.equal(again.merged, true);
  assert.equal(again.ticket.id, leak.id);
});

test('staff can create a ticket with a trade, and an unknown trade is refused', () => {
  const s = world();
  const admin = s.members.find(m => m.role === 'Admin')!;
  const base = {action: 'create', address: 'Wieterstraße 10, 37154 Northeim', unit: 'EG rechts', title: 'Steckdose ohne Strom', note: 'Steckdose im Flur funktioniert nicht mehr.', team: s.teams[0]};
  applyAction(s, admin, admin, {...base, trade: 'Electrical'}, now, 'owner');
  assert.equal(s.tickets[0].trade, 'Electrical');
  assert.match(s.tickets[0].id, /^HW-2026-/);
  assert.throws(() => applyAction(s, admin, admin, {...base, trade: 'Astrology'}, now, 'owner'));
  applyAction(s, admin, admin, base, now, 'owner');
  assert.equal(s.tickets[0].trade, 'Other');
});

test('the Northeim demo uses real Northeim addresses and trade-matched contracts', () => {
  const s = seed('owner', 'owner@example.test');
  loadDemoPack(s, 'northeim', s.members.filter(m => m.id === 'owner'), now, 'System');
  const n = normalizeState(s);
  assert.equal(n.tickets.length, DEMO_PACKS.northeim.tickets.length);
  for (const t of n.tickets) {
    assert.match(t.address || '', /, 37154 Northeim$/, t.id);
    for (const k of ['lat', 'lng', 'accuracy', 'lane']) assert.equal((t as any)[k], undefined, t.id + ' has no ' + k);
    for (const e of t.evidence || []) assert.equal((e as any).lat, undefined, t.id + ' photo has no GPS');
    assert.ok(t.unit && t.contactName && t.contactPhone, t.id + ' has apartment and contact');
    if (t.contractId) assert.equal(n.contracts.find(c => c.id === t.contractId)!.trade, t.trade, t.id);
  }
});
