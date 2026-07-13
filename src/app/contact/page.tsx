"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import Button from "@/components/Button";
import Container from "@/components/Container";
import { FaGithub, FaLinkedin, FaPhone, FaWhatsapp } from "react-icons/fa";
import { useProfile } from "@/context/ProfileContext";

const COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes
const STORAGE_KEY = "contact_last_sent";

function formatMMSS(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function Contact() {
  const { profile } = useProfile();
  const phoneMatch = profile?.bio?.match(/\[phone:(.*?)\]/);
  const phone = phoneMatch ? phoneMatch[1].trim() : "";

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldownLeft, setCooldownLeft] = useState(0); // seconds

  // Restore cooldown on mount (survives refresh) and tick every second.
  useEffect(() => {
    const tick = () => {
      try {
        const last = parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10);
        const remainingMs = last + COOLDOWN_MS - Date.now();
        if (remainingMs > 0) {
          setCooldownLeft(Math.ceil(remainingMs / 1000));
          setSubmitted(true);
        } else {
          setCooldownLeft(0);
        }
      } catch {
        setCooldownLeft(0);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldownLeft > 0) return; // guard against spam
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(json.error || "Something went wrong. Please try again or reach out directly below.");
        setLoading(false);
        return;
      }

      try {
        localStorage.setItem(STORAGE_KEY, Date.now().toString());
      } catch {}
      setCooldownLeft(Math.ceil(COOLDOWN_MS / 1000));
      setSubmitted(true);
    } catch {
      setError("Network error. Please try again or reach out directly below.");
    }

    setLoading(false);
  };

  return (
    <PageTransition>
      <div className="absolute inset-x-0 top-0 h-[420px] warm-glow pointer-events-none -z-10" />
      <Container className="py-24 max-w-3xl!">
        <div className="text-center mb-12">
          <span className="tag mb-5">✉️ Get in touch</span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 text-[var(--foreground)]">
            Let&apos;s build something <span className="marker">solid.</span>
          </h1>
          <p className="text-lg text-[var(--muted)] font-medium">
            Have a project in mind or just want to say hi? Drop me a line.
          </p>
        </div>

        <div className="card p-8 md:p-10 min-h-[400px] flex flex-col justify-center shadow-[var(--shadow)]">
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="text-center space-y-6"
              >
                <motion.div
                  className="w-20 h-20 rounded-full bg-[var(--accent-soft)] border border-[var(--accent)]/30 flex items-center justify-center mx-auto"
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                >
                  <motion.svg
                    width="36" height="36" viewBox="0 0 36 36" fill="none"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    <motion.path
                      d="M7 18l8 8L29 10"
                      stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                      transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
                    />
                  </motion.svg>
                </motion.div>
                <div>
                  <h2 className="text-2xl font-black text-[var(--foreground)]">Message sent! 🎉</h2>
                  <p className="text-[var(--muted)] text-sm mt-2 font-medium">Thanks for reaching out — I&apos;ll get back to you shortly.</p>
                </div>

                {cooldownLeft > 0 ? (
                  <div className="inline-flex flex-col items-center gap-2">
                    <div className="inline-flex items-center gap-2.5 px-5 py-3 rounded-full bg-[var(--surface)] border border-[var(--border)]">
                      <span className="w-2 h-2 rounded-full bg-[var(--accent-strong)] animate-pulse-soft" />
                      <span className="text-sm font-bold text-[var(--muted)]">You can send another in</span>
                      <span className="text-sm font-black tabular-nums text-[var(--foreground)]">{formatMMSS(cooldownLeft)}</span>
                    </div>
                    <p className="text-xs font-medium text-[var(--faint)]">Need a faster reply? Reach out directly below 👇</p>
                  </div>
                ) : (
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-sm font-extrabold text-[#92700c] hover:opacity-70 transition-opacity"
                  >
                    Send another →
                  </button>
                )}
              </motion.div>
            ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-extrabold text-[var(--foreground)]">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-2xl px-4 py-3 text-[var(--foreground)] font-medium placeholder:text-[var(--faint)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] transition-shadow"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-extrabold text-[var(--foreground)]">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-2xl px-4 py-3 text-[var(--foreground)] font-medium placeholder:text-[var(--faint)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] transition-shadow"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-extrabold text-[var(--foreground)]">
                  Message
                </label>
                <textarea
                  name="message"
                  id="message"
                  required
                  rows={5}
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-2xl px-4 py-3 text-[var(--foreground)] font-medium placeholder:text-[var(--faint)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] transition-shadow resize-none"
                  placeholder="Your message here..."
                ></textarea>
              </div>

              {error && (
                <p className="text-sm font-bold text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  {error}
                </p>
              )}

              <Button variant="primary" type="submit" className="w-full py-4">
                {loading ? "Sending..." : "Send message"}
              </Button>
            </form>
          )}
          </AnimatePresence>
        </div>

        {/* Instant touch — direct channels for a faster reply */}
        <div className="mt-10">
          <p className="text-center text-xs font-extrabold uppercase tracking-wide text-[var(--faint)] mb-4">
            Or reach me instantly
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            {phone && (
              <a href={`https://wa.me/${phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="card card-hover p-4 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-[#e7f8ee] flex items-center justify-center text-[#25d366] shrink-0">
                  <FaWhatsapp size={17} />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-bold text-[var(--faint)]">WhatsApp</span>
                  <span className="block text-sm font-extrabold text-[var(--foreground)] truncate">Chat now</span>
                </span>
              </a>
            )}
            {phone && (
              <a href={`tel:${phone.replace(/\s+/g, "")}`} className="card card-hover p-4 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-[var(--pass-soft)] flex items-center justify-center text-[var(--pass)] shrink-0">
                  <FaPhone size={15} />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-bold text-[var(--faint)]">Call</span>
                  <span className="block text-sm font-extrabold text-[var(--foreground)] truncate">{phone}</span>
                </span>
              </a>
            )}
            {profile?.linkedin_url && (
              <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="card card-hover p-4 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-[#e8f1fb] flex items-center justify-center text-[#0a66c2] shrink-0">
                  <FaLinkedin size={16} />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-bold text-[var(--faint)]">LinkedIn</span>
                  <span className="block text-sm font-extrabold text-[var(--foreground)] truncate">Message me</span>
                </span>
              </a>
            )}
            {profile?.github_url && !phone && (
              <a href={profile.github_url} target="_blank" rel="noreferrer" className="card card-hover p-4 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-[var(--surface-2)] flex items-center justify-center text-[var(--foreground)] shrink-0">
                  <FaGithub size={16} />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-bold text-[var(--faint)]">GitHub</span>
                  <span className="block text-sm font-extrabold text-[var(--foreground)] truncate">See my code</span>
                </span>
              </a>
            )}
          </div>
        </div>
      </Container>
    </PageTransition>
  );
}
