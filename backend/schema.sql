-- Cum IN Dungeon backend foundation
-- PostgreSQL-compatible schema. Keep identity/verification data minimal and
-- store only references to verification providers rather than raw ID images.

create table if not exists users (
  id uuid primary key,
  email text not null unique,
  display_name text,
  role text not null default 'member' check (role in ('member', 'performer', 'moderator', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists age_verifications (
  id uuid primary key,
  user_id uuid not null references users(id) on delete cascade,
  provider text not null,
  provider_reference text not null,
  verified_at timestamptz not null,
  expires_at timestamptz,
  status text not null check (status in ('verified', 'expired', 'revoked')),
  created_at timestamptz not null default now()
);

create table if not exists memberships (
  id uuid primary key,
  user_id uuid not null references users(id) on delete cascade,
  plan text not null,
  status text not null check (status in ('trialing', 'active', 'past_due', 'cancelled', 'expired')),
  provider text,
  provider_customer_id text,
  provider_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists venue_categories (
  id uuid primary key,
  slug text not null unique,
  name text not null,
  short_label text,
  icon_key text not null,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists rooms (
  id uuid primary key,
  name text not null,
  description text,
  visibility text not null default 'members' check (visibility in ('public', 'members', 'private')),
  status text not null default 'offline' check (status in ('offline', 'open', 'live', 'maintenance')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists room_categories (
  room_id uuid not null references rooms(id) on delete cascade,
  category_id uuid not null references venue_categories(id) on delete cascade,
  primary key (room_id, category_id)
);

create table if not exists performer_profiles (
  id uuid primary key,
  user_id uuid not null unique references users(id) on delete cascade,
  stage_name text not null,
  bio text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'suspended', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists room_sessions (
  id uuid primary key,
  room_id uuid not null references rooms(id) on delete cascade,
  performer_id uuid references performer_profiles(id) on delete set null,
  status text not null default 'scheduled' check (status in ('scheduled', 'live', 'ended', 'cancelled')),
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists transactions (
  id uuid primary key,
  user_id uuid not null references users(id) on delete restrict,
  type text not null check (type in ('membership', 'tip', 'refund', 'payout')),
  provider text,
  provider_reference text,
  amount_minor bigint not null check (amount_minor >= 0),
  currency char(3) not null default 'CAD',
  status text not null check (status in ('pending', 'succeeded', 'failed', 'refunded')),
  created_at timestamptz not null default now()
);

create table if not exists conversations (
  id uuid primary key,
  kind text not null default 'direct' check (kind in ('direct', 'room')),
  status text not null default 'active' check (status in ('pending', 'active', 'blocked', 'closed')),
  requested_by uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  expires_at timestamptz not null default (now() + interval '14 days')
);

create table if not exists conversation_participants (
  conversation_id uuid not null references conversations(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  primary key (conversation_id, user_id)
);

create table if not exists messages (
  id uuid primary key,
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_user_id uuid not null references users(id) on delete restrict,
  body text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '14 days'),
  safety_status text not null default 'clear' check (safety_status in ('clear', 'review', 'restricted', 'resolved')),
  safety_case_id uuid
);

create table if not exists message_attachments (
  id uuid primary key,
  message_id uuid not null references messages(id) on delete cascade,
  object_key text not null,
  media_type text not null,
  size_bytes bigint not null check (size_bytes >= 0),
  download_allowed boolean not null default false,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '14 days')
);

create table if not exists user_blocks (
  blocker_user_id uuid not null references users(id) on delete cascade,
  blocked_user_id uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_user_id, blocked_user_id),
  check (blocker_user_id <> blocked_user_id)
);

create table if not exists safety_cases (
  id uuid primary key,
  user_id uuid not null references users(id) on delete restrict,
  message_id uuid references messages(id) on delete set null,
  attachment_id uuid references message_attachments(id) on delete set null,
  trigger_type text not null check (trigger_type in ('user_report', 'automated_signal', 'moderator_review', 'legal_request')),
  category text not null check (category in ('suspected_minor', 'suspected_csamm', 'luring', 'nonconsensual_intimate_image', 'harassment', 'other')),
  status text not null default 'open' check (status in ('open', 'quarantined', 'reviewing', 'resolved', 'escalated')),
  confidence numeric(5,4),
  reason_code text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists safety_holds (
  id uuid primary key,
  safety_case_id uuid not null references safety_cases(id) on delete cascade,
  message_id uuid references messages(id) on delete cascade,
  attachment_id uuid references message_attachments(id) on delete cascade,
  hold_reason text not null,
  created_at timestamptz not null default now(),
  released_at timestamptz
);

create table if not exists moderation_actions (
  id uuid primary key,
  safety_case_id uuid references safety_cases(id) on delete set null,
  target_user_id uuid not null references users(id) on delete restrict,
  action text not null check (action in ('warn', 'restrict', 'suspend', 'ban', 'restore')),
  reason text not null,
  moderator_user_id uuid references users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists audit_events (
  id bigserial primary key,
  actor_user_id uuid references users(id) on delete set null,
  event_type text not null,
  resource_type text,
  resource_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_age_verifications_user on age_verifications(user_id);
create index if not exists idx_memberships_user on memberships(user_id);
create index if not exists idx_room_categories_category on room_categories(category_id);
create index if not exists idx_room_sessions_room on room_sessions(room_id);
create index if not exists idx_transactions_user on transactions(user_id);
create index if not exists idx_messages_expires on messages(expires_at);
create index if not exists idx_attachments_expires on message_attachments(expires_at);
create index if not exists idx_safety_cases_status on safety_cases(status, created_at desc);
create index if not exists idx_safety_cases_user on safety_cases(user_id, created_at desc);
create index if not exists idx_safety_holds_case on safety_holds(safety_case_id);
create index if not exists idx_moderation_actions_user on moderation_actions(target_user_id, created_at desc);
create index if not exists idx_audit_events_created on audit_events(created_at desc);

-- Cleanup worker contract:
-- Delete messages/attachments whose expires_at has passed, except records covered
-- by an active safety_holds row. Storage objects must be deleted with their rows.
-- Safety holds are released only after the applicable review/legal retention
-- requirement has been satisfied.
