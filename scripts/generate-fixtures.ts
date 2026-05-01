/**
 * Generate 10 synthetic test fixtures for the appeal-generation flow.
 *
 *   docs/test-fixtures/
 *     01-medical-necessity-aetna/
 *       denial-letter.pdf
 *       chart-notes.txt
 *       meta.json
 *     ...etc
 *
 * Mandatory synthetic-data rules (per founder spec):
 *   - NPIs in the CMS test range 1000000000–1999999999
 *   - Member IDs like "TEST-1234-5678"
 *   - Practice names obviously synthetic
 *   - Fictional addresses
 *   - Dates of service in 2026
 *   - Header line in every text file: SYNTHETIC TEST DATA — NOT REAL PHI
 *
 * meta.json drives the validation script — it carries the expected
 * detected_category, payer, code, and confidence floor.
 *
 * Run:  npx tsx scripts/generate-fixtures.ts
 */

import { jsPDF } from "jspdf";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const FIXTURES_ROOT = path.resolve("docs/test-fixtures");

const HEADER = "SYNTHETIC TEST DATA — NOT REAL PHI";

type ExpectedCategory =
  | "medical_necessity"
  | "coding"
  | "bundling"
  | "authorization"
  | "timely_filing"
  | "cob"
  | "experimental"
  | "non_covered"
  | "other";

type ExpectedPayer =
  | "aetna"
  | "unitedhealthcare"
  | "bcbs"
  | "cigna"
  | "medicare"
  | "default";

type Fixture = {
  slug: string;
  description: string;
  payerLabel: string;
  payerAddress: string;
  denialDate: string;
  claimNumber: string;
  serviceDate: string;
  memberId: string;
  patientLast4: string;
  cptCodes: string[];
  icd10Codes: string[];
  reasonCode: string;
  reasonText: string;
  appealAddress: string;
  appealDeadlineText: string;
  chartNotes: string;
  expected: {
    detected_category: ExpectedCategory | null; // null = expected "other" / unknown
    detected_payer: ExpectedPayer;
    extracted_code: string | "unknown";
    confidence_floor: "high" | "medium" | "low"; // minimum acceptable
  };
};

// ─────────────────────────────────────────────────────────────────────────
// Shared synthetic practice info (used in chart notes for context)
// ─────────────────────────────────────────────────────────────────────────

const PRACTICE = {
  name: "Demo Family Medicine of NJ",
  address: "123 Test Lane, Sample City, NJ 07000",
  phone: "(555) 123-4567",
  npi: "1234567890", // CMS test-range
  tin: "12-3456789",
};

// ─────────────────────────────────────────────────────────────────────────
// Fixtures
// ─────────────────────────────────────────────────────────────────────────

