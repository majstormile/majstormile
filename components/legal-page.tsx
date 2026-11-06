'use client';
// Frame for the legal pages (Impressum, Datenschutz): logo, language switch, and the shared footer links.
import {useLang, LangSwitch, getLang} from '@/lib/i18n';
import {instance} from '@/lib/instance';

/** A required detail that has not been filled in yet: shown highlighted so it cannot be missed. */
export function Fill({value, label}: {value: string; label: string}) {
  return value ? <>{value}</> : <mark className="legal-missing">[{label}]</mark>;
}

export function LegalFooterLinks() {
  useLang();
  const de = getLang() === 'de';
  return <span className="legal-links"><a href="/impressum">{de ? 'Impressum' : 'Legal notice'}</a><a href="/datenschutz">{de ? 'Datenschutz' : 'Privacy'}</a></span>;
}

export default function LegalPage({children}: {children: React.ReactNode}) {
  useLang();
  return <main className="public-page legal-page">
    <header className="public-head">
      <a href="/concept"><img src={instance.logo} alt="Baunavi"/></a>
      <LangSwitch/>
    </header>
    <article className="public-card legal">{children}</article>
    <p className="public-links"><a href="/concept">Baunavi</a> · <LegalFooterLinks/></p>
  </main>;
}
