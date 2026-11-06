'use client';
// Admin settings for data protection: how long tenant contact details are kept, and requests from a person
// to see (ZZPL Art. 26) or erase (Art. 30) their data.
import {useState} from 'react';
import {tx, useLang} from '@/lib/i18n';
import {contactDays, findPersonInJobs, personalDataExport, MIN_CONTACT_DAYS, MAX_CONTACT_DAYS} from '@/lib/privacy';
import type {State} from '@/lib/domain';

export default function PrivacyCard({data, mutate, busy}: {data: State; mutate: (b: Record<string, unknown>) => Promise<boolean>; busy: boolean}) {
  useLang();
  const [days, setDays] = useState(String(contactDays(data)));
  const [query, setQuery] = useState('');
  const [confirming, setConfirming] = useState(false);
  const found = query.trim().length >= 5 ? findPersonInJobs(data, query) : [];
  const withContact = found.filter(t => t.contactName || t.contactPhone || t.reporterEmail || t.access);

  function download() {
    const blob = new Blob([JSON.stringify(personalDataExport(data, query, new Date().toISOString()), null, 2)], {type: 'application/json'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'MajstorMile_Datenauskunft.json'; a.click(); URL.revokeObjectURL(a.href);
  }

  return <div className="privacy-card" style={{marginTop: 22}}>
    <h3>{tx('Data protection')}</h3>
    <form className="form" onSubmit={async e => { e.preventDefault(); await mutate({action: 'retention', contactDays: Number(days)}); }}>
      <label>{tx('Remove tenant contact details this many days after a job is closed')}
        <input type="number" min={MIN_CONTACT_DAYS} max={MAX_CONTACT_DAYS} value={days} onChange={e => setDays(e.target.value)} required/></label>
      <p className="footnote">{tx('Name, phone, email and access details are removed automatically every night. The job itself, its address and photos stay as a record of the work.')}</p>
      <button className="secondary" disabled={busy || Number(days) === contactDays(data)}>{tx('Save retention period')}</button>
    </form>
    <div className="form" style={{marginTop: 16}}>
      <label>{tx('Request from a person: their email or phone number')}
        <input value={query} onChange={e => { setQuery(e.target.value); setConfirming(false); }} placeholder={tx('e.g. anna@example.de or 05551 123456')}/></label>
      {query.trim().length >= 5 && <p className="footnote">{tx('{0} job(s) found, {1} with contact details.', [String(found.length), String(withContact.length)])}</p>}
      <div className="button-row">
        <button type="button" className="secondary" disabled={!found.length} onClick={download}>{tx('Download their data (JSON)')}</button>
        {!confirming
          ? <button type="button" className="secondary" disabled={busy || !withContact.length} onClick={() => setConfirming(true)}>{tx('Remove their contact details')}</button>
          : <button type="button" className="primary" disabled={busy} onClick={async () => { if (await mutate({action: 'erasePerson', query})) { setConfirming(false); setQuery(''); } }}>{tx('Confirm: remove from {0} job(s)', [String(withContact.length)])}</button>}
      </div>
      <p className="footnote">{tx('Answer access and erasure requests without delay and within 30 days (extendable by up to 60 days if you tell the person within the first 30). Your property manager is responsible for the data; MajstorMile processes it on your behalf.')}</p>
    </div>
  </div>;
}
