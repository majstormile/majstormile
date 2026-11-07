'use client';
// Public support page: WhatsApp and Viber chat with MajstorMile support.
import {tx, useLang, LangSwitch} from '@/lib/i18n';
import {instance} from '@/lib/instance';
import {LegalFooterLinks} from '@/components/legal-page';
import {operator} from '@/lib/legal';
import {useState} from 'react';
import {MessageCircle, Phone} from 'lucide-react';

const PHONE = '+381 61 623 0364';
const DIGITS = PHONE.replace(/\D/g, '');

function TicketForm() {
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');
  const [ref, setRef] = useState('');
  const topics = ['Question', 'Technical problem', 'Subscription and pilot', 'Account and sign-in', 'Other'];
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setError(''); setState('sending');
    const d = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    try {
      const r = await fetch('/api/support', {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify(d)});
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || 'Your message could not be sent right now. Please try again later.');
      setRef(j.ref || ''); setState('sent');
    } catch (err) { setError(tx((err as Error).message)); setState('idle'); }
  };
  if (state === 'sent') return <div className="support-sent"><h2>{tx('Thank you, your request has been sent.')}</h2><p className="muted">{tx('Reference number: {0}. We will reply to your email address.', [ref])}</p></div>;
  return <form className="support-form" onSubmit={submit}>
    <h2>{tx('Send a support request')}</h2>
    <label>{tx('Name')}<input name="name" required maxLength={120} autoComplete="name"/></label>
    <label>{tx('Email')}<input name="email" type="email" required maxLength={200} autoComplete="email"/></label>
    <label>{tx('Phone (optional)')}<input name="phone" type="tel" maxLength={40} autoComplete="tel"/></label>
    <label>{tx('Topic')}<select name="topic" defaultValue={topics[0]}>{topics.map(t => <option key={t} value={t}>{tx(t)}</option>)}</select></label>
    <label>{tx('Message')}<textarea name="message" required minLength={5} maxLength={4000} rows={6}/></label>
    <input name="website" tabIndex={-1} autoComplete="off" className="hp" aria-hidden="true"/>
    {error && <p className="form-error" role="alert">{error}</p>}
    <button type="submit" className="primary" disabled={state === 'sending'}>{tx(state === 'sending' ? 'Sending…' : 'Send request')}</button>
    <p className="muted small">{tx('We use your details only to answer this request.')} <a href="/politika-privatnosti">{tx('Privacy Policy')}</a></p>
  </form>;
}

export default function SupportPage() {
  useLang();
  return <main className="public-page">
    <header className="public-head">
      <a href="/"><img src={instance.logo} alt={tx('MajstorMile')}/></a>
      <LangSwitch/>
    </header>
    <section className="public-card">
      <p className="eyebrow">{tx('SUPPORT')}</p>
      <h1>{tx('How can we help?')}</h1>
      <p className="muted">{tx('Write to us on WhatsApp or Viber. We usually reply within one working day.')}</p>
      <div className="support-buttons">
        <a className="support-btn whatsapp" href={`https://wa.me/${DIGITS}`} target="_blank" rel="noopener noreferrer">
          <MessageCircle size={22}/> {tx('Chat on WhatsApp')}
        </a>
        <a className="support-btn viber" href={`viber://chat?number=%2B${DIGITS}`}>
          <Phone size={22}/> {tx('Chat on Viber')}
        </a>
      </div>
      <p className="muted">{tx('Phone')}: <a href={`tel:+${DIGITS}`}>{PHONE}</a>{operator.email ? <> · {tx('Email')}: <a href={`mailto:${operator.email}`}>{operator.email}</a></> : null}</p>
      <TicketForm/>
      <p className="muted">{tx('To report a defect in your building, use the report form instead, so it reaches your property manager directly.')}</p>
      <p className="public-links"><a href="/report">{tx('Report a defect')}</a> · <a href="/radni-prostor">{tx('Open MajstorMile in the browser')}</a> · <LegalFooterLinks/></p>
    </section>
  </main>;
}
