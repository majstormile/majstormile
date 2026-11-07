'use client';
// Public product page: what MajstorMile does, the subscriptions, the phone app and the pilot.
import {tx, useLang, LangSwitch, locale} from '@/lib/i18n';
import {instance} from '@/lib/instance';
import {Smartphone, Hammer, ClipboardCheck, ArrowUpRight} from 'lucide-react';
import InstallApp, {InstallLink} from '@/components/install-app';
import {LegalFooterLinks} from '@/components/legal-page';

const eur = (n: number) => new Intl.NumberFormat(locale(), {style: 'currency', currency: 'EUR', maximumFractionDigits: 0}).format(n);

// Planning prices per month, billed annually. Sizes are counted in apartment units and contractor firms.
const PLANS = [
  {name: 'Bronze', monthly: 500, setup: 2500, units: 'Up to 200 apartment units', contractors: 'Up to 20 contractors', staff: '10 staff accounts', extra: 'Email support', recommended: false},
  {name: 'Silver', monthly: 1000, setup: 5000, units: 'Up to 500 apartment units', contractors: 'Up to 50 contractors', staff: '20 staff accounts', extra: 'Contract import from Excel or CSV', recommended: true},
  {name: 'Gold', monthly: 2000, setup: 7500, units: '1,000+ apartment units', contractors: 'Up to 100 contractors', staff: '50 staff accounts', extra: 'Priority support and onboarding', recommended: false},
];

export default function Concept() {
  useLang();
  return <main className="marketing">
    <nav className="marketing-nav">
      <a href="/"><img src={instance.logo} alt="MajstorMile"/></a>
      <div>
        <a href="#platform">{tx('Platform')}</a>
        <a href="#plans">{tx('Subscriptions')}</a>
        <a href="#app">{tx('App')}</a>
        <a href="#pilot">{tx('Pilot')}</a>
        <a href="/report">{tx('Report a problem')}</a>
        <LangSwitch/>
        <a href="/radni-prostor" className="primary">{tx('Open workspace ')}<ArrowUpRight size={16}/></a>
      </div>
    </nav>

    <section className="hero">
      <div>
        <p className="eyebrow">{tx('PROPERTY MAINTENANCE. CLEAR RESPONSIBILITY.')}</p>
        <h1>{tx('Every defect in your buildings.')}<br/>{tx('A tradesperson')}<br/><em>{tx('who takes it on.')}</em></h1>
        <p>{tx('Tenants report from their phone. You release the job to your contracted trades. The contractor accepts, reports progress with photos, and you sign off the work.')}</p>
        <div className="hero-actions">
          <a className="primary" href="/radni-prostor">{tx('Explore the working demo ')}<ArrowUpRight size={18}/></a>
          <a className="secondary hero-report" href="/report">{tx('Report a defect')}</a>
          <a className="secondary hero-report" href="#app"><Smartphone size={16}/>{tx('Get the app')}</a>
        </div>
        <p className="concept-note" style={{marginTop: 18}}>{tx('Pilot for property managers in Germany. Prices are proposals to be confirmed in the pilot.')}</p>
      </div>
      <div className="hero-photo">
        <img src="/illustrations/hero.svg" width={1200} height={900} alt={tx('Illustration of a tradesperson at work in an apartment')}/>
        <div className="hero-card"><span className="status valid">{tx('Job workflow')}</span><strong>{tx('From report to sign-off.')}</strong><p>{tx('One job. One firm. A complete history.')}</p></div>
      </div>
    </section>

    <section className="marketing-section" id="platform">
      <p className="eyebrow">{tx('ONE CONNECTED REPAIR PROCESS')}</p>
      <h2>{tx('See the defect. Follow the responsibility.')}</h2>
      <p>{tx('MajstorMile connects tenant reports with your teams and the contractors who do the work, from the first photo to the sign-off.')}</p>
      <div className="feature-grid">
        <article><Smartphone/><h3>{tx('Reported in a minute')}</h3><p>{tx('Tenants and caretakers report from any phone: address, apartment, photos and how to get in. No app or account needed.')}</p></article>
        <article><Hammer/><h3>{tx('Released to your trades')}</h3><p>{tx('Release a job to one firm or to every firm with a contract for the trade. Prices follow the contract, so the first to accept takes the job.')}</p></article>
        <article><ClipboardCheck/><h3>{tx('Tracked to sign-off')}</h3><p>{tx('The contractor agrees the appointment, posts progress with photos and reports the job finished. You check it and sign it off, or reopen it.')}</p></article>
      </div>
    </section>

    <section className="marketing-section" id="plans" style={{background: '#f6f8fb'}}>
      <p className="eyebrow">{tx('SUBSCRIPTIONS')}</p>
      <h2>{tx('Scale by the apartments you manage.')}</h2>
      <p>{tx('Prices in euros per month, before VAT, billed annually. All roles, the tenant reporting page and the full job workflow are included in every plan.')}</p>
      <div className="pricing-grid">
        {PLANS.map(x => <article className={'pricing-card tier-' + x.name.toLowerCase() + (x.recommended ? ' recommended' : '')} key={x.name}>
          <span className="tier-badge">{tx(x.name)}</span>
          <div className="price">{eur(x.monthly)}<small>{tx(' / month')}</small></div>
          <ul>
            <li><b>{tx(x.units)}</b></li>
            <li><b>{tx(x.contractors)}</b></li>
            <li>{tx(x.staff)}</li>
            <li>{tx('Tenant reporting page with tracking codes')}</li>
            <li>{tx('Contractor job portal')}</li>
            <li>{tx('Android and iPhone app')}</li>
            <li>{tx(x.extra)}</li>
          </ul>
          <p className="footnote">{tx('One-time setup: {0}', [eur(x.setup)])}</p>
          <a className="secondary" href="#pilot">{tx('Start with a pilot')}</a>
        </article>)}
      </div>
      <p className="concept-note" style={{marginTop: 20}}>{tx('An apartment unit is any apartment, office or shop you manage. A contractor is a firm with a contract in MajstorMile; each firm can have several users.')}</p>
    </section>

    <section className="marketing-section" id="app">
      <p className="eyebrow">{tx('THE MAJSTORMILE APP')}</p>
      <h2>{tx('On every phone, without an app store.')}</h2>
      <p>{tx('Staff and contractors install MajstorMile straight from this website. It opens full screen, keeps working with a weak signal and sends what was entered offline once the connection is back.')}</p>
      <InstallApp/>
    </section>

    <section className="marketing-section" id="pilot">
      <div className="pilot-banner">
        <div>
          <p className="eyebrow">{tx('30-DAY PAID PILOT')}</p>
          <h2>{tx('Prove the workflow on your own buildings.')}</h2>
          <p>{tx('Proposed paid pilot: one property portfolio with up to 500 apartments. Validate reporting, contractor acceptance, progress reports and sign-off. The pilot price is agreed with the property management.')}</p>
        </div>
        <a className="secondary" href="/radni-prostor">{tx('Review the prototype ')}<ArrowUpRight size={18}/></a>
      </div>
    </section>

    <footer className="marketing-footer">
      <span>{tx('{0} · working brand · 2026', [instance.brand])}</span>
      <span className="footer-links">
        <InstallLink className="footer-app"/>
        <a href="/report">{tx('Report a defect')}</a>
        <a href="/track">{tx('Track a report')}</a>
        <LegalFooterLinks/>
      </span>
    </footer>
  </main>;
}
