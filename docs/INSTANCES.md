# Market profiles

Everything that differs between markets lives in `lib/instance.ts`. Baunavi ships one profile:

| Setting | Germany (`de`) |
|---|---|
| Brand and logo | Baunavi, `/logo.svg` |
| Languages (default first) | German, English |
| Dates, currency | de-DE, EUR |
| Address search | Germany only (Photon/OpenStreetMap) |
| Map start | Northeim, zoom 13 |
| Demo pack | `demo/northeim.json` (Northeim, Lower Saxony) |
| Emergency number on the tenant form | 112 |

## Adding Austria or Switzerland

1. Add `'at'` or `'ch'` to `InstanceId` and a new entry to `INSTANCES` with its bounding box, map centre, examples and (for Switzerland) `currency: 'CHF'`.
2. Pick the profile from `NEXT_PUBLIC_INSTANCE` at the bottom of the file.
3. Optionally add a demo pack in `demo/` and register it in `lib/demo.ts`, `lib/actions.ts` (`loadDemo`) and `components/demo-data.tsx`.
4. Most German text works unchanged. Put country-specific wording (for example "Hausverwaltung" vs. "Liegenschaftsverwaltung") in a small override dictionary.

## Demo data

- Admins reload a pack from User Profile → Platform settings → Demo data. It replaces jobs, contracts, teams and demo people; real sign-in accounts are kept.
- Dates are stored as `daysAgo`, so a freshly loaded demo always looks current. `path` lists the stages a job has gone through after "Detected"; the loader rejects paths the workflow does not allow, and contracts whose trade does not match the job (`npm test` checks this).
- Demo people cannot sign in. Use Preview role at the top of the workspace to see it as any of them.

## Keeping the database awake

The free Supabase tier pauses a project after about a week without activity. `vercel.json` runs `/api/keepalive` every 5 days and `/api/auto-close` daily. Both need `CRON_SECRET` set in the project.
