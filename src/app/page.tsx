"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useProfile } from "@/context/ProfileContext";
import TestRunner from "@/components/TestRunner";
import Typewriter from "@/components/Typewriter";
import PageTransition from "@/components/PageTransition";
import CountUp from "@/components/CountUp";
import Container from "@/components/Container";
import ProjectCard from "@/components/ProjectCard";
import Link from "next/link";
import { FaArrowRight, FaGithub, FaLinkedin, FaEnvelope, FaFileDownload, FaCode } from "react-icons/fa";
import { SiCypress, SiPostman, SiGithubactions, SiK6, SiBurpsuite } from "react-icons/si";
import { parseBio, downloadFile, sortItems } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

interface Project {
  id: string | number;
  title: string;
  description: string;
  image_url: string;
  github_url: string;
  live_url: string;
  type: string;
  tools_used?: string;
}

const services = [
  {
    emoji: "🎯",
    title: "UI Automation",
    body: "End-to-end flows in Cypress & Playwright that catch regressions before your users ever do.",
  },
  {
    emoji: "🔌",
    title: "API Automation",
    body: "Contract & integration tests in Postman and REST — fast, reliable, and wired into CI.",
  },
  {
    emoji: "🛡️",
    title: "CI/CD & Security",
    body: "Pipelines that gate every merge, plus security testing to catch vulnerabilities early.",
  },
];

const tools = [
  { name: "Cypress", icon: <SiCypress size={34} /> },
  { name: "Playwright", icon: <FaCode size={30} /> },
  { name: "Postman", icon: <SiPostman size={34} /> },
  { name: "k6", icon: <SiK6 size={34} /> },
  { name: "GitHub Actions", icon: <SiGithubactions size={34} /> },
  { name: "BurpSuite", icon: <SiBurpsuite size={34} /> },
];

