/**
 * POST /api/appeals/generate — generate an appeal letter from denial text +
 * chart notes. Wraps the IP module at src/lib/prompts/generate-appeal.ts.
 *
 * Body:
 *   {
 *     denial_letter_text:        string,
 *     chart_notes_text:          string,
 *     denial_document_id?:       uuid,   // optional FK to link upload row
 *     chart_notes_document_id?:  uuid,
 *     practice_letterhead?:      { name, address, phone, npi, tin }, // optional override
 *   }
 *
 * Responses:
 *   200 { appeal_id, confidence, detected_category, detected_payer }
 *   401 unauthenticated
 *   422 { error, reason, suggestion }     // validation failure (caller should fix)
 *   429 { error: "rate_limit", retry_after_seconds }
 *   500 { error: "server_error", request_id }
 */

import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { recordAudit } from "@/lib/audit";
import {
  generateAppeal,
  type AppealOutput,
  type PracticeLetterhead,
} from "@/lib/prompts/generate-appeal";

export const runtime = "nodejs";
export const maxDuration = 120;

// ─────────────────────────────────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────────────────────────────────

const MIN_DENIAL_TEXT = 50;
const MIN_CHART_TEXT = 100;

type ValidationFailure = {
  error: "validation_failed";
  reason: string;
  suggestion: string;
};

function validateBody(body: unknown):
  | { ok: true; payload: ParsedBody }
  | { ok: false; failure: ValidationFailure } {
  if (!body || typeof body !== "object") {
    return {
      ok: false,
      failure: {
        error: "validation_failed",
        reason: "Request body is empty or not JSON.",
        suggestion: "Send a JSON body with denial_letter_text and chart_notes_text.",
      },
    };
  }

  const b = body as Record<string, unknown>;
  const denialText = typeof b.denial_letter_text === "string" ? b.denial_letter_text.trim() : "";
  const chartText = typeof b.chart_notes_text === "string" ? b.chart_notes_text.trim() : "";

  if (denialText.length < MIN_DENIAL_TEXT) {
    return {
      ok: false,
      failure: {
        error: "validation_failed",
        reason: "Denial letter text is missing or too short.",
        suggestion: `Provide at least ${MIN_DENIAL_TEXT} characters of extracted denial-letter text.`,
      },
    };
  }
  if (chartText.length < MIN_CHART_TEXT) {
    return {
      ok: false,
      failure: {
        error: "validation_failed",
        reason: "Chart notes are missing or too brief to support an appeal.",
        suggestion:
          `Paste or upload at least ${MIN_CHART_TEXT} characters of relevant clinical documentation. Include diagnoses, exam findings, and treatment rationale.`,
      },
    };
  }

  const denialDocumentId =
    typeof b.denial_document_id === "string" ? b.denial_document_id : null;
  const chartNotesDocumentId =
    typeof b.chart_notes_document_id === "string" ? b.chart_notes_document_id : null;

  let letterhead: PracticeLetterhead | undefined;
  if (b.practice_letterhead && typeof b.practice_letterhead === "object") {
    const lh = b.practice_letterhead as Record<string, unknown>;
    if (
      typeof lh.name === "string" &&
      typeof lh.address === "string" &&
      typeof lh.phone === "string" &&
      typeof lh.npi === "string" &&
      typeof lh.tin === "string"
    ) {
      letterhead = {
        name: lh.name,
        address: lh.address,
        phone: lh.phone,
        npi: lh.npi,
        tin: lh.tin,
      };
    }
  }

  return {
    ok: true,
    payload: {
      denialText,
      chartText,
      denialDocumentId,
      chartNotesDocumentId,
      letterhead,
    },
  };
}

type ParsedBody = {
  denialText: string;
  chartText: string;
  denialDocumentId: string | null;
  chartNotesDocumentId: string | null;
  letterhead: PracticeLetterhead | undefined;
};

// ─────────────────────────────────────────────────────────────────────────
// Rate limit (Postgres-based)
// ─────────────────────────────────────────────────────────────────────────

const RATE_LIMIT_PER_HOUR = 30;

async function checkRateLimit(practiceId: string): Promise<{ ok: true } | { ok: false; retryAfterSeconds: number }> {
  const admin = createAdminClient();
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count, error } = await admin
    .from("audit_log")
    .select("id", { count: "exact", head: true })
    .eq("practice_id", practiceId)
    .eq("action", "generate_appeal")
    .gte("created_at", since);

  if (error) {
    console.error("[generate] rate-limit query failed:", error);
    // Fail-open: don't block the user on a rate-limit DB hiccup.
    return { ok: true };
  }
  if ((count ?? 0) >= RATE_LIMIT_PER_HOUR) {
    return { ok: false, retryAfterSeconds: 60 * 60 };
  }
  return { ok: true };
}

