-- Email log: tracks every email sent per user
create table if not exists public.email_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  sequence text not null,
  step integer not null default 0,
  subject text not null,
  resend_id text,
  sent_at timestamptz not null default now(),
  opened_at timestamptz,
  clicked_at timestamptz
);

alter table public.email_log enable row level security;

create policy "Users can view their own email log"
  on public.email_log for select
  using (auth.uid() = user_id);

create index idx_email_log_user_seq on public.email_log(user_id, sequence);

-- Email queue: scheduled emails waiting to be sent
create table if not exists public.email_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  sequence text not null,
  step integer not null,
  send_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'sent', 'cancelled')),
  created_at timestamptz not null default now()
);

alter table public.email_queue enable row level security;

create index idx_email_queue_pending on public.email_queue(send_at) where status = 'pending';

-- User email preferences
create table if not exists public.email_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  welcome_sent boolean not null default false,
  unsubscribed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.email_preferences enable row level security;

create policy "Users can view their own email preferences"
  on public.email_preferences for select
  using (auth.uid() = user_id);

create policy "Users can update their own email preferences"
  on public.email_preferences for update
  using (auth.uid() = user_id);
