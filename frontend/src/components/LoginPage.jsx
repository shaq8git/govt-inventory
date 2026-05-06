import { useState } from "react";

const SEED = { username: "admin", password: "admin123" };

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

export default function LoginPage({ onLogin }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
      setError("Invalid username or password.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md space-y-5">
        {/* Branding */}
        <div className="text-center">
          <img
            src="/images/govLogo3.webp"
            alt="Government logo"
            className="mx-auto h-20 object-contain"
          />
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-400">
            Government of Bangladesh
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-white">
            Directorate of Education Engineering
          </h1>
          
        </div>

        {/* Login form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-[24px] border border-white/10 bg-white/5 p-6 backdrop-blur-md"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Sign in</h2>
            <img src="/images/login2.jpeg" alt="Login illustration" className="h-8 w-8 rounded object-cover" />
          </div>

          <label className="mt-5 block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Username
            </span>
            <input
              value={form.username}
              onChange={(e) => updateForm("username", e.target.value)}
              className="h-11 w-full rounded-xl border border-white/10 bg-slate-800 px-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              placeholder="username"
              required
            />
          </label>

          <label className="mt-4 block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Password
            </span>
            <input
              type="password"
              value={form.password}
              onChange={(e) => updateForm("password", e.target.value)}
              className="h-11 w-full rounded-xl border border-white/10 bg-slate-800 px-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              placeholder="password"
              required
            />
          </label>

          {error && (
            <div className="mt-4 rounded-xl bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="mt-5 h-11 w-full rounded-xl bg-cyan-600 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:bg-slate-600"
          >
            {saving ? "Signing in…" : "Sign In"}
          </button>
        </form>

        {/* Seed credentials hint */}
        {/* <div className="rounded-[20px] border border-white/8 bg-white/[0.03] p-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Default credentials
          </p>
          <p className="mt-2 text-sm text-slate-300">
            Username:{" "}
            <span className="font-mono font-semibold text-cyan-400">{SEED.username}</span>
            &nbsp;&nbsp;·&nbsp;&nbsp;Password:{" "}
            <span className="font-mono font-semibold text-cyan-400">{SEED.password}</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Run{" "}
            <code className="font-mono text-slate-400">python manage.py seed_admin</code> to
            create this account.
          </p>
        </div> */}
      </div>
    </div>
  );
}
