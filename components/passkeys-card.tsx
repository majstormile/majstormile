'use client';
// User Profile card: register a passkey (Face ID, fingerprint or device PIN) for signing in without a password,
// and remove passkeys this account no longer uses. Supabase Auth stores the passkeys; nothing is kept in the workspace.
import {useEffect, useState} from 'react';
import {KeyRound, Trash2} from 'lucide-react';
import type {PasskeyListItem} from '@supabase/supabase-js';
import {tx, useLang, getLang} from '@/lib/i18n';
import {instance} from '@/lib/instance';
import {browserClient} from '@/lib/supabase-browser';

/** The browser can create and use passkeys (WebAuthn). */
export const passkeysSupported = () => typeof window !== 'undefined' && typeof window.PublicKeyCredential === 'function';

/** Turn a Supabase or WebAuthn failure into a message the person can act on. */
export function passkeyErrorText(e: unknown): string {
  const code = String((e as {code?: string})?.code || (e as {name?: string})?.name || '');
  if (code === 'passkey_disabled') return 'Passkeys are not switched on for this workspace yet.';
  if (code === 'webauthn_credential_exists') return 'This device already has a passkey for your account.';
  if (code === 'too_many_passkeys') return 'Your account has reached the passkey limit. Remove one first.';
  if (code === 'NotAllowedError' || code === 'ERROR_CEREMONY_ABORTED' || code === 'AbortError') return 'The passkey request was cancelled.';
  return 'The passkey could not be used. Please try again.';
}

export default function PasskeysCard() {
  useLang();
  const [items, setItems] = useState<PasskeyListItem[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [supported, setSupported] = useState(false);

  async function load() {
    try {
      const {data, error} = await browserClient().auth.passkey.list();
      if (error) throw error;
      setItems(data || []);
    } catch { setItems([]); }
  }
  useEffect(() => { setSupported(passkeysSupported()); void load(); }, []);

  async function add() {
    setBusy(true); setNotice(''); setError('');
    try {
      const {error} = await browserClient().auth.registerPasskey();
      if (error) throw error;
      setNotice('Passkey added. Next time choose "Sign in with a passkey".');
      await load();
    } catch (e) { setError(passkeyErrorText(e)); }
    finally { setBusy(false); }
  }

  async function remove(p: PasskeyListItem) {
    setBusy(true); setNotice(''); setError('');
    try {
      const {error} = await browserClient().auth.passkey.delete({passkeyId: p.id});
      if (error) throw error;
      setNotice('Passkey removed.');
      await load();
    } catch { setError('The passkey could not be removed. Please try again.'); }
    finally { setBusy(false); }
  }

  const date = (iso?: string) => iso ? new Date(iso).toLocaleDateString(instance.locales[getLang()] || undefined) : '';

  return <section className="settings-card">
    <div className="section-head"><div>
      <h2>{tx('Passkeys')}</h2>
      <p>{tx('Sign in with Face ID, your fingerprint or your device PIN instead of a password. Add one on each phone or computer you use.')}</p>
    </div></div>
    {!supported ? <p className="muted">{tx('This browser does not support passkeys.')}</p> : <>
      {items && items.length > 0 && <ul className="passkey-list">
        {items.map(p => <li key={p.id}>
          <KeyRound size={16}/>
          <span><strong>{p.friendly_name || tx('Passkey')}</strong><small>{tx('Added {0}', [date(p.created_at)])}{p.last_used_at ? ' · ' + tx('last used {0}', [date(p.last_used_at)]) : ''}</small></span>
          <button type="button" className="text-button" disabled={busy} onClick={() => remove(p)} aria-label={tx('Remove passkey')}><Trash2 size={15}/>{tx('Remove')}</button>
        </li>)}
      </ul>}
      {items && items.length === 0 && <p className="muted">{tx('No passkeys yet.')}</p>}
      <button type="button" className="secondary" disabled={busy} onClick={add}><KeyRound size={16}/>{tx(busy ? 'Working…' : 'Add a passkey on this device')}</button>
    </>}
    {notice && <p role="status" className="muted">{tx(notice)}</p>}
    {error && <p role="alert" className="access-error">{tx(error)}</p>}
  </section>;
}
