-- Storage buckets for source documents (denial PDFs, chart notes files).
-- Both private. Access only via signed URLs created server-side after the
-- practice_id check in the API route.
--
-- Storage policies use storage.foldername(name)[1] = practice_id::text — the
-- first folder segment of the object key is the practice_id. So uploads land
-- at: <bucket>/<practice_id>/<upload_id>.<ext>

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('denial-pdfs', 'denial-pdfs', false, 10485760,
   array['application/pdf']),
  ('chart-notes', 'chart-notes', false, 10485760,
   array['application/pdf',
         'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
         'text/plain'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Storage RLS: only practice members can read/write their own folder.

drop policy if exists "denial-pdfs select own" on storage.objects;
create policy "denial-pdfs select own"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'denial-pdfs'
    and (storage.foldername(name))[1] = public.auth_practice_id()::text
  );

drop policy if exists "denial-pdfs insert own" on storage.objects;
create policy "denial-pdfs insert own"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'denial-pdfs'
    and (storage.foldername(name))[1] = public.auth_practice_id()::text
  );

drop policy if exists "chart-notes select own" on storage.objects;
create policy "chart-notes select own"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'chart-notes'
    and (storage.foldername(name))[1] = public.auth_practice_id()::text
  );

drop policy if exists "chart-notes insert own" on storage.objects;
create policy "chart-notes insert own"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'chart-notes'
    and (storage.foldername(name))[1] = public.auth_practice_id()::text
  );

-- DELETE is system-only via the purge cron running with service-role.
