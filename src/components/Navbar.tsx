"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed top-0 w-full z-50 px-6 py-6 pointer-events-none">
      <nav
        className={`max-w-4xl mx-auto h-16 flex items-center justify-between px-8 rounded-full transition-all duration-700 pointer-events-auto relative ${
          scrolled 
            ? "glass shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-white/10 scale-[0.98] mt-2" 
            : "bg-white/5 border border-white/5"
        }`}
      >
        <div className="scanner-line opacity-[0.1] rounded-full" />
        <Link href="/" className="text-xl font-bold tracking-tighter hover:opacity-70 transition-opacity flex items-center gap-2 group relative">
          <motion.div 
            animate={{ rotate: [0, 90, 180, 270, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-[var(--neon-cyan)]/50 transition-colors"
          >
            <span className="text-xs text-[var(--neon-cyan)] neon-text">P</span>
          </motion.div>
          <span className="group-hover:text-[var(--neon-cyan)] transition-colors text-gradient">Paras<span className="text-white/40 group-hover:text-[var(--neon-cyan)]/40">Oli</span></span>
        </Link>
        
        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative px-4 py-2 text-xs font-bold tracking-[0.1em] uppercase transition-all rounded-full ${
                pathname === link.href ? "text-[var(--neon-cyan)] neon-text" : "text-white/40 hover:text-white"
              }`}
            >
              {pathname === link.href && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 bg-white/5 border border-white/10 rounded-full -z-10 shadow-[0_0_20px_rgba(0,242,255,0.1)]"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              {link.label}
            </Link>
          ))}
        </div>
        
        {/* Mobile menu button */}
        <button 
          className="md:hidden p-2 text-white/50 hover:text-white transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <div className="w-5 h-4 flex flex-col justify-between">
            <span className={`w-full h-0.5 bg-current rounded-full transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
            <span className={`w-full h-0.5 bg-current rounded-full transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
            <span className={`w-full h-0.5 bg-current rounded-full transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </div>
        </button>
      </nav>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="md:hidden mt-4 max-w-sm mx-auto glass rounded-3xl overflow-hidden pointer-events-auto shadow-2xl border-white/10"
          >
            <div className="flex flex-col p-4 gap-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-6 py-4 rounded-2xl text-lg font-medium transition-all ${
                    pathname === link.href ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
