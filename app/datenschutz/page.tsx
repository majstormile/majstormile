'use client';
// Privacy policy (Datenschutzerklärung) under Art. 13 and 14 GDPR. German is the binding version.
// Keep in step with lib/legal.ts (operator, sub-processors) and lib/privacy.ts (retention).
import {useLang, getLang} from '@/lib/i18n';
import {operator as o, SUBPROCESSORS} from '@/lib/legal';
import {DEFAULT_CONTACT_DAYS} from '@/lib/privacy';
import LegalPage, {Fill} from '@/components/legal-page';

type Section = {h: string; p: (string | React.ReactNode)[]};

export default function Datenschutz() {
  useLang();
  const de = getLang() === 'de';
  const who = <>
    <Fill value={o.name} label={de ? 'Firma' : 'Company'}/>, <Fill value={o.street} label={de ? 'Straße' : 'Street'}/>, <Fill value={o.postcodeCity} label={de ? 'PLZ Ort' : 'Postcode town'}/>, {o.country}. {de ? 'E-Mail' : 'Email'}: <Fill value={o.email} label="E-Mail"/>
  </>;
  const sections: Section[] = de ? [
    {h: '1. Wer ist verantwortlich?', p: [
      <>Für diese Website, die Konten unserer Kunden und die Anfragen an uns ist verantwortlich: {who}</>,
      o.dpo ? <>Datenschutzbeauftragte/r: {o.dpo}</> : 'Ein Datenschutzbeauftragter ist derzeit nicht benannt; die Pflicht dazu wird bei Aufnahme des Geschäftsbetriebs geprüft.',
      'Baunavi ist eine Software für Hausverwaltungen. Für die Aufträge, Mietermeldungen und Fotos in einem Arbeitsbereich ist die jeweilige Hausverwaltung verantwortlich (Art. 4 Nr. 7 DSGVO). Wir verarbeiten diese Daten nur in ihrem Auftrag und nach ihren Weisungen auf Grundlage eines Vertrags zur Auftragsverarbeitung (Art. 28 DSGVO). Anfragen zu diesen Daten richten Sie bitte an Ihre Hausverwaltung; wir leiten an uns gerichtete Anfragen weiter.',
    ]},
    {h: '2. Schadensmeldung durch Mieter', p: [
      'Wenn Sie über die Meldeseite einen Schaden melden, verarbeiten wir: Adresse, Wohnung bzw. Etage, Zugangshinweise, Gewerk, Beschreibung, optional ein Foto, Ihren Namen, Ihre Telefonnummer und optional Ihre E-Mail-Adresse.',
      'Zweck ist die Organisation der Reparatur durch Ihre Hausverwaltung. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Mietvertrag, Instandhaltungspflicht des Vermieters nach § 535 BGB) sowie Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einer schnellen Schadensbehebung).',
      'Name, Telefonnummer und Zugangshinweise erhält nur der Handwerksbetrieb, der den Auftrag übernimmt, damit er einen Termin vereinbaren kann. Andere Betriebe sehen sie nicht.',
      'Fotos: Standortdaten (GPS), Gerätedaten und Aufnahmezeit, die Smartphones in Fotos speichern, werden beim Hochladen automatisch entfernt. Bitte fotografieren Sie keine Personen und keine persönlichen Unterlagen.',
      'Den Bearbeitungsstand können Sie mit Ihrem Verfolgungscode abrufen. Die Statusseite zeigt keine Namen, Notizen oder Fotos.',
    ]},
    {h: '3. Speicherdauer', p: [
      `Name, Telefonnummer, E-Mail-Adresse und Zugangshinweise werden automatisch ${DEFAULT_CONTACT_DAYS} Tage nach Abschluss des Auftrags gelöscht (die Hausverwaltung kann eine Frist zwischen 14 und 730 Tagen festlegen) und auf Anfrage auch früher.`,
      'Der Auftrag selbst (Adresse, Beschreibung, Fotos, Verlauf) bleibt als Nachweis der ausgeführten Arbeit erhalten, solange Gewährleistungsansprüche bestehen können (in der Regel bis zu 5 Jahre, § 634a BGB), und wird danach von der Hausverwaltung gelöscht.',
      'Sicherungskopien des Arbeitsbereichs werden 30 Tage aufbewahrt.',
    ]},
    {h: '4. Konten von Hausverwaltungen und Handwerksbetrieben', p: [
      'Für ein Benutzerkonto verarbeiten wir Name, E-Mail-Adresse, Rolle, Team- bzw. Betriebszugehörigkeit sowie ein Protokoll der Aktionen im Arbeitsbereich (Art. 6 Abs. 1 lit. b DSGVO; für das Protokoll Art. 6 Abs. 1 lit. f DSGVO: Nachvollziehbarkeit und Sicherheit). Zugang erhält nur, wer von einem Administrator freigeschaltet wurde.',
      'Bei der Anmeldung mit Google erhalten wir von Google Ihren Namen und Ihre E-Mail-Adresse. Google erfährt dabei, dass Sie sich bei Baunavi anmelden.',
    ]},
    {h: '5. Hosting, Server-Protokolle und Webanalyse', p: [
      'Beim Aufruf der Website verarbeitet unser Hoster technisch notwendige Daten (IP-Adresse, Zeitpunkt, aufgerufene Seite, Browser) zur Auslieferung und Absicherung (Art. 6 Abs. 1 lit. f DSGVO). Um Missbrauch des Meldeformulars zu verhindern, speichern wir kurzzeitig einen gekürzten, nicht umkehrbaren Hashwert der IP-Adresse.',
      'Wir nutzen Vercel Web Analytics zur Zählung von Seitenaufrufen. Dabei werden keine Cookies gesetzt und keine seitenübergreifenden Profile gebildet; Besucher werden nur über einen täglich wechselnden Hash unterschieden (Art. 6 Abs. 1 lit. f DSGVO).',
    ]},
    {h: '6. Speicherung auf Ihrem Gerät', p: [
      'Wir verwenden keine Tracking- oder Werbe-Cookies. Im Speicher Ihres Browsers legen wir nur ab, was für die von Ihnen gewünschte Nutzung nötig ist: Anmeldesitzung, Sprache, Darstellung (hell/dunkel), offline erfasste Änderungen und eine Kopie der App für die Nutzung ohne Verbindung. Das ist nach § 25 Abs. 2 Nr. 2 TDDDG ohne Einwilligung zulässig. Beim Abmelden werden die gespeicherten Arbeitsdaten gelöscht.',
    ]},
    {h: '7. Empfänger und Dienstleister', p: [
      'Wir setzen folgende Dienstleister als Auftragsverarbeiter ein. Mit allen bestehen Verträge nach Art. 28 DSGVO. Wo Daten in die USA gelangen können, stützen wir die Übermittlung auf das EU-US Data Privacy Framework (Art. 45 DSGVO) bzw. EU-Standardvertragsklauseln (Art. 46 DSGVO).',
      <ul key="sp">{SUBPROCESSORS.map(s => <li key={s.name}><b>{s.name}</b>: {s.role.de}. {s.where.de}.</li>)}</ul>,
    ]},
    {h: '8. Ihre Rechte', p: [
      'Sie haben das Recht auf Auskunft (Art. 15), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) und Widerspruch gegen Verarbeitungen auf Grundlage berechtigter Interessen (Art. 21 DSGVO). Wenden Sie sich dazu an Ihre Hausverwaltung oder an uns.',
      <>Sie können sich bei einer Datenschutz-Aufsichtsbehörde beschweren (Art. 77 DSGVO), zum Beispiel bei der für uns zuständigen: <Fill value={o.authority} label="Aufsichtsbehörde am Sitz des Betreibers"/></>,
      'Eine automatisierte Entscheidungsfindung einschließlich Profiling findet nicht statt.',
    ]},
    {h: '9. Stand', p: ['November 2026. Wir passen diese Erklärung an, wenn sich Baunavi oder die Rechtslage ändert.']},
  ] : [
    {h: '1. Who is responsible?', p: [
      <>Responsible for this website, our customers’ accounts and enquiries to us: {who}</>,
      o.dpo ? <>Data protection officer: {o.dpo}</> : 'No data protection officer is appointed yet; this is reviewed when commercial operation starts.',
      'Baunavi is software for property managers. Each property management is the controller for the jobs, tenant reports and photos in its workspace (Art. 4(7) GDPR). We process this data only on its behalf and instructions under a data processing agreement (Art. 28 GDPR). Please send requests about this data to your property management; we forward requests sent to us.',
    ]},
    {h: '2. Tenant reports', p: [
      'When you report a defect on the reporting page we process: address, apartment or floor, access notes, trade, description, optionally a photo, your name, your phone number and optionally your email.',
      'The purpose is to organise the repair by your property management. Legal bases: Art. 6(1)(b) GDPR (tenancy, the landlord’s maintenance duty under § 535 BGB) and Art. 6(1)(f) GDPR (legitimate interest in fixing defects quickly).',
      'Only the contractor who takes the job receives your name, phone number and access notes, to agree an appointment. Other firms do not see them.',
      'Photos: GPS position, device details and capture time that phones store in photos are removed automatically on upload. Please do not photograph people or personal documents.',
      'You can check progress with your tracking code. The status page shows no names, notes or photos.',
    ]},
    {h: '3. How long data is kept', p: [
      `Name, phone, email and access notes are deleted automatically ${DEFAULT_CONTACT_DAYS} days after the job is closed (the property management can set 14 to 730 days), and earlier on request.`,
      'The job itself (address, description, photos, history) is kept as a record of the work for as long as warranty claims may arise (usually up to 5 years, § 634a BGB) and is then deleted by the property management.',
      'Workspace backups are kept for 30 days.',
    ]},
    {h: '4. Accounts of property managers and contractors', p: [
      'For a user account we process name, email, role, team or firm and a log of actions in the workspace (Art. 6(1)(b) GDPR; for the log Art. 6(1)(f): traceability and security). Only people approved by an administrator get access.',
      'With Sign in with Google, Google sends us your name and email, and Google learns that you sign in to Baunavi.',
    ]},
    {h: '5. Hosting, server logs and web analytics', p: [
      'When you open the website our host processes technically necessary data (IP address, time, page, browser) to deliver and secure it (Art. 6(1)(f) GDPR). To prevent abuse of the reporting form we briefly keep a shortened, irreversible hash of the IP address.',
      'We use Vercel Web Analytics to count page views. It sets no cookies and builds no cross-site profiles; visitors are only told apart by a hash that changes daily (Art. 6(1)(f) GDPR).',
    ]},
    {h: '6. Storage on your device', p: [
      'We use no tracking or advertising cookies. Your browser only stores what the service you asked for needs: sign-in session, language, light or dark mode, changes made offline and a copy of the app for offline use. This is allowed without consent under § 25(2) no. 2 TDDDG. Signing out deletes the stored workspace data.',
    ]},
    {h: '7. Recipients and service providers', p: [
      'We use the following processors, each under an Art. 28 GDPR agreement. Where data may reach the USA, transfers rely on the EU-US Data Privacy Framework (Art. 45 GDPR) or EU Standard Contractual Clauses (Art. 46 GDPR).',
      <ul key="sp">{SUBPROCESSORS.map(s => <li key={s.name}><b>{s.name}</b>: {s.role.en}. {s.where.en}.</li>)}</ul>,
    ]},
    {h: '8. Your rights', p: [
      'You have the right of access (Art. 15), rectification (Art. 16), erasure (Art. 17), restriction (Art. 18), data portability (Art. 20) and to object to processing based on legitimate interests (Art. 21 GDPR). Contact your property management or us.',
      <>You may complain to a data protection authority (Art. 77 GDPR), for example the one responsible for us: <Fill value={o.authority} label="authority at the operator's seat"/></>,
      'There is no automated decision-making or profiling.',
    ]},
    {h: '9. Version', p: ['November 2026. We update this policy when Baunavi or the law changes. The German version is binding.']},
  ];
  return <LegalPage>
    <h1>{de ? 'Datenschutzerklärung' : 'Privacy policy'}</h1>
    {sections.map(s => <section key={s.h}><h2>{s.h}</h2>{s.p.map((x, i) => typeof x === 'string' ? <p key={i}>{x}</p> : <div key={i}>{x}</div>)}</section>)}
  </LegalPage>;
}
