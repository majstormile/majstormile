// Ticket workflow as seven phases from report to closure, derived from status and history.
// Pure functions: used by the ticket stepper, the next-step card and the tickets table.
import {type Ticket, type Member, type Status, permitted, nextStages} from './domain.ts';
import {canAccept, canReport} from './jobs.ts';

export type Phase = {key: string; label: string; statuses: Status[]};
export const PHASES: Phase[] = [
  {key: 'reported', label: 'Reported', statuses: ['Detected']},
  {key: 'routed', label: 'Routed', statuses: ['Team assigned', 'Analyst assigned']},
  {key: 'investigation', label: 'Investigation', statuses: ['Investigating', 'Confirmed']},
  {key: 'notice', label: 'Contractor notice', statuses: ['Notice prepared', 'Acknowledged']},
  {key: 'repair', label: 'Repair', statuses: ['Repair in progress']},
  {key: 'verification', label: 'Verification', statuses: ['Awaiting verification']},
  {key: 'closed', label: 'Closed', statuses: ['Verified closed']},
];

export type StepState = 'done' | 'current' | 'upcoming' | 'skipped';
export type Step = {phase: Phase; state: StepState; at?: string; status?: Status};
export type Flow = {
  steps: Step[];
  current: number; // index into PHASES
  /** Side condition shown as a banner over the stepper. */
  flag?: 'reopened' | 'on-hold' | 'rejected' | 'duplicate' | 'pending-closure';
  ended: boolean;
};

const phaseOf = (s: string) => PHASES.findIndex(p => (p.statuses as string[]).includes(s));
// Assignments are logged as their own event; they mark the routing phase.
const ROUTING_EVENTS = ['Assignment updated', 'Assignment recorded'];
// Contractor reports move the job on without a separate stage change; they count as that stage.
const JOB_EVENTS: Record<string, Status> = {'Job accepted': 'Acknowledged', 'Work started': 'Repair in progress', 'Work finished': 'Awaiting verification'};
const asStatus = (action: string) => JOB_EVENTS[action] || action;
const historyPhase = (action: string) => ROUTING_EVENTS.includes(action) ? 1 : phaseOf(asStatus(action));

/** Where a ticket stands: which phases are done, current, skipped or still ahead, with the date each was reached. */
export function ticketFlow(t: Ticket): Flow {
  let flag: Flow['flag'];
  let status: string = t.status;
  if (t.status === 'On hold') { flag = 'on-hold'; status = t.holdFrom || 'Investigating'; }
  if (t.status === 'Reopened') { flag = 'reopened'; status = 'Investigating'; }
  if (t.status === 'Rejected') flag = 'rejected';
  if (t.status === 'Duplicate') flag = 'duplicate';
  if (t.pendingClosureAt && t.status !== 'Verified closed') flag = 'pending-closure';
  const ended = ['Verified closed', 'Rejected', 'Duplicate'].includes(t.status);

  // Only the latest pass counts: after a reopen, earlier repair and verification steps start again.
  const history = t.history || [];
  let from = 0;
  for (let i = history.length - 1; i >= 0; i--) if (history[i].action === 'Reopened') { from = i; break; }
  const reached = new Map<number, {at: string; status: Status}>();
  reached.set(0, {at: t.created, status: 'Detected'});
  history.forEach((h, i) => {
    const p = historyPhase(h.action);
    if (p < 0) return;
    if (i < from && p > phaseOf('Investigating')) return;
    const prev = reached.get(p);
    reached.set(p, {at: h.at, status: phaseOf(asStatus(h.action)) === p ? asStatus(h.action) as Status : prev?.status || PHASES[p].statuses[0]});
  });

  let current = phaseOf(status);
  if (current < 0) {
    // Rejected or duplicate: the flow stops at the last phase reached.
    current = Math.max(...[...reached.keys()]);
  }
  const steps: Step[] = PHASES.map((phase, i) => {
    const r = reached.get(i);
    // Only the contractor notice can be bypassed (confirmed straight to repair); earlier phases are always passed through.
    if (i < current) return {phase, state: r || phase.key !== 'notice' ? 'done' : 'skipped', at: r?.at, status: r?.status};
    if (i === current) {
      const closedNow = t.status === 'Verified closed';
      return {phase, state: closedNow ? 'done' : 'current', at: r?.at || t.updated, status: (phaseOf(t.status) === i ? t.status : r?.status) as Status};
    }
    return {phase, state: 'upcoming'};
  });
  return {steps, current, flag, ended};
}

