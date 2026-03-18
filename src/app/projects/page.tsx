"use client";

import { useState, useEffect } from "react";
import PageTransition from "@/components/PageTransition";
import ProjectCard from "@/components/ProjectCard";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

const categories = ["All", "UI Testing", "API Testing", "Performance", "Security"];

interface Project {
  id: any;
  title: string;
  description: string;
  image_url: string;
  github_url: string;
  live_url: string;
  type: string;
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "project" | "writeup">("all");

  useEffect(() => {
    async function fetchProjects() {
      if (!supabase) {
        setIsLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching projects:", error);
      } else {
        setProjects(data || []);
      }
      setIsLoading(false);
    }
    
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(p => filter === "all" || p.type === filter);

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-6 py-20 relative overflow-hidden min-h-screen">
        <div className="absolute inset-0 tech-grid opacity-[0.03] pointer-events-none" />
        <div className="scanner-line opacity-[0.05]" />
        
        <div className="text-center mb-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-3 py-1 rounded-full border border-[var(--neon-cyan)]/30 bg-[var(--neon-cyan)]/5 mb-6 tech-pulse"
          >
            <span className="text-[10px] font-bold text-[var(--neon-cyan)] tracking-[0.3em] uppercase">Showcase</span>
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-gradient">
            Projects & <span className="opacity-30 uppercase tracking-tighter">Writeups</span>
          </h1>
          <p className="text-lg text-white/50 max-w-2xl mx-auto font-light leading-relaxed mb-12">
            A comprehensive archive of automation frameworks, testing strategies, and technical project breakdowns.
          </p>

          {/* Filter System */}
          <div className="flex items-center justify-center gap-2 p-1 bg-white/5 rounded-2xl w-fit mx-auto mb-16 border border-white/5">
            {[
              { id: "all", label: "All Systems" },
              { id: "project", label: "Projects" },
              { id: "writeup", label: "Writeups" }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id as any)}
                className={`px-8 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-all relative ${
                  filter === cat.id ? "text-[var(--neon-cyan)] neon-text" : "text-white/40 hover:text-white"
                }`}
              >
                {filter === cat.id && (
                  <motion.div layoutId="filter-bg" className="absolute inset-0 bg-white/5 rounded-xl -z-10 border border-white/10 shadow-[0_0_20px_rgba(0,242,255,0.1)]" />
                )}
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20 w-full">
            <div className="w-10 h-10 border-4 border-[var(--neon-cyan)]/10 border-t-[var(--neon-cyan)] rounded-full animate-spin" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="glass p-12 rounded-3xl text-center flex flex-col items-center">
             <p className="text-white/20 mb-4 text-xs tracking-widest uppercase">No data found in this sector.</p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                >
                  <ProjectCard
                    title={project.title}
                    description={project.description}
                    category={project.type === 'writeup' ? 'Technical Writeup' : 'QA Automation'}
                    imageUrl={project.image_url}
                    githubUrl={project.github_url}
                    liveUrl={project.live_url}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}
