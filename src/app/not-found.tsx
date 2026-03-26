import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 — Page Not Found | Portfolio",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-center px-6 relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 tech-grid opacity-[0.03] pointer-events-none" />

      {/* Glow */}
      <div className="absolute w-96 h-96 bg-sky-500/10 rounded-full blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      <p className="text-[10px] font-mono text-sky-500 tracking-[0.4em] uppercase mb-6">Error 404</p>

      <h1 className="text-[120px] md:text-[180px] font-black text-white/5 leading-none tracking-tighter select-none">
        404
      </h1>

      <div className="-mt-16 md:-mt-24 space-y-4">
        <h2 className="text-2xl md:text-4xl font-bold text-white tracking-tight">
          Page <span className="text-sky-500">not found</span>
        </h2>
        <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
      </div>

      <div className="flex gap-4 mt-10">
        <Link
          href="/"
          className="px-6 py-3 bg-sky-500 text-slate-950 font-bold rounded-xl hover:bg-sky-400 transition-all text-sm"
        >
          Go Home
        </Link>
        <Link
          href="/projects"
          className="px-6 py-3 bg-slate-800 text-slate-300 font-medium rounded-xl hover:bg-slate-700 transition-all text-sm border border-white/5"
        >
          View Projects
        </Link>
      </div>

      <p className="mt-16 text-[10px] text-slate-700 font-mono tracking-widest uppercase">
        // endpoint_not_resolved
      </p>
    </div>
  );
}
