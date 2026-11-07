'use client';
// "Get the app" for phones, without an app store.
// Android (Chrome, Edge, Samsung Internet): the browser installs MajstorMile as a real app (a WebAPK) from this site,
// with its own icon in the app drawer. iPhone and iPad: Safari adds it to the home screen; it then opens full screen.
import {useEffect, useState} from 'react';
import {Download, Share, PlusSquare, Smartphone, CheckCircle2} from 'lucide-react';
import {tx, useLang} from '@/lib/i18n';

type PromptEvent = Event & {prompt: () => Promise<void>; userChoice: Promise<{outcome: 'accepted' | 'dismissed'}>};
declare global { interface Window { __majstormileInstall?: PromptEvent | null } }

/** Catch the browser's install offer as early as possible; it fires once, often before this component mounts. */
export function listenForInstall() {
  if (typeof window === 'undefined' || (window as any).__majstormileListening) return;
  (window as any).__majstormileListening = true;
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); window.__majstormileInstall = e as PromptEvent; window.dispatchEvent(new Event('majstormile-install-ready')); });
  window.addEventListener('appinstalled', () => { window.__majstormileInstall = null; window.dispatchEvent(new Event('majstormile-installed')); });
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
    const on = () => setReady(!!window.__majstormileInstall);
    on(); window.addEventListener('majstormile-install-ready', on); window.addEventListener('majstormile-installed', on);
    return () => { window.removeEventListener('majstormile-install-ready', on); window.removeEventListener('majstormile-installed', on); };
  }, []);
  return <a className={className} href="/app" onClick={async e => {
    const p = window.__majstormileInstall;
    if (!ready || !p) return; // no direct install offer: the /app page explains the steps
    e.preventDefault(); await p.prompt(); await p.userChoice.catch(() => null); window.__majstormileInstall = null; setReady(false);
  }}><Smartphone size={16}/>{tx(label || 'Android & iPhone app')}</a>;
}

/** Store-style download badges plus a QR code for desktop visitors. Not Google Play / App Store badges:
 *  MajstorMile installs straight from the website. */
export function AppBadges() {
  useLang();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    listenForInstall();
    const on = () => setReady(!!window.__majstormileInstall);
    on(); window.addEventListener('majstormile-install-ready', on);
    return () => window.removeEventListener('majstormile-install-ready', on);
  }, []);
  const go = (id: string) => (e: React.MouseEvent) => {
    const p = window.__majstormileInstall;
    if (id === 'android' && ready && p) { e.preventDefault(); void p.prompt(); return; }
    e.preventDefault(); document.getElementById(id)?.scrollIntoView({behavior: 'smooth', block: 'center'});
  };
  return <div className="app-badges">
    <div className="badge-row">
      <a className="app-badge" href="#android" onClick={go('android')}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#9fd36a" d="M6 9h12v8a2 2 0 0 1-2 2h-1v3a1.5 1.5 0 0 1-3 0v-3h-0v3a1.5 1.5 0 0 1-3 0v-3H8a2 2 0 0 1-2-2V9Zm-2.5 0A1.5 1.5 0 0 1 5 10.5v5a1.5 1.5 0 0 1-3 0v-5A1.5 1.5 0 0 1 3.5 9Zm17 0a1.5 1.5 0 0 1 1.5 1.5v5a1.5 1.5 0 0 1-3 0v-5A1.5 1.5 0 0 1 20.5 9ZM6.2 8a5.9 5.9 0 0 1 3-4.4L8.1 1.8a.4.4 0 0 1 .7-.4l1.1 1.9a6.3 6.3 0 0 1 4.2 0l1.1-1.9a.4.4 0 0 1 .7.4l-1.1 1.8a5.9 5.9 0 0 1 3 4.4H6.2Zm3.3-2.6a.8.8 0 1 0 0 1.6.8.8 0 0 0 0-1.6Zm5 0a.8.8 0 1 0 0 1.6.8.8 0 0 0 0-1.6Z"/></svg>
        <span><small>{tx('Install for')}</small><b>Android</b></span>
      </a>
      <a className="app-badge" href="#iphone" onClick={go('iphone')}>
        <Smartphone size={26} aria-hidden="true"/>
        <span><small>{tx('Add to home screen')}</small><b>iPhone & iPad</b></span>
      </a>
    </div>
    <div className="qr-box">
      <img src="/qr-app.svg" alt={tx('QR code for www.majstormile.com/app')} width={112} height={112}/>
      <p><b>{tx('On a computer?')}</b><br/>{tx('Scan with your phone camera to open the app page.')}</p>
    </div>
  </div>;
}

/** The full install panel with steps for Android and iPhone, highlighting the visitor's own phone. */
export default function InstallApp({compact = false}: {compact?: boolean}) {
  useLang();
  const [platform, setPlatform] = useState<Platform>('other');
  const [ready, setReady] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [host, setHost] = useState('www.majstormile.com');
  useEffect(() => {
    listenForInstall();
    setPlatform(detectPlatform()); setInstalled(standalone()); setHost(window.location.host);
    const on = () => setReady(!!window.__majstormileInstall);
    const done = () => { setInstalled(true); setReady(false); };
    on(); window.addEventListener('majstormile-install-ready', on); window.addEventListener('majstormile-installed', done);
    return () => { window.removeEventListener('majstormile-install-ready', on); window.removeEventListener('majstormile-installed', done); };
  }, []);

  async function install() {
    const p = window.__majstormileInstall;
    if (!p) return;
    await p.prompt();
    const choice = await p.userChoice.catch(() => null);
    window.__majstormileInstall = null; setReady(false);
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
