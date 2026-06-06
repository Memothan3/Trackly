-- Enables username → email resolution for Firebase sign-in.
alter table public.profiles
  add column if not exists email text;

create unique index if not exists profiles_email_unique_idx
  on public.profiles (lower(email))
  where email is not null;

-- Allow anonymous username → email lookup for login (email only).
create or replace function public.resolve_login_email(login_identifier text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  resolved text;
begin
  if login_identifier is null or length(trim(login_identifier)) = 0 then
    return null;
  end if;

  if position('@' in login_identifier) > 0 then
    return lower(trim(login_identifier));
  end if;

  select p.email
    into resolved
  from public.profiles p
  where lower(p.username) = lower(trim(login_identifier))
  limit 1;

  return resolved;
end;
$$;

revoke all on function public.resolve_login_email(text) from public;
grant execute on function public.resolve_login_email(text) to anon, authenticated;