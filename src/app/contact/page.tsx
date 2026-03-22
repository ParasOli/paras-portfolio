"use client";

import { useState } from "react";
import PageTransition from "@/components/PageTransition";
import Button from "@/components/Button";
import { FaGithub, FaLinkedin, FaEnvelope, FaCheckCircle } from "react-icons/fa";
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
          {submitted ? (
            <div className="text-center space-y-4 animate-in fade-in zoom-in duration-500">
              <div className="flex justify-center">
                <FaCheckCircle size={64} className="text-white opacity-80" />
              </div>
              <h2 className="text-2xl font-bold">Message Sent!</h2>
              <p className="text-muted">Thanks for reaching out, Paras will get back to you shortly.</p>
              <button 
                onClick={() => setSubmitted(false)}
                className="text-sm font-medium text-white/40 hover:text-white transition-colors"
              >
                Send another message
              </button>
            </div>
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
