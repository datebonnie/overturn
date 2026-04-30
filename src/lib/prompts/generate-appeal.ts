import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "./system";
import { routeDenialCode, type DenialCategory } from "./code-router";
import { getStrategy } from "./strategies";
import { getPayerFormatting } from "./payer-formatting";

const MODEL = "claude-sonnet-4-5";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface PracticeLetterhead {
  name: string;
  address: string;
  phone: string;
  npi: string;
  tin: string;
}

export interface AppealInput {
  denial_letter_text: string;
  chart_notes_text: string;
  practice_letterhead?: PracticeLetterhead;
}

export interface AppealOutput {
  appeal_letter: string;
  denial_summary: {
    payer: string;
    claim_number: string;
    service_date: string;
    cpt_codes: string[];
    icd10_codes: string[];
    denial_reason_code: string;
    denial_reason_category: DenialCategory;
  };
  appeal_strategy: string;
  citations_used: string[];
  appeal_deadline: string | null;
  confidence: "high" | "medium" | "low";
  confidence_rationale: string;
  metadata: {
    detected_category: DenialCategory;
    detected_payer: string;
    extracted_code: string;
    model_used: string;
  };
}

/**
 * Extracts the CARC denial code from the denial letter text.
 * Returns "unknown" if no clear code is present.
 */
async function extractDenialCode(denialLetterText: string): Promise<string> {
  const prompt = `You are extracting the CARC (Claim Adjustment Reason Code) from a medical insurance denial letter.

Return ONLY the code itself, with no explanation, no prefix (no "CO-" or "PR-"), and no other text.

Examples of valid responses: "50", "97", "197", "B7", "16", "29"

If no clear CARC code is present, return exactly: unknown

Denial letter:
${denialLetterText.slice(0, 4000)}`;

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 20,
    messages: [{ role: "user", content: prompt }],
  });

  const block = response.content[0];
  if (block.type !== "text") return "unknown";
  return block.text.trim();
}

/**
 * Identifies the payer from the denial letter text.
 * Returns one of the known PayerKey values or "default".
 */
async function extractPayer(denialLetterText: string): Promise<string> {
  const prompt = `You are identifying the insurance payer from a medical claim denial letter.

Return ONLY one of these exact values, with no other text:

aetna
unitedhealthcare
bcbs
cigna
medicare
medicaid
default

Use "bcbs" for any Blue Cross Blue Shield plan (Anthem BCBS, Horizon BCBS, BCBS of any state, etc.).
Use "medicare" for traditional Medicare or any Medicare Administrative Contractor (MAC).
Use "medicaid" for any state Medicaid plan or Medicaid managed care organization.
Use "default" if the payer cannot be clearly identified or doesn't match the list above.

Denial letter:
${denialLetterText.slice(0, 4000)}`;

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 20,
    messages: [{ role: "user", content: prompt }],
  });

  const block = response.content[0];
  if (block.type !== "text") return "default";
  return block.text.trim().toLowerCase();
}

/**
 * Strips markdown code fences and parses JSON output from the model.
 * Throws if the output is not valid JSON.
 */
function parseAppealOutput(rawOutput: string): Omit<AppealOutput, "metadata"> {
  const cleaned = rawOutput
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error(
      `Appeal generation returned invalid JSON. Raw output: ${rawOutput.slice(0, 500)}`
    );
  }
}

/**
 * Main entry point. Generates a complete appeal letter for the given denial.
 *
 * Flow:
 *   1. Extract the CARC denial code (1 small API call)
 *   2. Extract the payer (1 small API call)
 *   3. Route to the appropriate strategy and payer formatting
 *   4. Generate the full appeal letter with the layered system prompt
 */
export async function generateAppeal(
  input: AppealInput
): Promise<AppealOutput> {
  if (!input.denial_letter_text || input.denial_letter_text.trim().length < 50) {
    throw new Error("Denial letter text is missing or too short.");
  }
  if (!input.chart_notes_text || input.chart_notes_text.trim().length < 50) {
    throw new Error("Chart notes text is missing or too short.");
  }

  // Step 1 & 2: Run extractions in parallel for speed.
  const [extractedCode, detectedPayer] = await Promise.all([
    extractDenialCode(input.denial_letter_text),
    extractPayer(input.denial_letter_text),
  ]);

  // Step 3: Route to strategy and formatting.
  const detectedCategory = routeDenialCode(extractedCode);
  const strategyPrompt = getStrategy(detectedCategory);
  const payerFormattingPrompt = getPayerFormatting(detectedPayer);

  // Step 4: Compose the full system prompt.
  const fullSystemPrompt = `${SYSTEM_PROMPT}

${strategyPrompt}

${payerFormattingPrompt}`;

  // Compose the user message with all source material.
  const letterheadBlock = input.practice_letterhead
    ? `

## PRACTICE INFORMATION:
Name: ${input.practice_letterhead.name}
Address: ${input.practice_letterhead.address}
Phone: ${input.practice_letterhead.phone}
NPI: ${input.practice_letterhead.npi}
TIN: ${input.practice_letterhead.tin}`
    : "";

  const userMessage = `Generate an appeal letter for the following denial.

## DENIAL LETTER (extracted text):
${input.denial_letter_text}

## CHART NOTES / CLINICAL DOCUMENTATION:
${input.chart_notes_text}${letterheadBlock}

Return only the JSON output as specified in your system prompt. No preamble. No explanation outside the JSON.`;

  // Generate the appeal.
  const appealResponse = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4000,
    system: fullSystemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const block = appealResponse.content[0];
  if (block.type !== "text") {
    throw new Error("Appeal generation returned non-text content.");
  }

  const parsed = parseAppealOutput(block.text);

  return {
    ...parsed,
    metadata: {
      detected_category: detectedCategory,
      detected_payer: detectedPayer,
      extracted_code: extractedCode,
      model_used: MODEL,
    },
  };
}
