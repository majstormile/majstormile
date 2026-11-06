'use client';
// Public page: tenants and building managers report a defect in a house or apartment without an account
// and get a tracking code. The job is located by its postal address and apartment, never by GPS.
import {useState} from 'react';
import {tx, useLang, LangSwitch} from '@/lib/i18n';
import {instance} from '@/lib/instance';
import AddressSuggest from '@/components/address-suggest';
import {TRADES} from '@/lib/domain';
import {LegalFooterLinks} from '@/components/legal-page';

export default function ReportPage() {
  useLang();
  const [address, setAddress] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<{code: string; merged: boolean} | null>(null);
  const [preview, setPreview] = useState('');

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    if (address.trim().length < 5) { setError(tx('Enter the full address: street, house number, postcode and town.')); return; }
    const f = new FormData(e.currentTarget);
    f.set('address', address.trim());
    f.set('dangerous', f.get('dangerous') === 'on' ? 'true' : 'false');
    const photo = f.get('photo');
    if (photo instanceof File && photo.size === 0) f.delete('photo');
    setBusy(true);
    try {
      const r = await fetch('/api/public/report', {method: 'POST', body: f});
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { setError(tx(d.error || 'The report could not be sent. Please try again.')); return; }
      setDone({code: d.code, merged: !!d.merged});
      window.scrollTo({top: 0, behavior: 'smooth'});
    } catch { setError(tx('No connection. Check your internet and try again.')); }
    finally { setBusy(false); }
  }

  return <main className="public-page">
    <header className="public-head">
      <a href="/concept"><img src={instance.logo} alt={tx('MajstorMile')}/></a>
      <LangSwitch/>
    </header>
    <section className="public-card">
      {done ? <div className="report-done" role="status">
        <p className="eyebrow">{tx('REPORT RECEIVED')}</p>
        <h1>{tx('Thank you. Your report has been sent.')}</h1>
        <p className="muted">{tx(done.merged ? 'This problem was already reported for this address, so your report was added to it. That helps the team prioritise it.' : 'The property management team will review it. You can follow its progress with this code.')}</p>
        <div className="track-code"><span>{tx('Tracking code')}</span><strong>{done.code}</strong></div>
        <a className="primary" href={'/track/' + encodeURIComponent(done.code)}>{tx('Follow this report')}</a>
        <p className="muted small">{tx('Save the code or bookmark the page. No account is needed to check it.')}</p>
        <button type="button" className="text-button" onClick={() => { setDone(null); setAddress(''); setPreview(''); }}>{tx('Report another problem')}</button>
      </div> : <>
        <p className="eyebrow">{tx('REPORT A DEFECT')}</p>
        <h1>{tx('Something broken in your home?')}</h1>
        <p className="muted">{tx('Tell us where the problem is and what it is about. It takes a minute, and you get a code to follow the job.')}</p>
        <form className="form report-form" onSubmit={submit} noValidate>
          <fieldset>
            <legend>{tx('1. Where is it?')}</legend>
            <label>{tx('Address')}<AddressSuggest publicLookup value={address} onChange={setAddress} placeholder={instance.examples.address}
              near={instance.mapCenter} onPick={s => setAddress(s.label)} inputProps={{'aria-label': tx('Address'), maxLength: 300, required: true}}/></label>
            <label>{tx('Apartment / floor')}<input name="unit" maxLength={120} placeholder={tx('e.g. 2nd floor left, apartment 5')}/></label>
            <label>{tx('Access')}<input name="access" maxLength={500} placeholder={tx('e.g. key at the caretaker, tenant at home after 4 pm')}/></label>
          </fieldset>
          <fieldset>
            <legend>{tx('2. What is the problem?')}</legend>
            <label>{tx('Trade')}<select name="trade" defaultValue="Other">{TRADES.map(x => <option key={x} value={x}>{tx(x)}</option>)}</select></label>
            <label>{tx('Description')}<textarea name="description" rows={4} required minLength={5} maxLength={1000} placeholder={tx('For example: water is dripping from the ceiling in the bathroom since this morning.')}/></label>
            <label className="check"><input type="checkbox" name="dangerous"/> {tx('It is an emergency (water damage, no power, locked out, risk of injury)')}</label>
          </fieldset>
          <fieldset>
            <legend>{tx('3. Photo (optional)')}</legend>
            <label className="photo-pick">
              <input type="file" name="photo" accept="image/jpeg,image/png,image/webp" capture="environment"
                onChange={e => { const f = e.target.files?.[0]; setPreview(f ? URL.createObjectURL(f) : ''); }}/>
              {preview ? <img src={preview} alt={tx('Selected photo')}/> : <span>{tx('Take or choose a photo')}</span>}
            </label>
            <p className="muted small">{tx('Please avoid faces and personal documents in the photo.')}</p>
          </fieldset>
          <fieldset>
            <legend>{tx('4. Contact for the appointment')}</legend>
            <label>{tx('Name')}<input name="contactName" maxLength={120} autoComplete="name"/></label>
            <label>{tx('Phone')}<input name="contactPhone" type="tel" maxLength={40} autoComplete="tel"/></label>
            <label>{tx('Email (optional)')}<input type="email" name="email" autoComplete="email" placeholder={tx('Only used if the team needs to ask you something')}/></label>
            <p className="muted small">{tx('Your name and phone are shared only with the tradesperson who takes the job, to agree an appointment.')}</p>
          </fieldset>
          <label className="hp" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off"/></label>
          {error && <p className="access-error" role="alert">{error}</p>}
          <button className="primary" disabled={busy}>{tx(busy ? 'Sending…' : 'Send report')}</button>
          <p className="muted small">{tx('Your report is stored by the property management to organise the repair. It is not an emergency service: for immediate danger, call {0}.', [instance.emergency])} <a href="/politika-privatnosti">{tx('How we handle your data')}</a></p>
        </form>
      </>}
      <p className="public-links"><a href="/track">{tx('Check a report with your code')}</a> · <LegalFooterLinks/></p>
    </section>
  </main>;
}
