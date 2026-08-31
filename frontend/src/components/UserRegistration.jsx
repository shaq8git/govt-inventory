import { useEffect, useRef, useState } from "react";

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

const ITEMS_PER_PAGE = 8;

async function requestJson(url, options) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
    ...options,
  });
  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err ? JSON.stringify(err) : `Request failed with ${response.status}`);
  }
  return response.status === 204 ? null : response.json();
}

function normalizeList(data) {
  return Array.isArray(data) ? data : data.results || [];
}

const inputCls =
  "h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200";
const selectCls =
  "h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 disabled:bg-slate-100";
const labelCls = "mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500";
const cancelBtnCls =
  "h-10 shrink-0 rounded-lg border border-slate-300 px-3 text-sm text-slate-600 hover:bg-slate-50";

function SearchIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
      strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="m16.5 16.5 4 4" />
    </svg>
  );
}

function ChevronLeft({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRight({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function pageNumbers(current, total) {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current]);
  if (current > 1) pages.add(current - 1);
  if (current < total) pages.add(current + 1);
  return [...pages].sort((a, b) => a - b);
}

function ChevronDown({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function IconEdit({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "-- Select --",
  disabled,
  addNewLabel,
  onAddNew,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    function onMouseDown(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  useEffect(() => {
    if (open && searchRef.current) searchRef.current.focus();
  }, [open]);

  const filtered = search
    ? options.filter((o) => o.name?.toLowerCase().includes(search.toLowerCase()))
    : options;

  const selected = options.find((o) => String(o.id) === String(value));

  function toggle() {
    if (disabled) return;
    setOpen((v) => !v);
    setSearch("");
  }

  function pick(id) {
    onChange(String(id));
    setOpen(false);
    setSearch("");
  }

  function clear() {
    onChange("");
    setOpen(false);
    setSearch("");
  }

  function handleAddNew() {
    setOpen(false);
    setSearch("");
    onAddNew?.();
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={toggle}
        className={`${selectCls} flex items-center justify-between gap-2 text-left ${
          disabled ? "cursor-not-allowed opacity-60" : ""
        } ${selected ? "text-slate-900" : "text-slate-400"}`}
      >
        <span className="truncate">{selected ? selected.name : placeholder}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">

          {/* ── Add new — pinned at top ── */}
          {addNewLabel && (
            <button
              type="button"
              onClick={handleAddNew}
              className="flex w-full items-center gap-2 border-b border-cyan-100 bg-cyan-50 px-3 py-2.5 text-left text-sm font-semibold text-cyan-700 transition hover:bg-cyan-100"
            >
              <span className="text-base leading-none">＋</span>
              {addNewLabel}
            </button>
          )}

          {/* ── Search input ── */}
          <div className="border-b border-slate-100 p-2">
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
              placeholder="Type to search…"
              className="h-8 w-full rounded border border-slate-200 px-2 text-sm outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-200"
            />
          </div>

          {/* ── Scrollable list ── */}
          <div className="max-h-52 overflow-y-auto">
            <button
              type="button"
              onClick={clear}
              className="w-full px-3 py-2 text-left text-sm text-slate-400 hover:bg-slate-50"
            >
              -- Select --
            </button>
            {filtered.length === 0 ? (
              <p className="px-3 py-4 text-center text-xs text-slate-400">
                No results for &ldquo;{search}&rdquo;
              </p>
            ) : (
              filtered.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => pick(o.id)}
                  className={`w-full px-3 py-2 text-left text-sm transition-colors hover:bg-cyan-50 ${
                    String(o.id) === String(value)
                      ? "bg-cyan-50 font-medium text-cyan-700"
                      : "text-slate-700"
                  }`}
                >
                  {o.name}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function UserRegistration({ onRegistered }) {
  // ── table state ──────────────────────────────────────────────
  const [users, setUsers] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // ── shared dropdown data ──────────────────────────────────────
  const [districtOffices, setDistrictOffices] = useState([]);
  const [offices, setOffices] = useState([]);
  const [userRoles, setUserRoles] = useState([]);
  const [dropdownsLoading, setDropdownsLoading] = useState(true);

  // ── register modal state ──────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [filteredOffices, setFilteredOffices] = useState([]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [districtOfficeMode, setDistrictOfficeMode] = useState("select");
  const [officeMode, setOfficeMode] = useState("select");
  const [userRoleMode, setUserRoleMode] = useState("select");

  // ── edit modal state ──────────────────────────────────────────
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editFilteredOffices, setEditFilteredOffices] = useState([]);
  const [editSaving, setEditSaving] = useState(false);
  const [editFormError, setEditFormError] = useState("");

  // initial load
  useEffect(() => {
    loadDropdowns();
    loadUsers("");
  }, []);

  // live search: debounce 300 ms, reset to page 1
  useEffect(() => {
    const t = setTimeout(() => {
      loadUsers(searchInput);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  // ── data fetching ─────────────────────────────────────────────
  async function loadUsers(q) {
    setTableLoading(true);
    try {
      const qs = q ? `?search=${encodeURIComponent(q)}` : "";
      const data = await requestJson(`/api/users/${qs}`);
      setUsers(normalizeList(data));
    } catch {
      setUsers([]);
    } finally {
      setTableLoading(false);
    }
  }

  async function loadDropdowns() {
    setDropdownsLoading(true);
    try {
      const [districtData, officeData, roleData] = await Promise.all([
        requestJson("/api/district-offices/"),
        requestJson("/api/offices/"),
        requestJson("/api/userroles/"),
      ]);
      const dList = normalizeList(districtData);
      const oList = normalizeList(officeData);
      setDistrictOffices(dList);
      setOffices(oList);
      setFilteredOffices(oList);
      setUserRoles(normalizeList(roleData));
    } finally {
      setDropdownsLoading(false);
    }
  }

  // ── pagination ────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(users.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const pagedUsers = users.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  // ── modal helpers ─────────────────────────────────────────────
  function openModal() {
    setForm(emptyForm);
    setFilteredOffices(offices);
    setDistrictOfficeMode("select");
    setOfficeMode("select");
    setUserRoleMode("select");
    setFormError("");
    setModalOpen(true);
  }

  function closeModal() { setModalOpen(false); }

  function updateForm(field, value) {
    setForm((cur) => {
      const next = { ...cur, [field]: value };
      if (field === "districtoffice_id") {
        next.office_id = "";
        setFilteredOffices(
          value ? offices.filter((o) => String(o.districtoffice_id) === value) : offices
        );
      }
      return next;
    });
  }

  // ── form submit ───────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.username.trim() || !form.email.trim() || !form.password) {
      setFormError("Username, email, and password are required.");
      return;
    }
    setSaving(true);
    setFormError("");
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

      closeModal();
      loadUsers(searchInput);
      onRegistered?.(data);
    } catch (apiError) {
      let msg = "Registration failed.";
      try {
        const parsed = JSON.parse(apiError.message);
        const parts = Object.entries(parsed)
          .map(([f, errs]) => `${f}: ${Array.isArray(errs) ? errs.join(", ") : errs}`)
          .join(" | ");
        if (parts) msg = parts;
      } catch {
        if (apiError.message && !apiError.message.startsWith("Request failed")) {
          msg = apiError.message;
        }
      }
      setFormError(msg);
    } finally {
      setSaving(false);
    }
  }

  // ── lookup helpers for table display ─────────────────────────
  function districtName(id) {
    if (!id) return "—";
    return districtOffices.find((d) => d.id === id)?.name ?? "—";
  }
  function officeName(id) {
    if (!id) return "—";
    return offices.find((o) => o.id === id)?.name ?? "—";
  }

  // ── edit modal helpers ────────────────────────────────────────
  function openEditModal(user) {
    setEditingUser(user);
    const ef = {
      username: user.username || "",
      email: user.email || "",
      designation: user.designation || "",
      districtoffice_id: user.districtoffice_id ? String(user.districtoffice_id) : "",
      office_id: user.office_id ? String(user.office_id) : "",
      userrole: user.userrole?.id ? String(user.userrole.id) : "",
      mobileno: user.mobileno || "",
    };
    setEditForm(ef);
    setEditFilteredOffices(
      ef.districtoffice_id
        ? offices.filter((o) => String(o.districtoffice_id) === ef.districtoffice_id)
        : offices
    );
    setEditFormError("");
    setEditModalOpen(true);
  }

  function closeEditModal() {
    setEditModalOpen(false);
    setEditingUser(null);
  }

  function updateEditForm(field, value) {
    setEditForm((cur) => {
      const next = { ...cur, [field]: value };
      if (field === "districtoffice_id") {
        next.office_id = "";
        setEditFilteredOffices(
          value ? offices.filter((o) => String(o.districtoffice_id) === value) : offices
        );
      }
      return next;
    });
  }

  async function handleEditSubmit(e) {
    e.preventDefault();
    if (!editForm.username.trim() || !editForm.email.trim()) {
      setEditFormError("Username and email are required.");
      return;
    }
    setEditSaving(true);
    setEditFormError("");
    const token = sessionStorage.getItem("storeAuthToken");
    try {
      const payload = {
        username: editForm.username.trim(),
        email: editForm.email.trim(),
        designation: editForm.designation.trim(),
        districtoffice_id: editForm.districtoffice_id ? Number(editForm.districtoffice_id) : 0,
        office_id: editForm.office_id ? Number(editForm.office_id) : 0,
        mobileno: editForm.mobileno.trim(),
        ...(editForm.userrole ? { userrole_id: Number(editForm.userrole) } : {}),
      };
      await requestJson(`/api/users/${editingUser.id}/`, {
        method: "PATCH",
        headers: { Authorization: `Token ${token}` },
        body: JSON.stringify(payload),
      });
      closeEditModal();
      loadUsers(searchInput);
    } catch (apiError) {
      let msg = "Update failed.";
      try {
        const parsed = JSON.parse(apiError.message);
        const parts = Object.entries(parsed)
          .map(([f, errs]) => `${f}: ${Array.isArray(errs) ? errs.join(", ") : errs}`)
          .join(" | ");
        if (parts) msg = parts;
      } catch {
        if (apiError.message && !apiError.message.startsWith("Request failed")) {
          msg = apiError.message;
        }
      }
      setEditFormError(msg);
    } finally {
      setEditSaving(false);
    }
  }

  // ── render ────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-[#f4f6f8] text-slate-900">

      {/* ── Page header ───────────────────────────────────────── */}
      <section className="border-b border-slate-200 bg-[#f4f6f8]">
        <div className="mx-auto max-w-6xl px-4 pt-3 pb-2 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="shrink-0 text-xl font-semibold text-slate-950">User Registration</h1>
            {/* Search — fills remaining space */}
            <div className="relative min-w-[200px] flex-1">
              <span
                className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 transition-opacity duration-300 ${
                  searchInput ? "opacity-0" : "opacity-100"
                }`}
              >
                <SearchIcon className="h-4 w-4 text-red-500" />
              </span>
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by name, mobile, designation…"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 py-0 pl-10 pr-3 text-sm font-semibold text-slate-950 outline-none placeholder:text-slate-600 placeholder:font-normal transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
              />
            </div>

            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="h-10 shrink-0 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
              >
                Clear
              </button>
            )}

            <button
              type="button"
              onClick={openModal}
              className="h-10 shrink-0 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 px-5 text-sm font-semibold text-white transition hover:from-cyan-600 hover:to-emerald-600"
            >
              + Register
            </button>
          </div>
        </div>
      </section>

      {/* ── Users table ───────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-2 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
          <div className="max-h-[480px] overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="sticky top-0 z-10 border-b border-cyan-700 bg-gradient-to-r from-cyan-600 to-emerald-600">
                  {["#", "Username", "Designation", "District Office", "Office", "Mobile No.", "Role", "Edit"].map(
                    (h, i) => (
                      <th
                        key={h}
                        className={`whitespace-nowrap px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white ${
                          i === 0 || i === 7 ? "text-center" : "text-left"
                        }`}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody>
                {tableLoading ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-16 text-center text-sm text-slate-400">
                      <span className="inline-flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-cyan-600" />
                        Loading users…
                      </span>
                    </td>
                  </tr>
                ) : pagedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-16 text-center text-sm text-slate-400">
                      {searchInput
                        ? `No users found for "${searchInput}".`
                        : "No users registered yet."}
                    </td>
                  </tr>
                ) : (
                  pagedUsers.map((u, idx) => {
                    const rowNum = (safePage - 1) * ITEMS_PER_PAGE + idx + 1;
                    const isEven = idx % 2 === 1;
                    return (
                      <tr
                        key={u.id}
                        className={`border-b border-slate-100 transition-colors last:border-0 hover:bg-cyan-50/40 ${
                          isEven ? "bg-slate-50" : "bg-white"
                        }`}
                      >
                        <td className="h-12 px-5 align-middle text-center text-xs font-semibold text-slate-600">
                          {rowNum}
                        </td>
                        <td className="h-12 px-5 align-middle font-semibold text-slate-950">{u.username}</td>
                        <td className="h-12 px-5 align-middle text-slate-950">{u.designation || "—"}</td>
                        <td className="h-12 px-5 align-middle text-slate-950">{districtName(u.districtoffice_id)}</td>
                        <td className="h-12 px-5 align-middle text-slate-950">{officeName(u.office_id)}</td>
                        <td className="h-12 px-5 align-middle font-mono text-slate-900">{u.mobileno || "—"}</td>
                        <td className="h-12 px-5 align-middle text-slate-950">{u.userrole?.rolename || "—"}</td>
                        <td className="h-12 px-5 align-middle text-center">
                          <button
                            type="button"
                            onClick={() => openEditModal(u)}
                            className="inline-flex items-center justify-center rounded-lg border border-rose-200 bg-white p-2 text-rose-500 transition hover:border-rose-400 hover:bg-rose-50 hover:text-rose-700"
                            title="Edit user"
                          >
                            <IconEdit className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination footer ── */}
          {!tableLoading && users.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
              <p className="text-xs text-slate-600">
                Showing{" "}
                <span className="font-semibold text-slate-700">
                  {(safePage - 1) * ITEMS_PER_PAGE + 1}–
                  {Math.min(safePage * ITEMS_PER_PAGE, users.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">{users.length}</span> users
                {searchInput && (
                  <span className="ml-1 text-cyan-600">for "{searchInput}"</span>
                )}
              </p>

              <div className="flex items-center gap-1">
                {/* Prev */}
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-cyan-400 hover:text-cyan-700 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronLeft />
                </button>

                {/* Page number boxes */}
                {pageNumbers(safePage, totalPages).map((n, i, arr) => (
                  <span key={n} className="flex items-center gap-1">
                    {i > 0 && arr[i - 1] !== n - 1 && (
                      <span className="px-1 text-xs text-slate-300">…</span>
                    )}
                    <button
                      type="button"
                      onClick={() => setCurrentPage(n)}
                      className={`h-8 min-w-[2rem] rounded-lg border px-2 text-xs font-semibold transition ${
                        safePage === n
                          ? "border-cyan-600 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-sm"
                          : "border-slate-300 bg-white text-slate-900 hover:border-cyan-400 hover:text-cyan-700"
                      }`}
                    >
                      {n}
                    </button>
                  </span>
                ))}

                {/* Next */}
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-cyan-400 hover:text-cyan-700 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronRight />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Registration modal ─────────────────────────────────── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-base font-semibold text-slate-950">Register New User</h2>
              <button
                type="button"
                onClick={closeModal}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Modal form */}
            <form onSubmit={handleSubmit} className="max-h-[78vh] overflow-y-auto p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <label className="block">
                  <span className={labelCls}>Username *</span>
                  <input
                    value={form.username}
                    onChange={(e) => updateForm("username", e.target.value)}
                    className={inputCls}
                    placeholder="Full name or username"
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

                

                {/* District Office */}
                <div className="block">
                  <span className={labelCls}>District Office</span>
                  {districtOfficeMode === "select" ? (
                    <SearchableSelect
                      options={districtOffices}
                      value={form.districtoffice_id}
                      onChange={(v) => updateForm("districtoffice_id", v)}
                      placeholder="-- Select district office --"
                      disabled={dropdownsLoading}
                      addNewLabel="Add new district office"
                      onAddNew={() => { setDistrictOfficeMode("add"); updateForm("districtoffice_id", ""); }}
                    />
                  ) : (
                    <div className="flex gap-2">
                      <input
                        value={form.new_district_office}
                        onChange={(e) => updateForm("new_district_office", e.target.value)}
                        className={inputCls}
                        placeholder="New district office name"
                        autoFocus
                      />
                      <button type="button" onClick={() => { setDistrictOfficeMode("select"); updateForm("new_district_office", ""); }} className={cancelBtnCls}>Cancel</button>
                    </div>
                  )}
                </div>

                {/* Office */}
                <div className="block">
                  <span className={labelCls}>Office Name</span>
                  {officeMode === "select" ? (
                    <SearchableSelect
                      options={filteredOffices}
                      value={form.office_id}
                      onChange={(v) => updateForm("office_id", v)}
                      placeholder="-- Select office --"
                      disabled={dropdownsLoading}
                      addNewLabel="Add new office"
                      onAddNew={() => { setOfficeMode("add"); updateForm("office_id", ""); }}
                    />
                  ) : (
                    <div className="flex gap-2">
                      <input
                        value={form.new_office}
                        onChange={(e) => updateForm("new_office", e.target.value)}
                        className={inputCls}
                        placeholder="New office name"
                        autoFocus
                      />
                      <button type="button" onClick={() => { setOfficeMode("select"); updateForm("new_office", ""); }} className={cancelBtnCls}>Cancel</button>
                    </div>
                  )}
                </div>

                <label className="block">
                  <span className={labelCls}>Designation</span>
                  <input
                    value={form.designation}
                    onChange={(e) => updateForm("designation", e.target.value)}
                    className={inputCls}
                    placeholder="e.g. Officer"
                  />
                </label>

                

                {/* User Role */}
                <div className="block">
                  <span className={labelCls}>User Role</span>
                  {userRoleMode === "select" ? (
                    <SearchableSelect
                      options={userRoles.map((r) => ({ id: r.id, name: r.rolename }))}
                      value={form.userrole}
                      onChange={(v) => updateForm("userrole", v)}
                      placeholder="-- Select role --"
                      disabled={dropdownsLoading}
                      addNewLabel="Add new role"
                      onAddNew={() => { setUserRoleMode("add"); updateForm("userrole", ""); }}
                    />
                  ) : (
                    <div className="flex gap-2">
                      <input
                        list="role-suggestions"
                        value={form.new_userrole}
                        onChange={(e) => updateForm("new_userrole", e.target.value)}
                        className={inputCls}
                        placeholder="New role name"
                        autoFocus
                      />
                      <datalist id="role-suggestions">
                        <option value="System Admin" />
                        <option value="Normal User" />
                        <option value="Store Admin" />
                      </datalist>
                      <button type="button" onClick={() => { setUserRoleMode("select"); updateForm("new_userrole", ""); }} className={cancelBtnCls}>Cancel</button>
                    </div>
                  )}
                </div>

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

              {formError && (
                <div className="mt-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {formError}
                </div>
              )}

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="h-10 rounded-lg border border-slate-300 px-4 text-sm text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="h-10 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 px-6 text-sm font-semibold text-white transition hover:from-cyan-600 hover:to-emerald-600 disabled:cursor-not-allowed disabled:from-slate-400 disabled:to-slate-400"
                >
                  {saving ? "Registering…" : "Register"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit modal ────────────────────────────────────────── */}
      {editModalOpen && editingUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) closeEditModal(); }}
        >
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-base font-semibold text-slate-950">
                Edit User — <span className="text-cyan-700">{editingUser.username}</span>
              </h2>
              <button
                type="button"
                onClick={closeEditModal}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="max-h-[78vh] overflow-y-auto p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <label className="block">
                  <span className={labelCls}>Username *</span>
                  <input
                    value={editForm.username}
                    onChange={(e) => updateEditForm("username", e.target.value)}
                    className={inputCls}
                    placeholder="Full name or username"
                    required
                  />
                </label>

                <label className="block">
                  <span className={labelCls}>Email *</span>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => updateEditForm("email", e.target.value)}
                    className={inputCls}
                    placeholder="user@example.com"
                    required
                  />
                </label>

                <label className="block">
                  <span className={labelCls}>Designation</span>
                  <input
                    value={editForm.designation}
                    onChange={(e) => updateEditForm("designation", e.target.value)}
                    className={inputCls}
                    placeholder="e.g. Officer"
                  />
                </label>

                <label className="block">
                  <span className={labelCls}>Mobile No.</span>
                  <input
                    type="tel"
                    value={editForm.mobileno}
                    onChange={(e) => updateEditForm("mobileno", e.target.value)}
                    className={inputCls}
                    placeholder="e.g. 01700000000"
                  />
                </label>

                {/* District Office */}
                <div className="block">
                  <span className={labelCls}>District Office</span>
                  <SearchableSelect
                    options={districtOffices}
                    value={editForm.districtoffice_id}
                    onChange={(v) => updateEditForm("districtoffice_id", v)}
                    placeholder="-- Select district office --"
                    disabled={dropdownsLoading}
                  />
                </div>

                {/* Office */}
                <div className="block">
                  <span className={labelCls}>Office Name</span>
                  <SearchableSelect
                    options={editFilteredOffices}
                    value={editForm.office_id}
                    onChange={(v) => updateEditForm("office_id", v)}
                    placeholder="-- Select office --"
                    disabled={dropdownsLoading}
                  />
                </div>

                {/* User Role */}
                <div className="block sm:col-span-2">
                  <span className={labelCls}>User Role</span>
                  <SearchableSelect
                    options={userRoles.map((r) => ({ id: r.id, name: r.rolename }))}
                    value={editForm.userrole}
                    onChange={(v) => updateEditForm("userrole", v)}
                    placeholder="-- Select role --"
                    disabled={dropdownsLoading}
                  />
                </div>

              </div>

              {editFormError && (
                <div className="mt-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {editFormError}
                </div>
              )}

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="h-10 rounded-lg border border-slate-300 px-4 text-sm text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="h-10 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 px-6 text-sm font-semibold text-white transition hover:from-cyan-600 hover:to-emerald-600 disabled:cursor-not-allowed disabled:from-slate-400 disabled:to-slate-400"
                >
                  {editSaving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </main>
  );
}
