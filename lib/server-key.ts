// Checks the Supabase server key for the usual copy mistakes, so a bad deployment setting gets a clear message.
/** Why a server key cannot work, or '' when it looks usable. Catches the usual copy mistakes. */
export function serverKeyProblem(key: string): string {
  if (/PASTE_|YOUR_/i.test(key)) return 'it is still the placeholder text';
  if (/[•*…]/.test(key)) return 'it was copied while hidden (it contains • or …); reveal the key in Supabase first';
  if (/\s/.test(key)) return 'it contains spaces or line breaks';
  if (/^[A-Z_]+=/.test(key)) return 'it starts with the variable name; paste only the key';
  if (/[^\x21-\x7e]/.test(key)) return 'it contains characters that are not allowed';
  if (key.startsWith('sb_publishable_')) return 'this is the publishable key; use the secret key';
  return '';
}

/** Not an error, but worth a log line: Supabase secret keys normally start with sb_secret_ (or eyJ for legacy keys). */
export const unusualServerKey = (key: string) => !key.startsWith('sb_secret_') && !key.startsWith('eyJ');
