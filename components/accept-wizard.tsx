'use client';
// Contractors: a new job offer pops up when they open the app, and accepting goes through four steps:
// the job, the contract, the appointment, confirm. Afterwards they can let the tenant know by SMS, Viber or WhatsApp.
import {useEffect, useMemo, useState} from 'react';
import {toast} from 'sonner';
import {BellRing, CalendarClock, CheckCircle2, FileText, Hammer, MapPin, MessageCircle, Phone, X} from 'lucide-react';
import {tx, useLang, locale} from '@/lib/i18n';
import {authorizedFetch} from '@/lib/supabase-browser';
import type {Member, State, Ticket} from '@/lib/domain';

type Contract = State['contracts'][number];
type Props = {ticket: Ticket; viewer: Member; contracts: Contract[]; revision: number; persona: string; onClose: () => void; onChanged: () => Promise<void>};

const STEPS = ['Job', 'Contract', 'Appointment', 'Confirm'];
const HOURS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const fmt = (iso: string, o: Intl.DateTimeFormatOptions) => new Date(iso).toLocaleString(locale(), o);
/** Serbian mobile numbers (06x…) to international digits (3816x…) for WhatsApp links. */
export const intlDigits = (p: string) => { const d = p.replace(/\D/g, ''); return d.startsWith('00') ? d.slice(2) : d.startsWith('0') ? '381' + d.slice(1) : d; };

export function tenantMessage(t: Ticket, firm: string) {
  const at = t.appointment ? fmt(t.appointment, {weekday: 'long', day: 'numeric', month: 'long'}) + ' ' + tx('at') + ' ' + fmt(t.appointment, {hour: '2-digit', minute: '2-digit'}) : '';
  return tx('Hello, this is the tradesperson from {0}. I am coming on {1} to {2} about: {3}. Please make sure someone is at home or the key is at reception. Thank you!', [firm, at, [t.address || t.road, t.unit].filter(Boolean).join(', '), t.title]);
}

/** Buttons that open SMS, Viber or WhatsApp with the appointment message ready to send. */
export function NotifyTenant({ticket: t, firm}: {ticket: Ticket; firm: string}) {
  useLang();
  if (!t.contactPhone || !t.appointment) return null;
  const msg = encodeURIComponent(tenantMessage(t, firm));
  const tel = t.contactPhone.replace(/[^\d+]/g, '');
  return <div className="notify-tenant">
    <p><b>{tx('Let the tenant know')}</b>{t.contactName ? ' · ' + t.contactName : ''} · {t.contactPhone}</p>
    <div className="notify-btns">
      <a className="nt-btn sms" href={`sms:${tel}?body=${msg}`}><MessageCircle size={18}/>SMS</a>
      <a className="nt-btn viber" href={`viber://forward?text=${msg}`}><MessageCircle size={18}/>Viber</a>
      <a className="nt-btn wa" href={`https://wa.me/${intlDigits(t.contactPhone)}?text=${msg}`} target="_blank" rel="noopener noreferrer"><MessageCircle size={18}/>WhatsApp</a>
      <a className="nt-btn call" href={`tel:${tel}`}><Phone size={18}/>{tx('Call')}</a>
    </div>
  </div>;
}

