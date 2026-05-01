/**
 * POST /api/uploads — accepts a file (denial PDF or chart notes), stores
 * it in the right Supabase Storage bucket scoped by practice_id, creates
 * an appeal_documents row with expires_at = now() + 24h, and returns the
 * upload id + extracted text for denial PDFs.
 *
 * Multipart form fields:
 *   - file:           File (PDF or chart-note file, up to 10MB)
 *   - document_type:  'denial_letter' | 'chart_notes'
 *
 * Response 200:
 *   {
 *     upload_id: uuid,
 *     file_name: string,
 *     extracted_text: string | null,   // populated only for PDFs
 *   }
 *
 * Errors:
 *   400 bad request shape
 *   401 not authenticated
 *   413 too large
 *   415 unsupported mime type
 *   422 file failed to extract / unreadable
 *   500 storage / DB failure
 */

import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { recordAudit } from "@/lib/audit";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 10 * 1024 * 1024;

const ALLOWED_MIME: Record<"denial_letter" | "chart_notes", string[]> = {
  denial_letter: ["application/pdf"],
  chart_notes: [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ],
};

const BUCKET_FOR: Record<"denial_letter" | "chart_notes", string> = {
  denial_letter: "denial-pdfs",
  chart_notes: "chart-notes",
};

const EXT_FOR_MIME: Record<string, string> = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "text/plain": "txt",
};

export async function POST(request: NextRequest) {
  // 1. Auth.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  // Resolve practice_id
  const { data: profile } = await supabase
    .from("users")
    .select("practice_id")
    .eq("id", user.id)
    .single();
  if (!profile) {
    return NextResponse.json({ error: "no_practice" }, { status: 401 });
  }
  const practiceId = (profile as { practice_id: string }).practice_id;

  // 2. Parse multipart.
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "invalid_form_data" }, { status: 400 });
  }

  const file = formData.get("file");
  const documentTypeRaw = String(formData.get("document_type") ?? "");
  const documentType =
    documentTypeRaw === "denial_letter" || documentTypeRaw === "chart_notes"
      ? documentTypeRaw
      : null;

  if (!(file instanceof File) || !documentType) {
    return NextResponse.json(
      { error: "missing_file_or_document_type" },
      { status: 400 },
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      {
        error: "file_too_large",
        max_bytes: MAX_BYTES,
        actual_bytes: file.size,
      },
      { status: 413 },
    );
  }

  const mime = file.type || "application/octet-stream";
  if (!ALLOWED_MIME[documentType].includes(mime)) {
    return NextResponse.json(
      {
        error: "unsupported_mime_type",
        accepted: ALLOWED_MIME[documentType],
        actual: mime,
      },
      { status: 415 },
    );
  }

  // 3. Upload to Supabase Storage.
  const uploadId = randomUUID();
  const ext = EXT_FOR_MIME[mime] ?? "bin";
  const storagePath = `${practiceId}/${uploadId}.${ext}`;
  const bucket = BUCKET_FOR[documentType];

  const admin = createAdminClient();
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await admin.storage
    .from(bucket)
    .upload(storagePath, buffer, {
      contentType: mime,
      upsert: false,
    });

  if (uploadError) {
    console.error("[uploads] storage upload error:", uploadError);
    return NextResponse.json({ error: "storage_failed" }, { status: 500 });
  }

  // 4. Insert appeal_documents row.
  const { data: docRow, error: insertError } = await admin
    .from("appeal_documents")
    .insert({
      practice_id: practiceId,
      document_type: documentType,
      supabase_storage_path: storagePath,
      file_name: file.name,
      file_size_bytes: file.size,
      // expires_at defaults to now() + 24h via the schema.
    })
    .select("id")
    .single();

  if (insertError || !docRow) {
    // Roll back the storage upload.
    await admin.storage.from(bucket).remove([storagePath]).catch(() => {});
    console.error("[uploads] insert error:", insertError);
    return NextResponse.json({ error: "db_failed" }, { status: 500 });
  }

  // 5. Extract text from PDFs (denial letters only).
  let extractedText: string | null = null;
  if (mime === "application/pdf") {
    try {
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      await parser.destroy();
      extractedText = result.text.trim();
    } catch (err) {
      console.error("[uploads] pdf extraction error:", err);
      // Don't fail the upload; client can let user paste text.
      extractedText = null;
    }
  } else if (mime === "text/plain") {
    extractedText = buffer.toString("utf8");
  }

  // 6. Audit.
  await recordAudit({
    practiceId,
    userId: user.id,
    action: "upload_create",
    targetType: "appeal_document",
    targetId: (docRow as { id: string }).id,
    metadata: {
      document_type: documentType,
      file_size_bytes: file.size,
      mime,
    },
  });

  return NextResponse.json({
    upload_id: (docRow as { id: string }).id,
    file_name: file.name,
    extracted_text: extractedText,
  });
}
