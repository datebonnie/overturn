export type DenialCategory =
  | "medical_necessity"
  | "coding"
  | "authorization"
  | "timely_filing"
  | "cob"
  | "bundling"
  | "experimental"
  | "non_covered"
  | "duplicate"
  | "other";

export const DENIAL_CODE_ROUTER: Record<string, DenialCategory> = {
  // Medical Necessity Family
  "50": "medical_necessity",
  "B7": "medical_necessity",

  // Coding Family
  "11": "coding",
  "16": "coding",

  // Bundling / NCCI Edits
  "97": "bundling",
  "B15": "bundling",

  // Authorization Family
  "197": "authorization",
  "198": "authorization",
  "199": "authorization",

  // Timely Filing Family
  "29": "timely_filing",

  // Coordination of Benefits Family
  "22": "cob",
  "109": "cob",

  // Experimental / Investigational
  "55": "experimental",

  // Non-covered / Excluded
  "96": "non_covered",
  "204": "non_covered",

  // Duplicate Claim
  "18": "duplicate",
};

export function routeDenialCode(code: string): DenialCategory {
  const normalized = code.trim().toUpperCase().replace(/^CO-?/, "").replace(/^PR-?/, "");
  return DENIAL_CODE_ROUTER[normalized] || "other";
}
