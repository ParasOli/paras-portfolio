"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline";
  href?: string;
  onClick?: () => void;
  className?: string;
  target?: string;
  type?: "button" | "submit" | "reset";
}

export default function Button({
  children,
  variant = "primary",
  href,
  onClick,
  className = "",
  target,
  type,
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-extrabold transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-strong)]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary:
      "btn-tactile bg-[var(--accent)] text-[var(--accent-ink)] hover:bg-[var(--accent-strong)]",
    secondary:
      "bg-[var(--accent-soft)] text-[#92700c] border border-[#f6e08a] hover:bg-[var(--accent)] hover:text-[var(--accent-ink)]",
    outline:
      "bg-white border border-[var(--border)] text-[var(--foreground)] hover:border-[var(--border-strong)] hover:bg-[var(--surface)] shadow-[var(--shadow-sm)]",
  };

  const Component = motion(href ? Link : "button");

  const props: any = {
    className: `${baseStyles} ${variants[variant]} ${className}`,
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
  };

  if (href) {
    props.href = href;
    if (target) {
      props.target = target;
      if (target === "_blank") {
        props.rel = "noreferrer";
      }
    }
  } else {
    props.onClick = onClick;
    props.type = type || "submit"; // Default to submit for buttons
  }

  return <Component {...props}>{children}</Component>;
}
