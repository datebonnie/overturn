import { NextResponse } from "next/server";
import { Resend } from "resend";

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
    practiceName: body.practiceName?.trim() ?? null,
    role: body.role ?? null,
    specialty: body.specialty ?? null,
    claimVolume: body.claimVolume ?? null,
    source: body.source ?? "landing",
    receivedAt: new Date().toISOString(),
  };

  const apiKey = process.env.RESEND_API_KEY;
  const notifyTo = process.env.WAITLIST_NOTIFY_EMAIL;
  const fromAddress = process.env.WAITLIST_FROM_EMAIL ?? "onboarding@resend.dev";

  if (!apiKey || !notifyTo) {
    console.log("[waitlist] Resend not configured — record:", record);
    return NextResponse.json({ ok: true, stubbed: true });
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: `Overturn Waitlist <${fromAddress}>`,
      to: notifyTo,
      replyTo: email,
      subject: `New Overturn waitlist signup: ${email}`,
      text: formatPlain(record),
      html: formatHtml(record),
    });

    if (error) {
      console.error("[waitlist] Resend send error:", error);
      return NextResponse.json(
        { error: "Could not save your spot. Try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[waitlist] Unexpected error:", err);
    return NextResponse.json(
      { error: "Could not save your spot. Try again." },
      { status: 500 },
    );
  }
}

type Record = {
  email: string;
  practiceName: string | null;
  role: string | null;
  specialty: string | null;
  claimVolume: string | null;
  source: string;
  receivedAt: string;
};

function formatPlain(r: Record): string {
  const lines = [
    `Email: ${r.email}`,
    r.practiceName ? `Practice: ${r.practiceName}` : null,
    r.role ? `Role: ${r.role}` : null,
    r.specialty ? `Specialty: ${r.specialty}` : null,
    r.claimVolume ? `Claim volume: ${r.claimVolume}` : null,
    `Source: ${r.source}`,
    `Received: ${r.receivedAt}`,
  ].filter(Boolean);
  return lines.join("\n");
}

function formatHtml(r: Record): string {
  const row = (label: string, value: string | null) =>
    value
      ? `<tr><td style="padding:6px 12px 6px 0;color:#4d6685;font-weight:600;font-size:13px;">${label}</td><td style="padding:6px 0;color:#0a1628;font-size:14px;">${escapeHtml(value)}</td></tr>`
      : "";

  return `
<div style="font-family:ui-sans-serif,system-ui,sans-serif;color:#0a1628;max-width:560px;">
  <h2 style="margin:0 0 16px;font-size:20px;color:#0a1628;">New waitlist signup</h2>
  <table style="border-collapse:collapse;font-size:14px;">
    ${row("Email", r.email)}
    ${row("Practice", r.practiceName)}
    ${row("Role", r.role)}
    ${row("Specialty", r.specialty)}
    ${row("Claim volume", r.claimVolume)}
    ${row("Source", r.source)}
    ${row("Received", r.receivedAt)}
  </table>
</div>`.trim();
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
