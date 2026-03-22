"use client";

import { motion, AnimatePresence } from "framer-motion";

interface SplashScreenProps {
  isVisible: boolean;
}

export default function SplashScreen({ isVisible }: SplashScreenProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeOut" } }}
          className="fixed inset-0 z-[9999] bg-[#080c14] flex flex-col items-center justify-center"
        >
          {/* Animated grid backdrop */}
          <div className="absolute inset-0 tech-grid opacity-[0.03] pointer-events-none" />

          {/* Glow orbs */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col items-center gap-8 z-10"
          >
            {/* Logo / Monogram */}
            <motion.div
              animate={{
                borderRadius: ["30% 70% 70% 30%", "70% 30% 30% 70%", "30% 70% 70% 30%"],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-20 h-20 bg-slate-900 border border-sky-500/30 flex items-center justify-center shadow-[0_0_40px_rgba(14,165,233,0.15)]"
            >
              <span className="text-2xl font-bold text-sky-400 font-mono tracking-tighter">PO</span>
            </motion.div>

            {/* Name */}
            <div className="text-center space-y-1">
              <p className="text-white/80 font-mono text-sm tracking-[0.3em] uppercase">Initializing</p>
            </div>

            {/* Loading bar */}
            <div className="w-48 h-[2px] bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-sky-500 to-sky-400 rounded-full"
                initial={{ x: "-100%" }}
                animate={{ x: "0%" }}
                transition={{ duration: 1.0, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
