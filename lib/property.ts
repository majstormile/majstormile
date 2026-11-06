// Jobs are located by their postal address, not by GPS: street and house number, then apartment or floor.
// These helpers compare addresses the way people write them ("Petra Ćelovića 10" = "Petra Ćelovića 10, 31000 Užice").

// Serbian Cyrillic to Latin, so "Петра Ћеловића 10" and "Petra Ćelovića 10" are the same building.
const CYRILLIC: Record<string, string> = {а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', ђ: 'dj', е: 'e', ж: 'z', з: 'z', и: 'i', ј: 'j', к: 'k', л: 'l', љ: 'lj', м: 'm', н: 'n', њ: 'nj', о: 'o', п: 'p', р: 'r', с: 's', т: 't', ћ: 'c', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'c', џ: 'dz', ш: 's'};

/** Street spelling that ignores case, diacritics (č, ć, š, ž, đ), Cyrillic vs. Latin, ß/ss, "Str."/"Straße"/"Strasse", hyphens and spaces. */
export function normStreet(s: string): string {
  return (s || '').toLowerCase()
    .replace(/[а-яђјљњћџ]/g, c => CYRILLIC[c] ?? c)
    .replace(/ß/g, 'ss').replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/đ/g, 'dj')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
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
