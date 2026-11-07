'use client';
// Admin view: support requests from the public /podrska form, with status and internal notes.
import {useEffect, useMemo, useState} from 'react';
import {Inbox, Mail, Phone, RefreshCw} from 'lucide-react';
import {toast} from 'sonner';
import {tx, useLang, locale} from '@/lib/i18n';
import {authorizedFetch} from '@/lib/supabase-browser';

type Status = 'new' | 'open' | 'answered' | 'closed';
type Req = {id: string; ref: string; created_at: string; updated_at: string; name: string; email: string; phone: string | null; topic: string; message: string; status: Status; notes: string; handled_by: string | null};
const STATUS: Record<Status, string> = {new: 'New', open: 'In progress', answered: 'Answered', closed: 'Closed'};
const FILTERS: (Status | 'active' | 'all')[] = ['active', 'new', 'open', 'answered', 'closed', 'all'];
const FILTER_LABEL: Record<string, string> = {active: 'Not closed', all: 'All', ...STATUS};

export default function SupportInbox({onCount}: {onCount?: (n: number) => void}) {
  useLang();
  const [list, setList] = useState<Req[] | null>(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('active');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const apply = (r: Req[]) => { setList(r); onCount?.(r.filter(x => x.status === 'new').length); };
  async function load() {
    try { const r = await authorizedFetch('/api/support-inbox'); const d = await r.json(); if (!r.ok) throw new Error(d.error); apply(d.requests); setError(''); }
    catch (e) { setError((e as Error).message); setList([]); }
  }
  useEffect(() => { void load(); }, []);

  async function save(id: string, patch: {status?: Status; notes?: string}) {
    setBusy(true);
    try {
      const r = await authorizedFetch('/api/support-inbox', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({id, ...patch})});
      const d = await r.json(); if (!r.ok) throw new Error(d.error);
      apply(d.requests); toast.success(tx('Saved'));
    } catch (e) { toast.error(tx((e as Error).message)); } finally { setBusy(false); }
  }

  const shown = useMemo(() => (list || []).filter(r => filter === 'all' ? true : filter === 'active' ? r.status !== 'closed' : r.status === filter)
    .filter(r => !q.trim() || [r.ref, r.name, r.email, r.phone || '', r.topic, r.message, r.notes].join(' ').toLowerCase().includes(q.trim().toLowerCase())), [list, filter, q]);
  const when = (s: string) => new Date(s).toLocaleString(locale(), {dateStyle: 'medium', timeStyle: 'short'});

  return <section className="panel support-inbox">
    <div className="section-head"><div><h2>{tx('Support requests')}</h2><p>{tx('Requests sent from the support page. Closed requests are deleted automatically after two years.')}</p></div>
      <div className="button-row"><button className="secondary" onClick={() => void load()}><RefreshCw size={16}/> {tx('Refresh')}</button></div></div>
    <div className="inbox-tools">
      <div className="inbox-filters">{FILTERS.map(f => <button key={f} className={'chip' + (filter === f ? ' active' : '')} onClick={() => setFilter(f)}>{tx(FILTER_LABEL[f])}{list ? ` (${(list.filter(r => f === 'all' ? true : f === 'active' ? r.status !== 'closed' : r.status === f)).length})` : ''}</button>)}</div>
      <input className="inbox-search" placeholder={tx('Search name, email, reference or text')} value={q} onChange={e => setQ(e.target.value)}/>
    </div>
    {error && <p className="form-error">{tx(error)}</p>}
    {list === null ? <p className="muted">{tx('Loading…')}</p> : !shown.length ? <div className="empty"><Inbox size={30}/><h3>{tx('No support requests here')}</h3></div> :
      shown.map(r => <div key={r.id} className={'inbox-row status-' + r.status}>
        <button className="inbox-head" onClick={() => setOpen(open === r.id ? null : r.id)}>
          <span className={'inbox-badge ' + r.status}>{tx(STATUS[r.status])}</span>
          <strong>{r.name}</strong><span className="muted">{tx(r.topic)}</span>
          <small className="muted">{r.ref} · {when(r.created_at)}</small>
        </button>
        {open === r.id && <div className="inbox-body">
          <p className="inbox-message">{r.message}</p>
          <p className="inbox-contact">
            <a href={`mailto:${r.email}?subject=${encodeURIComponent(`Re: [${r.ref}] ${r.topic}`)}`}><Mail size={15}/> {r.email}</a>
            {r.phone && <a href={`tel:${r.phone.replace(/[^\d+]/g, '')}`}><Phone size={15}/> {r.phone}</a>}
            {r.phone && <a href={`https://wa.me/${r.phone.replace(/\D/g, '').replace(/^0/, '381')}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>}
          </p>
          <label className="inbox-label">{tx('Status')}
            <select value={r.status} disabled={busy} onChange={e => void save(r.id, {status: e.target.value as Status})}>{(Object.keys(STATUS) as Status[]).map(s => <option key={s} value={s}>{tx(STATUS[s])}</option>)}</select>
          </label>
          <label className="inbox-label">{tx('Internal notes')}
            <textarea rows={4} value={notes[r.id] ?? r.notes} onChange={e => setNotes({...notes, [r.id]: e.target.value})}/>
          </label>
          <div className="button-row">
            <button className="primary" disabled={busy || (notes[r.id] ?? r.notes) === r.notes} onClick={() => void save(r.id, {notes: notes[r.id]})}>{tx('Save notes')}</button>
            {r.status !== 'closed' && <button className="secondary" disabled={busy} onClick={() => void save(r.id, {status: 'closed'})}>{tx('Close request')}</button>}
          </div>
          {r.handled_by && <p className="footnote">{tx('Last changed by {0} on {1}', [r.handled_by, when(r.updated_at)])}</p>}
        </div>}
      </div>)}
  </section>;
}
