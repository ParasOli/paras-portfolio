import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 — Page Not Found | Portfolio",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--background)] warm-glow flex flex-col items-center justify-center text-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 dot-grid opacity-40 [mask-image:radial-gradient(circle_at_center,black,transparent_70%)] pointer-events-none" />

      <span className="tag mb-6 relative">🔍 Test failed: route not found</span>

      <h1 className="text-[110px] md:text-[190px] font-black text-[var(--accent)] leading-none tracking-tighter select-none relative">
        404
      </h1>

      <div className="mt-2 space-y-4 relative">
        <h2 className="text-2xl md:text-4xl font-black text-[var(--foreground)] tracking-tight">
          This page didn&apos;t pass QA.
        </h2>
        <p className="text-[var(--muted)] text-base max-w-md mx-auto leading-relaxed font-medium">
          The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mt-10 relative">
        <Link
          href="/"
          className="btn-tactile px-6 py-3 bg-[var(--accent)] text-[var(--accent-ink)] font-extrabold rounded-full hover:bg-[var(--accent-strong)] text-sm"
        >
          Go home
        </Link>
        <Link
          href="/projects"
          className="px-6 py-3 bg-white text-[var(--foreground)] font-bold rounded-full hover:bg-[var(--surface)] transition-all text-sm border border-[var(--border)] shadow-[var(--shadow-sm)]"
        >
          View projects
        </Link>
      </div>
    </div>
  );
}
