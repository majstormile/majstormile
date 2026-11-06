// Who operates MajstorMile, and the shared data for the legal documents (all in Serbian, the binding language).
// Laws referred to: Zakon o elektronskoj trgovini (provider notice, čl. 6; terms, čl. 12–13),
// Zakon o zaštiti podataka o ličnosti – ZZPL (privacy policy, čl. 23–24; processor agreement, čl. 45),
// Zakon o obligacionim odnosima (liability, čl. 265).
// Fill in the operator once the company exists; empty fields are shown as highlighted placeholders.
// A Serbian lawyer should review every document before MajstorMile is offered to paying customers.
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
  /** Registry entry, e.g. "Agencija za privredne registre, matični broj 12345678". */
  register: string;
  /** Tax identification number (PIB). */
  pib: string;
  /** VAT number (PDV), only if the operator is VAT-registered. */
  vatId: string;
  /** Representative in Serbia (ZZPL Art. 44): needed when the operator has no seat or residence in Serbia. */
  serbianRepresentative: string;
  /** Data protection officer (lice za zaštitu podataka o ličnosti), if one is appointed. */
  dpo: string;
  /** Town whose court has jurisdiction over disputes; normally the town of the registered seat. */
  courtTown: string;
};

export const operator: Operator = {
  name: '',
  street: '',
  postcodeCity: '',
  country: 'Srbija',
  representedBy: '',
  email: 'info@majstormile.com',
  phone: '',
  register: '',
  pib: '',
  vatId: '',
  serbianRepresentative: '',
  dpo: '',
  courtTown: '',
};

/** Version shown on every legal document. Raise it whenever a document changes. */
export const LEGAL_VERSION = {number: '1.0', date: '6. novembra 2026.'} as const;

/** Every legal document, in the order shown in footers. */
export const LEGAL_DOCS = [
  {href: '/uslovi-koriscenja', title: 'Uslovi korišćenja'},
  {href: '/politika-privatnosti', title: 'Politika privatnosti'},
  {href: '/politika-kolacica', title: 'Politika kolačića'},
  {href: '/ugovor-o-obradi-podataka', title: 'Ugovor o obradi podataka'},
  {href: '/podaci-o-pruzaocu-usluge', title: 'Podaci o pružaocu usluge'},
] as const;

/** The supervisory authority for personal data in Serbia. */
export const AUTHORITY = {
  name: 'Poverenik za informacije od javnog značaja i zaštitu podataka o ličnosti',
  address: 'Bulevar kralja Aleksandra 15, 11120 Beograd',
  email: 'office@poverenik.rs',
  phone: '+381 11 3408 900',
  web: 'https://www.poverenik.rs',
} as const;

/** Processors (podobrađivači) that host or transmit data, listed in the privacy policy and the processor agreement. */
export const SUBPROCESSORS: readonly {name: string; role: string; where: string}[] = [
  {name: 'Supabase Inc.', role: 'baza podataka, skladište fajlova i prijava', where: 'data centar u Frankfurtu na Majni (AWS eu-central-1); kompanija iz SAD'},
  {name: 'Vercel Inc.', role: 'hosting sajta i serverskih funkcija, veb analitika bez kolačića', where: 'serverske funkcije u Frankfurtu na Majni (fra1), isporuka preko svetske mreže; kompanija iz SAD'},
  {name: 'Resend Inc.', role: 'slanje e-pošte (kodovi za prijavu, obaveštenja, poruke podršci)', where: 'EU region ili SAD'},
  {name: 'komoot GmbH (Photon)', role: 'predlozi adresa dok kucate', where: 'Nemačka'},
  {name: 'Google Ireland Ltd. / Google LLC', role: 'prijava preko Google naloga (samo ako je korisnik izabere) i vanmrežna kopija dnevne rezervne kopije na Google Disku', where: 'EU i SAD'},
  {name: 'Meta Platforms Ireland Ltd.', role: 'prijava preko Facebook naloga (samo ako je korisnik izabere)', where: 'EU i SAD'},
];
