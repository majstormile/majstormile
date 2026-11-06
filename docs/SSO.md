# Single sign-on (SSO)

Baunavi supports three kinds of company sign-in, all through Supabase Auth:

| Button on the sign-in page | Supabase provider | Typical client | Supabase plan |
|---|---|---|---|
| Mit Microsoft anmelden | `azure` (Microsoft Entra ID / Microsoft 365) | Most German property managers | Free |
| Mit Google anmelden | `google` (Google Workspace) | Smaller firms, trade businesses | Free |
| Firmen-Anmeldung (SAML) | SAML 2.0 (`sso:<id>`) | Large clients with Okta, ADFS, Entra SAML | Pro or higher |

Email and password sign-in keeps working alongside SSO.

## How access works

1. An administrator opens Users and Roles → Add user and picks **Firmenkonto (SSO …), ohne Passwort**. The membership (role, teams) is created with the person's company email and no password.
2. The person clicks "Mit Microsoft anmelden" (or Google/SAML) and signs in with exactly that email.
3. On the first sign-in, Baunavi links the membership to that account (`lib/sso.ts`). The Activity log records "SSO-Anmeldung verknüpft für …". The Users list shows "SSO · wartet auf erste Anmeldung" until then.

Safeguards: only members an admin marked as SSO can be linked, and only while still unlinked. They must be active, real (not demo) members. Email/password sign-ins never link. One account can only ever hold one membership. Someone who signs in through SSO without a matching membership gets the usual "no active membership" message and sees nothing.

Existing password users can also use the Microsoft or Google button. Supabase merges the two identities into one account when both have the same verified email, so their access stays the same.

## Settings (Vercel → Project → Settings → Environment Variables)

| Variable | Example | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SSO_PROVIDERS` | `azure,google` | Which buttons to show. Leave empty to hide them. |
| `NEXT_PUBLIC_SSO_SAML` | `true` | Shows the company SAML field (needs a SAML connection in Supabase). |
| `SSO_PROVIDERS` | `azure,google,sso` | Server side: which providers may link an SSO membership (default: all three). |
| `SSO_ALLOWED_DOMAINS` | `hausverwaltung-mueller.de,mueller-immobilien.de` | **Strongly recommended.** Only these email domains may link an SSO membership. |

Redeploy after changing `NEXT_PUBLIC_*` variables, because they are built into the page.

## Set up Microsoft (Entra ID)

1. Azure portal → Microsoft Entra ID → App registrations → **New registration**.
   - Name: `Baunavi`
   - Supported account types: "Accounts in any organizational directory (multitenant)" so each client firm can sign in with its own Microsoft 365. Choose single tenant if Baunavi serves only one company.
   - Redirect URI (Web): `https://<your-project-ref>.supabase.co/auth/v1/callback`
2. Certificates & secrets → New client secret. Copy the **Value** (not the ID). Note its expiry date in your calendar.
3. Token configuration → Add optional claim → ID token → add `email` and `xms_edov` (marks whether the email is verified).
4. Supabase → Authentication → Sign In / Providers → **Azure** → enable. Paste the Application (client) ID and the secret. Azure Tenant URL: leave empty for multitenant, or `https://login.microsoftonline.com/<tenant-id>` for one company.
5. Supabase → Authentication → URL Configuration: set Site URL to your Baunavi address (for example `https://baunavi.vercel.app`) and add it under Redirect URLs, along with `http://localhost:3000` for local testing.
6. In Vercel set `NEXT_PUBLIC_SSO_PROVIDERS=azure` (or `azure,google`) and `SSO_ALLOWED_DOMAINS`, then redeploy.

## Set up Google

1. Google Cloud console → APIs & Services → OAuth consent screen: set it up as External (or Internal for one Workspace domain).
2. Credentials → Create credentials → OAuth client ID → Web application. Authorized redirect URI: `https://<your-project-ref>.supabase.co/auth/v1/callback`.
3. Supabase → Authentication → Sign In / Providers → **Google** → enable, then paste the client ID and secret.
4. Add `google` to `NEXT_PUBLIC_SSO_PROVIDERS` and redeploy.

## Set up SAML (enterprise clients, Supabase Pro)

1. Supabase → Authentication → SSO → enable SAML 2.0, then add a connection using the client's IdP metadata URL and their email domain(s). The Supabase CLI also works: `supabase sso add --type saml --metadata-url … --domains client.de`.
2. Give the client's IT the Supabase SAML metadata (ACS URL and Entity ID shown in the dashboard).
3. Set `NEXT_PUBLIC_SSO_SAML=true` and redeploy. People enter their work email, and Baunavi forwards them to their company login.

## Security notes

- Always set `SSO_ALLOWED_DOMAINS` in production. Without it, any Microsoft or Google account with a matching email can link a waiting SSO membership.
- SSO members cannot have their password reset in Baunavi; their company controls the account. To remove access, suspend or delete the membership. Disabling the person in Microsoft or Google also stops new sign-ins.
- Keep public sign-up disabled in Supabase except for the SSO providers. A self-created account still has no membership and cannot see any data.
