"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import Button from "@/components/Button";
import Container from "@/components/Container";
import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";
import { useProfile } from "@/context/ProfileContext";
import { parseBio } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export default function Contact() {
  const { profile } = useProfile();
  const { email } = parseBio(profile?.bio || "");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
    };

    const { error: insertError } = await supabase.from("messages").insert([data]);

    if (!insertError) {
      // Send email notification
      try {
        await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      } catch (err) {
        console.error("Email notification failed:", err);
      }
      setSubmitted(true);
    } else {
      setError("Something went wrong sending your message. Please try again or email me directly.");
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
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-sm font-extrabold text-[#92700c] hover:opacity-70 transition-opacity"
                >
                  Send another →
                </button>
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
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  {error}
                </p>
              )}

              <Button variant="primary" type="submit" className="w-full py-4">
                {loading ? "Sending..." : "Send Message"}
              </Button>
            </form>
          )}
          </AnimatePresence>
        </div>

        <div className="mt-16 flex justify-center gap-8 text-[var(--faint)]">
          {email && (
            <a href={`mailto:${email}`} className="hover:text-[var(--accent)] transition-colors duration-300">
              <FaEnvelope size={24} />
            </a>
          )}
          {profile?.github_url && (
            <a href={profile.github_url} target="_blank" rel="noreferrer" className="hover:text-[var(--accent)] transition-colors duration-300">
              <FaGithub size={24} />
            </a>
          )}
          {profile?.linkedin_url && (
            <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="hover:text-[var(--accent)] transition-colors duration-300">
              <FaLinkedin size={24} />
            </a>
          )}
        </div>
      </Container>
    </PageTransition>
  );
}
