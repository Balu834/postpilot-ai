-- Track Razorpay orders server-side so /api/razorpay/verify can trust the
-- plan/amount that was actually paid for instead of a client-supplied value,
-- and so a given order can't be replayed to upgrade a different account.
create table if not exists payment_orders (
  order_id    text primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  plan        text not null,
  amount      integer not null,
  status      text not null default 'created',
  created_at  timestamptz not null default now(),
  verified_at timestamptz
);

alter table payment_orders enable row level security;

create policy "Users can view their own orders" on payment_orders
  for select using (auth.uid() = user_id);
