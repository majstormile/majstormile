'use client';
// Processor agreement (ugovor o obradi podataka) under Art. 45 ZZPL, concluded electronically as part of the terms.
// Keep the security measures and sub-processors in step with the code and lib/legal.ts.
import {operator as o, SUBPROCESSORS} from '@/lib/legal';
import {DEFAULT_CONTACT_DAYS} from '@/lib/privacy';
import LegalPage, {Fill} from '@/components/legal-page';

export default function ProcessorAgreement() {
  return <LegalPage title="Ugovor o obradi podataka" intro={<p className="muted">Zaključen u skladu sa članom 45 Zakona o zaštiti podataka o ličnosti (ZZPL). Sastavni je deo <a href="/uslovi-koriscenja">Uslova korišćenja</a> i smatra se zaključenim u elektronskom obliku zaključenjem ugovora o korišćenju Usluge.</p>} sections={[
    {h: '1. Strane', p: [
      'Rukovalac: Klijent, odnosno upravnik objekta ili stanodavac koji koristi MajstorMile (u daljem tekstu: Rukovalac).',
      <>Obrađivač: <Fill value={o.name} label="Poslovno ime"/>, <Fill value={o.street} label="Ulica"/>, <Fill value={o.postcodeCity} label="Poštanski broj i mesto"/>, PIB <Fill value={o.pib} label="PIB"/> (u daljem tekstu: Obrađivač).</>,
    ]},
    {h: '2. Predmet, trajanje, priroda i svrha obrade', p: [
      'Predmet: čuvanje i obrada podataka u radnom prostoru Rukovaoca radi prijema prijava kvarova, prosleđivanja poslova izvođačima, praćenja radova, primopredaje i izveštavanja.',
      'Trajanje: za vreme trajanja ugovora o korišćenju Usluge i do brisanja ili vraćanja podataka po tački 9.',
      'Priroda obrade: prikupljanje preko obrazaca, čuvanje, pregled, prosleđivanje izvođaču, izvoz, uklanjanje metapodataka sa fotografija, automatsko brisanje kontakt podataka i izrada rezervnih kopija.',
    ]},
    {h: '3. Vrste podataka i kategorije lica', p: [<ul key="data">
      <li><b>Stanari i drugi podnosioci prijava:</b> ime, broj telefona, e-pošta (opciono), adresa, stan ili sprat, podaci o pristupu, opis kvara, fotografije.</li>
      <li><b>Zaposleni i saradnici Rukovaoca:</b> ime, e-pošta, telefon, uloga, tim, profilna fotografija, evidencija aktivnosti.</li>
      <li><b>Izvođači i njihovi zaposleni:</b> naziv firme, kontakt osoba, e-pošta, telefon, podaci iz ugovora, beleške i fotografije o napretku radova.</li>
    </ul>, 'Posebne vrste podataka (o zdravlju, verskom uverenju i sl.) ne treba unositi u Uslugu.']},
    {h: '4. Prava i obaveze Rukovaoca', p: [
      'Rukovalac određuje svrhu i sredstva obrade, odgovara za zakonitost obrade i za pravni osnov za podatke koje unosi, daje Obrađivaču uputstva (podešavanjima u aplikaciji, ovim ugovorom ili pisanim putem) i ima pravo da proverava ispunjavanje obaveza Obrađivača.',
      `Rukovalac sam podešava rok automatskog brisanja kontakt podataka stanara (podrazumevano ${DEFAULT_CONTACT_DAYS} dana od zatvaranja posla, od 14 do 730 dana) i odgovara na zahteve lica čiji se podaci obrađuju.`,
    ]},
    {h: '5. Obaveze Obrađivača', p: ['Obrađivač se obavezuje da:', <ol key="obl">
      <li>obrađuje podatke samo po pisanim uputstvima Rukovaoca, uključujući i iznošenje podataka u druge države, osim ako je obrada propisana zakonom, o čemu pre obrade obaveštava Rukovaoca;</li>
      <li>obezbedi da se lica ovlašćena za obradu obavežu na čuvanje poverljivosti ili da podležu zakonskoj obavezi poverljivosti;</li>
      <li>preduzme mere zaštite iz člana 50 ZZPL, navedene u tački 7;</li>
      <li>poštuje uslove za angažovanje drugog obrađivača iz tačke 6;</li>
      <li>pomaže Rukovaocu, koliko je moguće, u odgovaranju na zahteve lica za ostvarivanje njihovih prava (pristup, ispravka, brisanje, ograničenje, prenosivost, prigovor); aplikacija za to sadrži pretragu, izvoz i brisanje podataka osobe;</li>
      <li>pomaže Rukovaocu u ispunjavanju obaveza iz člana 50 i čl. 52–55 ZZPL (bezbednost, povrede podataka, procena uticaja);</li>
      <li>po prestanku obrade, po izboru Rukovaoca, briše ili vraća sve podatke i briše kopije, osim ako je čuvanje propisano zakonom (tačka 9);</li>
      <li>Rukovaocu stavi na raspolaganje informacije potrebne za dokazivanje ispunjenosti obaveza i omogući proveru (reviziju) od strane Rukovaoca ili lica koje on ovlasti, uz najavu od najmanje 14 dana i u razumnom obimu.</li>
    </ol>, 'Obrađivač bez odlaganja upozorava Rukovaoca ako smatra da je neko uputstvo suprotno ZZPL ili drugom propisu o zaštiti podataka (član 45 stav 5 ZZPL). Obrađivač ne koristi podatke Rukovaoca za sopstvene svrhe.']},
    {h: '6. Drugi obrađivači (podobrađivači)', p: [
      'Rukovalac daje opšte pisano ovlašćenje za angažovanje sledećih obrađivača:',
      <ul key="sp">{SUBPROCESSORS.map(s => <li key={s.name}><b>{s.name}</b>: {s.role}. {s.where}.</li>)}</ul>,
      'O planiranoj promeni ili dodavanju obrađivača Obrađivač obaveštava Rukovaoca e-poštom najmanje 30 dana unapred. Rukovalac može izjaviti prigovor; ako se ne postigne dogovor, Rukovalac može raskinuti ugovor bez troškova. Obrađivač drugom obrađivaču nameće iste obaveze zaštite podataka i ostaje odgovoran Rukovaocu za njegov rad (član 45 stav 7 ZZPL).',
      'Kada drugi obrađivač podatke iznosi iz Republike Srbije, to se čini u skladu sa odredbama ZZPL o iznošenju podataka, na primer na osnovu standardnih ugovornih klauzula.',
    ]},
    {h: '7. Mere zaštite', p: [<ul key="sec">
      <li>Šifrovan prenos podataka (HTTPS) i čuvanje u data centru u Evropskoj uniji (Frankfurt).</li>
      <li>Pristup samo prijavljenim korisnicima, kontrola pristupa prema ulogama i timovima, zaštita od zloupotrebe obrasca za prijave.</li>
      <li>Fotografije i dokumenta u privatnom skladištu, dostupni samo preko servera uz proveru ovlašćenja.</li>
      <li>Automatsko uklanjanje GPS i drugih metapodataka sa fotografija pri otpremanju.</li>
      <li>Automatsko brisanje kontakt podataka stanara po isteku roka koji podesi Rukovalac.</li>
      <li>Evidencija aktivnosti u radnom prostoru i dnevne rezervne kopije koje se čuvaju 30 dana.</li>
      <li>Automatska odjava posle 24 sata i mogućnost prijave bez lozinke (passkey, kod iz e-pošte).</li>
    </ul>]},
    {h: '8. Povreda podataka', p: [
      'Obrađivač obaveštava Rukovaoca o povredi podataka o ličnosti bez nepotrebnog odlaganja, a najkasnije u roku od 48 sati od kada je za nju saznao, i dostavlja raspoložive informacije potrebne Rukovaocu da obavesti Poverenika i lica na koja se podaci odnose, u skladu sa čl. 52 i 53 ZZPL.',
    ]},
    {h: '9. Prestanak obrade', p: [
      'Po prestanku ugovora Rukovalac ima 30 dana da izveze podatke. Posle toga Obrađivač briše radni prostor, a rezervne kopije se brišu najkasnije 30 dana kasnije, kada im istekne rok čuvanja. Na zahtev Rukovaoca Obrađivač pisano potvrđuje brisanje.',
    ]},
    {h: '10. Završne odredbe', p: [
      'Za pitanja koja ovaj ugovor ne uređuje primenjuju se ZZPL i Uslovi korišćenja. Ako se ovaj ugovor i Uslovi korišćenja razlikuju u pogledu zaštite podataka, primenjuje se ovaj ugovor. Rukovalac na zahtev može dobiti i potpisan primerak ovog ugovora.',
      <>Kontakt za pitanja zaštite podataka: <Fill value={o.email} label="e-pošta"/>.</>,
    ]},
  ]}/>;
}
