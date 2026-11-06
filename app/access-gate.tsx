'use client';
import {tx,useLang,LangSwitch} from '@/lib/i18n';
import {instance} from '@/lib/instance';
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { browserClient } from '@/lib/supabase-browser';
import { KeyRound } from 'lucide-react';
import {LegalFooterLinks} from '@/components/legal-page';
import {passkeysSupported, passkeyErrorText} from '@/components/passkeys-card';

const MIN_PASSWORD = 8;
// Single sign-on buttons shown on the sign-in page. Each provider must also be enabled in Supabase (see docs/SSO.md).
// Default: offer Microsoft and Google. A button only appears once that provider is enabled in Supabase (checked below).
type Provider = 'azure' | 'google' | 'facebook';
const SSO_PROVIDERS = (process.env.NEXT_PUBLIC_SSO_PROVIDERS ?? 'google,facebook,azure').split(',').map(x => x.trim().toLowerCase()).filter((x): x is Provider => x === 'azure' || x === 'google' || x === 'facebook');
const SSO_SAML = process.env.NEXT_PUBLIC_SSO_SAML === 'true';
const SSO_LABEL: Record<Provider, string> = {azure: 'Sign in with Microsoft', google: 'Sign in with Google', facebook: 'Sign in with Facebook'};

function ProviderIcon({provider}: {provider: Provider}) {
  if (provider === 'facebook') return <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="#1877F2"/><path fill="#fff" d="M13.4 19.5v-6h2l.3-2.4h-2.3V9.6c0-.7.2-1.2 1.2-1.2h1.2V6.3c-.2 0-1-.1-1.8-.1-1.8 0-3 1.1-3 3.1v1.8H9v2.4h2v6h2.4z"/></svg>;
  if (provider === 'azure') return <svg width="18" height="18" viewBox="0 0 21 21" aria-hidden="true"><rect x="1" y="1" width="9" height="9" fill="#f25022"/><rect x="11" y="1" width="9" height="9" fill="#7fba00"/><rect x="1" y="11" width="9" height="9" fill="#00a4ef"/><rect x="11" y="11" width="9" height="9" fill="#ffb900"/></svg>;
  return <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.8c4.3-4 6.9-9.9 6.9-17.2z"/><path fill="#FBBC05" d="M10.5 28.7c-.5-1.4-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C1 16.5 0 20.1 0 24s1 7.5 2.6 10.8l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.8c-2.1 1.4-4.8 2.3-8.5 2.3-6.3 0-11.6-4.1-13.5-9.7l-7.9 6.1C6.6 42.6 14.6 48 24 48z"/></svg>;
}

