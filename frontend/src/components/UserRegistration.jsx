import { useEffect, useState } from "react";

const emptyForm = {
  username: "",
  email: "",
  designation: "",
  districtoffice_id: "",
  office_id: "",
  userrole: "",
  password: "",
  mobileno: "",
  new_district_office: "",
  new_office: "",
  new_userrole: "",
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

const inputCls =
  "h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200";
const selectCls =
  "h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100";
const labelCls = "mb-1 block text-xs font-semibold uppercase text-slate-500";
const cancelBtnCls =
  "h-11 shrink-0 rounded-md border border-slate-300 px-3 text-sm text-slate-600 hover:bg-slate-50";

export default function UserRegistration({ onRegistered }) {
  const [districtOffices, setDistrictOffices] = useState([]);
  const [offices, setOffices] = useState([]);
  const [filteredOffices, setFilteredOffices] = useState([]);
  const [userRoles, setUserRoles] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [districtOfficeMode, setDistrictOfficeMode] = useState("select");
  const [officeMode, setOfficeMode] = useState("select");
  const [userRoleMode, setUserRoleMode] = useState("select");

  useEffect(() => {
    loadDropdowns();
  }, []);

  async function loadDropdowns() {
    setLoading(true);
    setError("");
    try {
      const [districtData, officeData, roleData] = await Promise.all([
        requestJson("/api/district-offices/"),
        requestJson("/api/offices/"),
        requestJson("/api/userroles/"),
      ]);
      const dList = normalizeList(districtData);
      const oList = normalizeList(officeData);
      const rList = normalizeList(roleData);
      setDistrictOffices(dList);
      setOffices(oList);
      setFilteredOffices(oList);
      setUserRoles(rList);
    } catch {
      setError("Could not load dropdown data. Make sure the API is running.");
    } finally {
      setLoading(false);
    }
  }

  function updateForm(field, value) {
    setForm((current) => {
      const updated = { ...current, [field]: value };
      if (field === "districtoffice_id") {
        updated.office_id = "";
        setFilteredOffices(
          value ? offices.filter((o) => String(o.district_office) === value) : offices
        );
      }
      return updated;
    });
  }

  function cancelDistrictOfficeAdd() {
    setDistrictOfficeMode("select");
    updateForm("new_district_office", "");
  }

  function cancelOfficeAdd() {
    setOfficeMode("select");
    updateForm("new_office", "");
  }

  function cancelUserRoleAdd() {
    setUserRoleMode("select");
    updateForm("new_userrole", "");
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
      let districtOfficeId = form.districtoffice_id ? Number(form.districtoffice_id) : 0;
      if (districtOfficeMode === "add" && form.new_district_office.trim()) {
        const newDO = await requestJson("/api/district-offices/", {
          method: "POST",
          body: JSON.stringify({ name: form.new_district_office.trim() }),
        });
        districtOfficeId = newDO.id;
        setDistrictOffices((prev) =>
          [...prev, newDO].sort((a, b) => a.name.localeCompare(b.name))
        );
      }

      let officeId = form.office_id ? Number(form.office_id) : 0;
      if (officeMode === "add" && form.new_office.trim()) {
        const newOffice = await requestJson("/api/offices/", {
          method: "POST",
          body: JSON.stringify({
            name: form.new_office.trim(),
            ...(districtOfficeId ? { district_office: districtOfficeId } : {}),
          }),
        });
        officeId = newOffice.id;
        setOffices((prev) =>
          [...prev, newOffice].sort((a, b) => a.name.localeCompare(b.name))
        );
      }

      let userRoleId = form.userrole ? Number(form.userrole) : undefined;
      if (userRoleMode === "add" && form.new_userrole.trim()) {
        const newRole = await requestJson("/api/userroles/", {
          method: "POST",
          body: JSON.stringify({ rolename: form.new_userrole.trim() }),
        });
        userRoleId = newRole.id;
        setUserRoles((prev) => [...prev, newRole]);
      }

      const payload = {
        username: form.username,
        email: form.email,
        designation: form.designation,
        districtoffice_id: districtOfficeId,
        office_id: officeId,
        mobileno: form.mobileno,
        password: form.password,
        ...(userRoleId && { userrole: userRoleId }),
      };

      const data = await requestJson("/api/users/register/", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setDistrictOfficeMode("select");
      setOfficeMode("select");
      setUserRoleMode("select");
      setForm(emptyForm);
      setFilteredOffices(offices);
      setNotice("User registered successfully.");
      onRegistered?.(data);
    } catch (apiError) {
      setError("Registration failed. Check for duplicate username/email or short password.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f6f8] text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-sm font-medium uppercase tracking-wide text-cyan-700">
            User Management
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-950 sm:text-3xl">
            User Registration
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <form
          onSubmit={handleSubmit}
          className="rounded-md border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Row 1 */}
            <label className="block">
              <span className={labelCls}>Username *</span>
              <input
                value={form.username}
                onChange={(e) => updateForm("username", e.target.value)}
                className={inputCls}
                placeholder="username"
                required
              />
            </label>

            <label className="block">
              <span className={labelCls}>Email *</span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateForm("email", e.target.value)}
                className={inputCls}
                placeholder="user@example.com"
                required
              />
            </label>

            {/* Row 2 */}
            <label className="block">
              <span className={labelCls}>Designation</span>
              <input
                value={form.designation}
                onChange={(e) => updateForm("designation", e.target.value)}
                className={inputCls}
                placeholder="e.g. Officer"
              />
            </label>

            {/* District Office */}
            <div className="block">
              <span className={labelCls}>District Office</span>
              {districtOfficeMode === "select" ? (
                <select
                  value={form.districtoffice_id}
                  onChange={(e) => {
                    if (e.target.value === "__add__") {
                      setDistrictOfficeMode("add");
                      updateForm("districtoffice_id", "");
                    } else {
                      updateForm("districtoffice_id", e.target.value);
                    }
                  }}
                  disabled={loading}
                  className={selectCls}
                >
                  <option value="">-- Select District Office --</option>
                  {districtOffices.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                  <option value="__add__">+ Add new district office…</option>
                </select>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={form.new_district_office}
                    onChange={(e) => updateForm("new_district_office", e.target.value)}
                    className={inputCls}
                    placeholder="New district office name"
                    autoFocus
                  />
                  <button type="button" onClick={cancelDistrictOfficeAdd} className={cancelBtnCls}>
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Office Name */}
            <div className="block">
              <span className={labelCls}>Office Name</span>
              {officeMode === "select" ? (
                <select
                  value={form.office_id}
                  onChange={(e) => {
                    if (e.target.value === "__add__") {
                      setOfficeMode("add");
                      updateForm("office_id", "");
                    } else {
                      updateForm("office_id", e.target.value);
                    }
                  }}
                  disabled={loading}
                  className={selectCls}
                >
                  <option value="">-- Select Office --</option>
                  {filteredOffices.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                  <option value="__add__">+ Add new office…</option>
                </select>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={form.new_office}
                    onChange={(e) => updateForm("new_office", e.target.value)}
                    className={inputCls}
                    placeholder="New office name"
                    autoFocus
                  />
                  <button type="button" onClick={cancelOfficeAdd} className={cancelBtnCls}>
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* User Role */}
            <div className="block">
              <span className={labelCls}>User Role</span>
              {userRoleMode === "select" ? (
                <select
                  value={form.userrole}
                  onChange={(e) => {
                    if (e.target.value === "__add__") {
                      setUserRoleMode("add");
                      updateForm("userrole", "");
                    } else {
                      updateForm("userrole", e.target.value);
                    }
                  }}
                  disabled={loading}
                  className={selectCls}
                >
                  <option value="">-- Select Role --</option>
                  {userRoles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.rolename}
                    </option>
                  ))}
                  <option value="__add__">+ Add new role…</option>
                </select>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={form.new_userrole}
                    onChange={(e) => updateForm("new_userrole", e.target.value)}
                    className={inputCls}
                    placeholder="New role name"
                    autoFocus
                  />
                  <button type="button" onClick={cancelUserRoleAdd} className={cancelBtnCls}>
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Row 4 */}
            <label className="block">
              <span className={labelCls}>Password *</span>
              <input
                type="password"
                value={form.password}
                onChange={(e) => updateForm("password", e.target.value)}
                className={inputCls}
                placeholder="Minimum 8 characters"
                required
              />
            </label>

            <label className="block">
              <span className={labelCls}>Mobile No.</span>
              <input
                type="tel"
                value={form.mobileno}
                onChange={(e) => updateForm("mobileno", e.target.value)}
                className={inputCls}
                placeholder="e.g. 01700000000"
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

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={saving || loading}
              className="h-11 rounded-md bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {saving ? "Registering..." : "Register"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
