// Contractor side of a job: release, accept or decline, then progress reports until the work is finished.
//
//   Confirmed ──release──▶ Notice prepared ("Released")
//        ▲                    │ a contractor accepts (first one wins; the workspace revision guards races)
//        └──── declined ──────┤
//                             ▼
//                       Acknowledged ("Accepted") ──Work started──▶ Repair in progress ──Work finished──▶ Awaiting verification
//
// Prices are uniform under the framework contracts, so a job never carries a price for the contractor.
// A job is released either to one firm (under a chosen contract) or to every firm with an active contract for its trade.
import {z} from 'zod';
import {AppError} from './errors.ts';
import {contractCovers, isActive, type Member, type State, type Ticket} from './domain.ts';

type Contract = State['contracts'][number];

/** Progress a contractor can report. Stored as English keys and translated when shown. */
export const JOB_STAGES = ['Appointment scheduled', 'Work started', 'Waiting for parts', 'Progress update', 'Work finished'] as const;
export type JobStage = typeof JOB_STAGES[number];

const day = (iso: string) => iso.slice(0, 10);
const activeOn = (c: Contract, d: string) => c.start <= d && c.end >= d;
const coversTrade = (c: Contract, t: Ticket) => !c.trade || !t.trade || c.trade === t.trade;

/** Firms with an active contract for this job's trade on the given day, best match (same street) first. */
export function eligibleContracts(s: State, t: Ticket, now: string): Contract[] {
  const d = day(now);
  const list = s.contracts.filter(c => activeOn(c, d) && coversTrade(c, t));
  return list.sort((a, b) => Number(contractCovers(b, t)) - Number(contractCovers(a, t)) || Number(!!b.trade) - Number(!!a.trade));
}

/** The contract a firm takes the job under: the best active match for that firm. */
export function contractForFirm(s: State, t: Ticket, firm: string, now: string): Contract | undefined {
  return eligibleContracts(s, t, now).find(c => c.contractor === firm);
}

/** Released and still waiting for someone to accept it. */
export const isOffered = (t: Ticket) => t.status === 'Notice prepared' && !t.acceptedAt;

/** Can this contractor accept the job right now? */
export function canAccept(t: Ticket, m: Member): boolean {
  if (m.role !== 'Contractor' || !isActive(m) || !m.contractor || !isOffered(t)) return false;
  return t.contractor ? t.contractor === m.contractor : (t.offeredTo || []).includes(m.contractor);
}

/** Can this member report progress on the job? The firm that accepted it, or an admin on its behalf. */
export function canReport(t: Ticket, m: Member): boolean {
  if (!isActive(m) || !['Acknowledged', 'Repair in progress'].includes(t.status)) return false;
  return m.role === 'Admin' || (m.role === 'Contractor' && !!m.contractor && t.contractor === m.contractor);
}

/** People to tell about a job: its case manager and the team managers of its team. */
function staffFor(s: State, t: Ticket): Member[] {
  return s.members.filter(x => isActive(x) && (x.id === t.analyst || (x.role === 'Head Analyst' && (x.teams || []).includes(t.team))));
}
function notify(s: State, to: Member[], t: Ticket, text: string, now: string) {
  for (const r of to) s.notifications.unshift({id: crypto.randomUUID(), recipient: r.id, ticket: t.id, text, at: now});
}
const label = (t: Ticket) => `${t.title} – ${t.address || t.road}`;

/**
 * Release a confirmed job. With a contract: offered to that firm only. Without one: offered to every firm
 * with an active contract for the trade. Returns the note for the history.
 */
export function releaseJob(s: State, t: Ticket, contract: Contract | undefined, now: string): string {
  let firms: string[];
  if (contract) {
    t.contractor = contract.contractor; t.contractId = contract.id; firms = [contract.contractor];
  } else {
    firms = [...new Set(eligibleContracts(s, t, now).map(c => c.contractor))];
    if (!firms.length) throw new AppError('No contractor has an active contract for this trade. Register a contract first, or choose a firm.');
    t.contractor = ''; delete t.contractId;
  }
  t.offeredTo = firms; t.releasedAt = now;
  delete t.acceptedAt; delete t.acceptedBy; delete t.appointment; delete t.workStage;
  notify(s, s.members.filter(x => isActive(x) && x.role === 'Contractor' && firms.includes(x.contractor)), t, `New job: ${label(t)}`, now);
  return contract ? `Released to ${contract.contractor} under ${contract.id}.` : `Released to all contractors for this trade (${firms.length} firm${firms.length === 1 ? '' : 's'}).`;
}

const progressSchema = z.object({
  stage: z.enum(JOB_STAGES),
  appointment: z.string().datetime().optional().or(z.literal('')),
});

