import { useState } from "react";

async function requestJson(url, options) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
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
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
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
    } catch (apiError) {
      setError("Invalid username or password.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f6f8] text-slate-900">
      <section className="mx-auto flex min-h-[calc(100vh-96px)] max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">
              Directorate of Education Engineering
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Store Management Login
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Sign in with a registered Django user account to continue managing stock setup,
              distribution, reporting, and user roles.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Login</h2>

            <label className="mt-5 block">
              <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Username</span>
              <input
                value={form.username}
                onChange={(event) => updateForm("username", event.target.value)}
                className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                placeholder="username"
              />
            </label>

            <label className="mt-4 block">
              <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Password</span>
              <input
                type="password"
                value={form.password}
                onChange={(event) => updateForm("password", event.target.value)}
                className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                placeholder="password"
              />
            </label>

            {error && (
              <div className="mt-4 rounded-md bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="mt-5 h-11 w-full rounded-md bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {saving ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
