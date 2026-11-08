// Demo packs: complete sample worlds (teams, people, contracts, tickets) that an admin can load or reset.
// Packs live in demo/*.json with dates relative to today, so a freshly loaded demo always looks current.
import uzice from '../demo/uzice.json' with {type: 'json'};
import beograd from '../demo/beograd.json' with {type: 'json'};
import zlatibor from '../demo/zlatibor.json' with {type: 'json'};
import {isTrade, transitions, type State, type Member, type Ticket, type Status, type Role, type Evidence} from './domain.ts';

export type PackTicket = {id: string; title: string; /** Demo apartment owner (role Resident) who reported it in the app. */ reporter?: string; trade?: string; road: string; address: string; unit?: string; access?: string; contactName?: string; contactPhone?: string;
  /** Released to every firm for the trade instead of the contract's firm. */ offer?: 'open'; workStage?: string; severity: string; team: string; analyst?: string; source: string; confidence?: number; observations: number; daysAgo: number; contractId?: string; reopened?: number; holdFrom?: string; duplicateOf?: string; path: string[]};
export type DemoPack = {name: string; description: string; /** Currency conversion for the illustrative job costs (base amounts are in euros). */ costUnit?: {rate: number; step: number}; teams: string[]; people: {id: string; name: string; role: string; teams: string[]; contractor?: string; vehicleTag?: string; phone?: string}[]; contracts: (State['contracts'][number])[]; notes: Record<string, string>; tickets: PackTicket[]};

export const DEMO_PACKS: Record<'uzice' | 'beograd' | 'zlatibor', DemoPack> = {uzice: uzice as DemoPack, beograd: beograd as DemoPack, zlatibor: zlatibor as DemoPack};
export type PackId = keyof typeof DEMO_PACKS;

const DAY = 86400000;
const iso = (ms: number) => new Date(ms).toISOString();
const DUE_DAYS: Record<string, number> = {Urgent: 2, Standard: 14, Low: 30};
const PHOTO_BY_TRADE: Record<string, number> = {Drywall: 1, Masonry: 1, Carpentry: 1, Plumbing: 2, Heating: 2, Painting: 3, Roofing: 3};
const CONTRACTOR_EVENT: Record<string, string> = {'Acknowledged': 'Job accepted', 'Repair in progress': 'Work started', 'Awaiting verification': 'Work finished'};
const STAGE_OF: Record<string, string | undefined> = {'Acknowledged': 'Appointment scheduled', 'Repair in progress': 'Work started', 'Awaiting verification': 'Work finished', 'Verified closed': 'Work finished'};

/** Check a pack against the workflow so a hand-edited file cannot create impossible tickets. Returns problems found. */
export function checkPack(p: DemoPack): string[] {
  const problems: string[] = [];
  const people = new Set(p.people.map(x => x.id)), contracts = new Set(p.contracts.map(c => c.id)), teams = new Set(p.teams), ids = new Set<string>();
  for (const t of p.tickets) {
    if (ids.has(t.id)) problems.push(`${t.id}: duplicate id`); ids.add(t.id);
    if (!teams.has(t.team)) problems.push(`${t.id}: unknown team ${t.team}`);
    if (t.analyst && !people.has(t.analyst)) problems.push(`${t.id}: unknown analyst ${t.analyst}`);
    if (t.reporter && !people.has(t.reporter)) problems.push(`${t.id}: unknown reporter ${t.reporter}`);
    if (t.contractId && !contracts.has(t.contractId)) problems.push(`${t.id}: unknown contract ${t.contractId}`);
    if (t.trade && !isTrade(t.trade)) problems.push(`${t.id}: unknown trade ${t.trade}`);
    const c = p.contracts.find(x => x.id === t.contractId);
    if (c?.trade && t.trade && c.trade !== t.trade) problems.push(`${t.id}: contract ${c.id} is for ${c.trade}, not ${t.trade}`);
    let at = 'Detected';
    for (const next of t.path) {
      const allowed = at === 'On hold' ? [t.holdFrom || 'Investigating'] : transitions[at] || [];
      if (!allowed.includes(next)) { problems.push(`${t.id}: ${at} cannot move to ${next}`); break; }
      at = next;
    }
    if (t.duplicateOf && !p.tickets.some(x => x.id === t.duplicateOf)) problems.push(`${t.id}: unknown primary ${t.duplicateOf}`);
  }
  return problems;
}

