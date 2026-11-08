// Appointment reminders, sent by the daily job (app/api/auto-close): the day before and on the day of the visit,
// to the contractor's people in the app and by email, to the case manager in the app, and to the tenant by email
// when they left one. Each reminder is sent once per appointment; a new appointment resets them.
import {isActive, type State, type Ticket, type Member} from './domain.ts';

const TZ = 'Europe/Belgrade';
const OPEN = ['Acknowledged', 'Repair in progress'];
const dayKey = (d: Date) => d.toLocaleDateString('sv-SE', {timeZone: TZ});
const timeOf = (iso: string) => new Date(iso).toLocaleTimeString('sr-RS', {timeZone: TZ, hour: '2-digit', minute: '2-digit'});
const dateOf = (iso: string) => new Date(iso).toLocaleDateString('sr-RS', {timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long'});
const realEmail = (e?: string) => !!e && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && !e.endsWith('.invalid');

export type Reminder = {ticket: Ticket; kind: 'tomorrow' | 'today'; crew: Member[]};

/** Finds the appointments to remind about now, records them on the tickets and adds the in-app notifications. */
export function appointmentReminders(s: State, now: string): Reminder[] {
  const today = dayKey(new Date(now)), tomorrow = dayKey(new Date(Date.parse(now) + 86_400_000));
  const out: Reminder[] = [];
  for (const t of s.tickets) {
    if (!t.appointment || !OPEN.includes(t.status) || t.archived || Date.parse(t.appointment) < Date.parse(now)) continue;
    const d = dayKey(new Date(t.appointment));
    const kind = d === today ? 'today' : d === tomorrow ? 'tomorrow' : null;
    if (!kind || t.reminders?.[kind] === t.appointment) continue;
    t.reminders = {...t.reminders, [kind]: t.appointment};
    const crew = s.members.filter(m => isActive(m) && m.role === 'Contractor' && !!m.contractor && m.contractor === t.contractor);
    const staff = s.members.filter(m => isActive(m) && m.id === t.analyst);
    const when = `${kind === 'today' ? 'Danas' : 'Sutra'} u ${timeOf(t.appointment)}`;
    for (const r of [...crew, ...staff]) s.notifications.unshift({id: crypto.randomUUID(), recipient: r.id, ticket: t.id, text: `Podsetnik: ${when} · ${t.title} – ${t.address || t.road}`, at: now});
    out.push({ticket: t, kind, crew});
  }
  return out;
}

/** Emails for the reminders: one per crew member with an address, and one to the tenant when they left an email. */
export function reminderEmails(list: Reminder[], appUrl: string): {to: string; subject: string; text: string}[] {
  const mails: {to: string; subject: string; text: string}[] = [];
  for (const {ticket: t, kind, crew} of list) {
    const day = kind === 'today' ? 'danas' : 'sutra';
    const at = `${dateOf(t.appointment!)} u ${timeOf(t.appointment!)}`;
    const where = [t.address || t.road, t.unit].filter(Boolean).join(', ');
    for (const m of crew) if (realEmail(m.email)) mails.push({
      to: m.email,
      subject: `Podsetnik: posao ${day} u ${timeOf(t.appointment!)} – ${t.title}`,
      text: [`Zdravo ${m.name},`, '', `Podsećamo vas na zakazanu posetu ${day}:`, '', `Termin: ${at}`, `Posao: ${t.title} (${t.id})`, `Adresa: ${where}`,
        ...(t.access ? [`Pristup: ${t.access}`] : []), ...(t.contactName || t.contactPhone ? [`Kontakt na licu mesta: ${[t.contactName, t.contactPhone].filter(Boolean).join(', ')}`] : []),
        '', 'Ako ne možete da stignete, promenite termin u aplikaciji i javite se stanaru.', '', `Otvorite posao: ${appUrl}/radni-prostor`].join('\n'),
    });
    if (realEmail(t.reporterEmail)) mails.push({
      to: t.reporterEmail!,
      subject: `Podsetnik: majstor dolazi ${day} u ${timeOf(t.appointment!)}`,
      text: ['Poštovani,', '', `Majstor firme ${t.contractor} dolazi ${day} radi prijave „${t.title}“.`, '', `Termin: ${at}`, `Adresa: ${where}`, '',
        'Molimo da neko bude kod kuće ili da ključ ostavite na recepciji, odnosno kod domara, kako je dogovoreno.',
        'Ako termin ne odgovara, javite se upravniku objekta.', '', ...(t.publicCode ? [`Status prijave: ${appUrl}/track (kod za praćenje: ${t.publicCode})`] : []), '', 'MajstorMile'].join('\n'),
    });
  }
  return mails;
}
