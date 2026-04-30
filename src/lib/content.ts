export const content = {
  brand: {
    name: "Overturn",
    domain: "hioverturn.com",
    tagline: "Every denial deserves a fight.",
    email: "hello@hioverturn.com",
    legalName: "Overturn Solutions LLC",
  },

  nav: {
    links: [
      { label: "Pricing", href: "#pricing" },
      { label: "How it works", href: "#how-it-works" },
    ],
    cta: { label: "Join the waitlist", href: "#waitlist" },
  },

  hero: {
    eyebrow: "FOR SMALL MEDICAL PRACTICES",
    headline: "Stop letting insurers steal your revenue.",
    subheadline:
      "Overturn turns denied claims into winning appeals in 60 seconds. Built for practices that lose six figures a year to denied claims they never appeal.",
    primaryCta: { label: "Join the waitlist", href: "#waitlist" },
    secondaryCta: { label: "See how it works", href: "#how-it-works" },
    socialProof:
      "Built for the 200,000+ small practices losing $20B/year to denied claims.",
    mockup: {
      pill: "DENIED CLAIM",
      status: "Appeal generated in 47 seconds",
      letterTitle: "Appeal Letter — Claim #A-7842910",
      letterBody: [
        "RE: Denial of CPT 99214 — Patient ID 4471",
        "",
        "To Whom It May Concern,",
        "",
        "We respectfully appeal the denial of the above-referenced claim, dated 04/12/2026, citing reason code CO-50 (medical necessity not established).",
        "",
        "Per CMS guideline IOM 100-02, Ch. 15 §60, and the patient's documented chronic conditions (E11.9, I10), the services rendered meet the threshold for medical necessity. Attached chart notes from 03/28/2026 confirm symptom progression and clinical decision-making consistent with a Level 4 office visit.",
      ],
    },
  },

  problem: {
    eyebrow: "THE INSURANCE COMPANY HAS THE ADVANTAGE",
    headline: "Your practice is fighting a machine with a fax machine.",
    stats: [
      {
        value: "94%",
        label: "of patients have care delayed by prior authorization",
      },
      {
        value: "13 hours",
        label: "wasted per physician per week on denials and appeals",
      },
      {
        value: "$20 billion",
        label: "lost annually to unrecovered denied claims",
      },
    ],
    paragraph:
      "Insurers have AI denying your claims at machine speed. You have a billing manager with 14 tabs open. The math doesn't work. We built Overturn to even the fight.",
  },

  howItWorks: {
    eyebrow: "HOW IT WORKS",
    headline: "Three steps. Sixty seconds. One overturned denial.",
    steps: [
      {
        number: "01",
        title: "Upload the denial",
        body: "Drag and drop the denial letter PDF. We extract the reason code, payer, and patient info automatically.",
      },
      {
        number: "02",
        title: "Add the chart notes",
        body: "Paste or upload the relevant clinical documentation. Overturn matches it to medical necessity criteria.",
      },
      {
        number: "03",
        title: "Generate and send",
        body: "Get a payer-formatted appeal letter with the right CMS guidelines, citations, and language. Edit if you want. Send and win.",
      },
    ],
    callout:
      "No EHR integration. No 6-month rollout. No five-figure setup fee. You're appealing denials by Tuesday.",
  },

  whyItWins: {
    eyebrow: "WHY OVERTURN",
    headline: "The shortest path between a denial and a check.",
    features: [
      {
        title: "Live in 10 minutes, not 6 months",
        body: "No EHR integration project. No IT ticket. No vendor onboarding call. Sign up, upload your first denial, send your first appeal before your coffee gets cold.",
      },
      {
        title: "Payer-specific intelligence",
        body: "Aetna, BCBS, UHC, Cigna, Medicare. Each appeal is formatted to that insurer's requirements.",
      },
      {
        title: "HIPAA compliant from day one",
        body: "BAA included. Encrypted at rest and in transit. Your patient data never trains any model.",
      },
      {
        title: "Built for the people doing the work, not the people buying the EHR",
        body: "Hospital software gets sold to administrators. Overturn gets used by the biller staring down 40 denials at 4pm. We built every screen for the person actually clicking the button, not the one signing the contract.",
      },
    ],
  },

  pricing: {
    eyebrow: "PRICING",
    headline: "One price. Unlimited appeals. No per-claim charges.",
    plan: {
      name: "Practice",
      price: "$199",
      period: "/month",
      features: [
        "Unlimited appeal generation",
        "All major payers supported",
        "HIPAA-compliant infrastructure",
        "Automatic deadline tracking",
        "Payer-specific formatting",
        "Priority email support",
        "14-day free trial, no credit card required",
        "Cancel anytime",
      ],
      cta: { label: "Join the waitlist", href: "#waitlist" },
    },
    roi: {
      heading: "The math, not the marketing.",
      body: "At a $250 average denied claim, 1 overturn covers your month. The typical small practice has 25–90 appealable denials sitting unworked every month.",
    },
  },

  faq: {
    eyebrow: "QUESTIONS",
    headline: "What practices ask before signing up.",
    items: [
      {
        question: "Is this HIPAA compliant?",
        answer:
          "Yes — and we go further. We process patient data, we don't archive it. Your chart notes and denial PDFs are deleted within 24 hours of appeal generation. We retain only the appeal letter you approved and the metadata needed to track deadlines and outcomes. Everything is encrypted at rest and in transit, stored in HIPAA-eligible infrastructure with a signed BAA, and never used to train any model.",
      },
      {
        question: "What patient data do you actually store?",
        answer:
          "Three things: (1) the appeal letter you approved, so you can resubmit or audit it later; (2) the metadata required for tracking — claim ID, payer, reason code, deadlines, outcome; (3) your account data — practice name, users, billing. Chart notes, denial PDFs, and any other source documents you upload are deleted within 24 hours of appeal generation. We do not maintain a long-term archive of patient clinical data.",
      },
      {
        question: "What payers do you support?",
        answer:
          "All major commercial payers (Aetna, BCBS, UHC, Cigna, Humana, Anthem) plus Medicare and most state Medicaid programs. If your top payer isn't listed, we'll add it within 5 business days.",
      },
      {
        question: "Do I need to integrate with my EHR?",
        answer:
          "No. Overturn works as a standalone tool. Drag, drop, generate. If you want EHR integration later, we'll build it for the practices that need it.",
      },
      {
        question: "What if the AI gets the appeal wrong?",
        answer:
          "Every appeal is reviewed by you before sending. Overturn drafts in 60 seconds; your billing team approves and submits. The AI never communicates directly with payers.",
      },
      {
        question: "How is this different from my billing software?",
        answer:
          "Most billing platforms charge 4-8% of collections to handle the entire revenue cycle. Overturn does one thing: generate winning appeals. We're an order of magnitude cheaper because we're focused.",
      },
      {
        question: "Can I cancel anytime?",
        answer:
          "Yes. Cancel any time before your next quarter — no penalty, no questions. Founding members keep their rate forever, even if they cancel and come back later.",
      },
      {
        question: "Is Overturn live today?",
        answer:
          "Not yet — we're building. Join the waitlist to be among the first 100 practices to get access. We'll email you the moment it's ready.",
      },
    ],
  },

  finalCta: {
    headline: "Stop writing appeals by hand.",
    subhead: "Be among the first 100 practices to get access.",
    placeholder: "you@yourpractice.com",
    button: "Join the waitlist",
    footnote: "We'll never spam you. Unsubscribe anytime.",
    success: "You're on the list. We'll reach out within 48 hours.",
  },

  footer: {
    tagline: "Every denial deserves a fight.",
    copyright: "© 2026 Overturn Solutions LLC",
    columns: [
      {
        title: "Product",
        links: [
          { label: "Pricing", href: "#pricing" },
          { label: "How it works", href: "#how-it-works" },
          { label: "FAQ", href: "#faq" },
        ],
      },
      {
        title: "Company",
        links: [
          { label: "About", href: "/about" },
          { label: "Privacy", href: "/privacy" },
          { label: "Terms", href: "/terms" },
          { label: "hello@hioverturn.com", href: "mailto:hello@hioverturn.com" },
        ],
      },
    ],
    disclaimer:
      "Overturn is not affiliated with any insurance carrier. We help practices submit appeals; we do not guarantee approval outcomes.",
  },

  waitlistForm: {
    fields: {
      email: { label: "Work email", placeholder: "you@yourpractice.com" },
      practiceName: {
        label: "Practice name",
        placeholder: "Cedar Family Medicine",
      },
      role: {
        label: "Your role",
        options: [
          "Owner",
          "Practice Manager",
          "Biller",
          "Physician",
          "Other",
        ],
      },
      specialty: {
        label: "Specialty",
        options: [
          "Family Medicine",
          "Internal Medicine",
          "Pediatrics",
          "Behavioral Health",
          "Dental",
          "OT/PT",
          "Other",
        ],
      },
      claimVolume: {
        label: "Monthly claim volume",
        options: ["<100", "100-500", "500-1000", "1000+"],
      },
    },
    submit: "Join the waitlist",
    success: "You're on the list. We'll reach out within 48 hours.",
    error: "Something went wrong. Please try again.",
  },
} as const;
