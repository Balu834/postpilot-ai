alter table users add column if not exists welcome_sent boolean default false;
alter table users add column if not exists email_notify_published boolean default true;
alter table users add column if not exists email_notify_digest boolean default false;
