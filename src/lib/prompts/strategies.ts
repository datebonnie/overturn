import type { DenialCategory } from "./code-router";

export const APPEAL_STRATEGIES: Record<DenialCategory, string> = {
  medical_necessity: `
## MEDICAL NECESSITY APPEAL STRATEGY

Denial reason: The payer claims the service was not medically necessary.

This is the most common and most winnable denial category. Overturn rate when properly documented: 50-75%.

Your appeal must build a clinical narrative that explicitly maps the patient's condition to the criteria for the service rendered. The structure:

### Required Argument Structure (in order):

1. **Identify the patient's clinical state at the time of service** — Cite specific symptoms, signs, lab values, imaging findings, functional impairments, and comorbidities present in the chart notes provided. Be specific. "Patient presented with symptoms" is weak. "Patient presented with HbA1c of 9.2%, BMI of 38, and progressive lower extremity neuropathy documented over 6 months" is strong.

2. **State the standard of care for this clinical state** — Reference the relevant guideline. For example: "Per the American Diabetes Association Standards of Care 2024 (Section 11), patients with HbA1c above 9% require intensification of pharmacotherapy and structured medical management." Use real, verifiable guidelines only. Do not invent.

3. **Map the rendered service to the standard of care** — Explicitly connect the dots: "The CPT 99214 visit billed on [date] addressed precisely this intensification, including medication titration, foot exam, and care plan revision documented in the chart notes."

4. **Cite the specific CMS or payer policy that establishes coverage** — For Medicare denials, cite the relevant LCD/NCD if one exists. For commercial payers, cite their published medical policy bulletin if you can verify the bulletin number from the payer's actual documentation.

5. **Request the specific action** — "We respectfully request the denial dated [date] be reversed and the claim processed for payment in accordance with the patient's coverage."

### Citations to consider (use only those that genuinely apply):

- CMS IOM Pub. 100-02, Ch. 15, §60: Reasonable and necessary services
- CMS IOM Pub. 100-08, Ch. 13: Local Coverage Determinations
- 42 CFR 411.15(k): Medicare coverage criteria

### What to avoid:

- Generic statements like "this service was medically necessary." Show, don't assert.
- Vague references to "the chart notes" without naming specific findings.
- Citing guidelines you cannot verify.
- More than 1.5 pages of text.

### Tone:

Clinical, confident, citation-dense. You are a colleague writing to another professional, not a supplicant.
`,

  coding: `
## CODING DENIAL APPEAL STRATEGY

Denial reason: The payer claims the codes submitted are inconsistent, unsupported, or incorrect (often CARC 11, 16, B15).

Overturn rate when properly addressed: 70-85%. Coding denials are highly winnable because they are typically administrative.

### Required Argument Structure:

1. **Identify the specific coding objection** — Read the denial letter carefully. Did the payer claim the diagnosis doesn't support the procedure? That a modifier is missing? That two codes were unbundled? Name the exact objection.

2. **Verify the coding was correct** — If it was correct, state that. If it was incorrect, this isn't an appeal letter, it's a corrected claim resubmission. Tell the user.

3. **Provide the documentation supporting the codes** — Cite the chart note language that justifies the diagnosis-to-procedure linkage. For example: "The chart note dated [date] documents [finding], which corresponds to ICD-10 [code] and supports the medical necessity of CPT [code]."

4. **Reference the CPT or HCPCS coding manual** — Where applicable, cite the official coding guidance. For E/M services, reference the 2021 AMA E/M coding revisions if a level-of-service denial is involved.

5. **Request reprocessing with the documentation attached.**

### Citations to consider:

- AMA CPT Codebook (current year), specific section relevant to the code
- CMS NCCI (National Correct Coding Initiative) Policy Manual, current edition
- For modifier denials: CMS IOM Pub. 100-04, Ch. 12

### Tone:

Matter-of-fact. The argument is technical, not clinical. The payer has a procedural error. You are correcting it.
`,

  bundling: `
## BUNDLING / NCCI EDIT APPEAL STRATEGY

Denial reason: The payer claims one of the codes is bundled into another (CARC 97, B15) or violates an NCCI edit.

Overturn rate when modifier 59 or XS/XU/XE/XP is appropriately applicable: 60-80%.

### Required Argument Structure:

1. **Identify the alleged bundling pair** — Name both CPT codes the payer says should be bundled.

2. **Establish that the services were distinct** — Use the chart note to demonstrate one of:
   - Different anatomic site (modifier XS justification)
   - Different encounter or session (modifier XE justification)
   - Different practitioner (modifier XP justification)
   - Unusual non-overlapping service (modifier XU or 59 justification)

3. **Cite NCCI guidance** — The NCCI Policy Manual permits unbundling when documentation supports a distinct procedural service. Reference Chapter 1 of the NCCI Policy Manual (current edition) and the specific PTP edit table where relevant.

4. **Request reprocessing with the appropriate modifier appended.**

### What to avoid:

- Appending modifier 59 without documentation. The payer will deny again and may flag the practice for audit.
- Generic claims of "distinct service." Be anatomic, temporal, or procedural in your specificity.

### Tone:

Technical. This is a coding-rules conversation between professionals.
`,

  authorization: `
## PRIOR AUTHORIZATION APPEAL STRATEGY

Denial reason: The payer claims prior authorization was required and not obtained, or was obtained but is being retrospectively denied (CARC 197, 198, 199).

Overturn rate varies dramatically by sub-category:
- Retro-denial after prior auth granted: 80-95% overturn (highly winnable)
- Service genuinely required prior auth and none was obtained: 10-30% overturn (uphill)
- Emergency or urgent care exemption applies: 60-80% overturn

### Required Argument Structure (varies by sub-type):

**If prior auth WAS obtained:**

1. State the prior authorization number, date issued, and approving entity.
2. Quote the prior auth approval language verbatim.
3. Argue that retrospective denial after granted auth violates the payer's own contractual obligations.
4. Cite the payer's published prior authorization policy and the relevant state regulation if applicable. For NJ: N.J.A.C. 11:24-8.7 governs prior authorization conduct for HMOs.
5. Request reversal and immediate payment.

**If service was emergent or urgent:**

1. Establish the clinical urgency from the chart note (presenting symptoms, vital signs, severity indicators).
2. Cite the prudent layperson standard (42 USC 1395w-22(d)(3) for Medicare Advantage; ACA §2719A for ACA plans) which exempts emergency services from prior authorization.
3. Argue the service met the prudent layperson definition.
4. Request reversal.

**If prior auth genuinely should have been obtained:**

This is the hardest category. Argue:

1. The medical necessity is unambiguous and the service would have been authorized.
2. The patient's clinical state required action without delay.
3. Cite the payer's own retroactive authorization policy if one exists.
4. Request retroactive authorization review.

### Tone:

Where the payer is wrong (retro-denial after auth), be sharp and direct. Where the practice missed authorization, be measured and emphasize patient outcome.
`,

  timely_filing: `
## TIMELY FILING APPEAL STRATEGY

Denial reason: The payer claims the claim was filed after the contractual filing deadline (CARC 29).

Overturn rate: 30-60%. These are hard to win unless you have proof of timely filing.

### Required Argument Structure:

1. **Establish proof of timely original filing** — Provide the original claim submission date, clearinghouse acknowledgment, or EDI receipt confirmation. If the practice has 277CA acceptance from the clearinghouse within the filing window, this is a near-automatic overturn.

2. **If no proof exists, argue extenuating circumstances** — Common winning arguments:
   - Patient enrollment was retroactive and not communicated to the practice in time.
   - Coordination of benefits delay caused by another payer.
   - Provider was unaware of the patient's coverage at the time of service.
   - Initial claim was rejected by clearinghouse for non-substantive reasons.

3. **Cite the payer's good cause policy** — Most payers have published good cause exceptions to timely filing. Cite the specific provision.

### What to avoid:

- Don't appeal timely filing denials without proof or a real good cause argument. You'll lose and burn provider relations capital.

### Tone:

Procedural. Stick to dates and facts.
`,

  cob: `
## COORDINATION OF BENEFITS APPEAL STRATEGY

Denial reason: The payer claims another payer is primary, or that COB information is missing/incorrect (CARC 22, 109).

Overturn rate: 70-90%. Highly winnable because these are administrative.

### Required Argument Structure:

1. **State the correct primary payer** — Either the appealing payer is primary, or the other payer is primary and has already paid/denied.

2. **Provide the EOB from the primary payer** — If the other payer has processed, the secondary needs the primary EOB to coordinate. Submit it with the appeal.

3. **If the appealing payer is actually primary**, cite the relevant COB rule:
   - Birthday rule for dependent children (NAIC Model COB Regulation)
   - Active-employee rule for working-aged spouses
   - Medicare Secondary Payer rules at 42 USC 1395y(b)

4. **Request reprocessing as primary or secondary as appropriate.**

### Tone:

Administrative. This is a coordination problem, not a clinical one.
`,

  experimental: `
## EXPERIMENTAL / INVESTIGATIONAL APPEAL STRATEGY

Denial reason: The payer claims the service is experimental, investigational, or not evidence-based.

Overturn rate: 25-50%. Difficult but possible with strong evidence.

### Required Argument Structure:

1. **Establish that the service is NOT experimental in this clinical context** — Cite peer-reviewed literature, FDA approval status, professional society guidelines, and NCCN/ACP/AAFP recommendations as applicable.

2. **Distinguish your patient's case from any experimental indication** — Many services are FDA-approved and standard for indication A but considered experimental for indication B. Make sure your patient's indication is the approved one.

3. **Cite the payer's own published medical policy** — If their policy says the service is covered for this indication, quote it.

4. **For ACA plans, invoke external review rights** — 29 CFR 2590.715-2719 grants patients the right to external review of experimental denials. This is leverage.

5. **Request reversal and offer to provide additional clinical evidence.**

### Tone:

Evidence-driven. Citation-heavy. This is a literature argument.
`,

  non_covered: `
## NON-COVERED SERVICE APPEAL STRATEGY

Denial reason: The payer claims the service is not a covered benefit under the plan (CARC 96, 204).

Overturn rate: 20-40%. The hardest category because if the plan truly excludes the service, the appeal is uphill.

### Required Argument Structure:

1. **Verify the exclusion actually applies** — Read the plan's Summary Plan Description. Many "non-covered" denials are actually misapplied. The service may be covered with a specific modifier, place of service, or diagnosis.

2. **If the service IS covered**, cite the specific section of the plan document that establishes coverage.

3. **If the service is genuinely non-covered**, the appeal pathway is usually:
   - Request a benefit exception based on medical necessity (some plans grant these).
   - Argue the service is the only viable treatment for the patient's condition.
   - For ACA plans, invoke external review.
   - For state-regulated plans, invoke state insurance department review.

### Tone:

Measured. Acknowledge the apparent exclusion, then argue why it shouldn't apply.
`,

  duplicate: `
## DUPLICATE CLAIM APPEAL STRATEGY

Denial reason: The payer claims this claim is a duplicate of a previously processed claim (CARC 18).

Overturn rate: 80-95%. Almost always winnable because most "duplicates" aren't actually duplicates.

### Required Argument Structure:

1. **Identify the alleged original claim** — Get the claim number the payer is referencing.

2. **Establish that the services are distinct**:
   - Different date of service (most common reason for false duplicate flags)
   - Different procedure code
   - Different modifier
   - Different rendering provider
   - Different patient encounter

3. **Provide the chart documentation establishing the distinct service.**

4. **Request reprocessing.**

### Tone:

Direct. This is almost always an automated edit error on the payer's side.
`,

  other: `
## GENERAL APPEAL STRATEGY

For denial reasons not falling into a specific category above, apply this general framework:

1. State the claim details and the denial reason as the payer expressed them.

2. Identify what the payer needs to reverse the denial (additional information, corrected information, clinical justification).

3. Provide that information from the chart notes.

4. Cite any applicable guideline or policy.

5. Request reprocessing.

Keep the letter under 1 page. Be precise. Don't pad.
`,
};

export function getStrategy(category: DenialCategory): string {
  return APPEAL_STRATEGIES[category] || APPEAL_STRATEGIES.other;
}
