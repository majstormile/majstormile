'use client';
// The contractor's side of a job: accept or decline a released job, then report progress with photos.
// Managers see the same panel read-only, as a summary of what the contractor reported.
import {useEffect, useState} from 'react';
import {toast} from 'sonner';
import {CalendarClock, CheckCircle2, Hammer, PackageSearch, MessageSquare, Play, XCircle} from 'lucide-react';
import {tx, useLang, locale} from '@/lib/i18n';
import {authorizedFetch} from '@/lib/supabase-browser';
import {canAccept, canReport, JOB_STAGES, type JobStage} from '@/lib/jobs';
import type {Member, Ticket} from '@/lib/domain';

const STAGE_ICON: Record<JobStage, typeof Play> = {
  'Appointment scheduled': CalendarClock, 'Work started': Play, 'Waiting for parts': PackageSearch, 'Progress update': MessageSquare, 'Work finished': CheckCircle2,
};
const when = (iso?: string) => iso ? new Date(iso).toLocaleString(locale(), {dateStyle: 'medium', timeStyle: 'short'}) : '';
const localInput = (d = new Date()) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

type Props = {ticket: Ticket; viewer: Member; revision: number; persona: string; busy: boolean; onChanged: () => Promise<void>};

export default function JobPanel({ticket: t, viewer, revision, persona, busy, onChanged}: Props) {
  useLang();
  const suffix = persona === 'owner' ? '' : '?persona=' + encodeURIComponent(persona);
  const [working, setWorking] = useState(false);
  const [reason, setReason] = useState('');
  const [declining, setDeclining] = useState(false);
  const [stage, setStage] = useState<JobStage>(t.status === 'Acknowledged' ? (t.appointment ? 'Work started' : 'Appointment scheduled') : 'Progress update');
  const [appointment, setAppointment] = useState(t.appointment ? localInput(new Date(t.appointment)) : '');
  const [note, setNote] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [urls, setUrls] = useState<string[]>([]);
  useEffect(() => { const u = files.map(f => URL.createObjectURL(f)); setUrls(u); return () => u.forEach(x => URL.revokeObjectURL(x)); }, [files]);

  const offered = canAccept(t, viewer), reporting = canReport(t, viewer);
  const JOB_EVENTS: string[] = [...JOB_STAGES, 'Job accepted', 'Job declined'];
  const updates = (t.history || []).filter(h => h.visibility === 'shared' && JOB_EVENTS.includes(h.action));
  const released = ['Notice prepared', 'Acknowledged', 'Repair in progress', 'Awaiting verification', 'Verified closed'].includes(t.status);
  if (!released && !updates.length) return null;

  // One request at a time, carrying the revision forward: photos first, then the progress report that needs them.
  async function send(body: Record<string, unknown>, photos: File[] = []) {
    setWorking(true);
    let rev = revision;
    try {
      for (let i = 0; i < photos.length; i++) {
        toast.info(tx('Uploading photo {0} of {1}...', [i + 1, photos.length]));
        const f = new FormData();
        f.set('ticket', t.id); f.set('revision', String(rev)); f.set('authorized', 'true'); f.set('purpose', 'repair');
        f.set('quality', 'clear'); f.set('capturedAt', new Date().toISOString()); f.set('shared', 'on'); f.set('file', photos[i]);
        const r = await authorizedFetch('/api/evidence' + suffix, {method: 'POST', body: f});
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(photos[i].name + ': ' + (d.error || tx('could not be attached')));
        rev += 1;
      }
      const r = await authorizedFetch('/api/workspace' + suffix, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({action: 'job', id: t.id, ...body, revision: rev})});
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || 'The update could not be saved.');
      toast.success(tx('Job updated'));
      setNote(''); setFiles([]); setReason(''); setDeclining(false);
      return true;
    } catch (e) {
      toast.error(tx((e as Error).message));
      return false;
    } finally {
      await onChanged();
      setWorking(false);
    }
  }

  function addFiles(list: FileList | null) {
    if (!list) return;
    const next = [...files];
    for (const f of Array.from(list)) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) { toast.error(tx('{0}: use a JPEG, PNG or WebP image', [f.name])); continue; }
      if (f.size > 3_000_000) { toast.error(tx('{0}: larger than 3 MB', [f.name])); continue; }
      if (next.length >= 6) { toast.error(tx('You can attach up to 6 photos per update')); break; }
      next.push(f);
    }
    setFiles(next);
  }

  const off = busy || working;
  const needsNote = stage === 'Waiting for parts' || stage === 'Progress update';
  const needsPhoto = stage === 'Work finished';
  const hasRepairPhoto = (t.evidence || []).some(e => e.purpose === 'repair' && e.uploadedAt >= (t.acceptedAt || t.releasedAt || t.created));

  return <section className="job-panel" id="job-panel" aria-label={tx('Job')}>
    <div className="job-head">
      <Hammer size={18}/>
      <div>
        <h3>{tx('Job')}</h3>
        <p className="muted">{t.contractor ? tx('Contractor: {0}', [t.contractor]) : tx('Open to all contractors for this trade')}{t.releasedAt ? ' · ' + tx('released {0}', [when(t.releasedAt)]) : ''}</p>
      </div>
    </div>
    {t.appointment && <p className="job-appointment"><CalendarClock size={16}/>{tx('Appointment: {0}', [new Date(t.appointment).toLocaleString(locale(), {dateStyle: 'full', timeStyle: 'short'})])}</p>}
    {t.workStage && <p className="job-stage">{tx('Last report: {0}', [tx(t.workStage)])}</p>}

    {offered && <div className="job-offer">
      <p><b>{tx('This job is offered to your firm.')}</b> {tx('Prices are fixed by your contract. Once you accept, you see the tenant contact and access details and can agree an appointment.')}</p>
      {!declining ? <div className="button-row">
        <button className="primary" disabled={off} onClick={() => send({job: 'accept'})}><CheckCircle2 size={16}/>{tx('Accept job')}</button>
        <button className="secondary" disabled={off} onClick={() => setDeclining(true)}><XCircle size={16}/>{tx('Decline')}</button>
      </div> : <div className="form">
        <label>{tx('Reason for declining')}<input value={reason} onChange={e => setReason(e.target.value)} maxLength={300} placeholder={tx('e.g. no capacity this week')}/></label>
        <div className="button-row">
          <button className="secondary" disabled={off || reason.trim().length < 3} onClick={() => send({job: 'decline', note: reason})}>{tx('Decline job')}</button>
          <button className="text-button" type="button" onClick={() => setDeclining(false)}>{tx('Cancel')}</button>
        </div>
      </div>}
    </div>}

    {reporting && <form className="form job-report" onSubmit={async e => {
      e.preventDefault();
      if (stage === 'Appointment scheduled' && !appointment) { toast.error(tx('Choose the date and time of the appointment.')); return; }
      if (needsNote && note.trim().length < 3) { toast.error(tx('Describe the progress in a few words.')); return; }
      if (needsPhoto && !files.length && !hasRepairPhoto) { toast.error(tx('Add at least one photo of the finished work first.')); return; }
      await send({stage, note: note.trim(), appointment: stage === 'Appointment scheduled' ? new Date(appointment).toISOString() : ''}, files);
    }}>
      <h4>{tx('Report progress')}</h4>
      <div className="job-stages" role="radiogroup" aria-label={tx('Progress')}>
        {JOB_STAGES.map(s => { const Icon = STAGE_ICON[s]; return <button type="button" key={s} role="radio" aria-checked={stage === s} className={'job-stage-btn' + (stage === s ? ' on' : '')} onClick={() => setStage(s)}><Icon size={16}/>{tx(s)}</button>; })}
      </div>
      {stage === 'Appointment scheduled' && <label>{tx('Date and time')}<input type="datetime-local" value={appointment} min={localInput()} onChange={e => setAppointment(e.target.value)} required/></label>}
      <label>{tx(needsNote ? 'What happened' : 'Note (optional)')}<textarea value={note} onChange={e => setNote(e.target.value)} maxLength={2000} rows={3}
        placeholder={tx(stage === 'Waiting for parts' ? 'e.g. replacement valve ordered, arrives Thursday' : stage === 'Work finished' ? 'e.g. siphon replaced, checked for leaks' : 'e.g. tenant not at home, new date agreed by phone')}/></label>
      <label>{tx(needsPhoto ? 'Photos of the finished work' : 'Photos (optional)')}<input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" multiple onChange={e => { addFiles(e.target.files); e.target.value = ''; }}/></label>
      {files.length > 0 && <div className="photo-grid">{files.map((f, i) => <figure key={f.name + i}><img src={urls[i]} alt={f.name}/><button type="button" aria-label={tx('Remove {0}', [f.name])} onClick={() => setFiles(files.filter((_, k) => k !== i))}>×</button></figure>)}</div>}
      <p className="footnote">{tx('Photos and notes are shared with the property management. Avoid faces and personal documents.')}</p>
      <button className="primary" disabled={off}>{tx(working ? 'Saving…' : stage === 'Work finished' ? 'Report job finished' : 'Send update')}</button>
    </form>}

    {updates.length > 0 && <ol className="job-timeline">
      {[...updates].reverse().map((h, i) => <li key={h.at + i}><b>{tx(h.action)}</b><small>{when(h.at)} · {h.actor}</small>{h.note && <p>{h.note.replace(/^Visit on (\S+)\./, (_, d) => tx('Visit on {0}.', [when(d)]))}</p>}</li>)}
    </ol>}
  </section>;
}
