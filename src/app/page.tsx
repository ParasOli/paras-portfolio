"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useProfile } from "@/context/ProfileContext";
import TestRunner from "@/components/TestRunner";
import Typewriter from "@/components/Typewriter";
import Button from "@/components/Button";
import PageTransition from "@/components/PageTransition";
import CountUp from "@/components/CountUp";
import Link from "next/link";
import { FaArrowRight, FaGithub, FaLinkedin, FaBug } from "react-icons/fa";

export default function Home() {
  const { profile, isLoading } = useProfile();

  const parseBio = (fullBio: string) => {
    if (!fullBio) return { cleanBio: "", terms: ["UI Testing", "API Testing", "CI/CD", "Health Checkups"], services: [] };

    const termMatch = fullBio.match(/\[terms:(.*?)\]/);
    const svcMatch = fullBio.match(/\[services:(.*?)\]/);

    const terms = termMatch ? termMatch[1].split(",").map(t => t.trim()) : ["UI Testing", "API Testing", "CI/CD", "Health Checkups"];
    const services = svcMatch 
      ? svcMatch[1].split(',').filter(s => s.includes('|')).map(s => {
          const [title, desc] = s.split('|');
          return { title: title.trim(), desc: (desc || "").trim() };
        })
      : [];

    const cleanBio = fullBio
      .replace(termMatch ? termMatch[0] : "", "")
      .replace(svcMatch ? svcMatch[0] : "", "")
      .trim();

    return { cleanBio, terms, services };
  };

  const { cleanBio, terms, services } = parseBio(profile?.bio || "");

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

            <div className="flex flex-wrap gap-6 items-center">
              <Link href="/projects">
                <button className="h-14 px-8 bg-white text-black font-bold rounded-2xl hover:bg-sky-400 hover:text-white transition-all transform hover:scale-105 flex items-center gap-3">
                  View Systems <FaArrowRight />
                </button>
              </Link>
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
                <div className="w-full h-full overflow-hidden relative grayscale hover:grayscale-0 transition-all duration-1000">
                  <Image
                    src={profile?.photo_url || "/profile.png"}
                    alt="Engineer"
                    fill
                    className="object-cover scale-110"
                    priority
                  />
                  <div className="absolute inset-0 bg-sky-500/10 mix-blend-overlay" />
                </div>
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

        {/* Services Section */}
        {services.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-32 md:mt-48 pb-24"
          >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 px-4">
              <div>
                <h2 className="text-[10px] font-bold tracking-[0.4em] mb-4 text-sky-500 uppercase font-mono">Expertise_Cloud</h2>
                <h3 className="text-4xl md:text-5xl font-bold tracking-tight text-white">Services_I_Provide</h3>
              </div>
              <p className="text-slate-500 max-w-sm text-sm font-light leading-relaxed">
                Strategic engineering solutions designed for high-performance automation ecosystems and seamless quality cycles.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
              {services.map((svc, i) => (
                <div 
                  key={i}
                  className="group relative p-8 rounded-[2.5rem] bg-slate-900/40 border border-white/5 hover:border-sky-500/20 transition-all overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <span className="text-6xl font-black text-white">0{i+1}</span>
                  </div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-400 mb-8 border border-sky-500/10 group-hover:border-sky-500/30 transition-colors">
                      <FaArrowRight className="-rotate-45 group-hover:rotate-0 transition-transform" />
                    </div>
                    <h4 className="text-xl font-bold text-white mb-4 group-hover:text-sky-400 transition-colors">{svc.title}</h4>
                    <p className="text-slate-500 text-sm leading-relaxed font-light group-hover:text-slate-400 transition-colors">
                      {svc.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}

