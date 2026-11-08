'use client';
// Apartment owners and tenants (role Resident): a simple view of their own report, its progress,
// the agreed visit and, once a firm has accepted it, the tradesperson's contact.
import {Check, CalendarClock, Hammer, MapPin, Phone, MessageCircle, Mail, ExternalLink} from 'lucide-react';
import {tx, useLang, locale} from '@/lib/i18n';
import {ticketFlow} from '@/lib/workflow';
import {intlDigits} from '@/components/accept-wizard';
import type {Ticket} from '@/lib/domain';

type Contact = {name?: string; phone?: string; email?: string};
export default function ResidentTicket({ticket: t}: {ticket: Ticket & {residentContact?: Contact}}) {
  useLang();
  const flow = ticketFlow(t), c = t.residentContact;
  const day = (s: string) => new Date(s).toLocaleDateString(locale(), {dateStyle: 'medium'});
  return <div className="resident-ticket">
    <p className="aw-line"><MapPin size={18}/>{t.address || t.road}{t.unit ? ' · ' + t.unit : ''}</p>
    <p className="aw-line"><Hammer size={18}/>{tx(t.trade || 'Other')}{t.contractor ? ' · ' + t.contractor : ''}</p>
    {t.appointment && !['Verified closed', 'Rejected', 'Duplicate'].includes(t.status) && <p className="aw-when"><CalendarClock size={18}/>{new Date(t.appointment).toLocaleString(locale(), {dateStyle: 'full', timeStyle: 'short'})}</p>}
    {c && <div className="track-contact">
      <p><b>{tx('Your tradesperson')}</b>{c.name ? ': ' + c.name : ''}</p>
      <div className="notify-btns">
        {c.phone && <a className="nt-btn call" href={'tel:' + c.phone.replace(/[^\d+]/g, '')}><Phone size={18}/>{c.phone}</a>}
        {c.phone && <a className="nt-btn wa" href={'https://wa.me/' + intlDigits(c.phone)} target="_blank" rel="noopener noreferrer"><MessageCircle size={18}/>WhatsApp</a>}
        {c.phone && <a className="nt-btn viber" href={'viber://chat?number=%2B' + intlDigits(c.phone)}><MessageCircle size={18}/>Viber</a>}
        {c.email && <a className="nt-btn sms" href={'mailto:' + c.email}><Mail size={18}/>{tx('Email')}</a>}
      </div>
    </div>}
    {t.note && <p className="aw-note">{t.note}</p>}
    <ol className="track-steps">
      {flow.steps.map((s, i) => <li key={s.phase.key} className={s.state}>
        <span className="dot">{s.state === 'done' ? <Check size={14}/> : i + 1}</span>
        <div><strong>{tx(s.phase.label)}</strong>{s.at && s.state !== 'upcoming' && <small>{day(s.at)}</small>}</div>
      </li>)}
    </ol>
    {t.publicCode && <p><a href={'/track/' + t.publicCode} target="_blank" rel="noopener noreferrer"><ExternalLink size={14}/> {tx('Public tracking page')}</a></p>}
  </div>;
}