export default function Home() {
  const { profile } = useProfile();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [featured, setFeatured] = useState<Project[]>([]);

  const { cleanBio, terms, email, cvFilename } = parseBio(profile?.bio || "");

  useEffect(() => {
    async function fetchFeatured() {
      if (!supabase) return;
      const [pRes, prRes] = await Promise.all([
        supabase.from("projects").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("bio").limit(1).single(),
      ]);
      if (!pRes.error && pRes.data) {
        const { orderProjects } = parseBio(prRes.data?.bio || "");
        setFeatured(sortItems(pRes.data, orderProjects).slice(0, 3));
      }
    }
    fetchFeatured();
  }, []);

  return (
    <PageTransition>
      {/* Ambient warm backdrop */}
      <div className="absolute inset-x-0 top-0 h-[720px] warm-glow pointer-events-none -z-10" />
      <div className="absolute inset-x-0 top-0 h-[720px] dot-grid opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent)] pointer-events-none -z-10" />

      {/* ===== HERO ===== */}
      <Container className="relative flex flex-col justify-center pt-10 md:pt-14 pb-16 md:pb-24">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-16 items-center">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-7"
          >
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="status-badge online">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--pass)] animate-pulse-soft" />
                Available for projects
              </span>
              <span className="status-badge">Freelance · Remote</span>
            </div>

            <h1 className="text-[2.75rem] sm:text-6xl lg:text-[4.2rem] font-black tracking-tight text-[var(--foreground)] leading-[1.02]">
              Ship software
              <br />
              that <span className="marker">just works.</span>
            </h1>

            <div className="text-lg md:text-xl text-[var(--muted)] font-bold flex items-center gap-2.5 min-h-[1.6em]">
              <span className="text-[var(--accent-strong)]">→</span>
              <Typewriter
                words={terms.length ? terms : ["Cypress automation", "API testing", "CI/CD pipelines", "Security testing"]}
                typingSpeed={80}
                deletingSpeed={40}
                delayBetweenWords={2000}
              />
            </div>

            <p className="text-base md:text-lg text-[var(--muted)] max-w-xl leading-relaxed font-medium">
              {cleanBio ||
                "I'm a Full-Stack Test Engineer specializing in UI automation (Cypress), API testing (Postman), and CI/CD integration. I build the safety net so your team can move fast without breaking things."}
            </p>

            <div className="flex flex-wrap gap-3 items-center relative">
              {/* hand-drawn arrow pointing at the CTA */}
              <svg
                className="hidden lg:block absolute -top-11 left-24 text-[var(--accent-strong)] rotate-6"
                width="72" height="44" viewBox="0 0 72 44" fill="none"
                aria-hidden
              >
                <path d="M4 4C22 6 44 12 54 34" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="1 7" />
                <path d="M46 30l9 6 2-11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>

              <Link
                href="/projects"
                className="btn-tactile inline-flex h-12 px-6 bg-[var(--accent)] text-[var(--accent-ink)] font-extrabold rounded-full items-center gap-2 hover:bg-[var(--accent-strong)]"
              >
                View my work <FaArrowRight size={13} />
              </Link>
              {profile?.cv_url && (
                <button
                  onClick={() => downloadFile(profile.cv_url!, cvFilename || "Paras_Oli_QA_Automation_Engineer_Resume.pdf")}
                  className="inline-flex h-12 px-5 bg-white border border-[var(--border)] rounded-full text-[var(--foreground)] font-bold hover:border-[var(--border-strong)] hover:bg-[var(--surface)] shadow-[var(--shadow-sm)] transition-all items-center gap-2"
                >
                  <FaFileDownload size={14} /> Download CV
                </button>
              )}
              <div className="flex gap-1 items-center pl-1">
                {profile?.github_url && (
                  <a href={profile.github_url} target="_blank" rel="noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)] transition-colors">
                    <FaGithub size={20} />
                  </a>
                )}
                {profile?.linkedin_url && (
                  <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)] transition-colors">
                    <FaLinkedin size={20} />
                  </a>
                )}
                {email && (
                  <a href={`mailto:${email}`} className="w-10 h-10 flex items-center justify-center rounded-full text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)] transition-colors">
                    <FaEnvelope size={20} />
                  </a>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-3 pt-1">
              <div className="card card-hover py-4 px-6 flex flex-col gap-0.5 min-w-[140px]">
                <span className="text-3xl font-black text-[var(--foreground)] tracking-tight">
                  <CountUp end={500} suffix="+" />
                </span>
                <span className="text-xs text-[var(--faint)] font-bold">Tests engineered</span>
              </div>
              <div className="card card-hover py-4 px-6 flex flex-col gap-0.5 min-w-[140px]">
                <span className="text-3xl font-black text-[var(--foreground)] tracking-tight">
                  <CountUp end={99.9} suffix="%" />
                </span>
                <span className="text-xs text-[var(--faint)] font-bold">System stability</span>
              </div>
            </div>
          </motion.div>

          {/* Right — test report is the hero visual; photo is a small avatar badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-[440px] mx-auto lg:mx-0 lg:ml-auto flex flex-col gap-4"
          >
            {/* playful rotated backing accent */}
            <div className="absolute -inset-2 bg-[var(--accent)]/25 rounded-[2rem] rotate-[-2deg] -z-10" />

            <TestRunner />

            {/* Signed-by profile chip */}
            <div className="card flex items-center gap-3.5 p-3.5">
              <div className="relative w-14 h-14 rounded-full overflow-hidden bg-[var(--surface-2)] ring-2 ring-[var(--accent)] shrink-0">
                {profile?.photo_url ? (
                  <Image
                    src={profile.photo_url}
                    alt={profile.full_name || "Paras Oli"}
                    fill
                    className={`object-cover transition-opacity duration-500 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                    priority
                    onLoad={() => setImageLoaded(true)}
                  />
                ) : null}
                {!imageLoaded && (
                  <span className="absolute inset-0 flex items-center justify-center font-black text-[var(--faint)]">PO</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-extrabold text-[var(--foreground)] leading-tight truncate">{profile?.full_name || "Paras Oli"}</p>
                <p className="text-xs font-bold text-[var(--faint)] truncate">Full-Stack Test Engineer</p>
              </div>
              <span className="ml-auto flex items-center gap-1.5 text-xs font-black text-[var(--pass)] shrink-0">
                <span className="w-2 h-2 rounded-full bg-[var(--pass)] animate-pulse-soft" /> Available
              </span>
            </div>
          </motion.div>
        </div>
      </Container>

      {/* ===== WHAT I DO ===== */}
      <section className="surface border-y border-[var(--border)]">
        <Container className="py-20 md:py-24">
          <div className="text-center mb-12">
            <span className="tag mb-4">⚡ What I do</span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-[var(--foreground)]">
              Fewer bugs. <span className="marker">Faster releases.</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {services.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="card card-hover p-7"
              >
                <div className="w-14 h-14 rounded-2xl bg-[var(--accent-soft)] border border-[#f6e08a] flex items-center justify-center text-3xl mb-5">
                  {s.emoji}
                </div>
                <h3 className="text-xl font-extrabold text-[var(--foreground)] mb-2">{s.title}</h3>
                <p className="text-[var(--muted)] font-medium leading-relaxed">{s.body}</p>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* ===== TOOLS WALL ===== */}
      <Container className="py-20 md:py-24">
        <div className="text-center mb-10">
          <h2 className="text-xl font-extrabold text-[var(--faint)] uppercase tracking-wider">
            Tools I build with
          </h2>
        </div>
        <div className="flex flex-wrap justify-center gap-3 md:gap-4">
          {tools.map((t) => (
            <div
              key={t.name}
              className="card card-hover flex items-center gap-3 px-5 py-3.5 hover:rotate-[-2deg]"
            >
              <span className="text-[var(--foreground)]">{t.icon}</span>
              <span className="font-extrabold text-[var(--foreground)]">{t.name}</span>
            </div>
          ))}
        </div>
      </Container>

      {/* ===== FEATURED WORK ===== */}
      {featured.length > 0 && (
        <section className="surface border-y border-[var(--border)]">
          <Container className="py-20 md:py-24">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
              <div>
                <span className="tag mb-4">✦ Featured</span>
                <h2 className="text-3xl md:text-5xl font-black tracking-tight text-[var(--foreground)]">
                  Recent work
                </h2>
              </div>
              <Link href="/projects" className="inline-flex items-center gap-2 font-extrabold text-[#92700c] hover:gap-3 transition-all">
                View all projects <FaArrowRight size={13} />
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((project) => (
                <ProjectCard
                  key={project.id}
                  title={project.title}
                  description={project.description}
                  category={project.type === "writeup" ? "Case Study" : "Automation"}
                  imageUrl={project.image_url?.startsWith("[") ? JSON.parse(project.image_url)[0] : project.image_url}
                  imageUrls={project.image_url?.startsWith("[") ? JSON.parse(project.image_url) : [project.image_url]}
                  githubUrl={project.github_url}
                  liveUrl={project.live_url}
                  tools={project.tools_used ? project.tools_used.split(",").map((t) => t.trim()).filter(Boolean) : []}
                />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ===== CTA BANNER ===== */}
      <Container className="py-20 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-[2rem] bg-[var(--accent)] px-8 py-14 md:px-16 md:py-20 text-center shadow-[var(--shadow-lg)]"
        >
          <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />
          <div className="relative">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-[var(--accent-ink)] mb-4">
              Got flaky tests? Let&apos;s fix that. 🛠️
            </h2>
            <p className="text-[var(--accent-ink)]/70 font-bold text-lg max-w-xl mx-auto mb-8">
              Whether it&apos;s a green-field automation suite or rescuing a brittle one, I&apos;d love to help you ship with confidence.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-7 h-13 py-4 bg-[var(--foreground)] text-white font-extrabold rounded-full hover:opacity-90 transition-opacity"
            >
              Start a conversation <FaArrowRight size={13} />
            </Link>
          </div>
        </motion.div>
      </Container>
    </PageTransition>
  );
}
