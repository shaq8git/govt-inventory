import { useEffect, useState } from "react";

const emptyForm = {
  username: "",
  email: "",
  password: "",
  first_name: "",
  last_name: "",
  designation: "",
  office_id: "0",
  districtoffice_id: "0",
  aprflag: "0",
  mobileno: "",
  status_id: "1",
  otpdate: "",
  lotpno: "",
  userrole: "",
};

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

  return response.status === 204 ? null : response.json();
}

function normalizeList(data) {
  return Array.isArray(data) ? data : data.results || [];
}

export default function UserRegistration({ onRegistered }) {
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    loadRoles();
  }, []);

  async function loadRoles() {
    setLoading(true);
    setError("");

    try {
      const data = await requestJson("/api/userroles/");
      setRoles(normalizeList(data));
    } catch (apiError) {
      setError("Could not load user roles. Run Django migrations and make sure the API is running.");
    } finally {
      setLoading(false);
    }
  }

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
    setNotice("");

    if (!form.username.trim() || !form.email.trim() || !form.password) {
      setError("Username, email, and password are required.");
      setSaving(false);
      return;
    }

    try {
      const payload = {
        ...form,
        office_id: Number(form.office_id || 0),
        districtoffice_id: Number(form.districtoffice_id || 0),
        aprflag: Number(form.aprflag || 0),
        status_id: Number(form.status_id || 1),
        otpdate: form.otpdate || null,
        lotpno: form.lotpno || null,
      };

      if (!payload.group) {
        delete payload.group;
      }

      const data = await requestJson("/api/users/", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setForm(emptyForm);
      setNotice("User registered.");
      onRegistered?.(data);
    } catch (apiError) {
      setError("Could not register user. Check duplicate username/email and password length.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f6f8] text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-cyan-700">
                User Management
              </p>
              <h1 className="mt-1 text-2xl font-semibold text-slate-950 sm:text-3xl">
                User Registration
              </h1>
            </div>
            <button
              type="button"
              onClick={loadRoles}
              className="h-10 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              Refresh Roles
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Username</span>
              <input
                value={form.username}
                onChange={(event) => updateForm("username", event.target.value)}
                className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                placeholder="username"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Email</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateForm("email", event.target.value)}
                className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                placeholder="user@example.com"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Password</span>
              <input
                type="password"
                value={form.password}
                onChange={(event) => updateForm("password", event.target.value)}
                className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                placeholder="Minimum 8 characters"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">First Name</span>
              <input
                value={form.first_name}
                onChange={(event) => updateForm("first_name", event.target.value)}
                className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Last Name</span>
              <input
                value={form.last_name}
                onChange={(event) => updateForm("last_name", event.target.value)}
                className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Role</span>
              <select
                value={form.group}
                onChange={(event) => updateForm("group", event.target.value)}
                disabled={loading}
                className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
              >
                <option value="">No role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.rolename}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Designation</span>
              <input
                value={form.designation}
                onChange={(event) => updateForm("designation", event.target.value)}
                className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Mobile No.</span>
              <input
                value={form.mobileno}
                onChange={(event) => updateForm("mobileno", event.target.value)}
                className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Status ID</span>
              <input
                type="number"
                min="0"
                value={form.status_id}
                onChange={(event) => updateForm("status_id", event.target.value)}
                className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Office ID</span>
              <input
                type="number"
                min="0"
                value={form.office_id}
                onChange={(event) => updateForm("office_id", event.target.value)}
                className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">District Office ID</span>
              <input
                type="number"
                min="0"
                value={form.districtoffice_id}
                onChange={(event) => updateForm("districtoffice_id", event.target.value)}
                className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Approval Flag</span>
              <select
                value={form.aprflag}
                onChange={(event) => updateForm("aprflag", event.target.value)}
                className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              >
                <option value="0">Pending</option>
                <option value="1">Approved</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">OTP Date</span>
              <input
                type="date"
                value={form.otpdate}
                onChange={(event) => updateForm("otpdate", event.target.value)}
                className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Last OTP No. Date</span>
              <input
                type="date"
                value={form.lotpno}
                onChange={(event) => updateForm("lotpno", event.target.value)}
                className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </label>
          </div>

          {(error || notice) && (
            <div
              className={`mt-4 rounded-md px-4 py-3 text-sm ${
                error ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"
              }`}
            >
              {error || notice}
            </div>
          )}

          <div className="mt-5 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="h-11 rounded-md bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {saving ? "Registering..." : "Register User"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
