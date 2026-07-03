"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle2, Droplets, Loader2, LockKeyhole, User } from "lucide-react";

const VALID_USERNAME = "admin";
const VALID_PASSWORD = "admin123";

type LoginPageProps = {
  locale?: string;
};

export function LoginPage({ locale: localeProp = "en" }: LoginPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = searchParams.get("locale") || localeProp || "en";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function checkCurrentSession() {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          if (data.success && isMounted) {
            const targetDashboard = data.user.role === "CUSTOMER"
              ? `/${locale}/customer/dashboard`
              : `/${locale}/admin/dashboard`;
            router.replace(targetDashboard);
          }
        }
      } catch (err) {
        // Not authenticated or error, ignore
      }
    }
    checkCurrentSession();
    return () => {
      isMounted = false;
    };
  }, [locale, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setIsSubmitting(false);
        setError(data.error || "Invalid username or password.");
        return;
      }

      const targetDashboard = data.user.role === "CUSTOMER"
        ? `/${locale}/customer/dashboard`
        : `/${locale}/admin/dashboard`;
      router.replace(targetDashboard);
    } catch (err) {
      console.error("Login error:", err);
      setIsSubmitting(false);
      setError("An error occurred during login. Please try again.");
    }
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.16),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.12),_transparent_28%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.55),transparent_35%,rgba(255,255,255,0.25)_72%,transparent)]" />
      <div className="relative mx-auto flex min-h-screen max-w-6xl items-start px-4 py-8 sm:items-center sm:px-6 lg:px-8">
        <div className="grid w-full gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="flex flex-col justify-between rounded-[32px] border border-white/70 bg-white/75 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:p-8 lg:p-10">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--brand-soft)] bg-[var(--brand-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand)]">
                <Droplets className="h-4 w-4" />
                Secure login
              </div>
              <h1 className="mt-6 max-w-md text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                Milkman dashboard access
              </h1>
              <p className="mt-4 max-w-lg text-base leading-7 text-slate-600 sm:text-lg">
                Use the demo credentials to open the dashboard. This keeps the
                flow beginner-friendly and fully client-side.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                    Username
                  </p>
                  <p className="mt-2 font-semibold text-slate-950">admin</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                    Password
                  </p>
                  <p className="mt-2 font-semibold text-slate-950">admin123</p>
                </div>
              </div>
            </div>

            <div className="mt-10 rounded-[28px] border border-emerald-100 bg-emerald-50/80 p-5 text-sm leading-6 text-emerald-950">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="h-4 w-4" />
                What happens after login
              </div>
              <p className="mt-2 text-emerald-900/80">
                We store <code className="font-semibold">isLoggedIn=true</code> in
                <code className="ml-1 font-semibold">localStorage</code> and send
                you to the dashboard immediately.
              </p>
            </div>
          </section>

          <section className="flex items-center">
            <form
              onSubmit={handleSubmit}
              aria-busy={isSubmitting}
              className="w-full rounded-[32px] border border-slate-200/80 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.14)] sm:p-8 lg:p-10"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">
                    Welcome back
                  </p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                    Login to continue
                  </h2>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand)] text-white">
                  <LockKeyhole className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-8 space-y-5">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Username
                  </span>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-[var(--brand)] focus-within:ring-4 focus-within:ring-[var(--brand-soft)] focus-within:bg-white transition-all">
                    <User className="h-4 w-4 text-slate-400" />
                    <input
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      type="text"
                      autoComplete="username"
                      placeholder="Enter admin"
                      autoFocus
                      className="w-full bg-transparent text-sm font-medium text-slate-950 outline-none placeholder:text-slate-400"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Password
                  </span>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-[var(--brand)] focus-within:ring-4 focus-within:ring-[var(--brand-soft)] focus-within:bg-white transition-all">
                    <LockKeyhole className="h-4 w-4 text-slate-400" />
                    <input
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      type="password"
                      autoComplete="current-password"
                      placeholder="Enter password"
                      className="w-full bg-transparent text-sm font-medium text-slate-950 outline-none placeholder:text-slate-400"
                    />
                  </div>
                </label>
              </div>

              {error ? (
                <p
                  role="alert"
                  aria-live="polite"
                  className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
                >
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--brand)] px-5 py-4 text-base font-semibold text-white shadow-lg shadow-[var(--brand)]/20 transition-all hover:-translate-y-0.5 hover:bg-[var(--brand-ink)] hover:shadow-xl hover:shadow-[var(--brand)]/25 focus:outline-none focus:ring-4 focus:ring-[var(--brand-soft)] disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-70 sm:text-lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Logging in...</span>
                  </>
                ) : (
                  <>
                    <span>Login to Dashboard</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>

              <p className="mt-5 text-center text-sm text-slate-500">
                Beginner-friendly demo credentials only. No backend, no database.
              </p>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
