/**
 * Validation pass for the 10 test fixtures.
 *
 * For each fixture:
 *   - Reads denial-letter.pdf and extracts text
 *   - Reads chart-notes.txt
 *   - Calls generateAppeal() against the live Anthropic API
 *   - Compares actual metadata (detected_category, detected_payer,
 *     extracted_code, confidence) against meta.json's expected values
 *
 * No DB writes. No audit_log entries. No "Test Fixtures" practice needed
 * because we bypass the API route entirely and call the IP module directly.
 *
 * Run: npx tsx scripts/validate-routing.ts
 *
 * Costs ~$0.50–1.00 in Anthropic API spend per full pass (10 generations).
 */

import { PDFParse } from "pdf-parse";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { config as loadEnv } from "dotenv";

// Load env BEFORE importing the prompts module — generate-appeal.ts
// constructs the Anthropic client at module-load time and would see
// undefined apiKey if env weren't loaded yet.
// override: true is required because tsx's startup env loader sets some
// keys to empty-string (when matching templates pre-load), and dotenv's
// default behavior is non-overriding.
loadEnv({ path: ".env.local", override: true });

// Type-only import is fine — runtime values come from a dynamic import
// after env has been loaded.
import type {
  AppealOutput,
  PracticeLetterhead,
} from "../src/lib/prompts/generate-appeal";

const FIXTURES_ROOT = path.resolve("docs/test-fixtures");

const TEST_LETTERHEAD: PracticeLetterhead = {
  name: "Demo Family Medicine of NJ",
  address: "123 Test Lane, Sample City, NJ 07000",
  phone: "(555) 123-4567",
  npi: "1234567890",
  tin: "12-3456789",
};

type Expected = {
  detected_category: string | null;
  detected_payer: string;
  extracted_code: string;
  confidence_floor: "high" | "medium" | "low";
};

type Meta = {
  description: string;
  expected: Expected;
};

type FixtureResult = {
  slug: string;
  description: string;
  expected: Expected;
  actual: {
    detected_category: AppealOutput["metadata"]["detected_category"];
    detected_payer: string;
    extracted_code: string;
    confidence: AppealOutput["confidence"];
    confidence_rationale: string | null;
  };
  pass: boolean;
  failures: string[];
};

const CONFIDENCE_RANK: Record<"low" | "medium" | "high", number> = {
  low: 0,
  medium: 1,
  high: 2,
};

async function extractDenialText(pdfPath: string): Promise<string> {
  const buf = readFileSync(pdfPath);
  const parser = new PDFParse({ data: buf });
  const result = await parser.getText();
  await parser.destroy();
  return result.text.trim();
}

function readMeta(metaPath: string): Meta {
  return JSON.parse(readFileSync(metaPath, "utf8")) as Meta;
}

function compare(slug: string, meta: Meta, output: AppealOutput): FixtureResult {
  const failures: string[] = [];
  const expected = meta.expected;
  const actualMetadata = output.metadata;

  // Category check.
  // For ambiguous denials (no CARC), expected category is null AND we accept
  // either "other" or whatever the model's best guess is, BUT the extracted
  // code MUST be "unknown" so the routing fell back correctly.
  if (expected.detected_category !== null) {
    if (actualMetadata.detected_category !== expected.detected_category) {
      failures.push(
        `category mismatch: expected "${expected.detected_category}", got "${actualMetadata.detected_category}"`,
      );
    }
  }

  // Payer check.
  if (expected.detected_payer !== "default") {
    if (actualMetadata.detected_payer !== expected.detected_payer) {
      failures.push(
        `payer mismatch: expected "${expected.detected_payer}", got "${actualMetadata.detected_payer}"`,
      );
    }
  }

  // Code check.
  if (expected.extracted_code === "unknown") {
    if (actualMetadata.extracted_code !== "unknown") {
      failures.push(
        `code mismatch: expected "unknown" (no CARC), got "${actualMetadata.extracted_code}"`,
      );
    }
  } else {
    if (actualMetadata.extracted_code !== expected.extracted_code) {
      failures.push(
        `code mismatch: expected "${expected.extracted_code}", got "${actualMetadata.extracted_code}"`,
      );
    }
  }

  // Confidence floor check.
  // For fixtures expecting "low" floor, the confidence MUST be low (these are
  // the failure-case fixtures and must surface as low).
  // For other fixtures, confidence must be >= the floor.
  if (expected.confidence_floor === "low") {
    if (output.confidence !== "low") {
      failures.push(
        `confidence mismatch: expected "low" (failure case), got "${output.confidence}"`,
      );
    }
  } else {
    const actualRank = CONFIDENCE_RANK[output.confidence];
    const floorRank = CONFIDENCE_RANK[expected.confidence_floor];
    if (actualRank < floorRank) {
      failures.push(
        `confidence below floor: expected >= "${expected.confidence_floor}", got "${output.confidence}" — rationale: ${output.confidence_rationale}`,
      );
    }
  }

  return {
    slug,
    description: meta.description,
    expected,
    actual: {
      detected_category: actualMetadata.detected_category,
      detected_payer: actualMetadata.detected_payer,
      extracted_code: actualMetadata.extracted_code,
      confidence: output.confidence,
      confidence_rationale: output.confidence_rationale ?? null,
    },
    pass: failures.length === 0,
    failures,
  };
}

