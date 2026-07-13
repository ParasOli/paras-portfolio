"use client";

import { motion, AnimatePresence } from "framer-motion";
import Logo from "@/components/Logo";

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
          className="fixed inset-0 z-[9999] bg-[var(--background)] warm-glow flex flex-col items-center justify-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col items-center gap-8 z-10"
          >
            <div className="animate-float-slow">
              <Logo size={64} />
            </div>

            {/* Loading bar */}
            <div className="w-40 h-1.5 bg-[var(--surface-2)] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[var(--accent)] rounded-full"
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
