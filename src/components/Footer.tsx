"use client";

import Link from "next/link";
import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";
import { useProfile } from "@/context/ProfileContext";
import { parseBio } from "@/lib/utils";

export default function Footer() {
  const { profile } = useProfile();
  const { email } = parseBio(profile?.bio || "");

  return (
    <footer className="border-t border-white/10 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted">
          © {new Date().getFullYear()} {profile?.full_name || "QA Portfolio"}. All rights reserved.
        </p>
        <div className="flex items-center gap-6 text-muted">
          {profile?.github_url && (
            <Link href={profile.github_url} target="_blank" className="hover:text-white transition-colors">
              <FaGithub size={20} />
            </Link>
          )}
          {profile?.linkedin_url && (
            <Link href={profile.linkedin_url} target="_blank" className="hover:text-white transition-colors">
              <FaLinkedin size={20} />
            </Link>
          )}
          {email && (
            <Link href={`mailto:${email}`} className="hover:text-white transition-colors">
              <FaEnvelope size={20} />
            </Link>
          )}
        </div>
      </div>
    </footer>
  );
}
