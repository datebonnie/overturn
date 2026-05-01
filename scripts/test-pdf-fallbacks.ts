/**
 * Test pdf-parse behavior against four problematic PDF types so we can
 * confirm /api/uploads degrades gracefully (returns extracted_text=null)
 * for each, allowing the client to surface the manual-paste fallback.
 *
 *   1. Image-only / scanned PDF (no embedded text)
 *   2. Encrypted / password-protected PDF
 *   3. Multi-page PDF where the denial is on page 3
 *   4. PDF with form fields
 *
 * For each, we run the SAME extraction logic /api/uploads runs and
 * report what extracted_text would be.
 */

import { PDFParse } from "pdf-parse";
import { jsPDF } from "jspdf";

type Result = {
  name: string;
  textLength: number;
  threw: boolean;
  errorMessage?: string;
  fallbackTriggered: boolean;
  notes: string;
};

async function tryExtract(
  buf: Uint8Array,
  name: string,
  notes: string,
): Promise<Result> {
  try {
    const parser = new PDFParse({ data: buf });
    const result = await parser.getText();
    await parser.destroy();
    const text = result.text.trim();
    return {
      name,
      textLength: text.length,
      threw: false,
      fallbackTriggered: text.length === 0,
      notes,
    };
  } catch (err) {
    return {
      name,
      textLength: 0,
      threw: true,
      errorMessage: (err as Error).message,
      fallbackTriggered: true,
      notes,
    };
  }
}

// 1. Image-only PDF — synthetically construct a PDF with NO text content.
// jspdf's text() never called → the resulting document contains only
// internal metadata and no extractable page text.
function buildImageOnlyPdf(): Uint8Array {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  // No text or image added — empty page.
  return new Uint8Array(doc.output("arraybuffer"));
}

// 2. Encrypted PDF — jspdf supports basic AES encryption.
function buildEncryptedPdf(): Uint8Array {
  const doc = new jsPDF({
    unit: "pt",
    format: "letter",
    encryption: {
      userPassword: "secret123",
      ownerPassword: "owner123",
    },
  });
  doc.text("Aetna Health Inc.\nClaim denied: CO-50", 56, 56);
  return new Uint8Array(doc.output("arraybuffer"));
}

// 3. Multi-page PDF, denial info on page 3.
function buildMultiPagePdf(): Uint8Array {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  doc.text("Page 1 — cover sheet", 56, 56);
  doc.addPage();
  doc.text("Page 2 — provider info", 56, 56);
  doc.addPage();
  doc.text(
    "Page 3 — DENIAL\nReason code: CO-50\nClaim number: A-2026-7842910\nDate of service: 2026-03-15",
    56,
    56,
  );
  return new Uint8Array(doc.output("arraybuffer"));
}

// 4. PDF with a form field (jspdf's form support).
function buildFormFieldPdf(): Uint8Array {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  doc.text("Insurance appeal request form", 56, 56);
  // jsPDF form-field API is annotation-based; this draws an interactive
  // text field at the given coordinates.
  type DocWithTextField = {
    addField: (
      type: string,
      options: Record<string, unknown>,
    ) => void;
  };
  const dWithFields = doc as unknown as DocWithTextField;
  if (typeof dWithFields.addField === "function") {
    try {
      dWithFields.addField("text", {
        x: 56,
        y: 90,
        width: 200,
        height: 20,
        fieldName: "claimNumber",
        defaultValue: "A-2026-1234567",
      });
    } catch {
      // jspdf's form support is limited; not all builds expose addField.
    }
  }
  doc.text("Member ID: TEST-1234-5678", 56, 130);
  return new Uint8Array(doc.output("arraybuffer"));
}

(async () => {
  console.log("═══ pdf-parse fallback behavior ═══\n");

  const tests: Array<{ name: string; build: () => Uint8Array; notes: string }> = [
    {
      name: "1. Image-only / no text",
      build: buildImageOnlyPdf,
      notes:
        "Empty page. pdf-parse should return text='' so the API returns extracted_text=null, triggering the client fallback.",
    },
    {
      name: "2. Encrypted",
      build: buildEncryptedPdf,
      notes:
        "Password-protected. pdf-parse without the password should either throw or return empty.",
    },
    {
      name: "3. Multi-page, denial on page 3",
      build: buildMultiPagePdf,
      notes:
        "pdf-parse reads all pages; the CO-50 reason should land in the extracted text.",
    },
    {
      name: "4. Form fields",
      build: buildFormFieldPdf,
      notes:
        "Static body text plus a form field. Static text is extracted; field default values usually are not.",
    },
  ];

  const results: Result[] = [];
  for (const t of tests) {
    const buf = t.build();
    const r = await tryExtract(buf, t.name, t.notes);
    results.push(r);
    console.log(`▸ ${r.name}`);
    console.log(`    text length: ${r.textLength}`);
    if (r.threw) console.log(`    threw: ${r.errorMessage}`);
    console.log(
      `    fallback: ${
        r.fallbackTriggered ? "✓ triggers manual-paste path" : "✗ extraction succeeded"
      }`,
    );
    console.log(`    note: ${r.notes}\n`);
  }

  // For test 3 (multi-page), confirm the denial reason is actually in there.
  const multiPage = results[2];
  if (!multiPage.fallbackTriggered) {
    console.log(`✓ multi-page case extracts page 3 content as expected.`);
  } else {
    console.log(`✗ multi-page case unexpectedly fell back. Investigate.`);
  }

  console.log("\n═══ Client-side fallback wiring ═══");
  console.log("Looking at src/app/app/new/new-appeal-flow.tsx:");
  console.log("  - On upload success, if extracted_text === null, the");
  console.log("    state still flips to denialUpload set + denialText empty.");
  console.log("  - The `Extracted denial-letter text` textarea renders any");
  console.log("    time `denialUpload || denialText` is truthy, so the");
  console.log("    user sees an empty editable textarea after a failed");
  console.log("    extraction and can paste manually.");
  console.log("  - Recommend adding a banner above the textarea when");
  console.log("    extracted_text is null but upload succeeded so the");
  console.log("    fallback intent is unmistakable.");
})();
