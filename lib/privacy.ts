// Personal data of tenants and on-site contacts: how long it is kept, and how it is erased or exported on request.
//
// GDPR Art. 5(1)(e) (storage limitation), Art. 15 (access) and Art. 17 (erasure).
// A closed job is kept as a record of the work (warranty claims under BGB §634a run 2 years, 5 years for work on a
// building), but the tenant's name, phone, email and access details are only needed to arrange the visit.
// They are removed automatically a set number of days after the job is closed, and earlier on request.
import type {State, Ticket} from './domain.ts';

/** Fields that identify or reach a private person. The job's address and description stay; they describe the work. */
export const CONTACT_FIELDS = ['contactName', 'contactPhone', 'access', 'reporterEmail'] as const;
export const DEFAULT_CONTACT_DAYS = 90;
export const MIN_CONTACT_DAYS = 14;
export const MAX_CONTACT_DAYS = 730;

const DONE = ['Verified closed', 'Rejected', 'Duplicate'];
const DAY = 86_400_000;

export const contactDays = (s: State) => s.retention?.contactDays ?? DEFAULT_CONTACT_DAYS;

/** When a finished job was finished: closure time if known, otherwise its last update. */
function finishedAt(t: Ticket): string | undefined {
  if (!DONE.includes(t.status)) return undefined;
  return t.closedAt || t.updated;
}

const hasContact = (t: Ticket) => CONTACT_FIELDS.some(k => !!t[k]);

/** Remove contact details from one job. Returns the fields that were removed. */
export function eraseContact(t: Ticket, now: string, actor: string, reason: string): string[] {
  const removed = CONTACT_FIELDS.filter(k => !!t[k]);
  if (!removed.length) return [];
  for (const k of removed) delete t[k];
  t.personalDataRemovedAt = now;
  t.updated = now;
  t.history.push({at: now, actor, action: 'Personal data removed', note: `${reason} Removed: ${removed.join(', ')}.`, visibility: 'internal'});
  return removed;
}

/** Daily sweep: remove contact details from jobs finished longer ago than the retention period. */
export function purgeExpiredContacts(s: State, now: string): number {
  const cutoff = Date.parse(now) - contactDays(s) * DAY;
  let n = 0;
  for (const t of s.tickets) {
    const done = finishedAt(t);
    if (!done || Date.parse(done) > cutoff || !hasContact(t)) continue;
    eraseContact(t, now, 'System', `Retention period of ${contactDays(s)} days after closing ended.`);
    n++;
  }
  if (n) s.events.unshift({at: now, actor: 'System', action: `Removed tenant contact details from ${n} closed job(s) after the retention period`});
  return n;
}

const norm = (x: string) => x.trim().toLowerCase();
const digits = (x: string) => x.replace(/[^0-9]/g, '').replace(/^0049|^49/, '0');

/** Jobs that mention a person, found by email or phone number (any spelling of the number). */
export function findPersonInJobs(s: State, query: string): Ticket[] {
  const q = query.trim();
  if (q.length < 5) return [];
  const email = q.includes('@') ? norm(q) : '';
  const phone = !email ? digits(q) : '';
  return s.tickets.filter(t =>
    (email && norm(t.reporterEmail || '') === email) ||
    (phone && phone.length >= 6 && !!t.contactPhone && digits(t.contactPhone) === phone));
}

/** What Baunavi holds about a person, as a portable JSON document (Art. 15 and Art. 20). */
export function personalDataExport(s: State, query: string, now: string) {
  const jobs = findPersonInJobs(s, query);
  return {
    generatedAt: now,
    request: query.trim(),
    controller: 'The property management that uses Baunavi for these jobs',
    jobs: jobs.map(t => ({
      job: t.id, trade: t.trade, issue: t.title, address: t.address || t.road, apartment: t.unit,
      contactName: t.contactName, contactPhone: t.contactPhone, email: t.reporterEmail, access: t.access,
      description: t.note, status: t.status, reported: t.created, lastUpdate: t.updated,
      photos: (t.evidence || []).map(e => ({file: e.name, takenAt: e.capturedAt, purpose: e.purpose})),
    })),
  };
}
