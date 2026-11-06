// Who operates MajstorMile. Shown on the provider notice (Impressum page, Law on Electronic Commerce Art. 6)
// and in the privacy policy (Law on Personal Data Protection, ZZPL, Art. 23 and 24).
// Fill these in with the real operator's details; empty fields are shown as highlighted placeholders.
// A Serbian lawyer should review both pages before MajstorMile is offered to paying customers.
export type Operator = {
  /** Business name with legal form, e.g. "Primer d.o.o." or the entrepreneur's registered name. */
  name: string;
  street: string;
  postcodeCity: string;
  country: string;
  /** Director or owner who represents the business. */
  representedBy: string;
  /** Contact email for quick, direct communication (required by Art. 6 of the Law on Electronic Commerce). */
  email: string;
  phone: string;
  /** Registry entry, e.g. "APR (Serbian Business Registers Agency), registration number 12345678". */
  register: string;
  /** Tax identification number (PIB). */
  pib: string;
  /** VAT number (PDV), only if the operator is VAT-registered. */
  vatId: string;
  /** Representative in Serbia (ZZPL Art. 44): needed when the operator has no seat or residence in Serbia. */
  serbianRepresentative: string;
  /** Data protection officer (lice za zaštitu podataka o ličnosti), if one is appointed. */
  dpo: string;
};

export const operator: Operator = {
  name: '',
  street: '',
  postcodeCity: '',
  country: 'Srbija',
  representedBy: '',
  email: '',
  phone: '',
  register: '',
  pib: '',
  vatId: '',
  serbianRepresentative: '',
  dpo: '',
};

/** The supervisory authority for personal data in Serbia. */
export const AUTHORITY = {
  name: 'Poverenik za informacije od javnog značaja i zaštitu podataka o ličnosti',
  nameEn: 'Commissioner for Information of Public Importance and Personal Data Protection',
  address: 'Bulevar kralja Aleksandra 15, 11120 Beograd',
  email: 'office@poverenik.rs',
  phone: '+381 11 3408 900',
  web: 'https://www.poverenik.rs',
} as const;

type L3 = {sr: string; en: string; de: string};
/** Processors and other recipients, listed in the privacy policy. */
export const SUBPROCESSORS: readonly {name: string; role: L3; where: L3}[] = [
  {name: 'Supabase Inc.', role: {sr: 'baza podataka, skladište fajlova i prijava', en: 'Database, file storage and sign-in', de: 'Datenbank, Dateispeicher und Anmeldung'}, where: {sr: 'Data centar u Frankfurtu na Majni (AWS eu-central-1); kompanija iz SAD', en: 'Data centre in Frankfurt am Main (AWS eu-central-1); company in the USA', de: 'Rechenzentrum Frankfurt am Main (AWS eu-central-1); Unternehmen in den USA'}},
  {name: 'Vercel Inc.', role: {sr: 'hosting sajta i serverskih funkcija, veb analitika bez kolačića', en: 'Website and server function hosting, cookie-free web analytics', de: 'Hosting der Website und Serverfunktionen, Webanalyse ohne Cookies'}, where: {sr: 'Serverske funkcije u Frankfurtu na Majni (fra1), isporuka preko svetske mreže; kompanija iz SAD', en: 'Server functions in Frankfurt am Main (fra1), delivery through a global network; company in the USA', de: 'Serverfunktionen in Frankfurt am Main (fra1), Auslieferung über ein weltweites Netz; Unternehmen in den USA'}},
  {name: 'Google Ireland Ltd. / Google LLC', role: {sr: 'prijava preko Google naloga (samo ako se koristi)', en: 'Sign in with Google (only if used)', de: 'Anmeldung mit Google (nur wenn genutzt)'}, where: {sr: 'EU i SAD', en: 'EU and USA', de: 'EU und USA'}},
  {name: 'komoot GmbH (Photon)', role: {sr: 'predlozi adresa dok kucate', en: 'Address suggestions while typing', de: 'Adressvorschläge beim Tippen'}, where: {sr: 'Nemačka', en: 'Germany', de: 'Deutschland'}},
  {name: 'Resend Inc.', role: {sr: 'slanje obaveštenja e-poštom (samo ako je podešeno)', en: 'Sending notification emails (only if set up)', de: 'Versand von Benachrichtigungs-E-Mails (nur wenn eingerichtet)'}, where: {sr: 'SAD ili EU region', en: 'USA or EU region', de: 'USA bzw. EU-Region'}},
];
