// Who operates Baunavi. Shown on the Impressum (§ 5 DDG) and in the privacy policy (Art. 13 GDPR).
// Fill these in once the operating company exists; empty fields are shown as highlighted placeholders.
// A lawyer should review both pages before Baunavi is offered to paying customers.
export type Operator = {
  /** Company name with legal form, e.g. "Baunavi GmbH". */
  name: string;
  street: string;
  postcodeCity: string;
  country: string;
  /** Managing directors (Geschäftsführer) or owner. */
  representedBy: string;
  email: string;
  phone: string;
  /** e.g. "Amtsgericht Göttingen, HRB 12345". Empty for sole traders without a register entry. */
  register: string;
  /** VAT ID under § 27a UStG, e.g. "DE123456789". */
  vatId: string;
  /** Data protection officer, if one is appointed (Art. 37 GDPR, § 38 BDSG). */
  dpo: string;
  /** EU representative under Art. 27 GDPR, only if the operator is based outside the EU. */
  euRepresentative: string;
  /** Data protection authority for the operator's seat, with its web address. */
  authority: string;
};

export const operator: Operator = {
  name: '',
  street: '',
  postcodeCity: '',
  country: 'Deutschland',
  representedBy: '',
  email: 'baunavi.info@gmail.com',
  phone: '',
  register: '',
  vatId: '',
  dpo: '',
  euRepresentative: '',
  authority: '',
};

/** Processors and other recipients, listed in the privacy policy and the data processing agreement. */
export const SUBPROCESSORS = [
  {name: 'Supabase Inc.', role: {de: 'Datenbank, Dateispeicher und Anmeldung', en: 'Database, file storage and sign-in'}, where: {de: 'Rechenzentrum Frankfurt am Main (AWS eu-central-1); Unternehmen in den USA', en: 'Data centre in Frankfurt am Main (AWS eu-central-1); company in the USA'}, transfer: 'DPA + SCC'},
  {name: 'Vercel Inc.', role: {de: 'Hosting der Website und Serverfunktionen, Webanalyse ohne Cookies', en: 'Website and server function hosting, cookie-free web analytics'}, where: {de: 'Serverfunktionen in Frankfurt am Main (fra1), Auslieferung über ein weltweites Netz; Unternehmen in den USA', en: 'Server functions in Frankfurt am Main (fra1), delivery through a global network; company in the USA'}, transfer: 'DPA + EU-US DPF + SCC'},
  {name: 'Google Ireland Ltd. / Google LLC', role: {de: 'Anmeldung mit Google (nur wenn genutzt)', en: 'Sign in with Google (only if used)'}, where: {de: 'EU und USA', en: 'EU and USA'}, transfer: 'EU-US DPF + SCC'},
  {name: 'komoot GmbH (Photon)', role: {de: 'Adressvorschläge beim Tippen', en: 'Address suggestions while typing'}, where: {de: 'Deutschland', en: 'Germany'}, transfer: '—'},
  {name: 'Resend Inc.', role: {de: 'Versand von Benachrichtigungs-E-Mails (nur wenn eingerichtet)', en: 'Sending notification emails (only if set up)'}, where: {de: 'USA bzw. EU-Region', en: 'USA or EU region'}, transfer: 'DPA + EU-US DPF + SCC'},
] as const;
