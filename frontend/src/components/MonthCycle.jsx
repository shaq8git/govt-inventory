import { useEffect, useState } from "react";
import { getPerms } from "../utils/permissions.js";

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
  "h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 bg-white";
const labelCls = "mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500";

function SearchIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
      strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="m16.5 16.5 4 4" />
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

const emptyForm = {
  cyclename: "",
  month: "",
  year: "",
  startdate: "",
  enddate: "",
};

export default function MonthCycle() {
  const perms = getPerms("MONTH_CYCLE");
  const [cycles, setCycles] = useState([]);
  const [monthList, setMonthList] = useState([]);
  const [yearList, setYearList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingCycle, setEditingCycle] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editSaving, setEditSaving] = useState(false);
  const [editFormError, setEditFormError] = useState("");

  useEffect(() => {
    loadCycles("");
    loadDropdowns();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      loadCycles(searchInput);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  async function loadCycles(q) {
    setLoading(true);
    try {
      const qs = q ? `?search=${encodeURIComponent(q)}` : "";
      const data = await requestJson(`/api/month-cycles/${qs}`);
      setCycles(normalizeList(data));
    } catch {
      setCycles([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadDropdowns() {
    try {
      const [months, years] = await Promise.all([
        requestJson("/api/month-list/"),
        requestJson("/api/year-list/"),
      ]);
      setMonthList(normalizeList(months));
      setYearList(normalizeList(years));
    } catch {
      // dropdowns stay empty
    }
  }

  const totalPages = Math.max(1, Math.ceil(cycles.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paged = cycles.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  function openModal() {
    setForm(emptyForm);
    setFormError("");
    setModalOpen(true);
  }

  function closeModal() { setModalOpen(false); }

  function updateForm(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function openEditModal(cycle) {
    setEditingCycle(cycle);
    setEditForm({
      cyclename: cycle.cyclename || "",
      month: cycle.month ?? "",
      year: cycle.year ?? "",
      startdate: cycle.startdate || "",
      enddate: cycle.enddate || "",
    });
    setEditFormError("");
    setEditModalOpen(true);
  }

  function closeEditModal() {
    setEditModalOpen(false);
    setEditingCycle(null);
  }

  function updateEditForm(field, value) {
    setEditForm((f) => ({ ...f, [field]: value }));
  }

  function calcDays(start, end) {
    if (!start || !end) return null;
    const diff = (new Date(end) - new Date(start)) / 86400000;
    return diff >= 0 ? diff + 1 : null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.cyclename.trim()) { setFormError("Cycle name is required."); return; }
    setSaving(true);
    setFormError("");
    try {
      await requestJson("/api/month-cycles/", {
        method: "POST",
        body: JSON.stringify({
          cyclename: form.cyclename.trim(),
          month: form.month ? Number(form.month) : null,
          year: form.year ? Number(form.year) : null,
          startdate: form.startdate || null,
          enddate: form.enddate || null,
        }),
      });
      closeModal();
      loadCycles(searchInput);
    } catch {
      setFormError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleEditSubmit(e) {
    e.preventDefault();
    if (!editForm.cyclename.trim()) { setEditFormError("Cycle name is required."); return; }
    setEditSaving(true);
    setEditFormError("");
    try {
      await requestJson(`/api/month-cycles/${editingCycle.id}/`, {
        method: "PATCH",
        body: JSON.stringify({
          cyclename: editForm.cyclename.trim(),
          month: editForm.month ? Number(editForm.month) : null,
          year: editForm.year ? Number(editForm.year) : null,
          startdate: editForm.startdate || null,
          enddate: editForm.enddate || null,
        }),
      });
      closeEditModal();
      loadCycles(searchInput);
    } catch {
      setEditFormError("Failed to update. Please try again.");
    } finally {
      setEditSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f6f8] text-slate-900">

      {/* Page header */}
      <section className="border-b border-slate-200 bg-[#f4f6f8]">
        <div className="mx-auto max-w-6xl px-4 pt-3 pb-2 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="shrink-0 text-xl font-semibold text-slate-950">Month Cycle</h1>
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
                placeholder="Search by cycle name…"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 py-0 pl-10 pr-3 text-sm font-semibold text-slate-950 outline-none placeholder:font-normal placeholder:text-slate-600 transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
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

            {perms.c && (
              <button
                type="button"
                onClick={openModal}
                className="h-10 shrink-0 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 px-5 text-sm font-semibold text-white transition hover:from-cyan-600 hover:to-emerald-600"
              >
                + Add
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Table */}
      <section className="mx-auto max-w-6xl px-4 py-2 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
          <div className="max-h-[480px] overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="sticky top-0 z-10 border-b border-cyan-700 bg-gradient-to-r from-cyan-600 to-emerald-600">
                  {["#", "Cycle Name", "Month", "Year", "Start Date", "End Date", "Days", "Edit"].map((h, i) => (
                    <th
                      key={h}
                      className={`whitespace-nowrap px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-white ${
                        [0, 2, 3, 6, 7].includes(i) ? "text-center" : "text-left"
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-16 text-center text-sm text-slate-400">
                      <span className="inline-flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-cyan-600" />
                        Loading…
                      </span>
                    </td>
                  </tr>
                ) : paged.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-16 text-center text-sm text-slate-400">
                      {searchInput
                        ? `No month cycles found for "${searchInput}".`
                        : "No month cycles added yet."}
                    </td>
                  </tr>
                ) : (
                  paged.map((c, idx) => {
                    const rowNum = (safePage - 1) * ITEMS_PER_PAGE + idx + 1;
                    const isEven = idx % 2 === 1;
                    return (
                      <tr
                        key={c.id}
                        className={`border-b border-slate-100 transition-colors last:border-0 hover:bg-cyan-50/40 ${
                          isEven ? "bg-slate-50" : "bg-white"
                        }`}
                      >
                        <td className="h-12 px-4 align-middle text-center text-xs font-semibold text-slate-600">
                          {rowNum}
                        </td>
                        <td className="h-12 px-4 align-middle font-semibold text-slate-950">
                          {c.cyclename}
                        </td>
                        <td className="h-12 px-4 align-middle text-center text-slate-700">
                          {c.month_name || "—"}
                        </td>
                        <td className="h-12 px-4 align-middle text-center text-slate-700">
                          {c.year_number || "—"}
                        </td>
                        <td className="h-12 px-4 align-middle text-slate-700">
                          {c.startdate || "—"}
                        </td>
                        <td className="h-12 px-4 align-middle text-slate-700">
                          {c.enddate || "—"}
                        </td>
                        <td className="h-12 px-4 align-middle text-center">
                          {c.days != null ? (
                            <span className="inline-block rounded-full bg-cyan-100 px-2.5 py-0.5 text-xs font-semibold text-cyan-700">
                              {c.days}d
                            </span>
                          ) : "—"}
                        </td>
                        <td className="h-12 px-4 align-middle text-center">
                          {perms.u && (
                            <button
                              type="button"
                              onClick={() => openEditModal(c)}
                              className="inline-flex items-center justify-center rounded-lg border border-rose-200 bg-white p-2 text-rose-500 transition hover:border-rose-400 hover:bg-rose-50 hover:text-rose-700"
                              title="Edit"
                            >
                              <IconEdit className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && cycles.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
              <p className="text-xs text-slate-600">
                Showing{" "}
                <span className="font-semibold text-slate-700">
                  {(safePage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(safePage * ITEMS_PER_PAGE, cycles.length)}
                </span>{" "}
                of <span className="font-semibold text-slate-700">{cycles.length}</span> cycles
                {searchInput && (
                  <span className="ml-1 text-cyan-600">for "{searchInput}"</span>
                )}
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-cyan-400 hover:text-cyan-700 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronLeft />
                </button>
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

      {/* Add modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-base font-semibold text-slate-950">Add Month Cycle</h2>
              <button
                type="button"
                onClick={closeModal}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className={labelCls}>Cycle Name *</span>
                  <input
                    value={form.cyclename}
                    onChange={(e) => updateForm("cyclename", e.target.value)}
                    className={inputCls}
                    placeholder="e.g. January Cycle"
                    required
                    autoFocus
                  />
                </label>
                <label className="block">
                  <span className={labelCls}>Month</span>
                  <select
                    value={form.month}
                    onChange={(e) => updateForm("month", e.target.value)}
                    className={selectCls}
                  >
                    <option value="">— Select month —</option>
                    {monthList.map((m) => (
                      <option key={m.id} value={m.id}>{m.monthname}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className={labelCls}>Year</span>
                  <select
                    value={form.year}
                    onChange={(e) => updateForm("year", e.target.value)}
                    className={selectCls}
                  >
                    <option value="">— Select year —</option>
                    {yearList.map((y) => (
                      <option key={y.id} value={y.id}>{y.yearnumber}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className={labelCls}>Start Date</span>
                  <input
                    type="date"
                    value={form.startdate}
                    onChange={(e) => updateForm("startdate", e.target.value)}
                    className={inputCls}
                  />
                </label>
                <label className="block">
                  <span className={labelCls}>End Date</span>
                  <input
                    type="date"
                    value={form.enddate}
                    onChange={(e) => updateForm("enddate", e.target.value)}
                    className={inputCls}
                  />
                </label>
                {calcDays(form.startdate, form.enddate) != null && (
                  <div className="sm:col-span-2 rounded-lg bg-cyan-50 border border-cyan-200 px-4 py-2.5 text-sm text-cyan-800">
                    Duration: <span className="font-semibold">{calcDays(form.startdate, form.enddate)} days</span>
                  </div>
                )}
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
                  {saving ? "Saving…" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editModalOpen && editingCycle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) closeEditModal(); }}
        >
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-base font-semibold text-slate-950">
                Edit — <span className="text-cyan-700">{editingCycle.cyclename}</span>
              </h2>
              <button
                type="button"
                onClick={closeEditModal}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className={labelCls}>Cycle Name *</span>
                  <input
                    value={editForm.cyclename}
                    onChange={(e) => updateEditForm("cyclename", e.target.value)}
                    className={inputCls}
                    placeholder="e.g. January Cycle"
                    required
                    autoFocus
                  />
                </label>
                <label className="block">
                  <span className={labelCls}>Month</span>
                  <select
                    value={editForm.month}
                    onChange={(e) => updateEditForm("month", e.target.value)}
                    className={selectCls}
                  >
                    <option value="">— Select month —</option>
                    {monthList.map((m) => (
                      <option key={m.id} value={m.id}>{m.monthname}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className={labelCls}>Year</span>
                  <select
                    value={editForm.year}
                    onChange={(e) => updateEditForm("year", e.target.value)}
                    className={selectCls}
                  >
                    <option value="">— Select year —</option>
                    {yearList.map((y) => (
                      <option key={y.id} value={y.id}>{y.yearnumber}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className={labelCls}>Start Date</span>
                  <input
                    type="date"
                    value={editForm.startdate}
                    onChange={(e) => updateEditForm("startdate", e.target.value)}
                    className={inputCls}
                  />
                </label>
                <label className="block">
                  <span className={labelCls}>End Date</span>
                  <input
                    type="date"
                    value={editForm.enddate}
                    onChange={(e) => updateEditForm("enddate", e.target.value)}
                    className={inputCls}
                  />
                </label>
                {calcDays(editForm.startdate, editForm.enddate) != null && (
                  <div className="sm:col-span-2 rounded-lg bg-cyan-50 border border-cyan-200 px-4 py-2.5 text-sm text-cyan-800">
                    Duration: <span className="font-semibold">{calcDays(editForm.startdate, editForm.enddate)} days</span>
                  </div>
                )}
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