const FIXTURES: Fixture[] = [
  // 1 — Medical Necessity (CO-50) — Aetna, CPT 99214, diabetes
  {
    slug: "01-medical-necessity-aetna",
    description:
      "Medical necessity denial. Aetna says 99214 isn't justified; chart shows poorly controlled T2DM with comorbidities.",
    payerLabel: "Aetna Health Inc.",
    payerAddress: "PO Box 14463, Lexington, KY 40512",
    denialDate: "2026-04-02",
    claimNumber: "A-2026-7842910",
    serviceDate: "2026-03-15",
    memberId: "TEST-1234-5678",
    patientLast4: "4471",
    cptCodes: ["99214"],
    icd10Codes: ["E11.9", "I10", "E11.40"],
    reasonCode: "CO-50",
    reasonText:
      "These services are non-covered services because this is not deemed a 'medical necessity' by the payer.",
    appealAddress: "Aetna Provider Appeals, PO Box 14463, Lexington, KY 40512",
    appealDeadlineText: "Appeal must be received within 180 days of this notice.",
    chartNotes: `${HEADER}

Practice: ${PRACTICE.name}
NPI: ${PRACTICE.npi}
Date of service: 2026-03-15
Patient ID (last 4): 4471
Provider: Sarah Chen, MD

CHIEF COMPLAINT
Follow-up for poorly controlled type 2 diabetes mellitus.

HISTORY OF PRESENT ILLNESS
58 y/o female with longstanding T2DM (E11.9) returns for medication
intensification. HbA1c drawn 03/01/2026 = 9.2% (up from 8.4% in
12/2025). Patient reports increased thirst and nocturia over last
6 weeks. She has been adherent to metformin 1000 mg BID and
lifestyle counseling but acknowledges weight gain (current BMI 38).
She also has hypertension (I10) on lisinopril 20 mg and early
diabetic neuropathy (E11.40) with bilateral foot tingling
documented since 2025-09.

EXAM
BP 148/92. BMI 38.1. Foot exam: decreased monofilament sensation
distally, no ulceration, pulses intact.

ASSESSMENT / PLAN
1. T2DM, uncontrolled (E11.9) — HbA1c 9.2% triggers intensification
   per ADA Standards of Care 2025 §11. Initiating semaglutide
   0.25 mg weekly. Counseled on injection technique and titration.
2. Hypertension (I10) — increase lisinopril to 30 mg.
3. Diabetic neuropathy (E11.40) — gabapentin 100 mg TID, follow-up
   neurology referral.
4. Comprehensive foot exam documented.
5. Diabetic care plan revised with patient education materials.

VISIT TIME / COMPLEXITY
35 minutes face-to-face. Moderate to high complexity decision-making
across three problems. Counseling and care coordination >50% of visit.
CPT 99214 selected per 2021 AMA E/M coding guidelines (high MDM:
multiple chronic illnesses with progression).

Plan: RTC 6 weeks for HbA1c recheck.
`,
    expected: {
      detected_category: "medical_necessity",
      detected_payer: "aetna",
      extracted_code: "50",
      confidence_floor: "medium",
    },
  },

  // 2 — Coding (CO-16) — UHC, missing modifier 25
  {
    slug: "02-coding-uhc",
    description:
      "Coding denial. UHC denied 99213 billed same day as 11042 (no modifier 25). Chart documents distinct E/M.",
    payerLabel: "UnitedHealthcare",
    payerAddress: "PO Box 30432, Salt Lake City, UT 84130",
    denialDate: "2026-04-12",
    claimNumber: "U-2026-1234567",
    serviceDate: "2026-04-02",
    memberId: "TEST-2345-6789",
    patientLast4: "5523",
    cptCodes: ["99213", "11042"],
    icd10Codes: ["S81.802A", "M54.5"],
    reasonCode: "CO-16",
    reasonText:
      "Claim/service lacks information or has submission/billing error which is needed for adjudication. The E/M service was not reported with an appropriate modifier when billed with a same-day procedure.",
    appealAddress:
      "UnitedHealthcare Provider Appeals, PO Box 30432, Salt Lake City, UT 84130",
    appealDeadlineText:
      "First-level appeals must be filed within 12 months of date of service.",
    chartNotes: `${HEADER}

Practice: ${PRACTICE.name}
NPI: ${PRACTICE.npi}
Date of service: 2026-04-02
Patient ID (last 4): 5523
Provider: James Park, DO

VISIT NOTE — Two distinct, separately identifiable encounters on same day.

ENCOUNTER 1: E/M for chronic low back pain (M54.5)
Patient is a 42 y/o male with 6-month history of mechanical low back
pain, evaluated today for ongoing symptoms unrelated to today's
laceration. Pain 6/10, worse with prolonged sitting. Discussed PT
referral, NSAID trial, and ergonomic adjustments. Reviewed prior
imaging from 2025-11. ROS otherwise unremarkable. ~15 min spent
on history, exam, and counseling for this complaint.

ASSESSMENT/PLAN (encounter 1):
- M54.5 chronic LBP — referring to PT, prescribing meloxicam 15 mg.
- Follow-up 4 weeks.

ENCOUNTER 2: Procedure — CPT 11042
Patient ALSO presented today with a fresh forearm laceration sustained
2 hours prior to visit (S81.802A — laceration, right forearm). Wound
debridement and complex repair performed under local anesthesia
(2% lidocaine). 4.5 cm laceration, debrided to subcutaneous tissue,
irrigated, closed in layers. Tetanus updated.

Documentation supports separately identifiable E/M (LBP follow-up)
distinct from same-day procedure (laceration repair). Modifier 25
should have been appended to 99213. Resubmitting with modifier 25.
`,
    expected: {
      detected_category: "coding",
      detected_payer: "unitedhealthcare",
      extracted_code: "16",
      confidence_floor: "medium",
    },
  },

  // 3 — Bundling (CO-97) — Cigna, 20610 bundled into 99213
  {
    slug: "03-bundling-cigna",
    description:
      "NCCI bundling denial. Cigna bundled 20610 into 99213. Chart shows distinct procedure (knee injection) at separate site from E/M (URI).",
    payerLabel: "Cigna",
    payerAddress: "PO Box 188011, Chattanooga, TN 37422",
    denialDate: "2026-04-14",
    claimNumber: "C-2026-3456789",
    serviceDate: "2026-04-10",
    memberId: "TEST-3456-7890",
    patientLast4: "7234",
    cptCodes: ["99213", "20610"],
    icd10Codes: ["J06.9", "M17.11"],
    reasonCode: "CO-97",
    reasonText:
      "The benefit for this service is included in the payment/allowance for another service/procedure that has already been adjudicated. Per NCCI edits, CPT 20610 is bundled into the same-day E/M service.",
    appealAddress:
      "Cigna Provider Reconsideration, PO Box 188011, Chattanooga, TN 37422",
    appealDeadlineText: "Appeal within 180 days of denial.",
    chartNotes: `${HEADER}

Practice: ${PRACTICE.name}
NPI: ${PRACTICE.npi}
Date of service: 2026-04-10
Patient ID (last 4): 7234
Provider: Sarah Chen, MD

CHIEF COMPLAINT
Two separate concerns: (1) acute upper respiratory infection,
(2) chronic right knee osteoarthritis pain.

ENCOUNTER 1 — Office visit (CPT 99213)
40 y/o male presents with 4-day history of nasal congestion, sore
throat, mild fever to 100.2°F. No SOB, no productive cough. Exam:
TM clear, oropharynx mildly erythematous, no exudate, lungs clear.
Diagnosed acute URI (J06.9). Symptomatic management discussed.

ENCOUNTER 2 — Therapeutic procedure (CPT 20610-XS)
Patient ALSO requested injection for ongoing R knee OA (M17.11),
documented since 2024. He has tried NSAIDs and PT without sufficient
relief. Standard intra-articular injection of right knee performed:
20610 — arthrocentesis/aspiration/injection, major joint. Sterile
prep, lateral approach, aspirated 5 mL serous fluid, injected
40 mg triamcinolone with 2 mL 1% lidocaine.

DOCUMENTATION OF DISTINCT SERVICES
- E/M (URI): different chief complaint, different diagnosis (J06.9),
  cognitive evaluation only.
- Injection (knee OA): separate diagnosis (M17.11), separate
  anatomic site (right knee, distinct from upper respiratory tract),
  procedural service with its own RVU value.

These services are independent and warrant unbundling per NCCI
Policy Manual Ch. 1. Modifier XS (separate structure) applied.
`,
    expected: {
      detected_category: "bundling",
      detected_payer: "cigna",
      extracted_code: "97",
      confidence_floor: "medium",
    },
  },

  // 4 — Authorization (CO-197) — BCBS retro-denial of MRI, prior auth granted
  {
    slug: "04-authorization-bcbs",
    description:
      "Authorization denial. BCBS retro-denied MRI knee but prior auth #PA-2026-04471 was actually granted on 2026-04-08.",
    payerLabel: "Horizon Blue Cross Blue Shield of New Jersey",
    payerAddress: "PO Box 820, Newark, NJ 07101",
    denialDate: "2026-04-22",
    claimNumber: "B-2026-4567890",
    serviceDate: "2026-04-12",
    memberId: "ABCJ-TEST-9012-3456",
    patientLast4: "8123",
    cptCodes: ["73721"],
    icd10Codes: ["M17.11", "S83.532A"],
    reasonCode: "CO-197",
    reasonText:
      "Precertification/authorization/notification absent. Service requires prior authorization which was not obtained.",
    appealAddress:
      "Horizon BCBS NJ Provider Appeals, PO Box 820, Newark, NJ 07101",
    appealDeadlineText: "Appeal within 180 days of denial.",
    chartNotes: `${HEADER}

Practice: ${PRACTICE.name}
NPI: ${PRACTICE.npi}
Date of service: 2026-04-12
Patient ID (last 4): 8123
Provider: James Park, DO

CHIEF COMPLAINT
Right knee MRI for evaluation of suspected medial meniscal tear.

PRIOR AUTHORIZATION RECORD
Prior authorization request submitted to Horizon BCBS NJ on
2026-04-06 by our office. Approved by Horizon BCBS NJ on 2026-04-08.

  Authorization number:   PA-2026-04471
  Approving entity:       Horizon BCBS NJ Utilization Management
  Service authorized:     CPT 73721 (MRI right knee, without contrast)
  Effective dates:        2026-04-08 through 2026-05-08
  Approval letter on file in patient record (received 2026-04-08).

CLINICAL CONTEXT
Patient with right knee OA (M17.11) and acute injury (S83.532A —
medial meniscus tear, right knee, initial encounter) sustained in a
fall on 2026-03-30. Failed conservative management (RICE, NSAIDs,
4 weeks PT). Persistent mechanical symptoms (locking, giving way).
MRI ordered to evaluate meniscal injury and guide surgical referral.

MRI was performed on 2026-04-12 within the authorization window.
Findings: medial meniscus complex tear, grade III chondral wear
medial femoral condyle. Patient referred to ortho.

The denial appears to be a retroactive reversal of an authorization
that was properly granted prior to service. Original authorization
letter (PA-2026-04471) is attached.
`,
    expected: {
      detected_category: "authorization",
      detected_payer: "bcbs",
      extracted_code: "197",
      confidence_floor: "medium",
    },
  },

  // 5 — Timely filing (CO-29) — Aetna, 277CA acceptance in window
  {
    slug: "05-timely-filing-aetna",
    description:
      "Timely filing denial. Aetna says claim filed late but practice has 277CA acceptance from clearinghouse within filing window.",
    payerLabel: "Aetna Health Inc.",
    payerAddress: "PO Box 14463, Lexington, KY 40512",
    denialDate: "2026-04-25",
    claimNumber: "A-2026-5678901",
    serviceDate: "2025-10-15",
    memberId: "TEST-5678-9012",
    patientLast4: "9912",
    cptCodes: ["99213"],
    icd10Codes: ["J20.9"],
    reasonCode: "CO-29",
    reasonText: "The time limit for filing has expired.",
    appealAddress: "Aetna Provider Appeals, PO Box 14463, Lexington, KY 40512",
    appealDeadlineText: "Appeal within 180 days of this denial notice.",
    chartNotes: `${HEADER}

Practice: ${PRACTICE.name}
NPI: ${PRACTICE.npi}
Date of service: 2025-10-15
Patient ID (last 4): 9912
Provider: Sarah Chen, MD

VISIT NOTE
Routine follow-up visit for acute bronchitis (J20.9), 99213. Visit
documentation complete and submitted to billing on 2025-10-16.

CLAIM FILING TIMELINE (FROM BILLING SYSTEM AUDIT TRAIL)

  2025-10-16  Initial 837P transmitted via Availity to Aetna.
              Submission ID: SUB-AETN-1015-99213-9912-001.

  2025-10-17  277CA acceptance received from Aetna clearinghouse.
              277CA Acceptance ID: 277CA-AETNA-202510170842-99912-A.
              Confirmation timestamp: 2025-10-17T08:42:13-04:00.

  2025-12-08  Aetna pended claim — requested medical records review.
              Records sent within 14 days (2025-12-22).

  2026-01-30  No response from Aetna. Practice resubmitted with
              cover letter referencing original 277CA acceptance.

  2026-04-25  Aetna issued denial citing CO-29 (timely filing).

EVIDENCE OF TIMELY ORIGINAL FILING
Aetna's stated timely filing limit on this product is 90 days from
date of service. DOS = 2025-10-15. 90-day window closed 2026-01-13.

Original claim was submitted 2025-10-16, the day after DOS.
277CA acceptance was received 2025-10-17 — 89 days inside the
window. Acceptance ID and submission timestamps preserved in the
Availity practice management report (attached).

The denial appears to disregard the original timely submission.
`,
    expected: {
      detected_category: "timely_filing",
      detected_payer: "aetna",
      extracted_code: "29",
      confidence_floor: "medium",
    },
  },

  // 6 — COB (CO-22) — Medicare, retired patient, no other coverage
  {
    slug: "06-cob-medicare",
    description:
      "Coordination of benefits denial. Medicare claims another payer is primary; patient is 67, retired, with Medicare Part B as sole coverage.",
    payerLabel: "Novitas Solutions, Inc. (Medicare Administrative Contractor)",
    payerAddress: "PO Box 3107, Mechanicsburg, PA 17055",
    denialDate: "2026-04-19",
    claimNumber: "M-2026-6789012",
    serviceDate: "2026-04-05",
    memberId: "1AB2-CD3-EF45", // synthetic MBI-like format
    patientLast4: "1078",
    cptCodes: ["99214"],
    icd10Codes: ["I25.10", "E78.5"],
    reasonCode: "CO-22",
    reasonText:
      "This care may be covered by another payer per coordination of benefits.",
    appealAddress: "Novitas Solutions, PO Box 3107, Mechanicsburg, PA 17055",
    appealDeadlineText:
      "Medicare redetermination must be requested within 120 days of the initial determination notice.",
    chartNotes: `${HEADER}

Practice: ${PRACTICE.name}
NPI: ${PRACTICE.npi}
Date of service: 2026-04-05
Patient ID (last 4): 1078
Provider: Sarah Chen, MD

INTAKE / COVERAGE VERIFICATION
67 y/o male, retired electrical contractor (worked at Northeast
Power until 2024-12-31; retirement confirmed at intake). Patient
reports no other active health coverage. Single coverage:
Traditional Medicare Part B (MBI on file).

NO EMPLOYER GROUP HEALTH PLAN
- Patient confirmed retirement effective 2024-12-31.
- Spouse status: widower since 2022; no spousal coverage.
- No COBRA election (lapsed 2025-06).
- No other private supplemental policy on file.

Per 42 USC 1395y(b) Medicare Secondary Payer rules, Medicare is
the primary and only payer.

VISIT NOTE
Follow-up for stable CAD (I25.10) and hyperlipidemia (E78.5).
Annual wellness components reviewed. Medications adjusted (atorvastatin
40 mg from 20 mg). 99214 billed appropriately for moderate complexity.

The CO-22 denial appears to be an MSP database mismatch. Patient
intake form (signed and dated 2026-04-05) confirming no other
coverage is attached.
`,
    expected: {
      detected_category: "cob",
      detected_payer: "medicare",
      extracted_code: "22",
      confidence_floor: "medium",
    },
  },

  // 7 — Experimental (CO-55) — Cigna, FDA-approved indication
  {
    slug: "07-experimental-cigna",
    description:
      "Experimental denial. Cigna labeled semaglutide for T2DM as experimental despite FDA approval.",
    payerLabel: "Cigna",
    payerAddress: "PO Box 188011, Chattanooga, TN 37422",
    denialDate: "2026-04-21",
    claimNumber: "C-2026-7890123",
    serviceDate: "2026-04-18",
    memberId: "TEST-7890-1234",
    patientLast4: "3344",
    cptCodes: ["99213"],
    icd10Codes: ["E11.65", "E66.01"],
    reasonCode: "CO-55",
    reasonText:
      "Procedure/treatment/drug is deemed experimental/investigational by the payer.",
    appealAddress:
      "Cigna Provider Reconsideration, PO Box 188011, Chattanooga, TN 37422",
    appealDeadlineText: "Appeal within 180 days of denial.",
    chartNotes: `${HEADER}

Practice: ${PRACTICE.name}
NPI: ${PRACTICE.npi}
Date of service: 2026-04-18
Patient ID (last 4): 3344
Provider: James Park, DO

CHIEF COMPLAINT
Type 2 diabetes mellitus with hyperglycemia, inadequately controlled
on dual oral therapy. Initiating GLP-1 agonist.

CLINICAL CONTEXT
51 y/o female with E11.65 (T2DM with hyperglycemia) and E66.01
(severe obesity, BMI 35.4). HbA1c 8.5% (today). Failed metformin
1000 mg BID + sitagliptin 100 mg daily after 9 months. Cardiovascular
risk profile elevated (HTN, dyslipidemia, family history of CAD).

INDICATION FOR SEMAGLUTIDE
Per ADA Standards of Care 2025 §11, GLP-1 receptor agonists are
recommended as second-line therapy for T2DM patients with HbA1c
above target despite metformin, especially in those with established
ASCVD risk factors or obesity. Semaglutide (Ozempic / Wegovy) is
FDA-approved for both type 2 diabetes mellitus (Ozempic, since 2017)
AND chronic weight management in patients with BMI ≥30 (Wegovy,
since 2021).

This patient meets BOTH FDA-approved indications:
- T2DM (E11.65) — Ozempic FDA-approved indication.
- Severe obesity (BMI 35.4, E66.01) — Wegovy FDA-approved indication.

Cigna's own published Coverage Policy on GLP-1 agonists (Coverage
Policy Number 0501) covers semaglutide for T2DM after metformin
failure. This patient's chart documents 9 months of metformin failure.

The CO-55 denial appears to mischaracterize semaglutide as
experimental. It is not — it has been FDA-approved for this exact
indication for nearly a decade.
`,
    expected: {
      detected_category: "experimental",
      detected_payer: "cigna",
      extracted_code: "55",
      confidence_floor: "medium",
    },
  },

  // 8 — Non-covered (CO-204) — UHC misapplied exclusion
  {
    slug: "08-non-covered-uhc",
    description:
      "Non-covered denial. UHC applied exclusion to physical therapy that the plan SPD specifically covers for the indication.",
    payerLabel: "UnitedHealthcare",
    payerAddress: "PO Box 30432, Salt Lake City, UT 84130",
    denialDate: "2026-04-26",
    claimNumber: "U-2026-8901234",
    serviceDate: "2026-04-22",
    memberId: "TEST-9012-3456",
    patientLast4: "5566",
    cptCodes: ["97110", "97140"],
    icd10Codes: ["M25.561", "S83.532A"],
    reasonCode: "CO-204",
    reasonText:
      "This service/equipment/drug is not covered under the patient's current benefit plan.",
    appealAddress:
      "UnitedHealthcare Provider Appeals, PO Box 30432, Salt Lake City, UT 84130",
    appealDeadlineText:
      "First-level appeals must be filed within 12 months of date of service.",
    chartNotes: `${HEADER}

Practice: ${PRACTICE.name}
NPI: ${PRACTICE.npi}
Date of service: 2026-04-22
Patient ID (last 4): 5566
Provider: Sarah Chen, MD (referring); Jordan Hayes, DPT (rendering)

CHIEF COMPLAINT
Outpatient physical therapy following acute meniscal injury and
documented pain.

CLINICAL CONTEXT
55 y/o female with right knee pain (M25.561) post medial meniscus
tear (S83.532A) sustained 2026-03-30. Conservative-first approach
ordered: 8-visit PT course before surgical evaluation. Today's
session: 4th visit.

SERVICES RENDERED
- 97110 (therapeutic exercise) — 30 minutes, 2 units. Closed-chain
  quad/hamstring strengthening, ROM progression.
- 97140 (manual therapy) — 15 minutes, 1 unit. Soft-tissue
  mobilization to medial joint line, scar tissue management.

Both codes documented with timed minutes and clinical rationale
per CMS billing guidance.

PLAN COVERAGE — REASON THIS DENIAL IS WRONG
Patient's UHC employer-sponsored Choice Plus plan (group # TEST-EMP-202)
explicitly covers outpatient PT for musculoskeletal injuries up to
60 visits per calendar year. This is the 4th visit. Per the plan
SPD §6.4 (Therapy Services), coverage applies when:
  (a) ordered by an in-network provider — YES, ordered by Sarah Chen, MD.
  (b) for a covered diagnosis — YES, S83.532A and M25.561 both covered.
  (c) by a licensed physical therapist — YES, Jordan Hayes, DPT.

The CO-204 denial appears to be an automated exclusion mismatched
to the wrong policy. Plan SPD section 6.4 (page 47) is attached.
`,
    expected: {
      detected_category: "non_covered",
      detected_payer: "unitedhealthcare",
      extracted_code: "204",
      confidence_floor: "medium",
    },
  },

  // 9 — Ambiguous (no CARC code)
  {
    slug: "09-ambiguous-no-carc",
    description:
      "Failure case: denial letter without a clear CARC code. Tests the 'unknown' routing path.",
    payerLabel: "Generic Health Plan Inc.",
    payerAddress: "PO Box 99999, Anywhere, USA 00000",
    denialDate: "2026-04-15",
    claimNumber: "G-2026-9999000",
    serviceDate: "2026-04-01",
    memberId: "TEST-0000-0000",
    patientLast4: "0000",
    cptCodes: ["99213"],
    icd10Codes: ["Z00.00"],
    reasonCode: "—",
    reasonText:
      "We have reviewed your claim and are unable to process it at this time. Please refer to your provider agreement and resubmit with appropriate supporting documentation.",
    appealAddress: "(No appeal address provided.)",
    appealDeadlineText: "(No appeal deadline stated.)",
    chartNotes: `${HEADER}

Practice: ${PRACTICE.name}
NPI: ${PRACTICE.npi}
Date of service: 2026-04-01
Patient ID (last 4): 0000

ROUTINE PREVENTIVE VISIT
Adult well-visit, age 38, female. No chronic conditions. Vitals normal.
ROS negative. PE unremarkable. Routine screening labs ordered.
No specific complaints. CPT 99213 reported.

(Standard chart note. Nothing about the denial reason here — this
fixture exercises the 'no CARC code' routing path, not the appeal
content quality.)
`,
    expected: {
      detected_category: null,
      detected_payer: "default",
      extracted_code: "unknown",
      confidence_floor: "low",
    },
  },

  // 10 — Insufficient chart notes (clear denial, weak documentation)
  {
    slug: "10-insufficient-chart-notes",
    description:
      "Failure case: denial is clear (CO-50 medical necessity) but chart notes are too vague to support a credible appeal. Tests low-confidence output.",
    payerLabel: "Aetna Health Inc.",
    payerAddress: "PO Box 14463, Lexington, KY 40512",
    denialDate: "2026-04-28",
    claimNumber: "A-2026-9999111",
    serviceDate: "2026-04-20",
    memberId: "TEST-1111-2222",
    patientLast4: "2222",
    cptCodes: ["99214"],
    icd10Codes: ["Z00.00"],
    reasonCode: "CO-50",
    reasonText:
      "These services are non-covered services because this is not deemed a 'medical necessity' by the payer.",
    appealAddress: "Aetna Provider Appeals, PO Box 14463, Lexington, KY 40512",
    appealDeadlineText: "Appeal within 180 days of this notice.",
    chartNotes: `${HEADER}

Practice: ${PRACTICE.name}
NPI: ${PRACTICE.npi}
Date of service: 2026-04-20
Patient ID (last 4): 2222

VISIT NOTE
Patient seen for follow-up.
Doing fine.
RTC PRN.

(Intentionally sparse chart note. No clinical findings, no diagnoses
specified beyond the routine code, no rationale documented for the
99214 level. Not enough material to support a medical-necessity appeal.)
`,
    expected: {
      detected_category: "medical_necessity",
      detected_payer: "aetna",
      extracted_code: "50",
      confidence_floor: "low",
    },
  },
];

