"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import PageTransition from "@/components/PageTransition";
import Button from "@/components/Button";
import Image from "next/image";
import { useProfile } from "@/context/ProfileContext";
import { supabase } from "@/lib/supabase";
import {
  SiCypress,
  SiPostman,
  SiGithubactions,
  SiK6,
  SiBurpsuite
} from "react-icons/si";
import { FaFileDownload, FaCode, FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";
import Link from "next/link";
import { parseBio, sortItems, downloadFile } from "@/lib/utils";

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
  const { profile: contextProfile, isLoading: profileLoading } = useProfile();
  const [experience, setExperience] = useState<Experience[]>([]);
  const [certs, setCerts] = useState<Certification[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  const tools = [
    { name: "Github Actions", icon: <SiGithubactions size={40} /> },
    { name: "Cypress", icon: <SiCypress size={40} /> },
    { name: "K6", icon: <SiK6 size={40} /> },
    { name: "Postman", icon: <SiPostman size={40} /> },
    { name: "Playwright", icon: <FaCode size={40} /> },
    { name: "BurpSuite", icon: <SiBurpsuite size={40} /> },
  ];

  useEffect(() => {
    async function fetchData() {
      const [eRes, cRes, pRes] = await Promise.all([
        supabase.from("experience").select("*").order("created_at", { ascending: false }),
        supabase.from("certifications").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("*").limit(1).single()
      ]);
      
      const { orderExperience, orderCerts } = parseBio(pRes.data?.bio || "");
      
      setExperience(sortItems(eRes.data || [], orderExperience));
      setCerts(sortItems(cRes.data || [], orderCerts));
      setProfile(pRes.data || null);
      setIsLoading(false);
    }
    fetchData();
  }, []);

  const { cleanBio, cvFilename, email } = parseBio(profile?.bio || "");

  const getIssuerInfo = (name: string, url?: string) => {
    const combined = (name + (url || "")).toLowerCase();
    if (combined.includes("coursera")) return { icon: "https://upload.wikimedia.org/wikipedia/commons/9/97/Coursera-Logo_600x600.svg", label: "Coursera" };
    if (combined.includes("udemy")) return { icon: "https://www.vectorlogo.zone/logos/udemy/udemy-icon.svg", label: "Udemy" };
    if (combined.includes("linkedin")) return { icon: "https://www.vectorlogo.zone/logos/linkedin/linkedin-icon.svg", label: "LinkedIn" };
    if (combined.includes("aws") || combined.includes("amazon")) return { icon: "https://www.vectorlogo.zone/logos/amazon_aws/amazon_aws-icon.svg", label: "AWS" };
    if (combined.includes("google")) return { icon: "https://www.vectorlogo.zone/logos/google/google-icon.svg", label: "Google" };
    if (combined.includes("istqb")) return { icon: "https://upload.wikimedia.org/wikipedia/en/d/df/ISTQB_logo.png", label: "ISTQB" };
    if (combined.includes("oracle") || combined.includes("java")) return { icon: "https://www.vectorlogo.zone/logos/oracle/oracle-icon.svg", label: "Oracle" };
    if (combined.includes("microsoft") || combined.includes("azure")) return { icon: "https://www.vectorlogo.zone/logos/microsoft/microsoft-icon.svg", label: "Microsoft" };
    return { icon: null, label: "Verified" };
  };

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto px-6 py-12 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 tech-grid opacity-[0.02] pointer-events-none" />
        
        <div className="flex flex-col items-center mb-20 md:mb-24">
          <div className="relative w-24 h-24 md:w-32 md:h-32 mb-8 rounded-[2rem] overflow-hidden bg-slate-900 border border-slate-800 p-1 shadow-2xl flex items-center justify-center">
            <div className={`absolute inset-0 bg-slate-800 flex items-center justify-center transition-opacity duration-1000 ${imageLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100 animate-pulse'}`}>
               <div className="w-full h-full bg-slate-800 rounded-[1.8rem]" />
            </div>

            <div className={`w-full h-full rounded-[1.8rem] overflow-hidden relative transition-opacity duration-1000 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}>
              {(profile?.photo_url || contextProfile?.photo_url) && (
                <Image
                  src={profile?.photo_url || contextProfile?.photo_url || "/profile.png"}
                  alt="Profile Photo"
                  fill
                  className="object-cover"
                  priority
                  onLoad={() => setImageLoaded(true)}
                />
              )}
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-center text-white">
            About <span className="text-sky-500 font-mono text-sm align-middle ml-2 tracking-[0.3em]">ENGINEER</span>
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 mb-24">
          <div className="space-y-6 text-base md:text-lg text-white/50 leading-relaxed font-light lg:w-1/2">
            {isLoading || !cleanBio ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-6 bg-white/5 rounded-xl w-full" />
                <div className="h-6 bg-white/5 rounded-xl w-5/6" />
                <div className="h-6 bg-white/5 rounded-xl w-4/6" />
              </div>
            ) : (
              <p className="text-base text-slate-300 font-light !leading-relaxed">
                {cleanBio}
              </p>
            )}
            
            <div className="pt-8 flex flex-wrap gap-8 items-center">
              <Button 
                variant="primary" 
                onClick={() => {
                  const url = profile?.cv_url || "/paras-cv.pdf";
                  downloadFile(url, cvFilename || "Paras_Oli_CV.pdf");
                }} 
                className="h-14 px-8 rounded-xl bg-white text-black hover:bg-slate-200"
              >
                <FaFileDownload className="mr-3" /> {cvFilename || "Technical_CV.pdf"}
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
                {email && (
                  <a href={`mailto:${email}`} className="text-slate-500 hover:text-white transition-all transform hover:scale-110">
                    <FaEnvelope size={24} />
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 p-10 md:p-14 rounded-[3rem] lg:w-1/2 flex flex-col justify-center relative">
            <h2 className="text-[10px] font-bold tracking-[0.4em] mb-12 text-center text-slate-500 uppercase">CORE_TECH_STACK</h2>
            <div className="grid grid-cols-3 gap-10">
              {tools.map((tool) => (
                <div key={tool.name} className="flex flex-col items-center justify-center gap-4 group">
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl group-hover:border-sky-500/30 transition-all text-slate-400 group-hover:text-white group-hover:shadow-lg">
                    {tool.icon}
                  </div>
                  <span className="text-[9px] font-bold tracking-widest text-center uppercase text-slate-600 font-mono">{tool.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 mt-20 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-white/10 via-white/5 to-transparent hidden lg:block" />
          
          <div className="flex flex-col">
            <h2 className="text-3xl font-bold tracking-tight mb-14 text-white">Professional Experience</h2>
            <div className="space-y-12 flex-grow">
              {isLoading ? (
                <div className="animate-pulse space-y-8">{[1,2].map(i => <div key={i} className="h-24 bg-white/5 rounded-2xl" />)}</div>
              ) : experience.length > 0 ? (
                experience.map((job, index) => (
                  <motion.div key={index} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative pl-8 border-l border-[var(--neon-cyan)]/20">
                    <div className="absolute w-2 h-2 bg-sky-500 rounded-full -left-[4.5px] top-2 shadow-[0_0_10px_rgba(14,165,233,0.5)]" />
                    <h3 className="text-xl font-bold text-white mb-2">{job.role}</h3>
                    <div className="text-sky-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-5 font-mono">{job.company} <span className="mx-2 text-slate-700">|</span> {job.duration}</div>
                    <p className="text-white/40 text-sm md:text-base font-light leading-relaxed">{job.description}</p>
                  </motion.div>
                ))
              ) : (
                <p className="text-white/20 italic">No operational data available.</p>
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <h2 className="text-3xl font-bold tracking-tight mb-14 text-white">Certifications <span className="text-sky-500">&</span> Licenses</h2>
            <div className="flex flex-col gap-5 flex-grow">
              {isLoading ? (
                <div className="animate-pulse space-y-4">{[1,2,3].map(i => <div key={i} className="h-16 bg-white/5 rounded-2xl" />)}</div>
              ) : certs.length > 0 ? (
                certs.map((cert, index) => {
                  const issuer = getIssuerInfo(cert.name, cert.certification_url);
                  return (
                    <Link 
                      key={index} 
                      href={cert.certification_url || "#"} 
                      target="_blank" 
                      className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between group hover:border-sky-500/30 transition-all hover:bg-slate-800/50"
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden p-2 group-hover:border-sky-500/20 transition-all">
                          {issuer.icon ? (
                            <img src={issuer.icon} alt={issuer.label} className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 transition-all scale-110" />
                          ) : (
                            <span className="text-sky-500 font-bold text-lg">{index + 1}</span>
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm group-hover:text-sky-400 transition-colors line-clamp-1">{cert.name}</p>
                          <p className="text-[9px] text-slate-600 font-mono tracking-widest mt-1 uppercase">{issuer.label}_AUTHENTICATED</p>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0">
                        <FaCode size={10} className="text-sky-500" />
                      </div>
                    </Link>
                  );
                })
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