/** Contractor actions on a job: accept, decline, progress. Mutates the ticket; the caller saves and logs the event. */
export function jobAction(s: State, t: Ticket, m: Member, actual: Member, body: Record<string, unknown>, note: string, now: string): {event: string; detail?: string} {
  const kind = z.enum(['accept', 'decline', 'progress']).parse(body.job);
  const by = `${actual.name}${m.contractor ? ` (${m.contractor})` : ''}`;

  if (kind === 'accept') {
    if (!canAccept(t, m)) throw new AppError(isOffered(t) ? 'This job is not offered to your firm.' : 'This job has already been accepted or is no longer open.', isOffered(t) ? 403 : 409);
    const contract = t.contractId && t.contractor === m.contractor ? s.contracts.find(c => c.id === t.contractId) : contractForFirm(s, t, m.contractor, now);
    if (!contract) throw new AppError('Your firm has no active contract for this trade.', 403);
    t.contractor = m.contractor; t.contractId = contract.id; t.warranty = 'Scope reviewed';
    t.acceptedAt = now; t.acceptedBy = actual.id; delete t.offeredTo;
    t.status = 'Acknowledged';
    // The accept wizard sends the agreed visit with the acceptance.
    const appt = typeof body.appointment === 'string' && body.appointment ? Date.parse(body.appointment) : NaN;
    if (!Number.isNaN(appt)) {
      if (appt < Date.parse(now) - 3_600_000 || appt > Date.parse(now) + 365 * 86_400_000) throw new AppError('The appointment must be within the next 12 months.');
      t.appointment = new Date(appt).toISOString(); t.workStage = 'Appointment scheduled'; delete t.reminders;
    }
    notify(s, staffFor(s, t), t, `Job accepted by ${m.contractor}: ${label(t)}`, now);
    return {event: 'Job accepted', detail: `Accepted by ${by} under ${contract.id}.` + (t.appointment && !Number.isNaN(appt) ? ` Visit on ${t.appointment}.` : '')};
  }

  if (kind === 'decline') {
    if (!canAccept(t, m)) throw new AppError('Only an offered job can be declined.', 409);
    if (note.length < 3) throw new AppError('Give a short reason, for example "no capacity this week".');
    const left = (t.offeredTo || []).filter(f => f !== m.contractor);
    if (t.contractor || !left.length) {
      // Nobody left to take it: back to the case manager to release it again.
      t.status = 'Confirmed'; t.contractor = ''; delete t.contractId; delete t.offeredTo; delete t.releasedAt;
      notify(s, staffFor(s, t), t, `Job declined by ${m.contractor}, release it again: ${label(t)}`, now);
    } else {
      t.offeredTo = left;
      notify(s, staffFor(s, t), t, `Job declined by ${m.contractor}; still offered to ${left.length} firm(s): ${label(t)}`, now);
    }
    return {event: 'Job declined', detail: `Declined by ${by}.`};
  }

  if (!canReport(t, m)) throw new AppError('Only the firm that accepted the job can report progress on it.', 403);
  const p = progressSchema.parse({stage: body.stage, appointment: body.appointment || undefined});
  if (p.stage === 'Appointment scheduled') {
    if (!p.appointment) throw new AppError('Choose the date and time of the appointment.');
    const at = Date.parse(p.appointment);
    if (at < Date.parse(now) - 86_400_000 || at > Date.parse(now) + 365 * 86_400_000) throw new AppError('The appointment must be within the next 12 months.');
    t.appointment = new Date(at).toISOString(); delete t.reminders;
  }
  if ((p.stage === 'Waiting for parts' || p.stage === 'Progress update') && note.length < 3) throw new AppError('Describe the progress in a few words.');
  if (p.stage === 'Work started' && t.status === 'Acknowledged') { t.status = 'Repair in progress'; t.startedAt = now; }
  if (p.stage === 'Work finished') {
    const since = t.acceptedAt || t.releasedAt || t.created;
    if (!(t.evidence || []).some(e => e.purpose === 'repair' && e.uploadedAt >= since)) throw new AppError('Add at least one photo of the finished work first.');
    t.status = 'Awaiting verification'; t.completedAt = now; t.completedBy = actual.id; t.startedAt ??= now;
  }
  t.workStage = p.stage;
  notify(s, staffFor(s, t), t, `${p.stage}: ${label(t)}`, now);
  return {event: p.stage, detail: p.stage === 'Appointment scheduled' ? `Visit on ${t.appointment}.` : undefined};
}

/**
 * What a contractor sees of a job. No prices (they are uniform under the contract), no internal notes or
 * staff, and no other firms. The tenant's contact and access details appear only once their firm has the job.
 */
export function contractorView(t: Ticket, m: Member): Ticket {
  const mine = !!m.contractor && t.contractor === m.contractor && !!(t.acceptedAt || t.status !== 'Notice prepared');
  // The contractor learns only whether their own firm is offered the job, never which other firms are.
  const offeredTo = (t.offeredTo || []).includes(m.contractor) ? [m.contractor] : undefined;
  return {...t, analyst: '', cost: undefined, reporterEmail: undefined, offeredTo, verification: undefined,
    history: t.history.filter(h => h.visibility === 'shared'), evidence: (t.evidence || []).filter(e => e.visibility === 'shared'),
    ...(mine ? {} : {contactName: undefined, contactPhone: undefined, access: undefined})};
}
