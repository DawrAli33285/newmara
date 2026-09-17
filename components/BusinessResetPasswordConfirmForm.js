"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function BusinessResetPasswordConfirmForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!token) {
      setError("This reset link is missing its token. Please request a new one.");
      return;
    }

    const formData = new FormData(event.target);
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/business/reset-password/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      setSuccess(true);
    } catch (err) {
      setLoading(false);
      setError("Something went wrong. Please try again.");
    }
  }

  if (!token) {
    return (
      <div className="w-full text-center">
        <p className="mt-3 text-sm leading-6 text-slate-500">
          This reset link is missing its token. Please request a new password
          reset email.
        </p>

        <Link
          href="/business/reset-password"
          className="mt-8 inline-flex min-h-11 items-center justify-center rounded-lg bg-[#2f7d1b] px-5 text-sm font-bold text-white transition hover:bg-[#246515]"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="w-full text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#edf6e5] text-3xl font-bold text-[#2f7d1b]">
          ✓
        </div>

        <p className="mt-7 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#2f7d1b]">
          Password updated
        </p>

        <h2 className="mt-3 font-serif text-3xl leading-tight tracking-tight text-[#0b1830]">
          You&rsquo;re all set.
        </h2>

        <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-slate-500">
          Your password has been reset. You can now sign in with your new
          password.
        </p>

        <button
          type="button"
          onClick={() => router.push("/business/login")}
          className="mt-8 inline-flex min-h-11 items-center justify-center rounded-lg bg-[#2f7d1b] px-5 text-sm font-bold text-white transition hover:bg-[#246515]"
        >
          Back to login
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div>
        <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#2f7d1b]">
          Account recovery
        </p>

        <h2 className="mt-3 font-serif text-3xl leading-tight tracking-tight text-[#0b1830] sm:text-4xl">
          Choose a new password.
        </h2>

        <p className="mt-4 max-w-md text-sm leading-6 text-slate-500">
          Enter a new password for your business account.
        </p>
      </div>

      {error && (
        <div className="mt-6 border-l-4 border-red-400 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-7 space-y-5">
        <label className="block text-xs font-bold text-[#0b1830]">
          New password
          <span className="relative mt-2 block">
            <input
              required
              name="password"
              minLength={8}
              type={showPassword ? "text" : "password"}
              placeholder="At least 8 characters"
              className="h-11 w-full rounded-lg border border-slate-200 px-3 pr-16 text-sm font-normal outline-none transition placeholder:text-slate-400 focus:border-[#2f7d1b] focus:ring-4 focus:ring-[#2f7d1b]/10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-0 h-11 text-[10px] font-bold text-[#2f7d1b]"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </span>
        </label>

        <label className="block text-xs font-bold text-[#0b1830]">
          Confirm new password
          <input
            required
            name="confirmPassword"
            minLength={8}
            type={showPassword ? "text" : "password"}
            placeholder="Re-enter your new password"
            className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-normal outline-none transition placeholder:text-slate-400 focus:border-[#2f7d1b] focus:ring-4 focus:ring-[#2f7d1b]/10"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="flex min-h-12 w-full items-center justify-center rounded-lg bg-[#2f7d1b] text-sm font-bold text-white transition hover:bg-[#246515] disabled:opacity-60"
        >
          {loading ? "Updating password..." : "Update password"}
        </button>
      </form>

      <div className="mt-7 text-center text-xs text-slate-500">
        Remember your password?{" "}
        <Link href="/business/login" className="font-bold text-[#2f7d1b]">
          Back to login
        </Link>
      </div>
    </div>
  );
}