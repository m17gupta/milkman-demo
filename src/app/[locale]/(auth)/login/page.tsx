"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Milk, ArrowRight, Smartphone, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loginUser } from "@/store/slices/auth/authThunks";
import { clearAuthError } from "@/store/slices/auth/authSlice";

export default function LoginPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations("auth");
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((s) => s.auth);
  const [phone, setPhone] = useState("9876543210");
  const [pin, setPin] = useState("1234");
  const [showPin, setShowPin] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    dispatch(clearAuthError());
   debugger
    const result = await dispatch(loginUser({ phone, pin })).unwrap();
    console.log("userlogin", result);
    if (result?.user?.role) {
      const role = result.user.role;
      const target = role === "CUSTOMER" ? "customer/dashboard" : "admin/dashboard";
      router.push(`/${locale}/${target}`);
    }
  }

  const isFormValid = phone.length === 10 && pin.length === 4;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--bg)] p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--brand-soft)]">
            <Milk className="h-8 w-8 text-[var(--brand)]" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-[var(--brand)]">{t("eyebrow")}</p>
            <h1 className="text-2xl font-black text-[var(--ink-900)]">{t("title")}</h1>
            <p className="text-sm text-[var(--ink-400)]">{t("description")}</p>
          </div>
        </div>

        {error && (
          <div className="rounded-[18px] bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Phone Input */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[var(--ink-700)]" htmlFor="phone">
              {t("mobile")}
            </label>
            <div className="relative">
              <Smartphone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--ink-300)]" />
              <input
                id="phone"
                type="tel"
                inputMode="numeric"
                pattern="[0-9]{10}"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder={t("mobilePlaceholder")}
                required
                autoComplete="tel"
                className="w-full rounded-[18px] border border-[var(--border)] bg-[var(--surface)] py-4 pl-12 pr-4 text-sm text-[var(--ink-700)] outline-none transition placeholder:text-[var(--ink-300)] focus:border-[var(--brand)] focus:ring-4 focus:ring-[rgba(37,99,235,0.12)]"
              />
            </div>
          </div>

          {/* PIN Input */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[var(--ink-700)]" htmlFor="pin">
              4-digit PIN
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--ink-300)]" />
              <input
                id="pin"
                type={showPin ? "text" : "password"}
                inputMode="numeric"
                pattern="[0-9]{4}"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="Enter your 4-digit PIN"
                required
                autoComplete="current-password"
                className="w-full rounded-[18px] border border-[var(--border)] bg-[var(--surface)] py-4 pl-12 pr-12 text-sm text-[var(--ink-700)] outline-none transition placeholder:text-[var(--ink-300)] focus:border-[var(--brand)] focus:ring-4 focus:ring-[rgba(37,99,235,0.12)]"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--ink-300)] hover:text-[var(--ink-500)] transition"
                tabIndex={-1}
                aria-label={showPin ? "Hide PIN" : "Show PIN"}
              >
                {showPin ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <p className="text-[11px] text-[var(--ink-300)] mt-1">
              Enter the 4-digit PIN provided by your milkman
            </p>
          </div>

          <button
            type="submit"
            disabled={!isFormValid || loading}
            className="flex w-full items-center justify-center gap-2 rounded-[18px] bg-[var(--brand)] py-4 text-sm font-semibold text-white transition hover:bg-[var(--brand-ink)] disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : t("submit")}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>
      </div>
    </main>
  );
}
