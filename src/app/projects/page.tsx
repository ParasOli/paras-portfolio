"use client";

import { useState, useEffect } from "react";
import PageTransition from "@/components/PageTransition";
import ProjectCard from "@/components/ProjectCard";
import Container from "@/components/Container";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { parseBio, sortItems } from "@/lib/utils";

interface Project {
  id: any;
  title: string;
  description: string;
  image_url: string;
  github_url: string;
  live_url: string;
  type: string;
  tools_used?: string;
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
      
      const [pRes, prRes] = await Promise.all([
        supabase.from("projects").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("bio").limit(1).single()
      ]);

      if (pRes.error) {
        console.error("Error fetching projects:", pRes.error);
      } else {
        const { orderProjects } = parseBio(prRes.data?.bio || "");
        setProjects(sortItems(pRes.data || [], orderProjects));
      }
      setIsLoading(false);
    }
    
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(p => filter === "all" || p.type === filter);

  return (
    <PageTransition>
      <Container className="py-24 relative min-h-screen">
        <div className="text-center mb-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block mb-5"
          >
            <span className="tag">✦ Showcase</span>
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-5 text-[var(--foreground)]">
            Selected <span className="marker">work</span>
          </h1>
          <p className="text-lg text-[var(--muted)] max-w-2xl mx-auto leading-relaxed font-medium mb-10">
            A curated archive of automation frameworks, testing strategies, and technical project breakdowns.
          </p>

          {/* Filter System */}
          <div className="w-full flex justify-center mb-14 relative z-10">
            <div className="flex flex-wrap items-center justify-center gap-1 p-1 bg-[var(--surface)] border border-[var(--border)] rounded-full shadow-[var(--shadow-sm)]">
              {[
                { id: "all", label: "All projects" },
                { id: "project", label: "Frameworks" },
                { id: "writeup", label: "Case studies" }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setFilter(cat.id as any)}
                  className={`px-5 md:px-7 py-2.5 rounded-full text-xs md:text-sm font-extrabold transition-colors relative whitespace-nowrap ${
                    filter === cat.id ? "text-[var(--accent-ink)]" : "text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {filter === cat.id && (
                    <motion.div
                      layoutId="filter-bg"
                      className="absolute inset-0 bg-[var(--accent)] rounded-full -z-10 shadow-[var(--shadow-sm)]"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20 w-full">
            <div className="w-10 h-10 border-4 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="card p-12 text-center flex flex-col items-center">
             <p className="text-[var(--faint)] text-sm font-bold">No projects in this category yet.</p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12"
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
                    imageUrl={
                      project.image_url?.startsWith('[') 
                        ? JSON.parse(project.image_url)[0] 
                        : project.image_url
                    }
                    imageUrls={
                      project.image_url?.startsWith('[') 
                        ? JSON.parse(project.image_url) 
                        : [project.image_url]
                    }
                    githubUrl={project.github_url}
                    liveUrl={project.live_url}
                    tools={project.tools_used ? project.tools_used.split(',').map(t => t.trim()).filter(Boolean) : []}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </Container>
    </PageTransition>
  );
}
