# Market profiles

Everything that differs between markets lives in `lib/instance.ts`. MajstorMile ships one profile:

| Setting | Serbia (`rs`) |
|---|---|
| Brand and logo | MajstorMile, `/logo.svg` |
| Languages (default first) | Serbian (Latin), English, German |
| Dates, currency | sr-Latn-RS, RSD |
| Address search | Serbia only (Photon/OpenStreetMap) |
| Map start | Užice |
| Demo pack | `demo/uzice.json` |
| Emergency number on the tenant form | 112 |

## Adding another country

1. Add its id to `InstanceId` and an entry to `INSTANCES` with bounding box, map centre, examples and currency.
2. Select it at the bottom of `lib/instance.ts`.
3. Optionally add a demo pack in `demo/` and register it in `lib/demo.ts`, `lib/actions.ts` (`loadDemo`) and `components/demo-data.tsx`.
4. Add a dictionary in `lib/i18n-<code>.ts` and register it in `lib/i18n.tsx` and `lib/server-i18n.ts`.

## Demo data

- Admins reload a pack from User Profile → Platform settings → Demo data. It replaces jobs, contracts, teams and demo people; real sign-in accounts are kept.
- Dates are stored as `daysAgo`, so a freshly loaded demo always looks current. `path` lists the stages a job has gone through after "Detected"; the loader rejects paths the workflow does not allow (`npm test` checks this).
