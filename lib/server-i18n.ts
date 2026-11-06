// Server-side wording for emails, in the deployment's default language. Keys are the English text.
import {sr} from './i18n-sr.ts';
import {de} from './i18n-de.ts';
import {en} from './i18n-en.ts';
import {instance} from './instance.ts';

const DICT: Record<string, Record<string, string>> = {sr, de, en};
export function serverTx(key: string, args: string[] = []): string {
  const text = DICT[instance.defaultLang]?.[key] ?? key;
  return text.replace(/\{(\d+)\}/g, (_, i) => args[Number(i)] ?? '');
}
