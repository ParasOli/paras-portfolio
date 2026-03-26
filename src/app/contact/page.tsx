"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import Button from "@/components/Button";
import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";
import { useProfile } from "@/context/ProfileContext";
import { parseBio } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export default function Contact() {
  const { profile } = useProfile();
  const { email } = parseBio(profile?.bio || "");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
    };

    const { error } = await supabase.from("messages").insert([data]);

    if (!error) {
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
      alert("Error sending message: " + error.message);
    }
    
    setLoading(false);
  };

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Let's <span className="text-white/40">Connect</span>
          </h1>
          <p className="text-lg text-white/60">
            Have a project in mind or just want to say hi? Feel free to reach out.
          </p>
        </div>

        <div className="glass p-8 md:p-12 rounded-3xl min-h-[400px] flex flex-col justify-center">
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
                  className="w-20 h-20 rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center mx-auto"
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
                      stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                      transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
                    />
                  </motion.svg>
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Message Sent!</h2>
                  <p className="text-slate-400 text-sm mt-2">Thanks for reaching out — I'll get back to you shortly.</p>
                </div>
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-xs font-medium text-slate-600 hover:text-sky-400 transition-colors uppercase tracking-widest"
                >
                  Send another →
                </button>
              </motion.div>
            ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-white/80">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/30 transition-shadow"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-white/80">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/30 transition-shadow"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium text-white/80">
                  Message
                </label>
                <textarea
                  name="message"
                  id="message"
                  required
                  rows={5}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/30 transition-shadow resize-none"
                  placeholder="Your message here..."
                ></textarea>
              </div>

              <Button variant="primary" className="w-full py-4" onClick={() => {}}>
                {loading ? "Sending..." : "Send Message"}
              </Button>
            </form>
          )}
          </AnimatePresence>
        </div>

        <div className="mt-16 flex justify-center gap-8 text-white/50">
          {email && (
            <a href={`mailto:${email}`} className="hover:text-white transition-colors duration-300">
              <FaEnvelope size={24} />
            </a>
          )}
          {profile?.github_url && (
            <a href={profile.github_url} target="_blank" rel="noreferrer" className="hover:text-white transition-colors duration-300">
              <FaGithub size={24} />
            </a>
          )}
          {profile?.linkedin_url && (
            <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="hover:text-white transition-colors duration-300">
              <FaLinkedin size={24} />
            </a>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
