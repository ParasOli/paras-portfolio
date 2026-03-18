"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import PageTransition from "@/components/PageTransition";
import Button from "@/components/Button";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import {
  SiCypress,
  SiSelenium,
  SiPostman,
  SiJira,
  SiJenkins,
} from "react-icons/si";
import { FaFileDownload, FaCode, FaGithub, FaLinkedin } from "react-icons/fa";
import Link from "next/link";

interface Experience {
  role: string;
  company: string;
  duration: string;
  description: string;
}

interface Certification {
  name: string;
  certification_url?: string;
}

interface Profile {
  photo_url: string;
  cv_url: string;
  full_name: string;
  bio: string;
  github_url: string;
  linkedin_url: string;
}

export default function About() {
  const [experience, setExperience] = useState<Experience[]>([]);
  const [certs, setCerts] = useState<Certification[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const tools = [
    { name: "Cypress", icon: <SiCypress size={40} /> },
    { name: "Selenium", icon: <SiSelenium size={40} /> },
    { name: "Playwright", icon: <FaCode size={40} /> },
    { name: "Postman", icon: <SiPostman size={40} /> },
    { name: "JIRA", icon: <SiJira size={40} /> },
    { name: "Jenkins", icon: <SiJenkins size={40} /> },
  ];

  useEffect(() => {
    async function fetchData() {
      const [eRes, cRes, pRes] = await Promise.all([
        supabase.from("experience").select("*").order("created_at", { ascending: false }),
        supabase.from("certifications").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("photo_url, cv_url, full_name, bio, github_url, linkedin_url").limit(1).single()
      ]);

      setExperience(eRes.data || []);
      setCerts(cRes.data || []);
      setProfile(pRes.data || null);
      setIsLoading(false);
    }
    fetchData();
  }, []);

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto px-6 py-12 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 tech-grid opacity-[0.02] pointer-events-none" />
        
        <div className="flex flex-col items-center mb-20 md:mb-24">
          <div className="relative w-24 h-24 md:w-32 md:h-32 mb-8 rounded-[2rem] overflow-hidden bg-slate-900 border border-slate-800 p-1 shadow-2xl">
            <div className="w-full h-full rounded-[1.8rem] overflow-hidden relative">
              <Image
                src={profile?.photo_url || "/profile.png"}
                alt="Profile Photo"
                fill
                className="object-cover"
              />
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-center text-white">
            About <span className="text-sky-500 font-mono text-sm align-middle ml-2 tracking-[0.3em]">ENGINEER</span>
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 mb-24">
          <div className="space-y-6 text-base md:text-lg text-white/50 leading-relaxed font-light lg:w-1/2">
            <p className="text-xl md:text-2xl text-white font-light !leading-relaxed">
              {profile?.bio || "I am a dedicated QA Automation Engineer with a passion for breaking things in code so the users don't have to."}
            </p>
            
            <div className="pt-8 flex flex-wrap gap-8 items-center">
              <Button variant="primary" href={profile?.cv_url || "/paras-cv.pdf"} target="_blank" className="h-14 px-8 rounded-xl bg-white text-black hover:bg-slate-200">
                <FaFileDownload className="mr-3" /> Technical_CV.pdf
              </Button>
              <div className="flex items-center gap-6">
                {profile?.github_url && (
                  <a href={profile.github_url} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-white transition-all transform hover:scale-110">
                    <FaGithub size={24} />
                  </a>
                )}
                {profile?.linkedin_url && (
                  <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-white transition-all transform hover:scale-110">
                    <FaLinkedin size={24} />
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 p-10 md:p-14 rounded-[3rem] lg:w-1/2 flex flex-col justify-center relative">
            <h2 className="text-[10px] font-bold tracking-[0.4em] mb-12 text-center text-slate-500 uppercase">CORE_TECH_STACK</h2>
            <div className="grid grid-cols-3 gap-10">
              {tools.map((tool) => (
                <div
                  key={tool.name}
                  className="flex flex-col items-center justify-center gap-4 group"
                >
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl group-hover:border-sky-500/30 transition-all text-slate-400 group-hover:text-white group-hover:shadow-lg">
                    {tool.icon}
                  </div>
                  <span className="text-[9px] font-bold tracking-widest text-center uppercase text-slate-600 font-mono">
                    {tool.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Experience and Certifications Section */}
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 mt-20 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-white/10 via-white/5 to-transparent hidden lg:block" />
          
          {/* Experience */}
          <div className="flex flex-col">
            <h2 className="text-3xl font-bold tracking-tight mb-14 text-white">
              Professional_Experience
            </h2>
            <div className="space-y-12 flex-grow">
              {isLoading ? (
                <div className="animate-pulse space-y-8">
                  {[1,2].map(i => <div key={i} className="h-24 bg-white/5 rounded-2xl" />)}
                </div>
              ) : experience.length > 0 ? (
                experience.map((job, index) => (
                  <motion.div 
                    key={index} 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="relative pl-8 border-l border-[var(--neon-cyan)]/20"
                  >
                    <div className="absolute w-2 h-2 bg-sky-500 rounded-full -left-[4.5px] top-2 shadow-[0_0_10px_rgba(14,165,233,0.5)]" />
                    <h3 className="text-xl font-bold text-white mb-2">{job.role}</h3>
                    <div className="text-sky-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-5 font-mono">
                      {job.company} <span className="mx-2 text-slate-700">|</span> {job.duration}
                    </div>
                    <p className="text-white/40 text-sm md:text-base font-light leading-relaxed">
                      {job.description}
                    </p>
                  </motion.div>
                ))
              ) : (
                <p className="text-white/20 italic">No operational data available.</p>
              )}
            </div>
          </div>

          {/* Certifications */}
          <div className="flex flex-col">
            <h2 className="text-3xl font-bold tracking-tight mb-14 text-white">
              Certified_Credentials
            </h2>
            <div className="flex flex-col gap-5 flex-grow">
              {isLoading ? (
                <div className="animate-pulse space-y-4">
                  {[1,2,3].map(i => <div key={i} className="h-16 bg-white/5 rounded-2xl" />)}
                </div>
              ) : certs.length > 0 ? (
                certs.map((cert, index) => (
                  cert.certification_url ? (
                    <Link 
                      key={index} 
                      href={cert.certification_url} 
                      target="_blank" 
                      className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] flex items-center justify-between group hover:border-sky-500/30 transition-all shadow-xl"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 group-hover:border-sky-500/20 transition-colors">
                          <span className="text-sky-400 font-bold text-xs">{index + 1}</span>
                        </div>
                        <span className="text-white font-medium tracking-tight group-hover:text-sky-400 transition-colors">{cert.name}</span>
                      </div>
                      <span className="opacity-0 group-hover:opacity-100 transition-all text-sky-400 text-[9px] font-bold uppercase tracking-widest translate-x-4 group-hover:translate-x-0 font-mono">VERIFY_PATH</span>
                    </Link>
                  ) : (
                    <div key={index} className="glass p-5 rounded-2xl flex items-center gap-5 hover:bg-white/[0.05] border-white/5 transition-all duration-500">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        <span className="text-white/20 font-bold text-xs">{index + 1}</span>
                      </div>
                      <span className="text-white/40 text-sm md:text-base font-medium tracking-tight">{cert.name}</span>
                    </div>
                  )
                ))
              ) : (
                <p className="text-white/20 italic">No certifications listed.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

