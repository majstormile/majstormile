# Changelog

## 1.3.0 — 2026-11-04

- Phones: the side menu closes after choosing a page (it used to stay open over the content).
- Phones: the top bar wraps into two rows (actions, then search) instead of making the page scroll sideways; the account name is shortened and the DE | EN switch is compact.
- Phones: the job and user tables become labelled cards; the job progress shows dots plus "Schritt 1 von 7: …" instead of squeezed step names.
- Phones: pages other than the overview start with their content; the intro text, pilot notice and role preview stay on the overview.
- Phones: concept page pricing cards and the sign-in language switch fit small screens.
- Checked on iPhone SE, iPhone 13 and Pixel 5: no page scrolls sideways.

## 1.2.0 — 2026-11-04

- English reworded for property management and trades (`lib/i18n-en.ts`): jobs, properties, tenants, case managers, inspectors, instead of the road-repair wording inherited from PaveLedger.
- Language switch shown as a DE | EN toggle on every page.
- Fixed German texts that fell back to English because their keys still used the old product name.
- New test: every interface text has a German translation, and no English text mentions roads or potholes.

## 1.1.0 — 2026-11-03

- Single sign-on: Microsoft (Entra ID), Google and optional SAML buttons on the sign-in page.
- Admins can add SSO users without a password; the membership links on the first SSO sign-in with the same email (`lib/sso.ts`), with domain and provider allowlists.
- SSO users have no password reset in MajstorMile; the Users list shows their SSO status.
- `EVIDENCE_BUCKET` setting; renamed to MajstorMile.

## 1.0.0 — 2026-11-03

- New project forked from PaveLedger 2.24.0 (commit 47ca23a).
- German interface by default (`lib/i18n-de.ts`, ~1,460 texts) with an English switch; the Serbian, Cyrillic and French interfaces were removed.
- Trades (Gewerke) on jobs and contracts: Painting, Plumbing, Electrical, Locksmith, Heating, Carpentry, Flooring, Roofing, Cleaning, Other.
- Duplicate reports merge only within the same trade; contracts only cover jobs of their own trade (or all trades when left empty).
- Trade selector and per-trade issue presets on the staff form; trade selector on the public tenant form; trade column in the jobs table.
- German market profile: EUR, address search limited to Germany, 112, Frankfurt region.
- Berlin/Hamburg demo pack with six trade firms and jobs at every stage.
- New logo, favicon and app icons; neutral before/after demo images.
- Job IDs now start with HW-.
