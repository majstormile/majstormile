// Single sign-on: people sign in with Microsoft (Entra ID / Microsoft 365), Google, or company SAML through Supabase Auth.
// An administrator adds a person as an SSO member (email and access, no password). The first time someone signs in
// through SSO with exactly that email, the membership is bound to their sign-in account. Pure functions, tested without a network.
import {isActive, type Member, type State} from './domain.ts';

export type SsoUser = {userId: string; email: string; provider?: string};
export type SsoPolicy = {
  /** Sign-in providers that may claim an SSO membership: 'azure', 'google', and 'sso' for any SAML connection. */
  providers: string[];
  /** If set, only emails at these domains may claim an SSO membership. */
  domains: string[];
};

const list = (v: string | undefined) => (v || '').split(',').map(x => x.trim().toLowerCase()).filter(Boolean);

/** Server policy from the environment. Providers default to Microsoft, Google and SAML. */
export function ssoPolicy(env: Record<string, string | undefined> = process.env): SsoPolicy {
  const providers = list(env.SSO_PROVIDERS);
  return {providers: providers.length ? providers : ['azure', 'google', 'sso'], domains: list(env.SSO_ALLOWED_DOMAINS)};
}

/** Supabase reports SAML sign-ins as "sso:<connection id>". */
export const providerKind = (provider?: string) => (provider || '').toLowerCase().startsWith('sso:') ? 'sso' : (provider || '').toLowerCase();
export const isSsoProvider = (provider: string | undefined, policy: SsoPolicy) => {
  const kind = providerKind(provider);
  return !!kind && kind !== 'email' && kind !== 'phone' && policy.providers.includes(kind);
};
const domainOf = (email: string) => email.slice(email.lastIndexOf('@') + 1).toLowerCase();

/** An SSO member that has not signed in yet: no sign-in account is bound. */
export const awaitingSso = (m: Member) => !!m.sso && !m.authUserId;

/**
 * Bind a waiting SSO membership to the signed-in account. Returns the member, or undefined when nothing may be bound.
 * Safeguards: only members an administrator marked as SSO, only while unbound, only active real members,
 * only through an allowed SSO provider, only at an allowed email domain, and never a second membership for one account.
 */
export function bindSsoMember(s: State, user: SsoUser, now: string, policy: SsoPolicy): Member | undefined {
  if (!isSsoProvider(user.provider, policy)) return undefined;
  const email = user.email.trim().toLowerCase();
  if (!email || (policy.domains.length && !policy.domains.includes(domainOf(email)))) return undefined;
  if (s.members.some(m => m.authUserId === user.userId || m.id === user.userId)) return undefined;
  const matches = s.members.filter(m => !m.demo && isActive(m) && awaitingSso(m) && m.email.trim().toLowerCase() === email);
  if (matches.length !== 1) return undefined;
  const m = matches[0];
  m.authUserId = user.userId;
  s.events.unshift({at: now, actor: 'System', action: `SSO sign-in linked for ${m.name} (${providerKind(user.provider)})`});
  return m;
}
