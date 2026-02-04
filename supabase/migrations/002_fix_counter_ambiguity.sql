-- Fix ambiguous counter_type reference in next_counter function
-- Drop the old function first (required to change parameter names)
drop function if exists public.next_counter(uuid, text);

-- Recreate with renamed parameter to avoid ambiguity
create function public.next_counter(org_id uuid, p_counter_type text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  counter_value integer;
  current_year integer := extract(year from now());
begin
  insert into public.org_counters (organization_id, counter_type, year, value)
  values (org_id, p_counter_type, current_year, 1)
  on conflict (organization_id, counter_type, year)
  do update set value = public.org_counters.value + 1
  returning value into counter_value;

  return counter_value;
end;
$$;
