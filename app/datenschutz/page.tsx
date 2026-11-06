'use client';
// Privacy policy under the Serbian Law on Personal Data Protection (ZZPL, Sl. glasnik RS 87/2018).
// Keep in step with lib/legal.ts (operator, sub-processors) and lib/privacy.ts (retention).
import {getLang} from '@/lib/i18n';
import {operator as o, AUTHORITY as a, SUBPROCESSORS} from '@/lib/legal';
import {DEFAULT_CONTACT_DAYS} from '@/lib/privacy';
import LegalPage, {Fill, useL3} from '@/components/legal-page';

type Section = {h: string; p: (string | React.ReactNode)[]};

export default function Datenschutz() {
  const t = useL3();
  const lang = getLang();
  const who = <>
    <Fill value={o.name} label={t('Poslovno ime', 'Business name', 'Firma')}/>, <Fill value={o.street} label={t('Ulica', 'Street', 'Straße')}/>, <Fill value={o.postcodeCity} label={t('Poštanski broj i mesto', 'Postcode and town', 'PLZ Ort')}/>, {o.country}. {t('E-pošta', 'Email', 'E-Mail')}: <Fill value={o.email} label={t('e-pošta', 'email', 'E-Mail')}/>
  </>;
  const authority = <>{lang === 'en' ? a.nameEn : a.name}, {a.address}, {a.email}, {a.phone}, <a href={a.web}>{a.web}</a></>;
  const sections: Section[] = lang === 'sr' ? [
    {h: '1. Ko je rukovalac?', p: [
      <>Za ovaj sajt, naloge naših korisnika i upite koji nam stižu rukovalac je: {who}</>,
      o.serbianRepresentative ? <>Predstavnik u Republici Srbiji (član 44 ZZPL): {o.serbianRepresentative}</> : null,
      o.dpo ? <>Lice za zaštitu podataka o ličnosti: {o.dpo}</> : 'Lice za zaštitu podataka o ličnosti trenutno nije imenovano; obaveza se proverava pre početka komercijalnog rada, a kontakt podaci će biti objavljeni ovde.',
      'MajstorMile je softver za upravnike objekata. Za naloge, prijave stanara i fotografije u jednom radnom prostoru rukovalac je upravnik objekta koji ga koristi. Te podatke obrađujemo samo u njegovo ime i po njegovim uputstvima, na osnovu ugovora o obradi podataka. Zahteve u vezi sa tim podacima uputite svom upravniku objekta; zahteve koji stignu nama prosleđujemo.',
    ]},
    {h: '2. Prijava kvara od strane stanara', p: [
      'Kada prijavite kvar preko stranice za prijave, obrađujemo: adresu, stan odnosno sprat, podatke o pristupu, struku, opis, opciono fotografiju, vaše ime, broj telefona i opciono e-poštu.',
      'Svrha je da upravnik vašeg objekta organizuje popravku. Pravni osnov je izvršenje ugovora odnosno obaveza održavanja objekta, kao i legitimni interes za brzo otklanjanje kvarova.',
      'Ime, broj telefona i podatke o pristupu dobija samo izvođač koji preuzme posao, da bi dogovorio termin. Druge firme ih ne vide.',
      'Fotografije: GPS pozicija, podaci o uređaju i vreme snimanja koje telefoni upisuju u fotografije automatski se uklanjaju pri otpremanju. Molimo vas da ne fotografišete osobe niti lična dokumenta.',
      'Napredak možete proveriti pomoću koda za praćenje. Stranica sa statusom ne prikazuje imena, beleške ni fotografije.',
      'Prijavu bez naloga treba da podnese lice koje je navršilo 15 godina; mlađa lica prijavu podnose preko roditelja ili staratelja.',
    ]},
    {h: '3. Koliko dugo čuvamo podatke', p: [
      `Ime, broj telefona, e-pošta i podaci o pristupu brišu se automatski ${DEFAULT_CONTACT_DAYS} dana nakon zatvaranja posla (upravnik objekta može podesiti rok od 14 do 730 dana), a na zahtev i ranije.`,
      'Sam posao (adresa, opis, fotografije, istorija) čuva se kao dokaz o izvedenim radovima dok mogu nastati zahtevi iz garancije (rok zavisi od ugovora i zakona), a zatim ga briše upravnik objekta.',
      'Rezervne kopije radnog prostora čuvaju se 30 dana.',
    ]},
    {h: '4. Nalozi upravnika objekata i izvođača', p: [
      'Za korisnički nalog obrađujemo ime, e-poštu, ulogu, pripadnost timu odnosno firmi i evidenciju radnji u radnom prostoru (izvršenje ugovora; za evidenciju legitimni interes: sledljivost i bezbednost). Pristup dobijaju samo osobe koje je odobrio administrator.',
      'Pri prijavi preko Google ili Facebook naloga od tog servisa dobijamo vaše ime i e-poštu, a servis saznaje da se prijavljujete u MajstorMile. Pri prijavi kodom iz e-pošte šaljemo jednokratni kod na vašu adresu. Ako koristite passkey, na našoj strani se čuva samo javni ključ; otisak prsta ili lice nikada ne napuštaju vaš uređaj.',
    ]},
    {h: '5. Hosting, serverski zapisi i veb analitika', p: [
      'Kada otvorite sajt, naš hosting provajder obrađuje tehnički neophodne podatke (IP adresa, vreme, stranica, pregledač) radi isporuke i zaštite sajta (legitimni interes). Da bismo sprečili zloupotrebu obrasca za prijavu, kratko čuvamo skraćenu, nepovratnu heš vrednost IP adrese.',
      'Koristimo Vercel Web Analytics za brojanje poseta stranicama. Ne postavlja kolačiće i ne pravi profile preko više sajtova; posetioci se razlikuju samo po heš vrednosti koja se menja svakog dana.',
    ]},
    {h: '6. Čuvanje na vašem uređaju', p: [
      'Ne koristimo kolačiće za praćenje ni za reklame. U memoriji vašeg pregledača čuva se samo ono što je potrebno za uslugu koju ste tražili: sesija prijave, jezik, izgled (svetlo/tamno), izmene unete van mreže i kopija aplikacije za rad bez veze. Pri odjavi se obrišu sačuvani radni podaci.',
    ]},
    {h: '7. Primaoci i pružaoci usluga', p: [
      'Koristimo sledeće obrađivače, svakog na osnovu ugovora o obradi podataka. Kada podaci mogu dospeti u SAD ili drugu državu, iznošenje podataka iz Republike Srbije vršimo u skladu sa odredbama ZZPL o iznošenju podataka (na primer, uz standardne ugovorne klauzule).',
      <ul key="sp">{SUBPROCESSORS.map(s => <li key={s.name}><b>{s.name}</b>: {s.role.sr}. {s.where.sr}.</li>)}</ul>,
    ]},
    {h: '8. Vaša prava', p: [
      'Imate pravo na pristup i kopiju podataka (član 26 ZZPL), ispravku i dopunu (član 29), brisanje (član 30), ograničenje obrade (član 31), prenosivost podataka (član 36) i prigovor na obradu zasnovanu na legitimnom interesu (član 37). Obratite se svom upravniku objekta ili nama. Na zahtev odgovaramo bez odlaganja, a najkasnije u roku od 30 dana od prijema zahteva; taj rok se može produžiti za još najviše 60 dana, o čemu vas obaveštavamo u prvih 30 dana (član 21).',
      <>Možete podneti pritužbu nadzornom organu: {authority}</>,
      <span id="brisanje-podataka">Brisanje podataka: da biste obrisali svoj nalog i podatke, uključujući podatke dobijene preko prijave sa Google ili Facebook nalogom, pošaljite zahtev na <Fill value={o.email} label="e-pošta"/> sa e-poštom kojom se prijavljujete. Brisanje potvrđujemo u roku od 30 dana. Vezu sa aplikacijom možete ukloniti i sami u podešavanjima svog Google ili Facebook naloga.</span>,
      'Ne vršimo automatizovano donošenje odluka niti profilisanje.',
    ]},
    {h: '9. Stanje', p: ['Novembar 2026. Ovu politiku menjamo kada se promeni MajstorMile ili zakon. Verzija na srpskom jeziku je merodavna.']},
  ] : lang === 'de' ? [
    {h: '1. Wer ist verantwortlich?', p: [
      <>Für diese Website, die Konten unserer Kunden und die Anfragen an uns ist verantwortlich: {who}</>,
      o.serbianRepresentative ? <>Vertreter in der Republik Serbien (Art. 44 ZZPL): {o.serbianRepresentative}</> : null,
      o.dpo ? <>Datenschutzbeauftragte/r: {o.dpo}</> : 'Ein Datenschutzbeauftragter ist derzeit nicht benannt; die Pflicht dazu wird bei Aufnahme des Geschäftsbetriebs geprüft, die Kontaktdaten werden dann hier veröffentlicht.',
      'MajstorMile ist eine Software für Objektverwaltungen. Für die Aufträge, Mietermeldungen und Fotos in einem Arbeitsbereich ist die jeweilige Verwaltung verantwortlich. Wir verarbeiten diese Daten nur in ihrem Auftrag und nach ihren Weisungen auf Grundlage eines Auftragsverarbeitungsvertrags. Anfragen zu diesen Daten richten Sie bitte an Ihre Verwaltung; an uns gerichtete Anfragen leiten wir weiter.',
    ]},
    {h: '2. Schadensmeldung durch Mieter', p: [
      'Wenn Sie über die Meldeseite einen Schaden melden, verarbeiten wir: Adresse, Wohnung bzw. Etage, Zugangshinweise, Gewerk, Beschreibung, optional ein Foto, Ihren Namen, Ihre Telefonnummer und optional Ihre E-Mail-Adresse.',
      'Zweck ist die Organisation der Reparatur durch Ihre Verwaltung. Rechtsgrundlage sind die Vertragserfüllung bzw. die Instandhaltungspflicht sowie das berechtigte Interesse an einer schnellen Schadensbehebung.',
      'Name, Telefonnummer und Zugangshinweise erhält nur der Handwerksbetrieb, der den Auftrag übernimmt, damit er einen Termin vereinbaren kann. Andere Betriebe sehen sie nicht.',
      'Fotos: Standortdaten (GPS), Gerätedaten und Aufnahmezeit, die Smartphones in Fotos speichern, werden beim Hochladen automatisch entfernt. Bitte fotografieren Sie keine Personen und keine persönlichen Unterlagen.',
      'Den Bearbeitungsstand können Sie mit Ihrem Verfolgungscode abrufen. Die Statusseite zeigt keine Namen, Notizen oder Fotos.',
      'Eine Meldung ohne Konto sollte von Personen ab 15 Jahren abgegeben werden; Jüngere melden über Eltern oder Erziehungsberechtigte.',
    ]},
    {h: '3. Speicherdauer', p: [
      `Name, Telefonnummer, E-Mail-Adresse und Zugangshinweise werden automatisch ${DEFAULT_CONTACT_DAYS} Tage nach Abschluss des Auftrags gelöscht (die Verwaltung kann eine Frist zwischen 14 und 730 Tagen festlegen) und auf Anfrage auch früher.`,
      'Der Auftrag selbst (Adresse, Beschreibung, Fotos, Verlauf) bleibt als Nachweis der ausgeführten Arbeit erhalten, solange Gewährleistungsansprüche bestehen können (Frist nach Vertrag und Gesetz), und wird danach von der Verwaltung gelöscht.',
      'Sicherungskopien des Arbeitsbereichs werden 30 Tage aufbewahrt.',
    ]},
    {h: '4. Konten von Verwaltungen und Handwerksbetrieben', p: [
      'Für ein Benutzerkonto verarbeiten wir Name, E-Mail-Adresse, Rolle, Team- bzw. Betriebszugehörigkeit sowie ein Protokoll der Aktionen im Arbeitsbereich (Vertragserfüllung; für das Protokoll berechtigtes Interesse: Nachvollziehbarkeit und Sicherheit). Zugang erhält nur, wer von einem Administrator freigeschaltet wurde.',
      'Bei der Anmeldung mit Google oder Facebook erhalten wir von diesem Dienst Ihren Namen und Ihre E-Mail-Adresse; der Dienst erfährt dabei, dass Sie sich bei MajstorMile anmelden. Bei der Anmeldung mit E-Mail-Code senden wir einen Einmalcode an Ihre Adresse. Bei einem Passkey speichern wir nur einen öffentlichen Schlüssel; Fingerabdruck oder Gesicht verlassen nie Ihr Gerät.',
    ]},
    {h: '5. Hosting, Server-Protokolle und Webanalyse', p: [
      'Beim Aufruf der Website verarbeitet unser Hoster technisch notwendige Daten (IP-Adresse, Zeitpunkt, aufgerufene Seite, Browser) zur Auslieferung und Absicherung (berechtigtes Interesse). Um Missbrauch des Meldeformulars zu verhindern, speichern wir kurzzeitig einen gekürzten, nicht umkehrbaren Hashwert der IP-Adresse.',
      'Wir nutzen Vercel Web Analytics zur Zählung von Seitenaufrufen. Dabei werden keine Cookies gesetzt und keine seitenübergreifenden Profile gebildet; Besucher werden nur über einen täglich wechselnden Hash unterschieden.',
    ]},
    {h: '6. Speicherung auf Ihrem Gerät', p: [
      'Wir verwenden keine Tracking- oder Werbe-Cookies. Im Speicher Ihres Browsers legen wir nur ab, was für die von Ihnen gewünschte Nutzung nötig ist: Anmeldesitzung, Sprache, Darstellung (hell/dunkel), offline erfasste Änderungen und eine Kopie der App für die Nutzung ohne Verbindung. Beim Abmelden werden die gespeicherten Arbeitsdaten gelöscht.',
    ]},
    {h: '7. Empfänger und Dienstleister', p: [
      'Wir setzen folgende Dienstleister als Auftragsverarbeiter ein, jeweils auf Grundlage eines Auftragsverarbeitungsvertrags. Wo Daten in die USA oder einen anderen Staat gelangen können, erfolgt die Übermittlung aus der Republik Serbien nach den Vorschriften des ZZPL über die Ausfuhr von Daten (zum Beispiel mit Standardvertragsklauseln).',
      <ul key="sp">{SUBPROCESSORS.map(s => <li key={s.name}><b>{s.name}</b>: {s.role.de}. {s.where.de}.</li>)}</ul>,
    ]},
    {h: '8. Ihre Rechte', p: [
      'Sie haben das Recht auf Auskunft und Kopie (Art. 26 ZZPL), Berichtigung und Ergänzung (Art. 29), Löschung (Art. 30), Einschränkung der Verarbeitung (Art. 31), Datenübertragbarkeit (Art. 36) und Widerspruch gegen Verarbeitungen auf Grundlage berechtigter Interessen (Art. 37). Wenden Sie sich an Ihre Verwaltung oder an uns. Wir antworten unverzüglich, spätestens innerhalb von 30 Tagen nach Eingang; diese Frist kann um höchstens weitere 60 Tage verlängert werden, worüber wir Sie innerhalb der ersten 30 Tage informieren (Art. 21).',
      <>Sie können sich bei der Aufsichtsbehörde beschweren: {authority}</>,
      <span id="brisanje-podataka">Löschung: Um Ihr Konto und Ihre Daten zu löschen, auch Daten aus der Anmeldung mit Google oder Facebook, senden Sie eine Anfrage an <Fill value={o.email} label="E-Mail"/> mit der E-Mail-Adresse, mit der Sie sich anmelden. Wir bestätigen die Löschung innerhalb von 30 Tagen. Die Verbindung zur App können Sie auch selbst in den Einstellungen Ihres Google- oder Facebook-Kontos entfernen.</span>,
      'Eine automatisierte Entscheidungsfindung einschließlich Profiling findet nicht statt.',
    ]},
    {h: '9. Stand', p: ['November 2026. Wir passen diese Erklärung an, wenn sich MajstorMile oder die Rechtslage ändert. Maßgeblich ist die serbische Fassung.']},
  ] : [
    {h: '1. Who is the controller?', p: [
      <>Responsible for this website, our customers’ accounts and enquiries to us: {who}</>,
      o.serbianRepresentative ? <>Representative in the Republic of Serbia (Art. 44 ZZPL): {o.serbianRepresentative}</> : null,
      o.dpo ? <>Data protection officer: {o.dpo}</> : 'No data protection officer is appointed yet; the duty is reviewed before commercial operation starts, and contact details will then be published here.',
      'MajstorMile is software for property managers. Each property manager is the controller for the jobs, tenant reports and photos in its workspace. We process this data only on its behalf and instructions under a data processing agreement. Please send requests about this data to your property manager; we forward requests sent to us.',
    ]},
    {h: '2. Tenant reports', p: [
      'When you report a defect on the reporting page we process: address, apartment or floor, access notes, trade, description, optionally a photo, your name, your phone number and optionally your email.',
      'The purpose is to organise the repair by your property manager. Legal bases: performance of the contract or the duty to maintain the building, and the legitimate interest in fixing defects quickly.',
      'Only the contractor who takes the job receives your name, phone number and access notes, to agree an appointment. Other firms do not see them.',
      'Photos: GPS position, device details and capture time that phones store in photos are removed automatically on upload. Please do not photograph people or personal documents.',
      'You can check progress with your tracking code. The status page shows no names, notes or photos.',
      'A report without an account should be made by someone aged 15 or over; younger people report through a parent or guardian.',
    ]},
    {h: '3. How long data is kept', p: [
      `Name, phone, email and access notes are deleted automatically ${DEFAULT_CONTACT_DAYS} days after the job is closed (the property manager can set 14 to 730 days), and earlier on request.`,
      'The job itself (address, description, photos, history) is kept as a record of the work for as long as warranty claims may arise (the period depends on the contract and the law) and is then deleted by the property manager.',
      'Workspace backups are kept for 30 days.',
    ]},
    {h: '4. Accounts of property managers and contractors', p: [
      'For a user account we process name, email, role, team or firm and a log of actions in the workspace (performance of the contract; for the log, legitimate interest: traceability and security). Only people approved by an administrator get access.',
      'With Sign in with Google or Facebook, that service sends us your name and email and learns that you sign in to MajstorMile. With an email code we send a one-time code to your address. With a passkey we store only a public key; your fingerprint or face never leaves your device.',
    ]},
    {h: '5. Hosting, server logs and web analytics', p: [
      'When you open the website our host processes technically necessary data (IP address, time, page, browser) to deliver and secure it (legitimate interest). To prevent abuse of the reporting form we briefly keep a shortened, irreversible hash of the IP address.',
      'We use Vercel Web Analytics to count page views. It sets no cookies and builds no cross-site profiles; visitors are only told apart by a hash that changes daily.',
    ]},
    {h: '6. Storage on your device', p: [
      'We use no tracking or advertising cookies. Your browser only stores what the service you asked for needs: sign-in session, language, light or dark mode, changes made offline and a copy of the app for offline use. Signing out deletes the stored workspace data.',
    ]},
    {h: '7. Recipients and service providers', p: [
      'We use the following processors, each under a data processing agreement. Where data may reach the USA or another country, the transfer out of the Republic of Serbia follows the ZZPL provisions on transfers abroad (for example with standard contractual clauses).',
      <ul key="sp">{SUBPROCESSORS.map(s => <li key={s.name}><b>{s.name}</b>: {s.role.en}. {s.where.en}.</li>)}</ul>,
    ]},
    {h: '8. Your rights', p: [
      'You have the right of access and a copy (Art. 26 ZZPL), rectification and completion (Art. 29), erasure (Art. 30), restriction (Art. 31), data portability (Art. 36) and to object to processing based on legitimate interests (Art. 37). Contact your property manager or us. We answer without delay and within 30 days of receiving the request at the latest; the period can be extended by up to 60 more days, and we tell you within the first 30 days (Art. 21).',
      <>You may complain to the supervisory authority: {authority}</>,
      <span id="brisanje-podataka">Data deletion: to delete your account and data, including data received through Sign in with Google or Facebook, send a request to <Fill value={o.email} label="email"/> from the email you sign in with. We confirm the deletion within 30 days. You can also remove the app's access yourself in your Google or Facebook account settings.</span>,
      'There is no automated decision-making or profiling.',
    ]},
    {h: '9. Version', p: ['November 2026. We update this policy when MajstorMile or the law changes. The Serbian version is binding.']},
  ];
  return <LegalPage>
    <h1>{t('Politika privatnosti', 'Privacy policy', 'Datenschutzerklärung')}</h1>
    <p className="muted">{t('Prema Zakonu o zaštiti podataka o ličnosti Republike Srbije (ZZPL)', 'Under the Serbian Law on Personal Data Protection (ZZPL)', 'Nach dem serbischen Gesetz über den Schutz personenbezogener Daten (ZZPL)')}</p>
    {sections.map(s => <section key={s.h}><h2>{s.h}</h2>{s.p.filter(Boolean).map((x, i) => typeof x === 'string' ? <p key={i}>{x}</p> : <div key={i}>{x}</div>)}</section>)}
  </LegalPage>;
}
