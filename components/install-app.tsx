'use client';
// "Get the app" for phones, without an app store.
// Android (Chrome, Edge, Samsung Internet): the browser installs MajstorMile as a real app (a WebAPK) from this site,
// with its own icon in the app drawer. iPhone and iPad: Safari adds it to the home screen; it then opens full screen.
import {useEffect, useState} from 'react';
import {Download, Share, PlusSquare, Smartphone, CheckCircle2} from 'lucide-react';
import {tx, useLang} from '@/lib/i18n';

type PromptEvent = Event & {prompt: () => Promise<void>; userChoice: Promise<{outcome: 'accepted' | 'dismissed'}>};
declare global { interface Window { __baunaviInstall?: PromptEvent | null } }

/** Catch the browser's install offer as early as possible; it fires once, often before this component mounts. */
export function listenForInstall() {
  if (typeof window === 'undefined' || (window as any).__baunaviListening) return;
  (window as any).__baunaviListening = true;
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); window.__baunaviInstall = e as PromptEvent; window.dispatchEvent(new Event('baunavi-install-ready')); });
  window.addEventListener('appinstalled', () => { window.__baunaviInstall = null; window.dispatchEvent(new Event('baunavi-installed')); });
}

export type Platform = 'android' | 'ios' | 'other';
export function detectPlatform(ua = typeof navigator === 'undefined' ? '' : navigator.userAgent): Platform {
  if (/android/i.test(ua)) return 'android';
  // iPadOS 13+ reports itself as a Mac; touch points tell them apart.
  if (/iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && typeof navigator !== 'undefined' && navigator.maxTouchPoints > 1)) return 'ios';
  return 'other';
}
const standalone = () => typeof window !== 'undefined' && (window.matchMedia?.('(display-mode: standalone)').matches || (navigator as any).standalone === true);

/** A compact button for footers and menus: installs directly where the browser allows it, otherwise opens /app. */
export function InstallLink({className, label}: {className?: string; label?: string}) {
  useLang();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    listenForInstall();
    const on = () => setReady(!!window.__baunaviInstall);
    on(); window.addEventListener('baunavi-install-ready', on); window.addEventListener('baunavi-installed', on);
    return () => { window.removeEventListener('baunavi-install-ready', on); window.removeEventListener('baunavi-installed', on); };
  }, []);
  return <a className={className} href="/app" onClick={async e => {
    const p = window.__baunaviInstall;
    if (!ready || !p) return; // no direct install offer: the /app page explains the steps
    e.preventDefault(); await p.prompt(); await p.userChoice.catch(() => null); window.__baunaviInstall = null; setReady(false);
  }}><Smartphone size={16}/>{tx(label || 'Android & iPhone app')}</a>;
}

/** The full install panel with steps for Android and iPhone, highlighting the visitor's own phone. */
export default function InstallApp({compact = false}: {compact?: boolean}) {
  useLang();
  const [platform, setPlatform] = useState<Platform>('other');
  const [ready, setReady] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [host, setHost] = useState('baunavi.vercel.app');
  useEffect(() => {
    listenForInstall();
    setPlatform(detectPlatform()); setInstalled(standalone()); setHost(window.location.host);
    const on = () => setReady(!!window.__baunaviInstall);
    const done = () => { setInstalled(true); setReady(false); };
    on(); window.addEventListener('baunavi-install-ready', on); window.addEventListener('baunavi-installed', done);
    return () => { window.removeEventListener('baunavi-install-ready', on); window.removeEventListener('baunavi-installed', done); };
  }, []);

  async function install() {
    const p = window.__baunaviInstall;
    if (!p) return;
    await p.prompt();
    const choice = await p.userChoice.catch(() => null);
    window.__baunaviInstall = null; setReady(false);
    if (choice?.outcome === 'accepted') setInstalled(true);
  }

  if (installed) return <div className="install-panel installed"><CheckCircle2 size={20}/><p>{tx('MajstorMile is installed on this device. Open it from your home screen.')}</p></div>;

  const android = <article className={'install-card' + (platform === 'android' ? ' mine' : '')} id="android">
    <h3>{tx('Android')}</h3>
    {ready
      ? <><p>{tx('Install MajstorMile directly from this page. It appears in your app drawer like any other app.')}</p>
        <button className="primary" onClick={install}><Download size={18}/>{tx('Install the Android app')}</button></>
      : <ol>
        <li>{tx('Open {0} in Chrome on your Android phone.', [host])}</li>
        <li>{tx('Tap the menu (⋮) at the top right.')}</li>
        <li>{tx('Tap "Install app" (or "Add to home screen", then "Install").')}</li>
      </ol>}
    <p className="footnote">{tx('No Play Store needed. Updates arrive automatically.')}</p>
  </article>;

  const ios = <article className={'install-card' + (platform === 'ios' ? ' mine' : '')} id="iphone">
    <h3>{tx('iPhone and iPad')}</h3>
    <ol>
      <li>{tx('Open {0} in Safari.', [host])}</li>
      <li><span className="inline-icon"><Share size={16}/></span>{tx('Tap the Share button.')}</li>
      <li><span className="inline-icon"><PlusSquare size={16}/></span>{tx('Choose "Add to Home Screen", then "Add".')}</li>
    </ol>
    <p className="footnote">{tx('Apple only allows apps outside the App Store on the home screen this way. MajstorMile then opens full screen like an app.')}</p>
  </article>;

  return <div className={'install-panel' + (compact ? ' compact' : '')}>
    {platform === 'ios' ? <>{ios}{android}</> : <>{android}{ios}</>}
  </div>;
}