// ─────────────────────────────────────────────────────────────────────────
// PDF rendering
// ─────────────────────────────────────────────────────────────────────────

function renderDenialPdf(f: Fixture): Buffer {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const margin = 56;
  const lineHeight = 14;
  const wrapWidth = 612 - margin * 2;
  let y = margin;

  const writeLine = (text: string, opts?: { bold?: boolean; size?: number }) => {
    doc.setFont("helvetica", opts?.bold ? "bold" : "normal");
    doc.setFontSize(opts?.size ?? 10);
    const lines = doc.splitTextToSize(text, wrapWidth);
    for (const line of lines) {
      if (y + lineHeight > 752 - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += lineHeight;
    }
  };

  const blank = (n = 1) => {
    y += lineHeight * n;
  };

  // Header watermark
  writeLine("SYNTHETIC TEST DATA — NOT REAL PHI", { bold: true, size: 9 });
  blank();

  // Payer header
  writeLine(f.payerLabel, { bold: true, size: 14 });
  writeLine(f.payerAddress);
  blank();

  writeLine(`Date: ${f.denialDate}`);
  writeLine("EXPLANATION OF BENEFITS — DENIAL OF CLAIM", { bold: true });
  blank();

  // Provider block
  writeLine("Provider:", { bold: true });
  writeLine(`${PRACTICE.name}`);
  writeLine(`NPI: ${PRACTICE.npi}`);
  writeLine(`TIN: ${PRACTICE.tin}`);
  writeLine(`Address: ${PRACTICE.address}`);
  blank();

  // Member block
  writeLine("Member / Patient:", { bold: true });
  writeLine(`Member ID: ${f.memberId}`);
  writeLine(`Patient identifier (last 4): ${f.patientLast4}`);
  blank();

  // Claim block
  writeLine("Claim:", { bold: true });
  writeLine(`Claim number: ${f.claimNumber}`);
  writeLine(`Date of service: ${f.serviceDate}`);
  writeLine(`Procedure code(s): ${f.cptCodes.join(", ")}`);
  writeLine(`Diagnosis code(s): ${f.icd10Codes.join(", ")}`);
  blank();

  // Denial reason
  writeLine("Reason for denial:", { bold: true });
  writeLine(`Reason code: ${f.reasonCode}`);
  writeLine(f.reasonText);
  blank();

  // Appeal address
  writeLine("Appeal information:", { bold: true });
  writeLine(`Submit appeals to: ${f.appealAddress}`);
  writeLine(f.appealDeadlineText);
  blank();

  writeLine(
    "This document is a synthetic test fixture for software development. " +
      "It does not represent a real claim, real patient, or real coverage decision.",
    { size: 8 },
  );

  return Buffer.from(doc.output("arraybuffer"));
}

// ─────────────────────────────────────────────────────────────────────────
// Write everything
// ─────────────────────────────────────────────────────────────────────────

function writeFixture(f: Fixture) {
  const dir = path.join(FIXTURES_ROOT, f.slug);
  mkdirSync(dir, { recursive: true });

  const pdfBuffer = renderDenialPdf(f);
  writeFileSync(path.join(dir, "denial-letter.pdf"), pdfBuffer);

  writeFileSync(path.join(dir, "chart-notes.txt"), f.chartNotes, "utf8");

  const meta = {
    description: f.description,
    expected: f.expected,
    practice_npi: PRACTICE.npi,
    fixture_version: 1,
  };
  writeFileSync(
    path.join(dir, "meta.json"),
    JSON.stringify(meta, null, 2) + "\n",
    "utf8",
  );

  console.log(`✓ ${f.slug}`);
}

function writeReadme() {
  const lines = [
    "# Test fixtures",
    "",
    "Generated by `scripts/generate-fixtures.ts`. Re-run any time; output is",
    "deterministic per fixture definition.",
    "",
    "All content is synthetic. Every text file starts with the line",
    "`SYNTHETIC TEST DATA — NOT REAL PHI`. NPI, member IDs, names, and",
    "addresses are fabricated. Do not use in production.",
    "",
    "## Fixtures",
    "",
    "| # | Slug | Expected category | Expected payer | Expected code | Confidence floor |",
    "|---|---|---|---|---|---|",
    ...FIXTURES.map((f, i) => {
      const e = f.expected;
      return `| ${String(i + 1).padStart(2, "0")} | \`${f.slug}\` | ${
        e.detected_category ?? "other (unknown)"
      } | ${e.detected_payer} | ${e.extracted_code} | ${e.confidence_floor} |`;
    }),
    "",
    "## Validation",
    "",
    "Run `npx tsx scripts/validate-routing.ts` after fixtures are present.",
    "It calls `generateAppeal()` against each and confirms the routing",
    "metadata matches `meta.json`.",
    "",
  ];
  writeFileSync(path.join(FIXTURES_ROOT, "README.md"), lines.join("\n"), "utf8");
}

(async () => {
  mkdirSync(FIXTURES_ROOT, { recursive: true });
  for (const f of FIXTURES) writeFixture(f);
  writeReadme();
  console.log(`\n${FIXTURES.length} fixtures written to ${FIXTURES_ROOT}`);
})();
