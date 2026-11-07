-- Support requests from the public /podrska form (small built-in CRM). Server access only.
begin;
create table if not exists public.support_requests (
 id uuid primary key default gen_random_uuid(),
 ref text not null unique,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 name text not null,
 email text not null,
 phone text,
 topic text not null,
 message text not null,
 status text not null default 'new' check (status in ('new','open','answered','closed')),
 notes text not null default '',
 handled_by text
);
create index if not exists support_requests_created_idx on public.support_requests (created_at desc);
alter table public.support_requests enable row level security;
revoke all on table public.support_requests from anon, authenticated;
grant select,insert,update,delete on table public.support_requests to service_role;
commit;
