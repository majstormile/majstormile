'use client';
// Install page for phones: Android installs straight from the site, iPhone adds it to the home screen.
import {tx, useLang, LangSwitch} from '@/lib/i18n';
import {instance} from '@/lib/instance';
import InstallApp from '@/components/install-app';
import {LegalFooterLinks} from '@/components/legal-page';

export default function AppPage() {
  useLang();
  return <main className="public-page">
    <header className="public-head">
      <a href="/concept"><img src={instance.logo} alt={tx('MajstorMile')}/></a>
      <LangSwitch/>
    </header>
    <section className="public-card">
      <p className="eyebrow">{tx('THE MAJSTORMILE APP')}</p>
      <h1>{tx('Install MajstorMile on your phone')}</h1>
      <p className="muted">{tx('No app store needed. The app opens full screen, works with a weak signal and updates itself.')}</p>
      <InstallApp compact/>
      <p className="public-links"><a href="/">{tx('Open MajstorMile in the browser')}</a> · <a href="/report">{tx('Report a defect')}</a> · <LegalFooterLinks/></p>
    </section>
  </main>;
}
