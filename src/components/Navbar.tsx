"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { useProfile } from "@/context/ProfileContext";

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

  const { profile, isLoading } = useProfile();
  const [imageLoaded, setImageLoaded] = useState(false);
  const profilePhoto = profile?.photo_url;

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
        className={`max-w-4xl mx-auto h-16 flex items-center justify-between px-8 rounded-full transition-all duration-700 pointer-events-auto relative mt-4 md:mt-6 ${
          scrolled 
            ? "bg-slate-900/90 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] border-white/10 scale-[0.98]" 
            : "bg-white/5 border border-white/5 shadow-lg backdrop-blur-md"
        }`}
      >
        <div className="scanner-line opacity-[0.1] rounded-full" />
        <Link href="/" className="text-xl font-bold tracking-tighter hover:opacity-70 transition-opacity flex items-center gap-4 group relative">
          <motion.div 
            animate={{ 
              borderRadius: ["30% 70% 70% 30%", "70% 30% 30% 70%", "30% 70% 70% 30%"]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="w-10 h-10 bg-slate-900 border border-sky-500/30 flex items-center justify-center transition-colors overflow-hidden shrink-0 shadow-[0_0_15px_rgba(14,165,233,0.2)]"
          >
            {profilePhoto ? (
              <div className="w-full h-full relative">
                <div className={`absolute inset-0 bg-slate-800 flex items-center justify-center animate-pulse transition-opacity duration-500 ${imageLoaded ? 'opacity-0' : 'opacity-100'}`}>
                  <span className="text-xs font-bold text-sky-400 font-mono">P</span>
                </div>
                <Image 
                  src={profilePhoto} 
                  alt="P" 
                  width={40} 
                  height={40} 
                  className={`object-cover w-full h-full scale-110 transition-opacity duration-700 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`} 
                  onLoad={() => setImageLoaded(true)}
                  quality={90} 
                  priority
                />
              </div>
            ) : (
              <div className="w-full h-full bg-slate-800 flex items-center justify-center animate-pulse">
                <span className="text-xs font-bold text-sky-400 font-mono">P</span>
              </div>
            )}
          </motion.div>

          <span className="text-white font-bold tracking-tight">Paras<span className="text-slate-500">Oli</span></span>
        </Link>
        
        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative px-4 py-2 text-[10px] font-bold tracking-[0.2em] uppercase transition-all rounded-lg ${
                pathname === link.href ? "text-sky-400" : "text-slate-400 hover:text-white"
              }`}
            >
              {pathname === link.href && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 bg-slate-800/50 border border-slate-700/50 rounded-lg -z-10 shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
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
            className="md:hidden mt-4 max-w-sm mx-auto bg-slate-900/95 backdrop-blur-2xl rounded-3xl overflow-hidden pointer-events-auto shadow-2xl border border-white/10"
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
