'use client';
// Provider notice under Art. 6 of the Serbian Law on Electronic Commerce. Operator details come from lib/legal.ts.
import {operator as o} from '@/lib/legal';
import LegalPage, {Fill, useL3} from '@/components/legal-page';

export default function Impressum() {
  const t = useL3();
  return <LegalPage>
    <h1>{t('Podaci o pružaocu usluge', 'Provider notice', 'Anbieterkennzeichnung')}</h1>
    <p className="muted">{t('Prema članu 6 Zakona o elektronskoj trgovini Republike Srbije', 'Under Art. 6 of the Serbian Law on Electronic Commerce', 'Nach Art. 6 des serbischen Gesetzes über den elektronischen Handel')}</p>
    <h2>{t('Pružalac usluge', 'Provider', 'Anbieter')}</h2>
    <p>
      <Fill value={o.name} label={t('Poslovno ime i pravna forma', 'Business name and legal form', 'Firma und Rechtsform')}/><br/>
      <Fill value={o.street} label={t('Ulica i broj', 'Street and number', 'Straße und Hausnummer')}/><br/>
      <Fill value={o.postcodeCity} label={t('Poštanski broj i mesto (sedište)', 'Postcode and town (registered seat)', 'PLZ und Ort (Sitz)')}/><br/>
      {o.country}
    </p>
    <h2>{t('Zastupnik', 'Represented by', 'Vertreten durch')}</h2>
    <p><Fill value={o.representedBy} label={t('Direktor ili vlasnik', 'Director or owner', 'Geschäftsführung bzw. Inhaber/in')}/></p>
    <h2>{t('Kontakt', 'Contact', 'Kontakt')}</h2>
    <p>{t('E-pošta', 'Email', 'E-Mail')}: <Fill value={o.email} label={t('e-pošta', 'email', 'E-Mail')}/><br/>{t('Telefon', 'Phone', 'Telefon')}: <Fill value={o.phone} label={t('broj telefona', 'phone number', 'Telefonnummer')}/></p>
    <h2>{t('Upis u registar', 'Register entry', 'Registereintrag')}</h2>
    <p><Fill value={o.register} label={t('Registar i matični broj, npr. APR, MB …', 'Register and registration number, e.g. APR, MB …', 'Register und Registernummer, z. B. APR, MB …')}/></p>
    <h2>{t('Poreski identifikacioni broj (PIB)', 'Tax identification number (PIB)', 'Steuer-Identifikationsnummer (PIB)')}</h2>
    <p><Fill value={o.pib} label="PIB"/></p>
    {o.vatId && <><h2>{t('Identifikacioni broj za PDV', 'VAT number', 'Umsatzsteuer-Identifikationsnummer')}</h2><p>{o.vatId}</p></>}
    {o.serbianRepresentative && <><h2>{t('Predstavnik u Republici Srbiji (član 44 ZZPL)', 'Representative in Serbia (Art. 44 ZZPL)', 'Vertreter in der Republik Serbien (Art. 44 ZZPL)')}</h2><p>{o.serbianRepresentative}</p></>}
    <h2>{t('Nadzorni organ', 'Supervisory authority', 'Aufsichtsbehörde')}</h2>
    <p>{t('Delatnost pružaoca usluge ne podleže posebnom nadzoru nadležnog organa. Za zaštitu podataka o ličnosti nadležan je Poverenik (pogledajte Politiku privatnosti).', 'The provider’s activity is not subject to supervision by a specific authority. For personal data the Commissioner is responsible (see the Privacy policy).', 'Die Tätigkeit des Anbieters unterliegt keiner besonderen behördlichen Aufsicht. Für personenbezogene Daten ist der Kommissar zuständig (siehe Datenschutz).')}</p>
    <h2>{t('Cene', 'Prices', 'Preise')}</h2>
    <p>{t('Cene su orijentacione i navedene u evrima bez PDV-a; konačna cena se utvrđuje ugovorom.', 'Prices are indicative, in euros before VAT; the final price is set in the contract.', 'Preise sind Richtwerte in Euro ohne USt.; der endgültige Preis ergibt sich aus dem Vertrag.')}</p>
    <h2>{t('Odgovornost za sadržaj', 'Liability for content', 'Haftung für Inhalte')}</h2>
    <p>{t('Naloge, prijave i fotografije u radnom prostoru unose korisnici. Za taj sadržaj odgovorne su upravnik objekta odnosno kompanija koja ga unosi. Nezakonit sadržaj uklanjamo bez odlaganja čim saznamo za njega.', 'Jobs, reports and photos in a workspace are entered by its users; the property manager or company entering them is responsible for that content. We remove unlawful content without delay once we become aware of it.', 'Aufträge, Meldungen und Fotos im Arbeitsbereich werden von den Nutzern eingestellt; verantwortlich ist die jeweilige Verwaltung bzw. das Unternehmen. Rechtswidrige Inhalte entfernen wir unverzüglich, sobald wir davon Kenntnis erhalten.')}</p>
  </LegalPage>;
}
