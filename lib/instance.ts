// One codebase, one profile per market. The Serbian profile (rs) is the default.
// Today there is a single profile (Serbia). Further markets can be added as more entries
// with their own currency, address search area, demo pack and wording.
export type Lang = 'sr' | 'de' | 'en';
export type InstanceId = 'rs';

export type Instance = {
  id: InstanceId;
  /** Full brand shown in titles and the sign-in screen. */
  brand: string;
  logo: string;
  /** Default sidebar slogan (English source text, translated on display). */
  slogan: string;
  languages: Lang[];
  defaultLang: Lang;
  /** Locale for dates and numbers per language. */
  locales: Record<Lang, string | undefined>;
  currency: string;
  /** Country used as the default in address forms. */
  country: 'SRB';
  /** ISO code used to limit address search to this country. */
  geocodeCountry: 'rs';
  /** Bounding box for address search: west, south, east, north. */
  bbox: [number, number, number, number];
  /** Where address suggestions are biased to (the demo town). Jobs themselves carry no coordinates. */
  mapCenter: {lat: number; lng: number};
  /** Examples shown in address and coordinate fields. */
  examples: {address: string; street: string};
  /** Demo pack loaded by default. */
  demoPack: 'uzice';
  /** Pricing wording on the concept page. */
  market: {name: string; pricing: 'eur'};
  /** Emergency number shown on the public report form. */
  emergency: string;
  /** Title and description for search engines and the browser tab, per language. */
  meta: Partial<Record<Lang, {title: string; description: string}>>;
};

export const INSTANCES: Record<InstanceId, Instance> = {
  rs: {
    id: 'rs', brand: 'MajstorMile', logo: '/logo.png', slogan: 'Property operations workspace',
    languages: ['sr', 'en', 'de'], defaultLang: 'sr', locales: {sr: 'sr-Latn-RS', en: 'en-GB', de: 'de-DE'},
    currency: 'RSD', country: 'SRB', geocodeCountry: 'rs', bbox: [18.81, 42.23, 23.01, 46.19], mapCenter: {lat: 43.8556, lng: 19.8425},
    examples: {address: 'Dimitrija Tucovića 30, 31000 Užice', street: 'Dimitrija Tucovića'},
    demoPack: 'uzice', emergency: '112', market: {name: 'Serbian', pricing: 'eur'},
    meta: {
      sr: {title: 'MajstorMile | Nalozi za majstore: moleri, vodoinstalateri, električari i ključari', description: 'Prijave kvarova, nalozi za izvođače i primopredaja radova za upravnike zgrada i stanodavce. Privatna demonstracija.'},
      en: {title: 'MajstorMile | Jobs for painters, plumbers, electricians and locksmiths', description: 'Defect reports, trade jobs and sign-off for property managers and landlords. Private demonstration.'},
      de: {title: 'MajstorMile | Aufträge für Maler, Sanitär, Elektro und Schlüsseldienst', description: 'Schadensmeldungen, Handwerkeraufträge und Abnahmen für Hausverwaltungen und Vermieter. Private Demonstration.'},
    },
  },
};

/** The profile for this deployment. */
export const instance: Instance = INSTANCES.rs;
