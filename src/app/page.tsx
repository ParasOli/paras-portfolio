"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Button from "@/components/Button";
import PageTransition from "@/components/PageTransition";
import { FaArrowRight, FaGithub, FaLinkedin } from "react-icons/fa";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [profile, setProfile] = useState<{ photo_url: string; full_name: string; bio: string; github_url: string; linkedin_url: string } | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      const { data } = await supabase.from("profiles").select("photo_url, full_name, bio, github_url, linkedin_url").limit(1).single();
      if (data) setProfile(data);
    }
    fetchProfile();
  }, []);

  return (
    <PageTransition>
      <div className="min-h-[90vh] flex flex-col items-center justify-center px-6 relative overflow-hidden text-center">
        {/* Decorative background glow & grid */}
        <div className="absolute inset-0 tech-grid opacity-[0.03] pointer-events-none" />
        <div className="scanner-line" />
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--neon-cyan)] opacity-[0.02] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[var(--neon-magenta)] opacity-[0.02] rounded-full blur-[100px] pointer-events-none" />

        <div className="z-10 max-w-4xl flex flex-col items-center">
          <motion.div 
            whileHover={{ rotateY: 15, rotateX: -10, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative w-36 h-36 md:w-48 md:h-48 mb-10 p-1 rounded-3xl glass-glow glass-3d cursor-pointer"
          >
            <div className="w-full h-full rounded-[22px] overflow-hidden border border-white/10 relative">
              <Image
                src={profile?.photo_url || "/profile.png"}
                alt="Profile"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--neon-cyan)]/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
            </div>
            {/* QA Badge */}
            <div className="absolute -bottom-2 -right-2 glass px-3 py-1 rounded-full border-[var(--neon-emerald)]/30 tech-pulse">
              <span className="text-[10px] font-bold text-[var(--neon-emerald)] tracking-widest uppercase">Verified QA</span>
            </div>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-9xl font-bold tracking-tighter mb-8 text-gradient leading-[0.9]"
          >
            {profile?.full_name || "Paras Oli"}
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3 mb-10"
          >
            <div className="h-px w-8 bg-white/20" />
            <span className="text-sm md:text-base text-[var(--neon-cyan)] tracking-[0.3em] font-medium uppercase neon-text">
              Quality Assurance Engineer
            </span>
            <div className="h-px w-8 bg-white/20" />
          </motion.div>

          <p className="text-lg md:text-xl text-white/50 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
            {profile?.bio || "Architecting digital resilience through precision automation and Web3-ready quality frameworks."}
          </p>

          <div className="flex items-center gap-8 mb-16">
            {profile?.github_url && (
              <a href={profile.github_url} target="_blank" rel="noreferrer" className="text-white/30 hover:text-[var(--neon-cyan)] hover:scale-125 transition-all duration-500">
                <FaGithub size={28} />
              </a>
            )}
            {profile?.linkedin_url && (
              <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="text-white/30 hover:text-[var(--neon-cyan)] hover:scale-125 transition-all duration-500">
                <FaLinkedin size={28} />
              </a>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Button href="/projects" variant="primary" className="min-w-[200px] h-14 group">
              View Projects <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button href="/contact" variant="outline" className="min-w-[200px] h-14">
              Get In Touch
            </Button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

