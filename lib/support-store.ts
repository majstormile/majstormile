import 'server-only';
// Support requests (built-in CRM). Stored in public.support_requests, reachable only with the service key.
import {adminClient} from './store';

export const SUPPORT_STATUSES = ['new', 'open', 'answered', 'closed'] as const;
export type SupportStatus = typeof SUPPORT_STATUSES[number];
export type SupportRequest = {id: string; ref: string; created_at: string; updated_at: string; name: string; email: string; phone: string | null; topic: string; message: string; status: SupportStatus; notes: string; handled_by: string | null};
/** Closed requests are deleted this many days after their last change (see the privacy policy). */
export const SUPPORT_KEEP_DAYS = 730;

const table = () => adminClient().from('support_requests');

export async function saveRequest(r: {ref: string; name: string; email: string; phone?: string; topic: string; message: string}) {
  const {error} = await table().insert({ref: r.ref, name: r.name, email: r.email, phone: r.phone || null, topic: r.topic, message: r.message});
  if (error) throw new Error(error.message);
}
export async function listRequests(): Promise<SupportRequest[]> {
  const {data, error} = await table().select('*').order('created_at', {ascending: false}).limit(300);
  if (error) throw new Error('503:Support requests are unavailable. Run the support_requests migration in Supabase.');
  return (data || []) as SupportRequest[];
}
export async function updateRequest(id: string, patch: {status?: SupportStatus; notes?: string}, by: string) {
  const {error} = await table().update({...patch, handled_by: by, updated_at: new Date().toISOString()}).eq('id', id);
  if (error) throw new Error('503:The request could not be updated.');
}
export async function purgeClosedRequests(now = Date.now()) {
  const cutoff = new Date(now - SUPPORT_KEEP_DAYS * 864e5).toISOString();
  const {error, count} = await table().delete({count: 'exact'}).eq('status', 'closed').lt('updated_at', cutoff);
  if (error) throw new Error(error.message);
  return count || 0;
}
