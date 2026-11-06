// Jobs are located by their postal address, not by GPS: street and house number, then apartment or floor.
// These helpers compare addresses the way people write them ("Mühlenstr. 10" = "Mühlenstraße 10, 37154 Northeim").

/** Street spelling that ignores case, ß/ss, "Str."/"Straße"/"Strasse", hyphens and spaces. */
export function normStreet(s: string): string {
  return (s || '').toLowerCase()
    .replace(/ß/g, 'ss').replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue')
    .replace(/str(asse|\.|\b)/g, 'str')
    .replace(/[^a-z0-9]/g, '');
}

/** The street line of an address: everything before the first comma ("Mühlenstraße 10"). */
export const streetLine = (address: string) => (address || '').split(',')[0].trim();

/** The street name without the house number ("Mühlenstraße 10a" -> "Mühlenstraße"). */
export function streetOf(address: string): string {
  return streetLine(address).replace(/\s+\d+\s*[a-zA-Z]?(\s*[-–/]\s*\d+\s*[a-zA-Z]?)?$/, '').trim();
}

/** Key for "the same building": street and house number, spelling-insensitive. */
export const buildingKey = (address: string) => normStreet(streetLine(address));

/** Same apartment or floor, when both are known. An unknown unit matches any unit. */
export function sameUnit(a?: string, b?: string): boolean {
  const x = normStreet(a || ''), y = normStreet(b || '');
  return !x || !y || x === y;
}
