"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheck } from "react-icons/fa";

const testCases = [
  { name: "user should log in", file: "login.spec.ts", ms: 450 },
  { name: "should fetch order history", file: "api/orders.spec.ts", ms: 320 },
  { name: "partial checkout flow", file: "checkout.spec.ts", ms: 1200 },
  { name: "passes WCAG 2.1 AA", file: "a11y.spec.ts", ms: 890 },
  { name: "handles expired token", file: "auth.spec.ts", ms: 210 },
];

export default function TestRunner() {
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible((prev) => (prev < testCases.length ? prev + 1 : 0));
    }, 1100);
    return () => clearInterval(interval);
  }, []);

  const passed = Math.min(visible, testCases.length);
  const done = visible >= testCases.length;

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-2 text-xs font-bold text-[var(--faint)]">cypress · e2e</span>
        </div>
        <span className={`text-xs font-black px-2.5 py-1 rounded-full transition-colors ${done ? "bg-[var(--pass-soft)] text-[#15803d]" : "bg-[var(--surface-2)] text-[var(--faint)]"}`}>
          {done ? "PASS" : "running…"}
        </span>
      </div>

      {/* Test rows */}
      <div className="p-3 min-h-[240px]">
        <AnimatePresence initial={false}>
          {testCases.slice(0, visible).map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--surface)] transition-colors"
            >
              <span className="shrink-0 w-5 h-5 rounded-full bg-[var(--pass-soft)] flex items-center justify-center">
                <FaCheck size={9} className="text-[var(--pass)]" />
              </span>
              <span className="flex-1 text-sm font-bold text-[var(--foreground)] truncate">{t.name}</span>
              <span className="text-[11px] font-mono text-[var(--faint)] shrink-0">{t.ms}ms</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer summary */}
      <div className="px-5 py-3 border-t border-[var(--border)] bg-[var(--surface)] flex items-center justify-between">
        <span className="text-xs font-bold text-[var(--muted)]">
          <span className="text-[var(--pass)] font-black">{passed}</span> / {testCases.length} passing
        </span>
        <span className="text-xs font-mono text-[var(--faint)]">✓ no flakes</span>
      </div>
    </div>
  );
}
