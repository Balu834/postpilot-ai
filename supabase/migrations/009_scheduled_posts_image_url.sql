-- Add image_url for Instagram posts
alter table scheduled_posts add column if not exists image_url text;

-- Expand platform check to include facebook (already added in 008, but ensure consistency)
alter table scheduled_posts drop constraint if exists scheduled_posts_platform_check;
alter table scheduled_posts add constraint scheduled_posts_platform_check
  check (platform in ('instagram', 'linkedin', 'twitter', 'facebook', 'youtube'));

-- Create public storage bucket for post images
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

-- Allow authenticated users to upload
create policy if not exists "Authenticated users can upload post images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'post-images');

-- Allow public read access (needed for Instagram API to fetch the image)
create policy if not exists "Post images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'post-images');

-- Allow users to delete their own images
create policy if not exists "Users can delete their own post images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'post-images' and auth.uid()::text = (storage.foldername(name))[1]);
