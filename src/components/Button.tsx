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
    "inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary: "bg-white text-black hover:shadow-[0_0_30px_rgba(0,242,255,0.4)] shadow-[0_0_20px_rgba(0,242,255,0.2)]",
    secondary: "bg-[var(--neon-cyan)]/10 text-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/20 border border-[var(--neon-cyan)]/20 shadow-[0_0_20px_rgba(0,242,255,0.1)]",
    outline: "glass border-white/10 text-white/70 hover:text-white hover:border-white/30",
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