// ─────────────────────────────────────────────────────────────────────────
// Handler
// ─────────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const requestId = randomUUID();

  // Auth
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("users")
    .select("practice_id, email")
    .eq("id", user.id)
    .single();
  if (!profile) {
    return NextResponse.json({ error: "no_practice" }, { status: 401 });
  }
  const practiceId = (profile as { practice_id: string }).practice_id;

  // Parse + validate
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "validation_failed", reason: "Body is not valid JSON.", suggestion: "Send a JSON body." },
      { status: 422 },
    );
  }

  const v = validateBody(body);
  if (!v.ok) {
    return NextResponse.json(v.failure, { status: 422 });
  }

  // Rate limit
  const rl = await checkRateLimit(practiceId);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate_limit", retry_after_seconds: rl.retryAfterSeconds },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } },
    );
  }

  // Generate
  let result: AppealOutput;
  try {
    result = await generateAppeal({
      denial_letter_text: v.payload.denialText,
      chart_notes_text: v.payload.chartText,
      practice_letterhead: v.payload.letterhead,
    });
  } catch (err) {
    console.error(`[generate] requestId=${requestId} error:`, err);
    await recordAudit({
      practiceId,
      userId: user.id,
      action: "generate_appeal_failed",
      targetType: "appeal",
      metadata: {
        request_id: requestId,
        error_message: err instanceof Error ? err.message : "unknown",
        denial_text_length: v.payload.denialText.length,
        chart_notes_length: v.payload.chartText.length,
      },
    });
    return NextResponse.json(
      { error: "server_error", request_id: requestId },
      { status: 500 },
    );
  }

  // Persist appeals row
  const admin = createAdminClient();
  const summary = result.denial_summary;
  const patientLast4 = (() => {
    const id = summary?.claim_number ?? "";
    return id.slice(-4) || null;
  })();

  const { data: appealRow, error: insertError } = await admin
    .from("appeals")
    .insert({
      practice_id: practiceId,
      created_by: user.id,
      claim_number: summary.claim_number || null,
      patient_identifier_last4: patientLast4,
      payer: summary.payer || null,
      service_date: summary.service_date || null,
      denial_reason_code: summary.denial_reason_code || null,
      denial_reason_category: summary.denial_reason_category,
      cpt_codes: summary.cpt_codes ?? [],
      icd10_codes: summary.icd10_codes ?? [],
      appeal_letter_text: result.appeal_letter,
      appeal_strategy: result.appeal_strategy,
      citations_used: result.citations_used ?? [],
      appeal_deadline: result.appeal_deadline,
      confidence: result.confidence,
      confidence_rationale: result.confidence_rationale,
      status: "draft",
    })
    .select("id")
    .single();

  if (insertError || !appealRow) {
    console.error(`[generate] requestId=${requestId} insert error:`, insertError);
    await recordAudit({
      practiceId,
      userId: user.id,
      action: "generate_appeal_failed",
      targetType: "appeal",
      metadata: {
        request_id: requestId,
        error_message: insertError?.message ?? "insert_returned_no_row",
      },
    });
    return NextResponse.json(
      { error: "server_error", request_id: requestId },
      { status: 500 },
    );
  }

  const appealId = (appealRow as { id: string }).id;

  // Link source documents (if any) to this appeal
  const docIds: string[] = [];
  if (v.payload.denialDocumentId) docIds.push(v.payload.denialDocumentId);
  if (v.payload.chartNotesDocumentId) docIds.push(v.payload.chartNotesDocumentId);
  if (docIds.length > 0) {
    await admin
      .from("appeal_documents")
      .update({ appeal_id: appealId })
      .in("id", docIds)
      .eq("practice_id", practiceId);
  }

  // Audit success
  await recordAudit({
    practiceId,
    userId: user.id,
    action: "generate_appeal",
    targetType: "appeal",
    targetId: appealId,
    metadata: {
      request_id: requestId,
      detected_category: result.metadata.detected_category,
      detected_payer: result.metadata.detected_payer,
      extracted_code: result.metadata.extracted_code,
      confidence: result.confidence,
      model: result.metadata.model_used,
    },
  });

  return NextResponse.json({
    appeal_id: appealId,
    confidence: result.confidence,
    confidence_rationale: result.confidence_rationale,
    detected_category: result.metadata.detected_category,
    detected_payer: result.metadata.detected_payer,
  });
}
