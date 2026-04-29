import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

type WaitlistPayload = {
  email?: string;
  practiceName?: string;
  role?: string;
  specialty?: string;
  claimVolume?: string;
  source?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: WaitlistPayload;
  try {
    body = (await request.json()) as WaitlistPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = body.email?.trim();
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "A valid email is required." },
      { status: 400 },
    );
  }

  const record = {
    email,
    practice_name: body.practiceName?.trim() ?? null,
    role: body.role ?? null,
    specialty: body.specialty ?? null,
    claim_volume: body.claimVolume ?? null,
    source: body.source ?? "landing",
    created_at: new Date().toISOString(),
  };

  const supabase = getSupabaseAdmin();

  if (!supabase) {
    console.log("[waitlist] Supabase not configured — record:", record);
    return NextResponse.json({ ok: true, stubbed: true });
  }

  const { error } = await supabase.from("waitlist").insert(record);
  if (error) {
    console.error("[waitlist] Supabase insert error:", error);
    return NextResponse.json(
      { error: "Could not save your spot. Try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
