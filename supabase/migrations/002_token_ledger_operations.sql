-- Cum IN Dungeon token ledger operations
-- Run this in Supabase SQL Editor after 001 token casino ledger.

create or replace function public.grant_tokens(
  p_user_id uuid,
  p_amount bigint,
  p_source text,
  p_round_id uuid default gen_random_uuid()
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance bigint;
  v_new_balance bigint;
begin
  if p_user_id is null then raise exception 'user_id is required'; end if;
  if p_amount <= 0 or p_amount > 25 then raise exception 'amount must be between 1 and 25'; end if;
  if p_source is null or length(trim(p_source)) = 0 then raise exception 'source is required'; end if;

  insert into public.token_accounts(user_id) values (p_user_id) on conflict (user_id) do nothing;

  select balance into v_balance from public.token_accounts where user_id = p_user_id for update;
  v_new_balance := v_balance + p_amount;

  update public.token_accounts set balance = v_new_balance, updated_at = now() where user_id = p_user_id;

  insert into public.token_transactions(user_id, round_id, game_id, transaction_type, amount, balance_after)
  values (p_user_id, p_round_id, left(p_source, 120), 'bonus', p_amount, v_new_balance);

  return jsonb_build_object('success', true, 'amount', p_amount, 'balance', v_new_balance, 'round_id', p_round_id);
end;
$$;

create or replace function public.transfer_tokens(
  p_sender_id uuid,
  p_recipient_id uuid,
  p_amount bigint,
  p_reason text default 'tip',
  p_round_id uuid default gen_random_uuid()
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sender bigint;
  v_recipient bigint;
  v_sender_new bigint;
  v_recipient_new bigint;
begin
  if p_sender_id is null or p_recipient_id is null then raise exception 'sender and recipient are required'; end if;
  if p_sender_id = p_recipient_id then raise exception 'cannot transfer to yourself'; end if;
  if p_amount <= 0 or p_amount > 10000 then raise exception 'invalid transfer amount'; end if;

  insert into public.token_accounts(user_id) values (p_sender_id) on conflict (user_id) do nothing;
  insert into public.token_accounts(user_id) values (p_recipient_id) on conflict (user_id) do nothing;

  -- Lock both accounts in deterministic order to prevent deadlocks.
  if p_sender_id::text < p_recipient_id::text then
    select balance into v_sender from public.token_accounts where user_id = p_sender_id for update;
    select balance into v_recipient from public.token_accounts where user_id = p_recipient_id for update;
  else
    select balance into v_recipient from public.token_accounts where user_id = p_recipient_id for update;
    select balance into v_sender from public.token_accounts where user_id = p_sender_id for update;
  end if;

  if v_sender < p_amount then raise exception 'insufficient tokens'; end if;

  v_sender_new := v_sender - p_amount;
  v_recipient_new := v_recipient + p_amount;

  update public.token_accounts set balance = v_sender_new, updated_at = now() where user_id = p_sender_id;
  update public.token_accounts set balance = v_recipient_new, updated_at = now() where user_id = p_recipient_id;

  insert into public.token_transactions(user_id, round_id, game_id, transaction_type, amount, balance_after)
  values
    (p_sender_id, p_round_id, left(coalesce(p_reason,'tip'),120), 'bet', -p_amount, v_sender_new),
    (p_recipient_id, p_round_id, left(coalesce(p_reason,'tip'),120), 'win', p_amount, v_recipient_new);

  return jsonb_build_object('success', true, 'amount', p_amount, 'senderBalance', v_sender_new, 'recipientBalance', v_recipient_new, 'round_id', p_round_id);
end;
$$;

grant execute on function public.grant_tokens(uuid,bigint,text,uuid) to authenticated, anon;
grant execute on function public.transfer_tokens(uuid,uuid,bigint,text,uuid) to authenticated, anon;
