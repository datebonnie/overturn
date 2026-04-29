"use client";

import { type ReactNode } from "react";
import { useReveal } from "@/hooks/use-reveal";

type RevealProps = {
  children: ReactNode;
  className?: string;
};

export function Reveal({ children, className = "" }: RevealProps) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "reveal-visible" : ""} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
