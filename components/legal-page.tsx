'use client';
// Frame for the legal pages (provider notice, privacy policy): logo, language switch, and the shared footer links.
import {useLang, LangSwitch, getLang} from '@/lib/i18n';
import {instance} from '@/lib/instance';

/** Pick the text for the current language. */
export function useL3() {
  useLang();
  const lang = getLang();
  return (sr: string, en: string, de: string) => lang === 'sr' ? sr : lang === 'de' ? de : en;
}

/** A required detail that has not been filled in yet: shown highlighted so it cannot be missed. */
export function Fill({value, label}: {value: string; label: string}) {
  return value ? <>{value}</> : <mark className="legal-missing">[{label}]</mark>;
}

export function LegalFooterLinks() {
  const t = useL3();
  return <span className="legal-links"><a href="/impressum">{t('Podaci o pružaocu usluge', 'Provider notice', 'Anbieterkennzeichnung')}</a><a href="/datenschutz">{t('Politika privatnosti', 'Privacy policy', 'Datenschutz')}</a></span>;
}

export default function LegalPage({children}: {children: React.ReactNode}) {
  useLang();
  return <main className="public-page legal-page">
    <header className="public-head">
      <a href="/concept"><img src={instance.logo} alt={instance.brand}/></a>
      <LangSwitch/>
    </header>
    <article className="public-card legal">{children}</article>
    <p className="public-links"><a href="/concept">{instance.brand}</a> · <LegalFooterLinks/></p>
  </main>;
}
