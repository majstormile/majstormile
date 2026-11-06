'use client';
// Terms of use (opšti uslovi). Published before the contract is concluded and storable/printable,
// as required by Art. 12 and 13 of the Law on Electronic Commerce. Serbian is the binding language.
import {operator as o} from '@/lib/legal';
import LegalPage, {Fill} from '@/components/legal-page';

export default function Terms() {
  const provider = <><Fill value={o.name} label="Poslovno ime"/>, <Fill value={o.street} label="Ulica"/>, <Fill value={o.postcodeCity} label="Poštanski broj i mesto"/>, PIB <Fill value={o.pib} label="PIB"/>, matični broj i registar: <Fill value={o.register} label="APR, matični broj"/></>;
  return <LegalPage title="Uslovi korišćenja" intro={<p className="muted">Ove uslove možete sačuvati ili odštampati (Ctrl+P / „Štampaj“ u pregledaču).</p>} sections={[
    {h: '1. Opšte odredbe', p: [
      <>Ovi uslovi uređuju korišćenje platforme MajstorMile na adresi www.majstormile.com i u aplikaciji za telefon (u daljem tekstu: Usluga). Uslugu pruža {provider} (u daljem tekstu: Pružalac).</>,
      'Usluga je softver za upravnike objekata i stanodavce: prijem prijava kvarova, prosleđivanje poslova izvođačima po ugovorima, praćenje radova i primopredaju. Pružalac ne izvodi radove i nije strana u ugovorima između upravnika objekta i izvođača.',
      'Korišćenjem Usluge, odnosno zaključenjem ugovora o pretplati, prihvatate ove uslove. Ako ih ne prihvatate, ne koristite Uslugu.',
    ]},
    {h: '2. Pojmovi', p: [<ul key="def">
      <li><b>Klijent</b> – pravno lice ili preduzetnik (upravnik objekta, stambena zajednica, stanodavac) koji sa Pružaocem zaključuje ugovor o korišćenju Usluge.</li>
      <li><b>Korisnik</b> – fizičko lice kojem je Klijent ili administrator otvorio nalog: zaposleni, članovi timova, kontrolori i izvođači.</li>
      <li><b>Izvođač</b> – firma ili preduzetnik sa kojim Klijent ima ugovor o radovima (moler, vodoinstalater, električar i dr.).</li>
      <li><b>Podnosilac prijave</b> – stanar, domar ili drugo lice koje kvar prijavljuje preko javne stranice za prijave, bez naloga.</li>
      <li><b>Radni prostor</b> – skup podataka jednog Klijenta: nalozi, ugovori, timovi, fotografije i evidencija aktivnosti.</li>
    </ul>]},
    {h: '3. Zaključenje ugovora', p: [
      'Ugovor sa Klijentom zaključuje se prihvatanjem ponude Pružaoca u pisanom ili elektronskom obliku (e-pošta, potpisana ponuda ili ugovor o pilotu). Ponuda navodi paket, broj stambenih jedinica i izvođača, cenu, trajanje i rok plaćanja. Ovi uslovi su sastavni deo svakog ugovora; ako se ugovor i ovi uslovi razlikuju, važi ugovor.',
      'Ugovor se zaključuje na srpskom jeziku. Pružalac čuva zaključene ugovore i na zahtev ih dostavlja Klijentu.',
      'Pre zaključenja ugovora Klijent može tražiti probni period (pilot) pod uslovima iz ponude. Podaci u demo radnom prostoru su izmišljeni i služe samo za prikaz.',
    ]},
    {h: '4. Nalozi i pristup', p: [
      'Naloge za Korisnike otvara administrator Klijenta. Klijent odgovara za to kome je dao pristup, koju ulogu je dodelio i za blagovremeno ukidanje pristupa osobama koje više ne rade za njega.',
      'Korisnik čuva lozinku, uređaje sa passkey-em i pristup svojoj e-pošti i ne deli ih sa drugima. O sumnji na neovlašćen pristup Korisnik odmah obaveštava administratora Klijenta, a Klijent Pružaoca.',
      'Pružalac može privremeno ograničiti pristup nalogu ako postoji osnovana sumnja na zloupotrebu ili ugrožavanje bezbednosti, o čemu bez odlaganja obaveštava Klijenta.',
    ]},
    {h: '5. Pravila korišćenja', p: [
      'Zabranjeno je: unositi nezakonit, uvredljiv ili tuđ zaštićen sadržaj; fotografisati lica i lična dokumenta bez potrebe; slati lažne prijave; pokušavati pristup tuđim radnim prostorima ili podacima; ometati rad Usluge, zaobilaziti ograničenja ili automatski preuzimati podatke; koristiti Uslugu za slanje neželjenih poruka.',
      'Javna stranica za prijave nije služba za hitne slučajeve. U slučaju neposredne opasnosti po život, zdravlje ili imovinu pozovite 112.',
    ]},
    {h: '6. Sadržaj u radnom prostoru', p: [
      'Podaci koje Klijent i Korisnici unesu ostaju vlasništvo Klijenta. Klijent Pružaocu daje pravo da te podatke čuva, obrađuje i prikazuje isključivo radi pružanja Usluge.',
      <>Za lične podatke u radnom prostoru Klijent je rukovalac, a Pružalac obrađivač. Njihov odnos uređuje <a href="/ugovor-o-obradi-podataka">Ugovor o obradi podataka</a>, koji je sastavni deo ovih uslova. Obradu podataka posetilaca sajta i Korisnika kao takvih opisuje <a href="/politika-privatnosti">Politika privatnosti</a>.</>,
      'Pružalac uklanja ili onemogućava pristup nezakonitom sadržaju čim sazna za njega.',
    ]},
    {h: '7. Izvođači i radovi', p: [
      'Posao se prosleđuje izvođaču prema ugovoru koji Klijent ima sa njim. Cene, rokove, garanciju i kvalitet radova uređuje taj ugovor. Pružalac ne odgovara za radove, štetu nastalu pri izvođenju radova, kašnjenja izvođača niti za plaćanja između Klijenta i izvođača.',
      'Izvođač koji koristi Uslugu dužan je da podatke stanara (ime, telefon, pristup) koristi samo za dogovor termina i izvođenje posla, i da ih ne čuva duže nego što je potrebno.',
    ]},
    {h: '8. Cene i plaćanje', p: [
      'Cene paketa navedene na sajtu su orijentacione, izražene u evrima i bez PDV-a. Obavezujuća je cena iz prihvaćene ponude ili ugovora. Ako nije drugačije ugovoreno, pretplata se plaća unapred za ugovoreni period, u dinarima, po srednjem kursu Narodne banke Srbije na dan izdavanja računa.',
      'U slučaju kašnjenja sa plaćanjem dužim od 30 dana, Pružalac može, posle pisane opomene, ograničiti Uslugu na čitanje podataka do izmirenja duga. Podaci se tom prilikom ne brišu.',
    ]},
    {h: '9. Dostupnost i izmene Usluge', p: [
      'Pružalac nastoji da Usluga bude dostupna bez prekida, ali ne garantuje neprekidan rad. Planirano održavanje najavljuje se unapred kada je to moguće. Usluga zavisi i od infrastrukture trećih lica (hosting, baza podataka, slanje e-pošte).',
      'Pružalac može unapređivati i menjati funkcije Usluge. Bitno smanjenje ugovorenih funkcija najavljuje se najmanje 30 dana unapred; Klijent u tom slučaju može raskinuti ugovor i dobiti srazmerni povraćaj unapred plaćene pretplate.',
    ]},
    {h: '10. Intelektualna svojina', p: [
      'Softver, dizajn, logotip i naziv MajstorMile pripadaju Pružaocu ili su korišćeni uz dozvolu. Klijent dobija neisključivo, neprenosivo pravo korišćenja Usluge za trajanja ugovora. Zabranjeno je kopiranje, rastavljanje ili preprodaja Usluge bez pisane saglasnosti Pružaoca.',
    ]},
    {h: '11. Odgovornost', p: [
      'Pružalac odgovara za štetu koju prouzrokuje namerno ili krajnjom nepažnjom; ta odgovornost se ne može unapred isključiti ni ograničiti (član 265 Zakona o obligacionim odnosima).',
      'Za običnu nepažnju, ukupna odgovornost Pružaoca prema Klijentu ograničena je na iznos pretplate koju je Klijent platio za poslednjih 12 meseci, i ne obuhvata izmaklu korist, osim ako zakon ne propisuje drugačije.',
      'Pružalac ne odgovara za sadržaj koji unose Klijent i Korisnici, za radove izvođača, ni za štetu nastalu zbog netačnih podataka u prijavi ili zbog kašnjenja u reagovanju na hitne slučajeve, za koje je nadležna služba 112.',
    ]},
    {h: '12. Trajanje i raskid', p: [
      'Ugovor traje za period naveden u ponudi i, ako nije drugačije ugovoreno, produžava se za isti period ako ga nijedna strana ne otkaže najkasnije 30 dana pre isteka.',
      'Svaka strana može raskinuti ugovor zbog bitne povrede obaveza druge strane koja nije otklonjena u roku od 15 dana od pisane opomene.',
      'Po prestanku ugovora Klijent ima 30 dana da izveze svoje podatke (CSV, JSON, PDF). Posle toga Pružalac briše radni prostor i rezervne kopije u roku utvrđenom Ugovorom o obradi podataka, osim podataka koje je dužan da čuva po zakonu.',
    ]},
    {h: '13. Podnosioci prijava (stanari)', p: [
      'Prijava kvara preko javne stranice je besplatna i ne zahteva nalog. Prijava se prosleđuje upravniku objekta koji odlučuje o daljem postupanju; Pružalac ne garantuje da će kvar biti otklonjen niti u kom roku. Podnosilac prijave odgovara za tačnost podataka koje unese.',
    ]},
    {h: '14. Izmene uslova', p: [
      'Pružalac može izmeniti ove uslove. O bitnim izmenama Klijente obaveštava e-poštom ili u aplikaciji najmanje 30 dana pre stupanja na snagu. Ako se Klijent ne slaže sa izmenama, može raskinuti ugovor pre njihovog stupanja na snagu i dobiti srazmerni povraćaj unapred plaćene pretplate. Važeća verzija i datum njenog stupanja na snagu uvek su objavljeni na ovoj stranici.',
    ]},
    {h: '15. Merodavno pravo i rešavanje sporova', p: [
      <>Na ove uslove i ugovore primenjuje se pravo Republike Srbije. Strane će sporove pokušati da reše sporazumno. Ako to ne uspe, nadležan je stvarno nadležan sud u <Fill value={o.courtTown} label="mesto sedišta Pružaoca"/>.</>,
    ]},
    {h: '16. Kontakt', p: [<>Pitanja i obaveštenja u vezi sa ovim uslovima šaljite na <Fill value={o.email} label="e-pošta"/>.</>]},
  ]}/>;
}
