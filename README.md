# MajstorMile

A Serbian-first job platform for property managers (upravnici objekata) and landlords. A tenant, caretaker or staff member reports a defect. The job goes to the right trade firm under a framework contract, and it is closed only after an independent handover with before and after photos.

It is a separate codebase with its own GitHub repository, Vercel project and Supabase project.

## Languages and market

- Interface: **Serbian (Latin script) by default**, with English and German in the language switcher. The choice is remembered on the device.
- Market profile `rs` in `lib/instance.ts`: Serbia, RSD, address search limited to Serbia, emergency number 112, map centred on Užice.
- Stored values stay in English and are translated only when shown. Cyrillic and Latin spellings of a street are treated as the same address.
- Role names (Serbian): Administrator, Rukovodilac tima (Head Analyst), Referent (Analyst), Kontrolor (Auditor), Direktor (Director) and Izvođač (Contractor).
- Ticket IDs look like `MM-2026-…`.

## Demo data

One demo pack, **Užice** (`demo/uzice.json`): two teams (Centar, Turica i Krčagovo), fictional people and firms, 7 contracts and 18 jobs covering every stage. Streets are real Užice street names with invented house numbers; people, firms and phone numbers are fictional.

- First start: set `SEED_DEMO_DATA=true` before the first sign-in.
- Reload at any time: User Profile → Platform settings → Demo data → "Serbia: Užice" → Load demo data. This replaces jobs, contracts, teams and demo people; real sign-in accounts are kept.

## Set it up (step by step)

1. **GitHub:** the code lives in `majstormile/majstormile` (branch `main`).
2. **Supabase:** create a project in your own Supabase account (Frankfurt, eu-central-1). In the SQL editor run the files in `supabase/migrations/` in order (a combined script is in the setup notes). This creates the `workspaces` table and the private `majstormile-evidence` storage bucket (the bucket keeps its original name; only the name inside Supabase). Turn off public sign-up and create and confirm your owner account under Authentication → Users.
3. **Local check:** copy `.env.example` to `.env.local` and fill in the values, then:
   ```sh
   npm ci
   node --env-file=.env.local scripts/check-env.mjs
   npm run dev
   ```
4. **Vercel:** Add New → Project → import `majstormile/majstormile`. Use the Next.js preset and Node.js 22.x. Add the variables from `.env.example` and deploy. The Frankfurt region (`fra1`) is set in `vercel.json`.
5. **SSO (optional):** follow [docs/SSO.md](docs/SSO.md).

## Where things live

- `lib/instance.ts`: the market profile (brand, languages, currency, map, address area).
- `lib/i18n-sr.ts`, `lib/i18n-de.ts`, `lib/i18n-en.ts`: interface text keyed by the English source. A missing key falls back to English.
- `lib/domain.ts`: `TRADES` and the trade-aware matching.
- `demo/uzice.json`: the demo pack.
- `app/report/page.tsx`: the public tenant report form (no account needed).

## Known gaps

- The Impressum and Datenschutz pages still contain German-law text and the original operator details; replace them before real use.
- The logo and icons are still the original ones.
- The concept page lists prices in EUR.

## Checks

```sh
npm run typecheck
npm test
npm run build
```
