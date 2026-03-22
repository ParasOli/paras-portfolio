"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useProfile } from "@/context/ProfileContext";
import TestRunner from "@/components/TestRunner";
import Typewriter from "@/components/Typewriter";
import Button from "@/components/Button";
import PageTransition from "@/components/PageTransition";
import CountUp from "@/components/CountUp";
import Link from "next/link";
import { FaArrowRight, FaGithub, FaLinkedin, FaEnvelope, FaFileDownload } from "react-icons/fa";
import { parseBio, downloadFile } from "@/lib/utils";

export default function Home() {
  const { profile, isLoading } = useProfile();
  const [imageLoaded, setImageLoaded] = useState(false);


  const { cleanBio, terms, services, email, cvFilename } = parseBio(profile?.bio || "");

  return (
    <PageTransition>
      <div className="min-h-[90vh] relative overflow-hidden flex flex-col justify-center px-6 lg:px-20 max-w-[1600px] mx-auto pt-24 md:pt-0">
        {/* Decorative Grid */}
        <div className="absolute inset-0 tech-grid opacity-[0.02] pointer-events-none" />
        
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center z-10 py-12 lg:py-0">
          {/* Left Column: Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-8 md:gap-12"
          >
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest font-mono text-emerald-400">Available for Projects</span>
                </div>
                <div className="px-3 py-1 bg-sky-500/10 border border-sky-500/20 rounded-full flex items-center gap-2">
                  <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest font-mono text-sky-400">Freelancer / Remote</span>
                </div>
              </div>

              <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white leading-[0.9]">
                Quality <br />
                <span className="text-sky-500 italic">Engineering_</span>
              </h1>
              
              <div className="h-[1.5em] text-xl md:text-2xl text-slate-400 font-mono flex items-center gap-2">
                <span className="text-slate-600 font-bold tracking-tighter">&gt;</span>
                <Typewriter 
                  words={terms}
                  typingSpeed={80}
                  deletingSpeed={40}
                  delayBetweenWords={2000}
                />
              </div>

              <p className="text-lg md:text-xl text-slate-500 max-w-xl leading-relaxed font-light">
                {cleanBio || "Architecting digital resilience through high-precision testing frameworks and autonomous quality systems."}
              </p>
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              <Link href="/projects">
                <button className="h-14 px-8 bg-white text-black font-bold rounded-2xl hover:bg-sky-400 hover:text-white transition-all transform hover:scale-105 flex items-center gap-3">
                  View Projects <FaArrowRight />
                </button>
              </Link>
              {profile?.cv_url && (
                <div className="relative group/cv">
                  <button
                    onClick={() => downloadFile(profile.cv_url!, cvFilename || "Paras_Oli_CV.pdf")}
                    className="h-14 w-14 bg-white/5 border border-white/10 rounded-2xl hover:border-sky-500/50 hover:bg-sky-500/10 hover:text-sky-400 text-slate-400 transition-all flex items-center justify-center"
                    aria-label="Download CV"
                  >
                    <FaFileDownload size={20} />
                  </button>
                  <span className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold text-sky-400 bg-slate-900 border border-white/10 px-3 py-1 rounded-lg opacity-0 group-hover/cv:opacity-100 transition-opacity pointer-events-none uppercase tracking-widest">
                    Download CV
                  </span>
                </div>
              )}
              <div className="flex gap-6 items-center">
                {profile?.github_url && (
                  <a href={profile.github_url} target="_blank" rel="noreferrer" className="text-slate-600 hover:text-white transition-all transform hover:scale-110">
                    <FaGithub size={28} />
                  </a>
                )}
                {profile?.linkedin_url && (
                  <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="text-slate-600 hover:text-white transition-all transform hover:scale-110">
                    <FaLinkedin size={28} />
                  </a>
                )}
                {email && (
                  <a href={`mailto:${email}`} className="text-slate-600 hover:text-white transition-all transform hover:scale-110">
                    <FaEnvelope size={28} />
                  </a>
                )}
              </div>
            </div>

            {/* Tech Stats: Premium Cards */}
            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="bg-slate-900/40 backdrop-blur-md py-6 px-8 rounded-3xl border border-white/5 flex flex-col items-start gap-2 group hover:border-sky-500/30 transition-all">
                <span className="text-4xl md:text-5xl font-bold text-white tracking-tighter font-mono">
                  <CountUp end={500} suffix="+" />
                </span>
                <span className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-mono group-hover:text-sky-400 transition-colors">Tests_Engineered</span>
              </div>
              <div className="bg-slate-900/40 backdrop-blur-md py-6 px-8 rounded-3xl border border-white/5 flex flex-col items-start gap-2 group hover:border-emerald-500/30 transition-all">
                <span className="text-4xl md:text-5xl font-bold text-white tracking-tighter font-mono">
                  <CountUp end={99.9} suffix="%" />
                </span>
                <span className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-mono group-hover:text-emerald-400 transition-colors">System_Stability</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Visual Centerpiece */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative flex flex-col gap-8"
          >
            {/* Integrated Photo & Info Panel */}
            <div className="relative group">
              <motion.div 
                animate={{ 
                  borderRadius: ["30% 70% 70% 30% / 30% 30% 70% 70%", "70% 30% 30% 70% / 70% 70% 30% 30%", "30% 70% 70% 30% / 30% 30% 70% 70%"]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="relative w-full aspect-square md:w-[480px] md:h-[480px] mx-auto bg-slate-900 border-2 border-white/5 overflow-hidden shadow-2xl flex items-center justify-center p-2 group-hover:border-sky-500/20 transition-all"
              >
                {/* Always show placeholder pulse if not loaded */}
                <div className={`absolute inset-0 bg-slate-800 flex items-center justify-center transition-opacity duration-1000 ${imageLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100 animate-pulse'}`}>
                  <div className="text-[10px] font-mono text-white/20 uppercase tracking-[0.5em]">Scanning_Bio...</div>
                </div>

                {profile?.photo_url && (
                  <div className={`w-full h-full overflow-hidden relative grayscale hover:grayscale-0 transition-all duration-[1500ms] ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}>
                    <Image
                      src={profile.photo_url}
                      alt="Engineer"
                      fill
                      className="object-cover scale-110"
                      priority
                      onLoad={() => setImageLoaded(true)}
                    />
                    <div className="absolute inset-0 bg-sky-500/10 mix-blend-overlay" />
                  </div>
                )}
              </motion.div>

              {/* Floating Data Panels */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -right-4 bg-slate-900/90 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-2xl z-20 flex flex-col gap-2 min-w-[170px]"
              >
                <span className="text-[9px] font-bold text-sky-400 uppercase tracking-widest font-mono text-sky-400">TEST_VELocity</span>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    animate={{ width: ["12%", "45%", "28%", "62%", "31%"] }}
                    transition={{ duration: 5, repeat: Infinity }}
                    className="h-full bg-sky-500" 
                  />
                </div>
                <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1 uppercase">
                  <span>Parallel_Threads</span>
                  <span className="text-sky-400/80">32_Active</span>
                </div>
              </motion.div>

              <motion.div 
                animate={{ x: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-4 -left-4 bg-slate-900/90 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-2xl z-20 flex flex-col gap-2 min-w-[170px]"
              >
                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest font-mono text-emerald-400">ASSERTION_HEALTH</span>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    animate={{ width: ["100%", "98%", "100%", "99.9%", "100%"] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" 
                  />
                </div>
                <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1 uppercase">
                  <span>Success_Rate</span>
                  <span className="text-emerald-400/80">99.9%</span>
                </div>
              </motion.div>
            </div>

            {/* Minimized Terminal Feed */}
            <div className="hidden md:block">
              <TestRunner />
            </div>
          </motion.div>
        </div>

      </div>
    </PageTransition>
  );
}

