-- 24-hour purge job for appeal_documents.
-- Runs every 5 minutes; deletes any row whose expires_at is in the past,
-- along with its storage object. Writes an audit_log entry per deletion.
--
-- This is the database-level enforcement of the public privacy commitment.
-- If this stops running, the FAQ on hioverturn.com starts lying. Monitor it.

create or replace function public.purge_expired_documents()
returns void
language plpgsql
security definer
set search_path = public, storage
as $$
declare
  expired_doc record;
begin
  for expired_doc in
    select id, practice_id, supabase_storage_path, document_type, file_size_bytes
    from public.appeal_documents
    where expires_at < now()
      and purged_at is null
    order by expires_at asc
    limit 500
  loop
    -- Delete the storage object. Supabase routes this to S3 deletion.
    delete from storage.objects
    where bucket_id = case expired_doc.document_type
                        when 'denial_letter' then 'denial-pdfs'
                        else 'chart-notes'
                      end
      and name = expired_doc.supabase_storage_path;

    -- Hard-delete the appeal_documents row. No soft delete; the audit
    -- entry below is the only trace.
    delete from public.appeal_documents where id = expired_doc.id;

    -- Log the purge. user_id = null because this is a system action.
    insert into public.audit_log (
      practice_id, user_id, action, target_type, target_id, metadata
    ) values (
      expired_doc.practice_id,
      null,
      'document.purge',
      'appeal_document',
      expired_doc.id,
      jsonb_build_object(
        'document_type', expired_doc.document_type,
        'file_size_bytes', expired_doc.file_size_bytes
      )
    );
  end loop;
end;
$$;

-- Schedule via pg_cron. Idempotent: unschedule any prior version first.
do $$
begin
  perform cron.unschedule('purge-expired-documents');
exception
  when others then null; -- ignore if it didn't exist
end;
$$;

select cron.schedule(
  'purge-expired-documents',
  '*/5 * * * *',
  $$ select public.purge_expired_documents() $$
);
