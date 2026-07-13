"use client";

import Link from "next/link";
import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";
import { useProfile } from "@/context/ProfileContext";
import { parseBio } from "@/lib/utils";
import Container from "@/components/Container";
import Logo from "@/components/Logo";

export default function Footer() {
  const { profile } = useProfile();
  const { email } = parseBio(profile?.bio || "");

  return (
    <footer className="border-t border-[var(--border)] mt-28 surface">
      <Container className="py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
          <Logo size={36} withWordmark />
          <p className="text-sm text-[var(--faint)] font-bold">
            © {new Date().getFullYear()} {profile?.full_name || "Paras Oli"}. Built with care.
          </p>
        </div>
        <div className="flex items-center gap-1 text-[var(--muted)]">
          {profile?.github_url && (
            <Link href={profile.github_url} target="_blank" className="w-10 h-10 flex items-center justify-center rounded-full hover:text-[var(--foreground)] hover:bg-white transition-colors">
              <FaGithub size={20} />
            </Link>
          )}
          {profile?.linkedin_url && (
            <Link href={profile.linkedin_url} target="_blank" className="w-10 h-10 flex items-center justify-center rounded-full hover:text-[var(--foreground)] hover:bg-white transition-colors">
              <FaLinkedin size={20} />
            </Link>
          )}
          {email && (
            <a href={`mailto:${email}`} className="w-10 h-10 flex items-center justify-center rounded-full hover:text-[var(--foreground)] hover:bg-white transition-colors">
              <FaEnvelope size={20} />
            </a>
          )}
        </div>
      </Container>
    </footer>
  );
}