export default function AcceptWizard({ticket: t, viewer, contracts, revision, persona, onClose, onChanged}: Props) {
  useLang();
  const [step, setStep] = useState(0);
  const [day, setDay] = useState(''), [hour, setHour] = useState(''), [custom, setCustom] = useState('');
  const [agree, setAgree] = useState(false), [working, setWorking] = useState(false), [done, setDone] = useState(false);
  const [declining, setDeclining] = useState(false), [reason, setReason] = useState('');
  const suffix = persona === 'owner' ? '' : '?persona=' + encodeURIComponent(persona);
  const firm = viewer.contractor || '';
  const contract = useMemo(() => contracts.find(c => c.id === t.contractId) || contracts.find(c => c.contractor === firm && (!c.trade || c.trade === t.trade) && c.end >= ymd(new Date())) || contracts.find(c => c.contractor === firm), [contracts, t, firm]);
  const days = useMemo(() => Array.from({length: 7}, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return d; }), []);
  const time = custom || hour;
  const appointment = day && time ? new Date(`${day}T${time}`) : null;
  const apptOk = !!appointment && appointment.getTime() > Date.now() - 3_600_000;
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === 'Escape' && !working) onClose(); }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, [onClose, working]);

  async function post(body: Record<string, unknown>) {
    setWorking(true);
    try {
      const r = await authorizedFetch('/api/workspace' + suffix, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({action: 'job', id: t.id, ...body, revision})});
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || 'The update could not be saved.');
      await onChanged();
      return true;
    } catch (e) { toast.error(tx((e as Error).message)); return false; } finally { setWorking(false); }
  }
  async function accept() {
    if (!apptOk || !agree) return;
    if (await post({job: 'accept', appointment: appointment!.toISOString()})) { setDone(true); toast.success(tx('Job accepted')); }
  }
  async function decline() { if (reason.trim().length >= 3 && await post({job: 'decline', note: reason.trim()})) { toast.success(tx('Job declined')); onClose(); } }
  const next = () => { if (step === 2 && !apptOk) { toast.error(tx('Choose the day and time of the visit.')); return; } setStep(step + 1); };
  const urgent = t.severity === 'Urgent';

  return <div className="aw-wrap" role="dialog" aria-modal="true" aria-label={tx('Accept job')}>
    <div className="aw">
      <div className="aw-top">
        <strong>{done ? tx('Job accepted') : tx('New job offer')}</strong>
        <button className="icon-btn" aria-label={tx('Close')} onClick={onClose} disabled={working}><X size={22}/></button>
      </div>
      {!done && <div className="wiz-steps aw-steps">{STEPS.map((x, i) => <button type="button" key={x} className={'wiz-dot' + (i === step ? ' on' : '') + (i < step ? ' done' : '')} disabled={i > step} onClick={() => i < step && setStep(i)}><b>{i < step ? '✓' : i + 1}</b><span>{tx(x)}</span></button>)}</div>}
      <div className="aw-body">
        {done ? <div className="aw-done">
          <CheckCircle2 size={56} className="aw-ok"/>
          <h2>{tx('The job is yours')}</h2>
          <p className="aw-when"><CalendarClock size={18}/>{t.appointment ? fmt(t.appointment, {dateStyle: 'full', timeStyle: 'short'}) : ''}</p>
          <p className="muted">{tx('We will remind you and the tenant the day before and on the morning of the visit.')}</p>
          {t.access && <p><b>{tx('Access')}:</b> {t.access}</p>}
          <NotifyTenant ticket={t} firm={firm}/>
        </div> : step === 0 ? <div className="aw-card">
          {urgent && <span className="aw-urgent">{tx('Urgent')}</span>}
          <h2>{t.title}</h2>
          <p className="aw-line"><MapPin size={18}/>{t.address || t.road}{t.unit ? ' · ' + t.unit : ''}</p>
          <p className="aw-line"><Hammer size={18}/>{tx(t.trade || 'Other')} · {tx(t.severity)}</p>
          {t.note && <p className="aw-note">{t.note}</p>}
          <p className="muted">{tx('{0} photos', [String((t.evidence || []).length)])} · {tx('Reported {0}', [fmt(t.created, {dateStyle: 'medium'})])}</p>
          <p className="footnote">{tx('The tenant contact and access details appear once you accept.')}</p>
          {!declining ? <button type="button" className="text-button aw-decline" onClick={() => setDeclining(true)}>{tx('I cannot take this job')}</button> : <div className="form">
            <label>{tx('Reason for declining')}<input value={reason} onChange={e => setReason(e.target.value)} maxLength={300} placeholder={tx('e.g. no capacity this week')}/></label>
            <div className="button-row"><button className="secondary" disabled={working || reason.trim().length < 3} onClick={decline}>{tx('Decline job')}</button><button className="text-button" type="button" onClick={() => setDeclining(false)}>{tx('Cancel')}</button></div>
          </div>}
        </div> : step === 1 ? <div className="aw-card">
          <h2><FileText size={20}/> {tx('Contract')}</h2>
          {contract ? <dl className="aw-dl">
            <dt>{tx('Contract')}</dt><dd>{contract.id}</dd>
            <dt>{tx('Contractor')}</dt><dd>{contract.contractor}</dd>
            {contract.trade && <><dt>{tx('Trade')}</dt><dd>{tx(contract.trade)}</dd></>}
            <dt>{tx('Valid')}</dt><dd>{fmt(contract.start, {dateStyle: 'medium'})} – {fmt(contract.end, {dateStyle: 'medium'})}</dd>
            {contract.scope && <><dt>{tx('Scope')}</dt><dd>{contract.scope}</dd></>}
            {contract.notes && <><dt>{tx('Terms')}</dt><dd>{contract.notes}</dd></>}
          </dl> : <p className="muted">{tx('No contract details are available for this job. The management will confirm the terms.')}</p>}
          <p className="footnote">{tx('Prices and warranty follow this contract. The job is paid under its terms.')}</p>
        </div> : step === 2 ? <div className="aw-card">
          <h2><CalendarClock size={20}/> {tx('When will you come?')}</h2>
          {urgent && <p className="aw-urgent-note">{tx('Urgent job: please come today or tomorrow.')}</p>}
          <p className="aw-label">{tx('Day')}</p>
          <div className="aw-chips">{days.map((d, i) => { const v = ymd(d); return <button type="button" key={v} className={'chip' + (day === v ? ' on' : '')} onClick={() => setDay(v)}>{i === 0 ? tx('Today') : i === 1 ? tx('Tomorrow') : d.toLocaleDateString(locale(), {weekday: 'short', day: 'numeric', month: 'numeric'})}</button>; })}
            <label className="chip chip-date">{tx('Other day')}<input type="date" min={ymd(new Date())} value={day && !days.some(d => ymd(d) === day) ? day : ''} onChange={e => setDay(e.target.value)}/></label></div>
          <p className="aw-label">{tx('Time')}</p>
          <div className="aw-chips">{HOURS.map(h => <button type="button" key={h} className={'chip' + (!custom && hour === h ? ' on' : '')} onClick={() => { setHour(h); setCustom(''); }}>{h}</button>)}
            <label className="chip chip-date">{tx('Other time')}<input type="time" value={custom} onChange={e => setCustom(e.target.value)}/></label></div>
          {appointment && <p className={'aw-pick' + (apptOk ? '' : ' bad')}>{apptOk ? fmt(appointment.toISOString(), {dateStyle: 'full', timeStyle: 'short'}) : tx('This time has already passed.')}</p>}
        </div> : <div className="aw-card">
          <h2>{tx('Check and accept')}</h2>
          <dl className="aw-dl">
            <dt>{tx('Job')}</dt><dd><b>{t.title}</b><br/>{t.address || t.road}{t.unit ? ' · ' + t.unit : ''}</dd>
            <dt>{tx('Contract')}</dt><dd>{contract?.id || '—'}</dd>
            <dt>{tx('Visit')}</dt><dd><b>{appointment ? fmt(appointment.toISOString(), {dateStyle: 'full', timeStyle: 'short'}) : '—'}</b></dd>
          </dl>
          <label className="check aw-agree"><input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)}/>{tx('I accept this job under the contract and will come at the agreed time.')}</label>
        </div>}
      </div>
      <div className="aw-nav">
        {done ? <button className="primary" onClick={onClose}>{tx('Done')}</button> : <>
          <button className="secondary" disabled={working} onClick={() => step ? setStep(step - 1) : onClose()}>{tx(step ? 'Back' : 'Later')}</button>
          {step < 3 ? <button className="primary" onClick={next}>{tx('Next')}</button> : <button className="primary" disabled={working || !agree || !apptOk} onClick={accept}><CheckCircle2 size={18}/>{tx(working ? 'Saving…' : 'Accept job')}</button>}
        </>}
      </div>
    </div>
  </div>;
}

