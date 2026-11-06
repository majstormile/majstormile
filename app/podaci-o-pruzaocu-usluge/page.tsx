'use client';
// Provider notice under Art. 6 of the Law on Electronic Commerce. Operator details come from lib/legal.ts.
import {operator as o} from '@/lib/legal';
import LegalPage, {Fill} from '@/components/legal-page';

export default function ProviderNotice() {
  return <LegalPage title="Podaci o pružaocu usluge" intro={<p className="muted">Prema članu 6 Zakona o elektronskoj trgovini.</p>} sections={[
    {h: 'Pružalac usluge', p: [<>
      <Fill value={o.name} label="Poslovno ime i pravna forma"/><br/>
      <Fill value={o.street} label="Ulica i broj"/><br/>
      <Fill value={o.postcodeCity} label="Poštanski broj i mesto (sedište)"/><br/>
      {o.country}
    </>]},
    {h: 'Zastupnik', p: [<Fill key="r" value={o.representedBy} label="Direktor ili vlasnik"/>]},
    {h: 'Kontakt', p: [<>E-pošta: <Fill value={o.email} label="e-pošta"/><br/>Telefon: <Fill value={o.phone} label="broj telefona"/></>]},
    {h: 'Upis u registar', p: [<Fill key="reg" value={o.register} label="Agencija za privredne registre, matični broj …"/>]},
    {h: 'Poreski identifikacioni broj (PIB)', p: [<Fill key="pib" value={o.pib} label="PIB"/>]},
    o.vatId ? {h: 'Broj obveznika PDV-a', p: [o.vatId]} : null,
    o.serbianRepresentative ? {h: 'Predstavnik u Republici Srbiji (član 44 ZZPL)', p: [o.serbianRepresentative]} : null,
    {h: 'Nadzorni organ', p: [
      'Delatnost pružaoca usluge ne podleže posebnom nadzoru nadležnog organa. Za zaštitu podataka o ličnosti nadležan je Poverenik za informacije od javnog značaja i zaštitu podataka o ličnosti (pogledajte Politiku privatnosti).',
    ]},
    {h: 'Cene', p: [
      'Cene na sajtu su orijentacione, izražene u evrima i bez PDV-a. Konačna cena i način plaćanja utvrđuju se ugovorom ili ponudom, u skladu sa Uslovima korišćenja.',
    ]},
    {h: 'Odgovornost za sadržaj', p: [
      'Naloge, prijave i fotografije u radnom prostoru unose korisnici. Za taj sadržaj odgovoran je upravnik objekta, odnosno korisnik koji ga je uneo. Nezakonit sadržaj uklanjamo bez odlaganja čim saznamo za njega.',
    ]},
  ].filter(Boolean) as never}/>;
}
