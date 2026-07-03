-- Street Run: optional email, one best score per player (username_key)
alter table public.street_run_scores
  alter column email drop not null;

alter table public.street_run_scores
  add column if not exists username_key text;

update public.street_run_scores
set username_key = lower(trim(username))
where username_key is null or trim(username_key) = '';

delete from public.street_run_scores sr
where sr.id not in (
  select distinct on (lower(trim(username))) id
  from public.street_run_scores
  order by lower(trim(username)), score desc, created_at asc
);

update public.street_run_scores
set username_key = lower(trim(username));

alter table public.street_run_scores
  alter column username_key set not null;

create unique index if not exists street_run_scores_username_key_idx
  on public.street_run_scores (username_key);

drop policy if exists "street_run_scores_insert" on public.street_run_scores;

create policy "street_run_scores_insert"
  on public.street_run_scores
  for insert
  to anon, authenticated
  with check (
    char_length(trim(username)) >= 2
    and char_length(trim(username)) <= 20
    and char_length(trim(username_key)) >= 2
    and (email is null or char_length(trim(email)) >= 3)
    and score >= 0
    and score <= 9999999
    and (character is null or character in ('boy', 'girl'))
  );

grant insert on public.street_run_scores to anon, authenticated;
grant select on public.street_run_scores to anon, authenticated;

create or replace function public.upsert_street_run_score(
  p_username text,
  p_email text,
  p_score integer,
  p_character text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_key text := lower(trim(p_username));
  v_name text := trim(p_username);
  v_row public.street_run_scores%rowtype;
begin
  if char_length(v_name) < 2 or char_length(v_name) > 20 then
    return jsonb_build_object('ok', false, 'error', 'invalid_username');
  end if;
  if p_score < 0 or p_score > 9999999 then
    return jsonb_build_object('ok', false, 'error', 'invalid_score');
  end if;

  select * into v_row from public.street_run_scores where username_key = v_key limit 1;

  if found then
    if p_score <= v_row.score then
      return jsonb_build_object('ok', true, 'stored', false, 'reason', 'not_personal_best');
    end if;
    update public.street_run_scores
    set
      score = p_score,
      username = v_name,
      email = nullif(lower(trim(coalesce(p_email, ''))), ''),
      character = p_character,
      created_at = now()
    where id = v_row.id;
    return jsonb_build_object('ok', true, 'stored', true, 'updated', true);
  end if;

  insert into public.street_run_scores (username, username_key, email, score, character)
  values (
    v_name,
    v_key,
    nullif(lower(trim(coalesce(p_email, ''))), ''),
    p_score,
    p_character
  );
  return jsonb_build_object('ok', true, 'stored', true, 'updated', false);
end;
$$;

grant execute on function public.upsert_street_run_score(text, text, integer, text) to anon, authenticated;
