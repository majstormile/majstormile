'use client';
// Frame for the legal documents. They exist only in Serbian, which is the binding language (see docs/INSTANCES.md).
import {useLang} from '@/lib/i18n';
import {instance} from '@/lib/instance';
import {LEGAL_DOCS, LEGAL_VERSION} from '@/lib/legal';

/** A required detail that has not been filled in yet: shown highlighted so it cannot be missed. */
export function Fill({value, label}: {value: string; label: string}) {
  return value ? <>{value}</> : <mark className="legal-missing">[{label}]</mark>;
}

/** Links to every legal document, used in the footers of all public pages and the workspace. */
export function LegalFooterLinks() {
  useLang();
  return <span className="legal-links">{LEGAL_DOCS.map(d => <a key={d.href} href={d.href}>{d.title}</a>)}</span>;
}

export type LegalSection = {h: string; p: React.ReactNode[]};

/** One legal document: title, version line, numbered sections and the list of the other documents. */
export default function LegalPage({title, intro, sections}: {title: string; intro?: React.ReactNode; sections: LegalSection[]}) {
  useLang();
  return <main className="public-page legal-page" lang="sr-Latn">
    <header className="public-head">
      <a href="/concept"><img src={instance.logo} alt={instance.brand}/></a>
    </header>
    <article className="public-card legal">
      <h1>{title}</h1>
      <p className="muted">Verzija {LEGAL_VERSION.number}, važi od {LEGAL_VERSION.date}</p>
      {intro && <div className="legal-intro">{intro}</div>}
      {sections.map(s => <section key={s.h}><h2>{s.h}</h2>{s.p.filter(Boolean).map((x, i) => typeof x === 'string' ? <p key={i}>{x}</p> : <div key={i}>{x}</div>)}</section>)}
      <nav className="legal-other" aria-label="Pravni dokumenti">
        <h2>Ostali dokumenti</h2>
        <ul>{LEGAL_DOCS.filter(d => d.title !== title).map(d => <li key={d.href}><a href={d.href}>{d.title}</a></li>)}</ul>
      </nav>
    </article>
    <p className="public-links"><a href="/concept">{instance.brand}</a> · <LegalFooterLinks/></p>
  </main>;
}
