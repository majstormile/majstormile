'use client';
// Impressum (legal notice) under § 5 DDG. Operator details come from lib/legal.ts.
import {useLang, getLang} from '@/lib/i18n';
import {operator as o} from '@/lib/legal';
import LegalPage, {Fill} from '@/components/legal-page';

export default function Impressum() {
  useLang();
  const de = getLang() === 'de';
  return <LegalPage>
    <h1>{de ? 'Impressum' : 'Legal notice (Impressum)'}</h1>
    <p className="muted">{de ? 'Angaben gemäß § 5 Digitale-Dienste-Gesetz (DDG)' : 'Information under § 5 of the German Digital Services Act (DDG)'}</p>
    <h2>{de ? 'Anbieter' : 'Provider'}</h2>
    <p>
      <Fill value={o.name} label={de ? 'Firma und Rechtsform' : 'Company name and legal form'}/><br/>
      <Fill value={o.street} label={de ? 'Straße und Hausnummer' : 'Street and number'}/><br/>
      <Fill value={o.postcodeCity} label={de ? 'PLZ und Ort' : 'Postcode and town'}/><br/>
      {o.country}
    </p>
    <h2>{de ? 'Vertreten durch' : 'Represented by'}</h2>
    <p><Fill value={o.representedBy} label={de ? 'Geschäftsführer/in bzw. Inhaber/in' : 'Managing director or owner'}/></p>
    <h2>{de ? 'Kontakt' : 'Contact'}</h2>
    <p>{de ? 'E-Mail' : 'Email'}: <Fill value={o.email} label="E-Mail"/><br/>{de ? 'Telefon' : 'Phone'}: <Fill value={o.phone} label={de ? 'Telefonnummer' : 'Phone number'}/></p>
    <h2>{de ? 'Registereintrag' : 'Register entry'}</h2>
    <p><Fill value={o.register} label={de ? 'Registergericht und Registernummer, z. B. Amtsgericht Göttingen, HRB …' : 'Register court and number'}/></p>
    <h2>{de ? 'Umsatzsteuer-Identifikationsnummer' : 'VAT ID'}</h2>
    <p>{de ? 'gemäß § 27a Umsatzsteuergesetz' : 'under § 27a of the German VAT Act'}: <Fill value={o.vatId} label="DE…"/></p>
    {o.euRepresentative && <><h2>{de ? 'Vertreter in der EU (Art. 27 DSGVO)' : 'EU representative (Art. 27 GDPR)'}</h2><p>{o.euRepresentative}</p></>}
    <h2>{de ? 'Verbraucherstreitbeilegung' : 'Consumer dispute resolution'}</h2>
    <p>{de
      ? 'Baunavi richtet sich an Unternehmen. Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.'
      : 'Baunavi is offered to businesses. We are neither willing nor obliged to take part in dispute resolution proceedings before a consumer arbitration board.'}</p>
    <h2>{de ? 'Haftung für Inhalte' : 'Liability for content'}</h2>
    <p>{de
      ? 'Aufträge, Meldungen und Fotos im Arbeitsbereich werden von den Nutzern eingestellt. Für diese Inhalte sind die jeweiligen Hausverwaltungen verantwortlich. Wir entfernen rechtswidrige Inhalte unverzüglich, sobald wir davon Kenntnis erhalten.'
      : 'Jobs, reports and photos in a workspace are entered by its users; each property management is responsible for that content. We remove unlawful content without delay once we become aware of it.'}</p>
  </LegalPage>;
}
