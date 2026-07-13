"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import PageTransition from "@/components/PageTransition";
import Button from "@/components/Button";
import Logo from "@/components/Logo";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/admin");
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen warm-glow flex items-center justify-center px-6">
        <div className="absolute inset-0 dot-grid opacity-40 [mask-image:radial-gradient(circle_at_center,black,transparent_75%)] pointer-events-none" />
        <div className="card p-8 md:p-10 w-full max-w-md relative shadow-[var(--shadow-lg)]">
          <div className="flex flex-col items-center text-center mb-8">
            <Logo size={52} />
            <h1 className="text-3xl font-black tracking-tight mt-5 mb-1 text-[var(--foreground)]">Welcome back 👋</h1>
            <p className="text-[var(--muted)] font-medium">Sign in to manage your portfolio</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-extrabold text-[var(--foreground)]">
                Email address
              </label>
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-2xl px-4 py-3 text-[var(--foreground)] font-medium placeholder:text-[var(--faint)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] transition-shadow"
                placeholder="admin@example.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" title="Password" className="text-sm font-extrabold text-[var(--foreground)]">
                Password
              </label>
              <input
                type="password"
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-2xl px-4 py-3 text-[var(--foreground)] font-medium placeholder:text-[var(--faint)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] transition-shadow"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm font-bold bg-red-50 p-3 rounded-xl border border-red-200">
                {error}
              </p>
            )}

            <Button variant="primary" className="w-full py-4" type="submit">
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </div>
      </div>
    </PageTransition>
  );
}