/** Share of the workflow completed, 0 to 1, for compact progress bars. */
export function progress(t: Ticket): number {
  const f = ticketFlow(t);
  if (t.status === 'Verified closed') return 1;
  return f.current / (PHASES.length - 1);
}

export type NextStep = {
  /** English UI text; translated where shown. */
  text: string;
  /** Role (English name) expected to act next, if anyone. */
  who?: string;
  /** Where the action happens in the ticket. */
  target?: 'assignment' | 'stage' | 'evidence' | 'job';
  /** Suggested next stage when target is 'stage'. */
  stage?: string;
  /** True when the current viewer can take this step. */
  mine: boolean;
};

/** The single most useful next action on a ticket, and whether the viewer can take it. */
export function nextStep(t: Ticket, viewer: Member): NextStep {
  const can = (stage: string) => nextStages(t).includes(stage) && permitted(viewer, t, stage);
  const canAssign = ['Admin', 'Head Analyst'].includes(viewer.role);
  const isAnalyst = t.analyst === viewer.id;
  switch (t.status) {
    case 'Detected':
      return {text: 'Route the ticket to a team so it can be investigated.', who: 'Head Analyst', target: 'assignment', mine: canAssign};
    case 'Team assigned':
      return {text: 'Assign an analyst from the team.', who: 'Head Analyst', target: 'assignment', mine: canAssign};
    case 'Analyst assigned':
      return {text: 'Start the investigation: check the location, photos and source.', who: 'Analyst', target: 'stage', stage: 'Investigating', mine: can('Investigating') && (isAnalyst || canAssign)};
    case 'Investigating':
      return {text: 'Confirm the defect, or mark it as rejected or a duplicate.', who: 'Analyst', target: 'stage', stage: 'Confirmed', mine: can('Confirmed') && (isAnalyst || canAssign)};
    case 'Confirmed':
      return t.contractId || t.contractor
        ? {text: 'Release the job to the contractor under the matching contract, or to all contractors for this trade.', who: 'Analyst', target: 'stage', stage: 'Notice prepared', mine: can('Notice prepared')}
        : {text: 'Release the job to the contractors for this trade, or start the work with your own staff.', who: 'Analyst', target: 'stage', stage: 'Notice prepared', mine: can('Notice prepared')};
    case 'Notice prepared':
      return t.acceptedAt
        ? {text: 'The contractor accepted the job and agrees an appointment.', who: 'Contractor', target: 'job', mine: canReport({...t, status: 'Acknowledged'}, viewer)}
        : {text: t.contractor ? 'Released to the contractor. Waiting for them to accept the job.' : 'Released to all contractors for this trade. The first to accept takes the job.', who: 'Contractor', target: 'job', mine: canAccept(t, viewer)};
    case 'Acknowledged':
      return {text: 'The contractor agrees an appointment with the tenant and starts the work.', who: 'Contractor', target: 'job', mine: canReport(t, viewer)};
    case 'Repair in progress':
      return {text: 'The contractor posts progress with photos and reports the job finished when done.', who: 'Contractor', target: 'job', mine: canReport(t, viewer)};
    case 'Awaiting verification':
      return {text: 'Check the finished work and sign it off with a clear photo taken after it was finished.', who: 'Auditor', target: 'stage', stage: 'Verified closed', mine: can('Verified closed')};
    case 'Reopened':
      return {text: 'The repair did not hold. Check it again, then release the job again.', who: 'Analyst', target: 'stage', stage: 'Investigating', mine: can('Investigating')};
    case 'On hold':
      return {text: 'Work is paused. Resume when the blocking issue is resolved.', who: 'Head Analyst', target: 'stage', stage: t.holdFrom || 'Investigating', mine: can(t.holdFrom || 'Investigating')};
    case 'Verified closed':
      return {text: 'Closed and verified. Reopen it if the defect comes back.', mine: false};
    case 'Rejected':
      return {text: 'Rejected. No further action is needed.', mine: false};
    case 'Duplicate':
      return {text: 'Marked as a duplicate. Work continues on the primary ticket.', mine: false};
  }
  return {text: '', mine: false};
}
