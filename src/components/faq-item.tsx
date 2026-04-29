"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";

type FaqItemProps = {
  question: string;
  answer: string;
};

export function FaqItem({ question, answer }: FaqItemProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const buttonId = useId();

  return (
    <div className="border-b border-navy-100">
      <h3>
        <button
          id={buttonId}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-6 py-6 text-left transition-colors hover:text-accent-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 rounded-sm"
        >
          <span className="text-lg font-semibold tracking-tight text-navy-800 sm:text-xl">
            {question}
          </span>
          <ChevronDown
            aria-hidden="true"
            className={`h-5 w-5 flex-shrink-0 text-navy-400 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!open}
        className="pb-6 pr-9"
      >
        <p className="text-base leading-relaxed text-slate-600">{answer}</p>
      </div>
    </div>
  );
}
