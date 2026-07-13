"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import PageTransition from "@/components/PageTransition";
import Button from "@/components/Button";
import Container from "@/components/Container";
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
import { FaFileDownload, FaCode, FaGithub, FaLinkedin, FaEnvelope, FaExternalLinkAlt } from "react-icons/fa";
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
      <div className="absolute inset-x-0 top-0 h-[420px] warm-glow pointer-events-none -z-10" />
      <Container className="py-16 md:py-24 relative">
        <div className="flex flex-col items-center mb-20 md:mb-24 text-center">
          <div className="relative mb-8">
            <div className="absolute -inset-2 bg-[var(--accent)] rounded-[1.6rem] rotate-[-4deg]" />
            <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-3xl overflow-hidden bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center shadow-[var(--shadow)]">
              <div className={`absolute inset-0 bg-[var(--surface-2)] transition-opacity duration-1000 ${imageLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100 animate-pulse-soft'}`} />
              <div className={`w-full h-full overflow-hidden relative transition-opacity duration-1000 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}>
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
          </div>
          <span className="tag mb-4">👋 About me</span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-[var(--foreground)]">
            The person behind <br className="hidden md:block" />the <span className="marker">green checkmarks.</span>
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 mb-24 items-center">
          <div className="space-y-6 lg:w-1/2">
            {isLoading || !cleanBio ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-6 bg-[var(--surface-2)] rounded-xl w-full" />
                <div className="h-6 bg-[var(--surface-2)] rounded-xl w-5/6" />
                <div className="h-6 bg-[var(--surface-2)] rounded-xl w-4/6" />
              </div>
            ) : (
              <p className="text-base md:text-lg text-[var(--muted)] leading-relaxed font-medium">
                {cleanBio}
              </p>
            )}

            <div className="pt-6 flex flex-wrap gap-6 items-center">
              <Button
                variant="primary"
                onClick={() => {
                  const url = profile?.cv_url || "/paras-cv.pdf";
                  downloadFile(url, cvFilename || "Paras_Oli_CV.pdf");
                }}
              >
                <FaFileDownload /> {cvFilename || "Download CV"}
              </Button>
              <div className="flex items-center gap-2">
                {profile?.github_url && (
                  <a href={profile.github_url} target="_blank" rel="noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)] transition-colors">
                    <FaGithub size={22} />
                  </a>
                )}
                {profile?.linkedin_url && (
                  <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)] transition-colors">
                    <FaLinkedin size={22} />
                  </a>
                )}
                {email && (
                  <a href={`mailto:${email}`} className="w-10 h-10 flex items-center justify-center rounded-full text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)] transition-colors">
                    <FaEnvelope size={22} />
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="card p-8 md:p-10 lg:w-1/2 flex flex-col justify-center">
            <h2 className="text-xs font-extrabold mb-8 text-[var(--faint)] uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" /> Core tech stack
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {tools.map((tool) => (
                <div key={tool.name} className="flex flex-col items-center justify-center gap-3 group p-4 rounded-2xl hover:bg-[var(--surface)] transition-colors">
                  <div className="text-[var(--foreground)] group-hover:text-[var(--accent-strong)] group-hover:scale-110 transition-all">
                    {tool.icon}
                  </div>
                  <span className="text-[11px] font-bold text-center text-[var(--muted)]">{tool.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 mt-20 relative">
          <div className="flex flex-col">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-10 text-[var(--foreground)]">Experience</h2>
            <div className="space-y-6 flex-grow">
              {isLoading ? (
                <div className="animate-pulse space-y-6">{[1,2].map(i => <div key={i} className="h-28 bg-[var(--surface-2)] rounded-2xl" />)}</div>
              ) : experience.length > 0 ? (
                experience.map((job, index) => (
                  <motion.div key={index} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="card card-hover p-6">
                    <div className="flex items-start gap-2 mb-3">
                      <span className="mt-1.5 w-2 h-2 rounded-full bg-[var(--accent)] shrink-0" />
                      <h3 className="text-lg font-extrabold text-[var(--foreground)]">{job.role}</h3>
                    </div>
                    <div className="text-[var(--muted)] text-xs font-extrabold uppercase tracking-wide mb-3 pl-4">{job.company} <span className="mx-1.5 text-[var(--faint)]">·</span> {job.duration}</div>
                    <p className="text-[var(--muted)] text-sm md:text-base leading-relaxed font-medium pl-4">{job.description}</p>
                  </motion.div>
                ))
              ) : (
                <p className="text-[var(--faint)] italic font-medium">No experience listed yet.</p>
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-10 text-[var(--foreground)]">Certifications <span className="text-[var(--accent-strong)]">&</span> licenses</h2>
            <div className="flex flex-col gap-3 flex-grow">
              {isLoading ? (
                <div className="animate-pulse space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-[var(--surface-2)] rounded-2xl" />)}</div>
              ) : certs.length > 0 ? (
                certs.map((cert, index) => {
                  const issuer = getIssuerInfo(cert.name, cert.certification_url);
                  return (
                    <Link
                      key={index}
                      href={cert.certification_url || "#"}
                      target="_blank"
                      className="card card-hover p-4 flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center overflow-hidden p-2 shrink-0">
                          {issuer.icon ? (
                            <img src={issuer.icon} alt={issuer.label} className="w-full h-full object-contain scale-110" />
                          ) : (
                            <span className="text-[var(--accent-strong)] font-black text-lg">{index + 1}</span>
                          )}
                        </div>
                        <div>
                          <p className="text-[var(--foreground)] font-extrabold text-sm line-clamp-1">{cert.name}</p>
                          <p className="text-xs text-[var(--faint)] font-bold mt-0.5">{issuer.label} · Verified ✓</p>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-[var(--surface)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 shrink-0">
                        <FaExternalLinkAlt size={10} className="text-[var(--accent-strong)]" />
                      </div>
                    </Link>
                  );
                })
              ) : (
                <p className="text-[var(--faint)] italic font-medium">No certifications listed.</p>
              )}
            </div>
          </div>
        </div>
      </Container>
    </PageTransition>
  );
}
