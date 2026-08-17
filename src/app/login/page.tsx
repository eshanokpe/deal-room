"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("demo@dealroom.test");
  const [password, setPassword] = useState("Demo123!");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Login failed");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-8 shadow-xl shadow-slate-200/50 backdrop-blur-sm">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Deal Room</h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Sign in as a demo founder.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white/50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white/50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-slate-900/20 transition-all duration-200 hover:bg-slate-800 hover:shadow-slate-900/30 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-slate-900"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

            {error && (
              <div className="rounded-lg bg-red-50/90 p-3 border border-red-100">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </form>

          <div className="mt-6 rounded-xl bg-slate-50/80 p-4 border border-slate-200/60">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-2">
              Demo credentials
            </p>
            <div className="space-y-1 text-sm text-slate-600">
              <p className="flex items-center gap-2">
                <span className="font-medium text-slate-500">Email:</span>
                <code className="rounded bg-white px-2 py-0.5 font-mono text-xs text-slate-700 border border-slate-200">
                  demo@dealroom.test
                </code>
              </p>
              <p className="flex items-center gap-2">
                <span className="font-medium text-slate-500">Password:</span>
                <code className="rounded bg-white px-2 py-0.5 font-mono text-xs text-slate-700 border border-slate-200">
                  Demo123!
                </code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}