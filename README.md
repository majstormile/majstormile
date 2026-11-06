# Baunavi

A German-language job platform for property managers (Hausverwaltungen) and landlords. A tenant, caretaker or staff member reports a defect. The job goes to the right trade firm under a framework contract, and it is closed only after an independent sign-off with before and after photos.

It was forked from PaveLedger (municipal road repairs) and keeps PaveLedger's tested workflow, roles, security model and offline support. It is a separate codebase with its own repository, Vercel project and Supabase project. Changes here never affect PaveLedger.

## What is different from PaveLedger

| | PaveLedger | Baunavi |
|---|---|---|
| Language | Serbian / English / French | **German by default**, English switch |
| Market | Serbia, Canada | Germany (EUR, German address search, emergency number 112) |
| What is reported | Road defects (potholes) | Defects in apartments and buildings |
| Trades (Gewerke) | none | Painting, Plumbing, Electrical, Locksmith (key and lock cylinder exchange), Heating, Carpentry, Flooring, Roofing, Cleaning, Other |
| Duplicate merging | Same spot within 20 m | Same spot **and same trade**. A leak and a broken lock at one address stay separate jobs. |
| Contract matching | Street / map radius | Street / map radius **and trade**. A contract with no trade covers every trade. |
| Demo | Užice/Belgrade, Waterloo | Northeim (Lower Saxony): Altstadt, Nord- and Südstadt, real street addresses, 4 trade firms, 16 jobs covering every stage |
| Ticket IDs | `PL-2026-…` | `HW-2026-…` |
| Sign-in | Email and password | Email and password, plus **SSO**: Microsoft (Entra ID), Google and optional SAML ([docs/SSO.md](docs/SSO.md)) |

Role names in German: Administrator, Teamleitung (Head Analyst), Sachbearbeiter (Analyst), Abnahme (Auditor), Geschäftsführung (Director) and Handwerksbetrieb (Contractor). Stored values stay in English, as in PaveLedger, and are translated only when shown.

## Set it up (step by step)

1. **GitHub:** the code lives in [bastahills/baunavi](https://github.com/bastahills/baunavi) (branch `main`).
2. **Supabase:** create a **new** project (or, for a quick demo, reuse the PaveLedger project with its own `WORKSPACE_ID` and `EVIDENCE_BUCKET=paveledger-evidence`) in Frankfurt (eu-central-1) so data stays in the EU (GDPR/DSGVO). In the SQL editor, run the files in `supabase/migrations/` in order. This creates the `workspaces` table and the private `baunavi-evidence` storage bucket. Turn off public sign-up and create and confirm your owner account under Authentication → Users.
3. **Local check:** copy `.env.example` to `.env.local` and fill in the values. Then run:
   ```sh
   npm ci
   node --env-file=.env.local scripts/check-env.mjs
   npm run dev
   ```
   Open http://localhost:3000 and sign in with `OWNER_EMAIL`.
4. **Vercel:** Add New → Project → import the new repository. Use the Next.js preset and Node.js 22.x. Add the variables from `.env.example`; set `SEED_DEMO_DATA=true` for a demo. Deploy. The Frankfurt region (`fra1`) is already set in `vercel.json`.
5. **SSO:** follow [docs/SSO.md](docs/SSO.md) to enable Microsoft and Google sign-in, then add people as "Firmenkonto (SSO)" users.
6. **Demo data:** to reload the demo later, go to User Profile → Platform settings → Demo data → "Deutschland: Northeim".

## Where things live

- `lib/instance.ts`: the market profile (brand, language, currency, map, address area). Austria or Switzerland can be added here later.
- `lib/i18n-de.ts`: all German interface text, keyed by the English source. Edit freely. A missing key falls back to English.
- `lib/domain.ts`: `TRADES` (the list of trades) and the trade-aware matching (`sameTrade`, `contractCovers`).
- `demo/northeim.json`: the demo pack (teams, people, trade firms, contracts, jobs).
- `app/report/page.tsx`: the public tenant report form (no account needed), with the trade selector.

## Checks

```sh
npm run typecheck
npm test            # 252 unit tests, including tests/trades.test.ts and tests/sso.test.ts
npm run build
```

## Known limits (inherited)

One workspace per deployment, up to 500 jobs, and up to 40 photos per job (3 MB each). Email to trade firms needs Resend (`RESEND_API_KEY`, `MAIL_FROM`). Some advanced areas still use the road-inspection vocabulary internally: the camera-vehicle API (`/api/detect`), the concept/pricing page and the long operations guide. They work, but they are the next candidates for rework into property-management features such as quotes, invoices with VAT, and tenant appointment slots.
