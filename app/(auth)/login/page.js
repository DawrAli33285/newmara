"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password. Please try again.");
    } else {
      const sessionRes = await fetch("/api/auth/session");
      const sessionData = await sessionRes.json();
      if (sessionData?.user?.role === "admin") {
        router.push("/dashboard");
      } else {
        router.push("/account");
      }
      router.refresh();
    }
  };

  return (
    <div className="w-full max-w-md">
      <div
        className="rounded-2xl border bg-white p-8"
        style={{ borderColor: "#D9E0E7", boxShadow: "0 20px 40px -24px rgba(8, 27, 49, 0.25)" }}
      >
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="text-2xl font-bold transition hover:opacity-80"
            style={{ color: "#0B1830" }}
          >
            Mara Media
          </Link>
          <p className="mt-2 text-sm" style={{ color: "#657084" }}>
            Sign in to your account
          </p>
        </div>

        {error && (
          <div
            className="mb-5 rounded-xl border p-3 text-sm"
            style={{ backgroundColor: "#FBEAE9", borderColor: "#F3C9C6", color: "#B3261E" }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              className="mb-1.5 block text-sm font-semibold"
              style={{ color: "#0B1830" }}
            >
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2"
              style={{ borderColor: "#D9E0E7", color: "#0B1830", minHeight: 44 }}
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-sm font-semibold" style={{ color: "#0B1830" }}>
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium transition hover:opacity-80"
                style={{ color: "#2F7D1B" }}
              >
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2"
              style={{ borderColor: "#D9E0E7", color: "#0B1830", minHeight: 44 }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: "#2F7D1B", minHeight: 44 }}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="my-6 h-px w-full" style={{ backgroundColor: "#D9E0E7" }} />

        <p className="text-center text-sm" style={{ color: "#657084" }}>
          Don't have an account?{" "}
          <Link
            href="/register"
            className="font-semibold transition hover:opacity-80"
            style={{ color: "#2F7D1B" }}
          >
            Create one
          </Link>
        </p>
      </div>

      <p className="mt-6 text-center text-sm" style={{ color: "#657084" }}>
        <Link href="/" className="transition hover:opacity-80" style={{ color: "#0B1830" }}>
          ← Back to Mara Media
        </Link>
      </p>
    </div>
  );
}