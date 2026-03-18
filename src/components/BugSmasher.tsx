"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaBug, FaGavel } from "react-icons/fa";

interface Bug {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

export default function BugSmasher() {
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [score, setScore] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const spawnBug = useCallback(() => {
    const id = Date.now() + Math.random();
    const newBug: Bug = {
      id,
      x: Math.random() * 80 + 10, // 10% to 90%
      y: Math.random() * 80 + 10,
      rotation: Math.random() * 360,
      scale: 0.5 + Math.random() * 0.5,
    };
    setBugs((prev) => [...prev.slice(-10), newBug]); // Keep max 10 bugs
  }, []);

  useEffect(() => {
    const interval = setInterval(spawnBug, 3000);
    return () => clearInterval(interval);
  }, [spawnBug]);

  const smashBug = (id: number) => {
    setBugs((prev) => prev.filter((b) => b.id !== id));
    setScore((s) => s + 1);
    
    // Trigger some haptic/sound if possible, or just visual
  };

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 cursor-none">
      <motion.div 
        className="fixed w-16 h-16 pointer-events-none z-50 rounded-full overflow-hidden border-2 border-sky-500 shadow-lg"
        style={{ left: mousePos.x, top: mousePos.y, x: "-50%", y: "-50%" }}
        animate={{ scale: bugs.some(b => Math.abs(b.x - (mousePos.x/window.innerWidth)*100) < 5) ? 1.2 : 1 }}
      >
        <img src="/profile.png" className="w-full h-full object-cover" />
      </motion.div>

      <AnimatePresence>
        {bugs.map((bug) => (
          <motion.div
            key={bug.id}
            initial={{ opacity: 0, scale: 0, rotateX: 0, rotateY: 0 }}
            animate={{ 
              opacity: [0, 0.4, 0.4, 0], 
              scale: [0, bug.scale, bug.scale, 0],
              x: `${bug.x}%`, 
              y: `${bug.y}%`,
              rotate: bug.rotation,
              rotateX: [0, 45, -45, 0],
              rotateY: [0, -45, 45, 0],
            }}
            transition={{ duration: 5, ease: "easeInOut" }}
            exit={{ 
              opacity: 0, 
              scale: 2, 
              rotateZ: 180,
              filter: "blur(20px)"
            }}
            whileHover={{ scale: bug.scale * 1.5, opacity: 0.8 }}
            onClick={(e) => {
              e.stopPropagation();
              smashBug(bug.id);
            }}
            className="absolute pointer-events-auto cursor-none p-4 group"
            style={{ left: 0, top: 0, perspective: "1000px" }}
          >
            <div className="relative transform-gpu">
              <FaBug className="text-red-500/40 group-hover:text-red-400 transition-colors drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]" size={60} />
              <div className="absolute -inset-4 bg-red-500/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Global Score Indicator (Very Subtle) */}
      <div className="absolute bottom-10 right-10 flex flex-col items-end opacity-20 hover:opacity-100 transition-opacity">
        <span className="text-[10px] font-mono text-white/40 uppercase tracking-[0.3em]">Operational_Stability</span>
        <span className="text-2xl font-bold text-sky-400 font-mono">BUGS_SQUASHED: {score}</span>
      </div>
    </div>
  );
}
