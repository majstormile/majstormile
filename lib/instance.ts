// One codebase, one profile per market. The deployment chooses it with NEXT_PUBLIC_INSTANCE.
// Today there is a single profile (Germany). Austria and Switzerland can be added as further entries
// with their own currency, address search area, demo pack and wording.
export type Lang = 'de' | 'en';
export type InstanceId = 'de';

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
  country: 'DEU';
  /** ISO code used to limit address search to this country. */
  geocodeCountry: 'de';
  /** Bounding box for address search: west, south, east, north. */
  bbox: [number, number, number, number];
  /** Where address suggestions are biased to (the demo town). Jobs themselves carry no coordinates. */
  mapCenter: {lat: number; lng: number};
  /** Zoom of the map before a location is chosen. */
  /** Examples shown in address and coordinate fields. */
  examples: {address: string; street: string};
  /** Demo pack loaded by default. */
  demoPack: 'northeim';
  /** Pricing wording on the concept page. */
  market: {name: string; pricing: 'eur'};
  /** Emergency number shown on the public report form. */
  emergency: string;
  /** Title and description for search engines and the browser tab, per language. */
  meta: Partial<Record<Lang, {title: string; description: string}>>;
};

export const INSTANCES: Record<InstanceId, Instance> = {
  de: {
    id: 'de', brand: 'Baunavi', logo: '/logo.svg', slogan: 'Property operations workspace',
    languages: ['de', 'en'], defaultLang: 'de', locales: {de: 'de-DE', en: 'en-GB'},
    currency: 'EUR', country: 'DEU', geocodeCountry: 'de', bbox: [5.87, 47.27, 15.04, 55.06], mapCenter: {lat: 51.7062, lng: 10.0010},
    examples: {address: 'Breite Straße 30, 37154 Northeim', street: 'Breite Straße'},
    demoPack: 'northeim', emergency: '112', market: {name: 'German', pricing: 'eur'},
    meta: {
      de: {title: 'Baunavi | Aufträge für Maler, Sanitär, Elektro und Schlüsseldienst', description: 'Schadensmeldungen, Handwerkeraufträge und Abnahmen für Hausverwaltungen und Vermieter. Private Demonstration.'},
      en: {title: 'Baunavi | Jobs for painters, plumbers, electricians and locksmiths', description: 'Defect reports, trade jobs and sign-off for property managers and landlords. Private demonstration.'},
    },
  },
};

/** The profile for this deployment. */
export const instance: Instance = INSTANCES.de;