/** Pops up when a contractor has job offers waiting. "Later" hides it until the next visit. */
export function OfferPopup({offers, onOpen}: {offers: Ticket[]; onOpen: (t: Ticket) => void}) {
  useLang();
  const [hidden, setHidden] = useState<string>(() => { try { return sessionStorage.getItem('mm-offers-later') || ''; } catch { return ''; } });
  const key = offers.map(o => o.id).sort().join(',');
  if (!offers.length || hidden === key) return null;
  const t = offers[0];
  const later = () => { try { sessionStorage.setItem('mm-offers-later', key); } catch {} setHidden(key); };
  return <div className="aw-wrap offer" role="dialog" aria-modal="true" aria-label={tx('New job offer')}>
    <div className="aw offer-card">
      <div className="offer-bell"><BellRing size={30}/></div>
      <h2>{offers.length > 1 ? tx('{0} new job offers', [String(offers.length)]) : tx('New job offer')}</h2>
      <div className="offer-job">
        {t.severity === 'Urgent' && <span className="aw-urgent">{tx('Urgent')}</span>}
        <b>{t.title}</b>
        <span><MapPin size={16}/>{t.address || t.road}</span>
        <span><Hammer size={16}/>{tx(t.trade || 'Other')}</span>
      </div>
      <div className="aw-nav">
        <button className="secondary" onClick={later}>{tx('Later')}</button>
        <button className="primary" onClick={() => onOpen(t)}>{tx('View and accept')}</button>
      </div>
    </div>
  </div>;
}
