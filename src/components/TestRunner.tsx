"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const terminalLines = [
  { text: "> cross-env NODE_ENV=test playwright test", type: "command" },
  { text: "Running 12 tests using 4 workers", type: "info" },
  { text: "✓ [chromium] › login.spec.ts:12:1 › user should login (450ms)", type: "success" },
  { text: "✓ [webkit] › api/orders.spec.ts:45:5 › should fetch history (320ms)", type: "success" },
  { text: "✓ [firefox] › checkout.spec.ts:110:3 › partial checkout flow (1.2s)", type: "success" },
  { text: "!", type: "warning", message: "Warning: Deprecated API usage in auth.ts:56" },
  { text: "✓ [chromium] › accessibility.spec.ts:22:1 › passes WCAG 2.1 (890ms)", type: "success" },
  { text: "12 passed (2.4s)", type: "summary" },
  { text: "Waiting for changes...", type: "info" },
];

export default function TestRunner() {
  const [visibleLines, setVisibleLines] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleLines(prev => (prev < terminalLines.length ? prev + 1 : 0));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="terminal-window w-full h-[320px] md:h-[400px]">
      <div className="terminal-header">
        <div className="dot red" />
        <div className="dot yellow" />
        <div className="dot green" />
        <span className="ml-4 text-[10px] text-white/30 uppercase tracking-[0.2em] font-mono">pw-test-runner --v1.42</span>
      </div>
      <div className="p-6 font-mono text-[11px] md:text-xs leading-relaxed overflow-y-auto h-[calc(100%-40px)] custom-scrollbar">
        <AnimatePresence initial={false}>
          {terminalLines.slice(0, visibleLines).map((line, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`mb-1.5 flex gap-3 ${
                line.type === "success" ? "text-emerald-400" :
                line.type === "command" ? "text-sky-400" :
                line.type === "warning" ? "text-amber-400" :
                line.type === "summary" ? "text-white font-bold" :
                "text-white/50"
              }`}
            >
              <span className="shrink-0 opacity-20">$</span>
              <span>
                {line.text}
                {line.message && <span className="block text-[10px] opacity-60 ml-2 mt-1 italic">{line.message}</span>}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="inline-block w-2 h-4 bg-white/40 ml-1 translate-y-1"
        />
      </div>
    </div>
  );
}
