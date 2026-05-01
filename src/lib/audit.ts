/**
 * Thin wrapper around the record_audit() Postgres function.
 * Always called server-side. Failures are logged but never thrown — losing
 * an audit row should never crash the user-visible flow.
 */

import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type AuditAction =
  | "generate_appeal"
  | "generate_appeal_failed"
  | "appeal_view"
  | "appeal_download_pdf"
  | "appeal_download_docx"
  | "appeal_status_change"
  | "upload_create"
  | "document.purge";

export type AuditTargetType =
  | "appeal"
  | "appeal_document"
  | "practice"
  | "user";

export async function recordAudit(args: {
  practiceId: string;
  userId: string | null;
  action: AuditAction;
  targetType: AuditTargetType;
  targetId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown> | null;
}): Promise<void> {
  try {
    const admin = createAdminClient();
    const { error } = await admin.rpc("record_audit", {
      p_practice_id: args.practiceId,
      p_user_id: args.userId,
      p_action: args.action,
      p_target_type: args.targetType,
      p_target_id: args.targetId ?? null,
      p_ip_address: args.ipAddress ?? null,
      p_user_agent: args.userAgent ?? null,
      p_metadata: args.metadata ?? null,
    });
    if (error) {
      console.error("[audit] record_audit rpc failed:", error);
    }
  } catch (err) {
    console.error("[audit] unexpected error:", err);
  }
}
