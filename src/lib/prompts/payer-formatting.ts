export type PayerKey =
  | "aetna"
  | "unitedhealthcare"
  | "bcbs"
  | "cigna"
  | "medicare"
  | "medicaid"
  | "default";

export const PAYER_FORMATTING: Record<PayerKey, string> = {
  aetna: `
## AETNA APPEAL FORMATTING

Submit to: Aetna's published appeals address listed on the EOB. For commercial plans, this is typically PO Box 14463, Lexington, KY 40512. Always verify the address on the actual denial letter, as it varies by plan and product line.

Header requirements:
- Provider name, NPI, TIN
- Patient name, DOB, member ID, group number
- Claim number, date(s) of service
- "FORMAL APPEAL" in subject line

Aetna-specific tone: Aetna responds well to clinical specificity and citation density. Their reviewers are predominantly RNs with chart-review experience. Lean into clinical narrative.

Required closing: "Pursuant to Aetna's appeals procedure outlined in the member's Explanation of Coverage, we respectfully request reversal of the denial and processing of this claim."

Note on timing: Commercial Aetna plans generally allow 180 days from the date of denial for first-level appeals. Confirm the deadline on the actual denial letter.
`,

  unitedhealthcare: `
## UNITEDHEALTHCARE APPEAL FORMATTING

Submit to: UHC's electronic Provider Portal at uhcprovider.com (preferred for fastest processing) or the address listed on the denial letter. Mail-in appeals commonly go to PO Box 30432, Salt Lake City, UT 84130, but always verify on the EOB.

Header requirements:
- Provider name, NPI, TIN
- Patient name, DOB, member ID
- Claim number, date(s) of service
- Subject line: "Provider Appeal — Claim [claim number]"

UHC-specific tone: UHC reviewers are time-pressured. Front-load the argument in the first paragraph. Lead with the strongest piece of evidence. Make the medical necessity case in the first three sentences.

UHC-specific citation: UHC publishes Medical & Drug Policies at uhcprovider.com. Reference the specific bulletin number where applicable.

Note on timing: Most UHC commercial plans allow 12 months from the date of service for first-level appeals, but appeal deadline policies vary. Confirm the deadline on the actual denial letter.
`,

  bcbs: `
## BLUE CROSS BLUE SHIELD APPEAL FORMATTING

Note: BCBS is a federation of independent plans. Format depends on the specific Blue plan. The address on the denial letter is authoritative.

Submit to: The address listed on the EOB. BCBSA federation rule generally requires the home plan handles the appeal.

Header requirements:
- Provider name, NPI, TIN
- Patient name, DOB, member ID (with prefix), group number
- Claim number, date(s) of service
- Subject line: "Level 1 Appeal — Claim [claim number]"

BCBS-specific tone: BCBS plans vary. Generally responsive to medical policy citations. Reference the home plan's published medical policy library where possible. Avoid generic citations to "BCBS policy" — the home plan's specific policy carries weight.

Note on timing: Appeal deadlines vary by Blue plan, typically 180 days for first-level appeals on commercial products. Confirm on the actual denial letter.
`,

  cigna: `
## CIGNA APPEAL FORMATTING

Submit to: The address listed on the denial letter. Cigna commonly directs provider appeals to PO Box 188011, Chattanooga, TN 37422 for commercial plans, but the EOB is authoritative.

Header requirements:
- Provider name, NPI, TIN
- Patient name, DOB, member ID
- Claim number, date(s) of service
- Subject line: "Provider Reconsideration Request"

Cigna-specific tone: Cigna's first-level appeals are typically clinical reviews. Lead with clinical justification. Their published Coverage Policies library is at cignaforhcp.cigna.com — reference specific policy numbers where applicable.

Note on timing: Cigna commercial plans typically require first-level appeals within 180 days of the denial. Confirm on the actual denial letter.
`,

  medicare: `
## MEDICARE APPEAL FORMATTING

Medicare appeals follow a structured 5-level process. The first level is Redetermination, submitted to the Medicare Administrative Contractor (MAC) listed on the Medicare Summary Notice or Medicare Remittance Advice.

Submit to: The MAC address listed on the denial. CMS Form 20027 (Medicare Redetermination Request Form) is preferred, but a properly formatted letter is acceptable.

Header requirements:
- Provider name, NPI, PTAN
- Beneficiary name, MBI (Medicare Beneficiary Identifier)
- Date(s) of service, claim number (ICN)
- "REQUEST FOR REDETERMINATION" in subject line

Medicare-specific tone: Strict, procedural, citation-heavy. Reference CMS IOM publications, NCDs, and LCDs by exact identifier. The MAC reviewers are looking for procedural compliance. Avoid emotional or persuasive language — Medicare appeals are won on documentation and citation, not narrative.

Critical timing: Medicare redetermination must be requested within 120 days of the initial determination notice. Missing this deadline forfeits appeal rights at this level.

Citation precision: When citing CMS guidance, use exact format: "CMS IOM Pub. 100-02, Ch. 15, §60." Approximations or paraphrased citations are routinely rejected.
`,

  medicaid: `
## MEDICAID APPEAL FORMATTING

State-specific. Default to the state's Medicaid managed care organization (MCO) appeal address listed on the denial.

Submit to: The address on the denial letter. For NJ FamilyCare, MCO addresses vary by plan (Aetna Better Health, Horizon NJ Health, UnitedHealthcare Community Plan, WellCare).

Header requirements:
- Provider name, NPI, Medicaid provider ID
- Recipient name, Medicaid ID, DOB
- Date(s) of service, claim number
- Subject: "Provider Appeal — [State] Medicaid"

Medicaid-specific tone: Direct, state-regulation-focused. Cite the state Medicaid manual section where applicable. For NJ: N.J.A.C. 10:49 governs Medicaid provider appeals.

Critical timing: NJ FamilyCare provider appeal deadlines vary by MCO but commonly fall between 60 and 90 days from the denial date. Confirm on the actual denial letter.
`,

  default: `
## GENERAL PAYER FORMATTING

When the payer is unidentified or formatting requirements are unknown:

Submit to: The address listed on the denial letter or EOB.

Header requirements:
- Provider name, NPI, TIN
- Patient name, DOB, member ID, group number
- Claim number, date(s) of service
- Subject: "Formal Appeal of Denied Claim"

Closing: "We respectfully request reconsideration of this denial. Please contact our billing office at [phone] with any questions or required documentation."

When in doubt: keep the letter to one page, lead with the strongest clinical or procedural argument, and request a specific action (reverse the denial, reprocess the claim, or provide a written explanation of the denial reason).
`,
};

export function getPayerFormatting(payer: string): string {
  const normalized = payer.trim().toLowerCase();
  const validKeys: PayerKey[] = [
    "aetna",
    "unitedhealthcare",
    "bcbs",
    "cigna",
    "medicare",
    "medicaid",
  ];
  if (validKeys.includes(normalized as PayerKey)) {
    return PAYER_FORMATTING[normalized as PayerKey];
  }
  return PAYER_FORMATTING.default;
}
