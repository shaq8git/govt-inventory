import { useState } from "react";
import { t } from "../i18n/translations";

async function requestJson(url, options) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
    ...options,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error ? JSON.stringify(error) : `Request failed with ${response.status}`);
  }
  return response.json();
}

function IconUser({ className = "h-[18px] w-[18px]" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <circle cx="12" cy="8" r="3.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 20c1.2-3.6 4-5.5 7.5-5.5s6.3 1.9 7.5 5.5" />
    </svg>
  );
}

function IconLock({ className = "h-[18px] w-[18px]" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <rect x="4.5" y="10.5" width="15" height="9.5" rx="2.2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 10.5V7.8a4.5 4.5 0 0 1 9 0v2.7" />
      <circle cx="12" cy="14.8" r="1.4" />
    </svg>
  );
}

function IconEye({ className = "h-[18px] w-[18px]" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconEyeOff({ className = "h-[18px] w-[18px]" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.6 5.7A9.6 9.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a13.7 13.7 0 0 1-3.1 3.8M6.5 7.2C4 8.9 2.5 12 2.5 12s3.5 6.5 9.5 6.5c1.1 0 2.1-.2 3-.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}

function IconAlert({ className = "h-[18px] w-[18px]" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4.5M12 17h.01" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.3 3.9 2.6 17.5A1.8 1.8 0 0 0 4.2 20h15.6a1.8 1.8 0 0 0 1.6-2.5L13.7 3.9a1.8 1.8 0 0 0-3.4 0Z" />
    </svg>
  );
}

function IconSpinner({ className = "h-[18px] w-[18px]" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={`animate-spin ${className}`}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export default function LoginPage({ onLogin }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function updateForm(field, value) {
    setForm((c) => ({ ...c, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const data = await requestJson("/api/users/login/", {
        method: "POST",
        body: JSON.stringify(form),
      });
      onLogin?.(data);
    } catch {
      setError(t("Invalid username or password."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-cyan-50/60 to-emerald-50/50 p-4">
      {/* Ambient background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(15,23,42,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.05) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
          maskImage: "radial-gradient(ellipse at center, black 0%, transparent 75%)",
        }}
      />
      <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-cyan-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -right-20 h-96 w-96 rounded-full bg-emerald-300/30 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-rose-200/20 blur-3xl" />

      <div className="relative w-full max-w-md space-y-6">
        {/* Branding */}
        <div className="text-center">
          <img
            src="/images/govLogo3.webp"
            alt="Government logo"
            className="mx-auto h-20 object-contain drop-shadow-[0_8px_20px_rgba(15,23,42,0.12)]"
          />
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700">
            গণপ্রজাতন্ত্রী বাংলাদেশ সরকার
          </p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900 sm:text-4xl">{t("Directorate of Education Engineering")}</h1>
          <p className="mt-1.5 text-sm text-slate-500">{t("Stock & Inventory Management System")}</p>
        </div>

        {/* Login card */}
        <form
          onSubmit={handleSubmit}
          className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/80 p-7 shadow-[0_20px_60px_-15px_rgba(15,23,42,0.15)] backdrop-blur-xl sm:p-8"
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500" />

          <div className="flex items-center gap-3.5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 text-white shadow-lg shadow-cyan-500/25">
              <IconLock className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{t("Sign in")}</h2>
              <p className="text-xs text-slate-500">{t("Enter your credentials to continue")}</p>
            </div>
          </div>

          <label className="mt-6 block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              {t("Username")}
            </span>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex w-11 items-center justify-center text-slate-400">
                <IconUser />
              </span>
              <input
                value={form.username}
                onChange={(e) => updateForm("username", e.target.value)}
                autoComplete="username"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-500/15"
                placeholder={t("Username")}
                required
              />
            </div>
          </label>

          <label className="mt-4 block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              {t("Password")}
            </span>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex w-11 items-center justify-center text-slate-400">
                <IconLock />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => updateForm("password", e.target.value)}
                autoComplete="current-password"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-500/15"
                placeholder={t("Password")}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-400 transition hover:text-cyan-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? <IconEyeOff /> : <IconEye />}
              </button>
            </div>
          </label>

          {error && (
            <div className="mt-4 flex items-center gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              <IconAlert className="h-[18px] w-[18px] shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-cyan-500/30 disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-slate-300 disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none"
          >
            {saving && <IconSpinner />}
            {saving ? t("Signing in…") : t("Sign In")}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          © {new Date().getFullYear()} গণপ্রজাতন্ত্রী বাংলাদেশ সরকার · {t("All rights reserved.")}
        </p>
      </div>
    </div>
  );
}