(async () => {
  console.log("═══ Routing validation ═══\n");

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error(
      "ANTHROPIC_API_KEY not set in .env.local. Add it before running validation.",
    );
    process.exit(1);
  }

  // Dynamic import after env is loaded.
  const { generateAppeal } = await import("../src/lib/prompts/generate-appeal");

  const slugs = readdirSync(FIXTURES_ROOT)
    .filter((entry) => {
      const full = path.join(FIXTURES_ROOT, entry);
      return statSync(full).isDirectory();
    })
    .sort();

  if (slugs.length === 0) {
    console.error("No fixtures found. Run scripts/generate-fixtures.ts first.");
    process.exit(1);
  }

  const results: FixtureResult[] = [];

  for (const slug of slugs) {
    const dir = path.join(FIXTURES_ROOT, slug);
    const denialPdf = path.join(dir, "denial-letter.pdf");
    const chartTxt = path.join(dir, "chart-notes.txt");
    const metaJson = path.join(dir, "meta.json");

    process.stdout.write(`▸ ${slug} ... `);

    let denialText: string;
    try {
      denialText = await extractDenialText(denialPdf);
    } catch (err) {
      console.log("FAILED (could not extract denial PDF)");
      console.error(err);
      process.exit(1);
    }
    const chartText = readFileSync(chartTxt, "utf8");
    const meta = readMeta(metaJson);

    const t0 = Date.now();
    let output: AppealOutput;
    try {
      output = await generateAppeal({
        denial_letter_text: denialText,
        chart_notes_text: chartText,
        practice_letterhead: TEST_LETTERHEAD,
      });
    } catch (err) {
      console.log("FAILED (generateAppeal threw)");
      console.error(err);
      results.push({
        slug,
        description: meta.description,
        expected: meta.expected,
        actual: {
          detected_category: "other",
          detected_payer: "default",
          extracted_code: "unknown",
          confidence: "low",
          confidence_rationale: `Threw: ${(err as Error).message}`,
        },
        pass: false,
        failures: [(err as Error).message],
      });
      continue;
    }
    const elapsed = Date.now() - t0;

    const result = compare(slug, meta, output);
    results.push(result);

    if (result.pass) {
      console.log(`✓ ok (${(elapsed / 1000).toFixed(1)}s)`);
    } else {
      console.log(`✗ FAIL (${(elapsed / 1000).toFixed(1)}s)`);
      for (const f of result.failures) console.log(`    ${f}`);
    }
  }

  // Summary
  console.log("\n═══ Summary ═══");
  const passed = results.filter((r) => r.pass).length;
  const failed = results.length - passed;
  console.log(`${passed}/${results.length} passed${failed > 0 ? `, ${failed} failed` : ""}`);

  if (failed > 0) {
    console.log("\n═══ Failures ═══");
    for (const r of results.filter((r) => !r.pass)) {
      console.log(`\n${r.slug} — ${r.description}`);
      console.log(`  expected: category=${r.expected.detected_category} payer=${r.expected.detected_payer} code=${r.expected.extracted_code} conf>=${r.expected.confidence_floor}`);
      console.log(`  actual:   category=${r.actual.detected_category} payer=${r.actual.detected_payer} code=${r.actual.extracted_code} conf=${r.actual.confidence}`);
      if (r.actual.confidence_rationale) {
        console.log(`  rationale: ${r.actual.confidence_rationale}`);
      }
    }
    process.exit(1);
  }

  console.log("\nAll fixtures route correctly. ✓");
})();
