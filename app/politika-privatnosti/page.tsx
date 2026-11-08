'use client';
// Privacy policy under the Law on Personal Data Protection (ZZPL, Sl. glasnik RS 87/2018), Serbian only.
// Keep in step with lib/legal.ts (operator, sub-processors) and lib/privacy.ts (retention).
import {operator as o, AUTHORITY as a, SUBPROCESSORS} from '@/lib/legal';
import {DEFAULT_CONTACT_DAYS} from '@/lib/privacy';
import LegalPage, {Fill} from '@/components/legal-page';

export default function PrivacyPolicy() {
  const who = <>
    <Fill value={o.name} label="Poslovno ime"/>, <Fill value={o.street} label="Ulica"/>, <Fill value={o.postcodeCity} label="Poštanski broj i mesto"/>, {o.country}. E-pošta: <Fill value={o.email} label="e-pošta"/>
  </>;
  return <LegalPage title="Politika privatnosti" intro={<p className="muted">Prema Zakonu o zaštiti podataka o ličnosti („Sl. glasnik RS“, br. 87/2018, u daljem tekstu: ZZPL).</p>} sections={[
    {h: '1. Ko je rukovalac?', p: [
      <>Za ovaj sajt, korisničke naloge naših klijenata i upite koji nam stižu rukovalac je: {who}</>,
      o.serbianRepresentative ? <>Predstavnik u Republici Srbiji (član 44 ZZPL): {o.serbianRepresentative}</> : null,
      o.dpo ? <>Lice za zaštitu podataka o ličnosti: {o.dpo}</> : 'Lice za zaštitu podataka o ličnosti trenutno nije imenovano; obaveza se proverava pre početka komercijalnog rada, a kontakt podaci će tada biti objavljeni ovde.',
      <>MajstorMile je softver za upravnike objekata. Za naloge, prijave stanara i fotografije u jednom radnom prostoru rukovalac je upravnik objekta koji ga koristi. Te podatke obrađujemo samo u njegovo ime i po njegovim uputstvima, na osnovu <a href="/ugovor-o-obradi-podataka">Ugovora o obradi podataka</a> (član 45 ZZPL). Zahteve u vezi sa tim podacima uputite svom upravniku objekta; zahteve koji stignu nama prosleđujemo.</>,
    ]},
    {h: '2. Prijava kvara od strane stanara', p: [
      'Kada prijavite kvar preko stranice za prijave, obrađuju se: adresa, stan odnosno sprat, podaci o pristupu, struka, opis, opciono fotografija, vaše ime, broj telefona i opciono e-pošta.',
      'Svrha je da upravnik vašeg objekta organizuje popravku. Pravni osnov je izvršenje ugovora odnosno obaveza održavanja objekta (član 12 stav 1 tačka 2 ZZPL) i legitimni interes za brzo otklanjanje kvarova (tačka 6).',
      'Ime, broj telefona i podatke o pristupu dobija samo izvođač koji preuzme posao, da bi dogovorio termin. Druge firme ih ne vide. Vi tada, na stranici za praćenje i e-poštom ako ste je ostavili, dobijate ime, telefon i e-poštu majstora za posao, kao i termin dolaska i podsetnike.',
      'Fotografije: GPS pozicija, podaci o uređaju i vreme snimanja koje telefoni upisuju u fotografije automatski se uklanjaju pri otpremanju. Molimo vas da ne fotografišete osobe niti lična dokumenta.',
      'Napredak možete proveriti pomoću koda za praćenje. Stranica sa statusom ne prikazuje imena, beleške ni fotografije.',
      'Prijavu bez naloga treba da podnese lice koje je navršilo 15 godina (član 16 ZZPL); mlađa lica prijavu podnose preko roditelja ili staratelja.',
    ]},
    {h: '3. Koliko dugo čuvamo podatke', p: [
      `Ime, broj telefona, e-pošta i podaci o pristupu brišu se automatski ${DEFAULT_CONTACT_DAYS} dana nakon zatvaranja posla (upravnik objekta može podesiti rok od 14 do 730 dana), a na zahtev i ranije.`,
      'Sam posao (adresa, opis, fotografije, istorija) čuva se kao dokaz o izvedenim radovima dok mogu nastati zahtevi iz garancije (rok zavisi od ugovora i zakona), a zatim ga briše upravnik objekta.',
      'Rezervne kopije radnog prostora čuvaju se 30 dana. Po prestanku ugovora sa klijentom podatke vraćamo ili brišemo kako je određeno Ugovorom o obradi podataka.',
    ]},
    {h: '4. Nalozi upravnika objekata i izvođača', p: [
      'Za korisnički nalog obrađujemo ime, e-poštu, ulogu, pripadnost timu odnosno firmi i evidenciju radnji u radnom prostoru. Pravni osnov je izvršenje ugovora (član 12 stav 1 tačka 2 ZZPL), a za evidenciju radnji legitimni interes sledljivosti i bezbednosti (tačka 6). Pristup dobijaju samo osobe koje je odobrio administrator.',
      'Načini prijave: lozinka, jednokratni kod poslat e-poštom, passkey (Face ID, otisak prsta ili PIN uređaja), Google ili Facebook nalog. Pri prijavi preko Google ili Facebook naloga od tog servisa dobijamo vaše ime i e-poštu, a servis saznaje da se prijavljujete u MajstorMile. Kod passkey-a čuva se samo javni ključ; otisak prsta i lice nikada ne napuštaju vaš uređaj.',
    ]},
    {h: '4a. Zahtevi za podršku', p: [
      'Kada nam pišete preko stranice za podršku, obrađujemo vaše ime, e-poštu, opciono broj telefona, temu i poruku, kao i naše interne beleške o rešavanju zahteva. Svrha je da odgovorimo na vaš zahtev; pravni osnov je preduzimanje radnji na vaš zahtev odnosno izvršenje ugovora (član 12 stav 1 tačka 2 ZZPL) i naš legitimni interes da odgovorimo na upite (tačka 6).',
      'Zahtev se čuva u našoj bazi podataka i šalje na našu adresu e-pošte. Zatvoreni zahtevi se automatski brišu dve godine nakon poslednje izmene, a na vaš zahtev i ranije. Ako nam pišete preko WhatsApp-a ili Viber-a, na tu komunikaciju primenjuju se i pravila tih servisa.',
    ]},
    {h: '5. Hosting, serverski zapisi i veb analitika', p: [
      'Kada otvorite sajt, naš hosting provajder obrađuje tehnički neophodne podatke (IP adresa, vreme, stranica, pregledač) radi isporuke i zaštite sajta (legitimni interes, član 12 stav 1 tačka 6 ZZPL). Da bismo sprečili zloupotrebu obrasca za prijavu, kratko čuvamo skraćenu, nepovratnu heš vrednost IP adrese.',
      'Koristimo Vercel Web Analytics za brojanje poseta stranicama. Ne postavlja kolačiće i ne pravi profile preko više sajtova; posetioci se razlikuju samo po heš vrednosti koja se menja svakog dana.',
    ]},
    {h: '6. Kolačići i čuvanje na vašem uređaju', p: [
      <>Ne koristimo kolačiće za praćenje ni za reklame. Detalji su u <a href="/politika-kolacica">Politici kolačića</a>.</>,
    ]},
    {h: '7. Primaoci i obrađivači', p: [
      'Koristimo sledeće obrađivače, svakog na osnovu ugovora o obradi podataka. Kada podaci mogu dospeti u SAD ili drugu državu, iznošenje podataka iz Republike Srbije vršimo u skladu sa odredbama ZZPL o iznošenju podataka (na primer, uz standardne ugovorne klauzule).',
      <ul key="sp">{SUBPROCESSORS.map(s => <li key={s.name}><b>{s.name}</b>: {s.role}. {s.where}.</li>)}</ul>,
      'Podatke ne prodajemo i ne koristimo ih za reklamiranje.',
    ]},
    {h: '8. Vaša prava', p: [
      'Imate pravo na pristup i kopiju podataka (član 26 ZZPL), ispravku i dopunu (član 29), brisanje (član 30), ograničenje obrade (član 31), prenosivost podataka (član 36) i prigovor na obradu zasnovanu na legitimnom interesu (član 37). Obratite se svom upravniku objekta ili nama. Na zahtev odgovaramo bez odlaganja, a najkasnije u roku od 30 dana od prijema zahteva; taj rok se može produžiti za još najviše 60 dana, o čemu vas obaveštavamo u prvih 30 dana (član 21).',
      <>Možete podneti pritužbu nadzornom organu: {a.name}, {a.address}, {a.email}, {a.phone}, <a href={a.web}>{a.web}</a>.</>,
      'Ne vršimo automatizovano donošenje odluka niti profilisanje.',
    ]},
    {h: '9. Brisanje podataka', p: [
      <span key="del" id="brisanje-podataka">Da biste obrisali svoj nalog i podatke, uključujući podatke dobijene preko prijave sa Google ili Facebook nalogom, pošaljite zahtev na <Fill value={o.email} label="e-pošta"/> sa adrese kojom se prijavljujete. Brisanje potvrđujemo u roku od 30 dana. Vezu sa aplikacijom možete ukloniti i sami u podešavanjima svog Google ili Facebook naloga. Ako ste prijavu podneli kao stanar, zahtev možete uputiti i svom upravniku objekta.</span>,
    ]},
    {h: '10. Bezbednost', p: [
      'Podaci se prenose isključivo šifrovano (HTTPS), čuvaju se u data centru u Evropskoj uniji, a fotografije i dokumenta u privatnom skladištu kojem se pristupa samo preko servera uz proveru ovlašćenja. Pristup unutar radnog prostora ograničen je ulogama, a izmene se beleže u evidenciji aktivnosti.',
    ]},
    {h: '11. Izmene', p: ['Ovu politiku menjamo kada se promeni MajstorMile ili propisi. Nova verzija važi od dana objavljivanja na ovoj stranici, a o bitnim izmenama korisnike obaveštavamo e-poštom ili u aplikaciji.']},
  ]}/>;
}