/** Replace the demo content of a workspace with a pack. Real sign-in accounts are kept; demo people are replaced. */
export function loadDemoPack(s: State, packId: PackId, keep: Member[], nowISO: string, actorName: string): void {
  const p = DEMO_PACKS[packId];
  const problems = checkPack(p);
  if (problems.length) throw new Error('Demo pack is invalid: ' + problems.join('; '));
  const now = Date.parse(nowISO);
  const firmOf = (contractId?: string) => p.contracts.find(c => c.id === contractId)?.contractor || '';
  const byRole = (role: string) => p.people.find(x => x.role === role);
  const lead = byRole('Head Analyst'), auditor = byRole('Auditor'), vehicle = byRole('Vehicle');

  const members: Member[] = [
    ...keep.map(m => ({...m, teams: (m.teams || []).filter(t => p.teams.includes(t))})),
    ...p.people.map(x => ({id: x.id, name: x.name, email: x.id.replace(/^demo-/, '') + '@example.invalid', role: x.role as Role, teams: x.teams, contractor: x.contractor || '', vehicleTag: x.vehicleTag, phone: x.phone, active: true, demo: true})),
  ];
  const notifications: State['notifications'] = [];

  const tickets: Ticket[] = p.tickets.map((pt, n) => {
    const created = now - pt.daysAgo * DAY - (n % 5) * 3600_000 - 2 * 3600_000;
    const end = now - (1 + (n % 3)) * 3600_000;
    const steps = pt.path.length;
    const at = (i: number) => iso(created + (end - created) * (i + 1) / (steps + 1));
    const analyst = pt.analyst ? p.people.find(x => x.id === pt.analyst) : undefined;
    const contractorPerson = p.people.find(x => x.role === 'Contractor' && x.contractor === firmOf(pt.contractId));
    const fromDashcam = pt.source === 'Automated dashcam';
    const open = pt.offer === 'open' && pt.path[pt.path.length - 1] === 'Notice prepared';
    const actorFor = (st: string) => {
      if (['Team assigned', 'Analyst assigned', 'On hold'].includes(st)) return lead?.name || actorName;
      if (['Acknowledged', 'Repair in progress', 'Awaiting verification'].includes(st)) return contractorPerson?.name || lead?.name || actorName;
      if (['Verified closed', 'Reopened'].includes(st)) return auditor?.name || actorName;
      return analyst?.name || lead?.name || actorName;
    };
    const history: Ticket['history'] = [{at: iso(created), actor: fromDashcam ? vehicle?.name || 'System' : 'System', action: 'Detected', note: p.notes['Detected'] || '', visibility: 'internal'}];
    const status = (pt.path[pt.path.length - 1] || 'Detected') as Status;
    let completedAt: string | undefined, closedAt: string | undefined, releasedAt: string | undefined, acceptedAt: string | undefined, appointment: string | undefined;
    pt.path.forEach((st, i) => {
      const when = at(i);
      // Contractor steps are recorded the way the job panel records them.
      const action = CONTRACTOR_EVENT[st] || st;
      history.push({at: when, actor: actorFor(st), action, note: p.notes[st] || '', visibility: ['Notice prepared', 'Acknowledged', 'Repair in progress', 'Awaiting verification', 'Verified closed', 'Reopened'].includes(st) ? 'shared' : 'internal'});
      if (st === 'Notice prepared') releasedAt = when;
      if (st === 'Acknowledged') {
        acceptedAt = when;
        // A visit during working hours (8 to 14 o'clock local time), the next days after accepting.
        const visit = new Date(Date.parse(when) + (status === 'Acknowledged' ? 3 : 1) * DAY); visit.setUTCHours(7 + (n % 4) * 2, 0, 0, 0);
        appointment = iso(visit.getTime());
        history.push({at: iso(Date.parse(when) + 60_000), actor: actorFor(st), action: 'Appointment scheduled', note: `Visit on ${appointment}.`, visibility: 'shared'});
      }
      if (st === 'Awaiting verification') completedAt = when;
      if (st === 'Verified closed') closedAt = when;
      if (st === 'Reopened') closedAt = undefined;
    });
    // Illustrative photos: a "before" for every ticket past confirmation, an "after" once the repair is done.
    // Illustrations by trade: 1 = cracked plaster, 2 = leaking pipe, 3 = water stain and mould on a ceiling.
    const pair = PHOTO_BY_TRADE[pt.trade || ''] || (n % 3) + 1;
    const photo = (purpose: Evidence['purpose'], when: string, kind: 'before' | 'after', by: string): Evidence => ({
      id: `demo-${pt.id}-${purpose}`, name: `${kind}-${pair}.jpg`, mime: 'image/jpeg', bytes: 200_000, sha256: `demo-${pt.id}-${purpose}`,
      purpose, capturedAt: when, uploadedAt: when, uploadedBy: by,
      quality: 'clear', visibility: 'shared', demoUrl: `/demo/${kind}-${pair}.jpg`,
    });
    // Illustrative repair costs in the pack's currency, once a contractor has been notified.
    // Illustrative job costs: base amounts in euros, converted to the pack's currency (Serbia: dinars).
    const unit = p.costUnit || {rate: 1, step: 10};
    const base = ({Urgent: 450, Standard: 300, Low: 180} as Record<string, number>)[pt.severity] || 300;
    const round = (v: number) => Math.round(v * unit.rate / unit.step) * unit.step;
    const noticed = pt.path.some(st => ['Notice prepared', 'Acknowledged', 'Repair in progress'].includes(st));
    const cost = noticed ? {
      estimate: round(base * (1 + (n % 4) * 0.15)),
      actual: completedAt ? round(base * (1 + (n % 4) * 0.15) * [0.9, 1.05, 1.3, 0.95][n % 4]) : undefined,
      recovered: undefined as number | undefined, updatedAt: iso(now), updatedBy: lead?.id,
    } : undefined;
    const evidence: Evidence[] = [];
    if (pt.path.includes('Confirmed')) evidence.push(photo('detection', iso(created), 'before', vehicle?.id || lead?.id || 'demo'));
    if (completedAt && status !== 'Reopened') evidence.push(photo(pt.path.includes('Verified closed') ? 'verification' : 'repair', completedAt, 'after', contractorPerson?.id || lead?.id || 'demo'));
    const updated = history[history.length - 1].at;
    if (pt.analyst && ['Analyst assigned', 'Investigating', 'Confirmed', 'Reopened'].includes(status)) notifications.push({id: 'demo-n-' + pt.id, recipient: pt.analyst, ticket: pt.id, text: 'Assigned to you: ' + pt.title, at: history.find(h => h.action === 'Analyst assigned')?.at || updated});
    return {
      id: pt.id, title: pt.title, trade: pt.trade || 'Other', road: pt.road, address: pt.address,
      unit: pt.unit, access: pt.access, contactName: pt.contactName, contactPhone: pt.contactPhone,
      ...(open ? {offeredTo: [...new Set(p.contracts.filter(c => !c.trade || c.trade === pt.trade).map(c => c.contractor))]} : status === 'Notice prepared' ? {offeredTo: [firmOf(pt.contractId)]} : {}),
      releasedAt, acceptedAt, acceptedBy: acceptedAt ? contractorPerson?.id : undefined,
      appointment: acceptedAt ? appointment : undefined, workStage: pt.workStage || STAGE_OF[status],
      severity: pt.severity, status, team: pt.team, analyst: pt.analyst || '', contractor: open ? '' : firmOf(pt.contractId), contractId: open ? undefined : pt.contractId,
      warranty: pt.contractId ? 'Candidate match' : 'Needs review', source: pt.source, confidence: pt.confidence || 0,
      created: iso(created), observedAt: iso(created - 3600_000), updated, due: iso(created + (DUE_DAYS[pt.severity] || 14) * DAY),
      reopened: pt.reopened || 0, observations: pt.observations, note: p.notes[status] || '', history, evidence,
      cost: cost && {...cost, actual: completedAt ? cost.actual ?? round(base) : undefined, recovered: completedAt && pt.contractId && status !== 'Reopened' ? (cost.actual ?? round(base)) : undefined},
      reportedBy: pt.reporter || (fromDashcam ? vehicle?.id : lead?.id), holdFrom: status === 'On hold' ? (pt.holdFrom as Status) : undefined, duplicateOf: pt.duplicateOf,
      completedAt, completedBy: completedAt ? contractorPerson?.id || lead?.id : undefined, closedAt, closedBy: closedAt ? auditor?.id : undefined,
    } as Ticket;
  });

  s.teams = [...p.teams];
  s.teamProfiles = {};
  s.members = members;
  s.contracts = p.contracts.map(c => ({...c}));
  s.tickets = tickets;
  s.notifications = notifications;
  s.outbox = [];
  s.events = [{at: nowISO, actor: actorName, action: 'Demo data loaded: ' + p.name}];
}
