"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import PageTransition from "@/components/PageTransition";
import Button from "@/components/Button";

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
      <div className="min-h-[80vh] flex items-center justify-center px-6">
        <div className="glass p-8 md:p-12 rounded-3xl w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Admin Login</h1>
            <p className="text-white/60">Enter your credentials to manage the portfolio</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-white/80">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/30 transition-shadow"
                placeholder="admin@example.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" title="Password" className="text-sm font-medium text-white/80">
                Password
              </label>
              <input
                type="password"
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/30 transition-shadow"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                {error}
              </p>
            )}

            <Button variant="primary" className="w-full py-4" type="submit">
              {loading ? "Logging in..." : "Sign In"}
            </Button>
          </form>
        </div>
      </div>
    </PageTransition>
  );
}