export default function AccessGate({ children }: { children: ReactNode }) {useLang();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [recovery, setRecovery] = useState(false);
  const [forgot, setForgot] = useState(false);
  // Only offer the SSO buttons whose provider is switched on in Supabase, so a half-configured provider never shows a broken button.
  const [enabledSso, setEnabledSso] = useState<Provider[]>([]);
  // Email code sign-in: 'password' shows the password form, 'code' asks for the email and then the one-time code.
  const [mode, setMode] = useState<'password' | 'code'>('password');
  const [codeEmail, setCodeEmail] = useState('');
  const [canPasskey, setCanPasskey] = useState(false);
  useEffect(() => { setCanPasskey(passkeysSupported()); }, []);
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key || !SSO_PROVIDERS.length) return;
    fetch(url.replace(/\/$/, '') + '/auth/v1/settings', {headers: {apikey: key}})
      .then(r => r.ok ? r.json() : null)
      .then(d => { const ext = (d && d.external) || {}; setEnabledSso(SSO_PROVIDERS.filter(p => ext[p] === true)); })
      .catch(() => setEnabledSso([]));
  }, []);

  useEffect(() => {
    let active = true;
    try {
      const auth = browserClient().auth;
      const { data: { subscription } } = auth.onAuthStateChange((event, next) => {
        if (!active) return;
        if (event === 'PASSWORD_RECOVERY') setRecovery(true);
        if (event === 'SIGNED_OUT') { navigator.serviceWorker?.controller?.postMessage('clear-data'); void import('@/lib/offline-queue').then(q => q.clearQueue()); }
        setSession(next); setLoading(false);
      });
      auth.getSession().then(({ data, error }) => {
        if (!active) return;
        if (error) setError('Could not restore your session. Sign in again.');
        setSession(data.session); setLoading(false);
      }).catch(() => { if (active) { setError('Sign-in is unavailable. Please retry.'); setLoading(false); } });
      return () => { active = false; subscription.unsubscribe(); };
    } catch (e) { setError((e as Error).message); setLoading(false); }
    return () => { active = false; };
  }, []);

  // Invited people, people given a temporary password, and people who followed a reset link must choose their own password.
  const mustChange = !!session && (recovery || session.user.user_metadata?.must_change_password === true);

  async function signIn(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(''); setNotice(''); setBusy(true);
    const form = new FormData(e.currentTarget);
    try {
      const { error } = await browserClient().auth.signInWithPassword({ email: String(form.get('email')).trim(), password: String(form.get('password')) });
      if (error) setError('Sign-in failed. Check your email, password, and account confirmation.');
    } catch { setError('Sign-in is unavailable. Check your connection and try again.'); }
    finally { setBusy(false); }
  }

  async function sendCode(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(''); setNotice(''); setBusy(true);
    const email = String(new FormData(e.currentTarget).get('email')).trim();
    try {
      // Only existing accounts get a code; the reply is the same either way so it does not reveal who has an account.
      const { error } = await browserClient().auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
      if (error && (error.status === 429 || /rate|seconds/i.test(error.message))) { setError('Please wait a minute before requesting another code.'); return; }
      setCodeEmail(email);
      setNotice('If an account exists for that email, a sign-in code is on its way.');
    } catch { setError('Sign-in is unavailable. Check your connection and try again.'); }
    finally { setBusy(false); }
  }

  async function verifyCode(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(''); setNotice(''); setBusy(true);
    const token = String(new FormData(e.currentTarget).get('code')).replace(/\s+/g, '');
    try {
      const { error } = await browserClient().auth.verifyOtp({ email: codeEmail, token, type: 'email' });
      if (error) setError('The code is wrong or has expired. Request a new one.');
    } catch { setError('Sign-in is unavailable. Check your connection and try again.'); }
    finally { setBusy(false); }
  }

  async function signInWithPasskey() {
    setError(''); setNotice(''); setBusy(true);
    try {
      const { error } = await browserClient().auth.signInWithPasskey();
      if (error) setError(passkeyErrorText(error));
    } catch (e) { setError(passkeyErrorText(e)); }
    finally { setBusy(false); }
  }

  async function signInWithProvider(provider: Provider) {
    setError(''); setNotice(''); setBusy(true);
    try {
      // Microsoft needs the email scope so Supabase receives the address used to link the membership.
      const { error } = await browserClient().auth.signInWithOAuth({ provider, options: { redirectTo: window.location.origin, scopes: provider === 'azure' ? 'email openid profile' : undefined } });
      if (error) { setError('Single sign-on is unavailable. Ask your administrator to check the SSO settings.'); setBusy(false); }
    } catch { setError('Sign-in is unavailable. Check your connection and try again.'); setBusy(false); }
  }

  async function signInWithSaml(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(''); setNotice(''); setBusy(true);
    const email = String(new FormData(e.currentTarget).get('email')).trim().toLowerCase();
    const domain = email.includes('@') ? email.slice(email.lastIndexOf('@') + 1) : email;
    try {
      const { data, error } = await browserClient().auth.signInWithSSO({ domain, options: { redirectTo: window.location.origin } });
      if (error || !data?.url) { setError('No company sign-in is set up for this email domain.'); setBusy(false); return; }
      window.location.href = data.url;
    } catch { setError('Sign-in is unavailable. Check your connection and try again.'); setBusy(false); }
  }

  async function requestReset(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(''); setNotice(''); setBusy(true);
    const email = String(new FormData(e.currentTarget).get('email')).trim();
    try { await browserClient().auth.resetPasswordForEmail(email, { redirectTo: window.location.origin }); } catch { /* the neutral message below is shown either way */ }
    setBusy(false);
    setNotice('If an account exists for that email, a password reset link is on its way. If nothing arrives, ask your administrator to reset your password.');
  }

  async function setNewPassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(''); setNotice('');
    const form = new FormData(e.currentTarget);
    const password = String(form.get('password')), confirm = String(form.get('confirm'));
    if (password.length < MIN_PASSWORD) { setError(`Use at least ${MIN_PASSWORD} characters.`); return; }
    if (password !== confirm) { setError('The two passwords do not match.'); return; }
    setBusy(true);
    try {
      const auth = browserClient().auth;
      const { error } = await auth.updateUser({ password, data: { must_change_password: false } });
      if (error) { setError('Could not set the password. Choose a different one and try again.'); return; }
      setRecovery(false);
      const { data } = await auth.getSession(); setSession(data.session);
    } catch { setError('Could not set the password. Check your connection and try again.'); }
    finally { setBusy(false); }
  }

  if (session && !mustChange) return <div key={session.user.id}>{children}</div>;
  return <main className="access-page"><div className="access-lang"><LangSwitch/></div><section className="access-card">
    <img src={instance.logo} width="140" height="140" alt={tx("MajstorMile")} />
    <p className="eyebrow">{tx("ROAD OPERATIONS")}</p>
    {session && mustChange ? <>
      <h1>{tx("Choose a new password")}</h1>
      <p className="muted">{tx(recovery ? 'Enter a new password for your account.' : 'Welcome. Choose your own password to continue.')}</p>
      <form className="form" onSubmit={setNewPassword}>
        <label>{tx("New password")}<input name="password" type="password" autoComplete="new-password" minLength={MIN_PASSWORD} required /></label>
        <label>{tx("Confirm new password")}<input name="confirm" type="password" autoComplete="new-password" minLength={MIN_PASSWORD} required /></label>
        <button className="primary" disabled={busy}>{tx(busy ? 'Saving…' : 'Save password and continue')}</button>
      </form>
      <button className="text-button" type="button" onClick={() => { setRecovery(false); void browserClient().auth.signOut(); }}>{tx("Sign out")}</button>
    </> : <>
      <h1>{tx(forgot ? 'Reset your password' : 'Sign in to your workspace')}</h1>
      <p className="muted">{tx(forgot ? 'Enter your email and we will send a reset link.' : 'Tickets, repair responsibility, and the next action in one place.')}</p>
      {loading ? <p role="status">{tx("Checking your session…")}</p> : forgot ? <form className="form" onSubmit={requestReset}>
        <label>{tx("Email")}<input name="email" type="email" autoComplete="username" required /></label>
        <button className="primary" disabled={busy}>{tx(busy ? 'Sending…' : 'Send reset link')}</button>
      </form> : mode === 'code' ? (codeEmail ? <form className="form" onSubmit={verifyCode}>
        <p className="muted">{tx('Enter the code we sent to {0}.', [codeEmail])}</p>
        <label>{tx('Code from the email')}<input name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9 ]{6,12}" required /></label>
        <button className="primary" disabled={busy}>{tx(busy ? 'Signing in…' : 'Sign in')}</button>
        <button className="text-button" type="button" onClick={() => { setCodeEmail(''); setError(''); setNotice(''); }}>{tx('Use a different email')}</button>
      </form> : <form className="form" onSubmit={sendCode}>
        <label>{tx("Email")}<input name="email" type="email" autoComplete="username" required /></label>
        <button className="primary" disabled={busy}>{tx(busy ? 'Sending…' : 'Send code')}</button>
      </form>) : <form className="form" onSubmit={signIn}>
        <label>{tx("Email")}<input name="email" type="email" autoComplete="username webauthn" required /></label>
        <label>{tx("Password")}<input name="password" type="password" autoComplete="current-password" required /></label>
        <button className="primary" disabled={busy}>{tx(busy ? 'Signing in…' : 'Sign in')}</button>
      </form>}
      {!loading && !forgot && <button className="text-button" type="button" onClick={() => { setMode(mode === 'code' ? 'password' : 'code'); setCodeEmail(''); setError(''); setNotice(''); }}>{tx(mode === 'code' ? 'Sign in with a password' : 'Sign in with an email code')}</button>}
      {!loading && !forgot && (enabledSso.length > 0 || SSO_SAML || canPasskey) && <div className="sso-block">
        <p className="sso-divider"><span>{tx('or')}</span></p>
        {canPasskey && <button type="button" className="secondary sso-button" disabled={busy} onClick={signInWithPasskey}><KeyRound size={18}/>{tx('Sign in with a passkey')}</button>}
        {enabledSso.map(p => <button key={p} type="button" className="secondary sso-button" disabled={busy} onClick={() => signInWithProvider(p)}><ProviderIcon provider={p}/>{tx(SSO_LABEL[p])}</button>)}
        {SSO_SAML && <form className="form sso-saml" onSubmit={signInWithSaml}>
          <label>{tx('Company sign-in (SAML)')}<input name="email" type="email" autoComplete="username" required placeholder={tx('name@company.de')} /></label>
          <button className="secondary" disabled={busy}>{tx('Continue with company sign-in')}</button>
        </form>}
      </div>}
      {!loading && (forgot || mode === 'password') && <button className="text-button" type="button" onClick={() => { setForgot(!forgot); setError(''); setNotice(''); }}>{tx(forgot ? 'Back to sign in' : 'Forgot your password?')}</button>}
    </>}
    {notice && <p role="status" className="muted">{tx(notice)}</p>}
    {error && <p role="alert" className="access-error">{tx(error)}</p>}
    <p className="footnote">{tx("Access is provisioned by your workspace administrator. Contact them for a new account or password reset.")}</p>
    <a className="text-button" href="/concept">{tx("Explore the platform")}</a>
    <a className="text-button report-link" href="/report">{tx("Report a defect without an account")}</a>
    <p className="legal-accept">{tx('By signing in you accept the Terms of Use. Your data is handled as described in the Privacy Policy.')}</p>
    <p className="public-links"><LegalFooterLinks/></p>
  </section></main>;
}
