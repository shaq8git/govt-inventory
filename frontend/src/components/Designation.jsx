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

const COLS = ["#", "Designation Name", "Edit"];

export default function Designation() {
  const perms = getPerms("DESIGNATION");
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingDesig, setEditingDesig] = useState(null);
  const [editName, setEditName] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [editFormError, setEditFormError] = useState("");

  useEffect(() => { loadDesignations(""); }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      loadDesignations(searchInput);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  async function loadDesignations(q) {
    setLoading(true);
    try {
      const qs = q ? `?search=${encodeURIComponent(q)}` : "";
      const data = await requestJson(`/api/designations/${qs}`);
      setDesignations(normalizeList(data));
    } catch {
      setDesignations([]);
    } finally {
      setLoading(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(designations.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paged = designations.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  function openModal() {
    setName("");
    setFormError("");
    setModalOpen(true);
  }

  function closeModal() { setModalOpen(false); }

  function openEditModal(d) {
    setEditingDesig(d);
    setEditName(d.designationname || "");
    setEditFormError("");
    setEditModalOpen(true);
  }

  function closeEditModal() {
    setEditModalOpen(false);
    setEditingDesig(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) { setFormError("Designation name is required."); return; }
    setSaving(true);
    setFormError("");
    try {
      await requestJson("/api/designations/", {
        method: "POST",
        body: JSON.stringify({ designationname: name.trim() }),
      });
      closeModal();
      loadDesignations(searchInput);
    } catch {
      setFormError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleEditSubmit(e) {
    e.preventDefault();
    if (!editName.trim()) { setEditFormError("Designation name is required."); return; }
    setEditSaving(true);
    setEditFormError("");
    try {
      await requestJson(`/api/designations/${editingDesig.id}/`, {
        method: "PATCH",
        body: JSON.stringify({ designationname: editName.trim() }),
      });
      closeEditModal();
      loadDesignations(searchInput);
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
          <h1 className="text-center text-xl font-semibold text-slate-950">Designation</h1>
          <div className="mt-2 flex items-center gap-3">
            <div className="relative flex-1">
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
                placeholder="Search by name…"
                className="h-10 w-full rounded-lg border border-slate-400 bg-slate-200 py-0 pl-10 pr-3 text-sm font-semibold text-slate-950 outline-none placeholder:font-normal placeholder:text-slate-600 transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
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
                className="h-10 shrink-0 rounded-lg bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-cyan-700"
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
                <tr className="sticky top-0 z-10 border-b border-slate-500 bg-gray-500">
                  {COLS.map((h, i) => (
                    <th
                      key={h}
                      className={`whitespace-nowrap px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white ${
                        i === 0 || i === COLS.length - 1 ? "text-center" : "text-left"
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
                    <td colSpan={COLS.length} className="px-5 py-16 text-center text-sm text-slate-400">
                      <span className="inline-flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-cyan-600" />
                        Loading…
                      </span>
                    </td>
                  </tr>
                ) : paged.length === 0 ? (
                  <tr>
                    <td colSpan={COLS.length} className="px-5 py-16 text-center text-sm text-slate-400">
                      {searchInput
                        ? `No designations found for "${searchInput}".`
                        : "No designations added yet."}
                    </td>
                  </tr>
                ) : (
                  paged.map((d, idx) => {
                    const rowNum = (safePage - 1) * ITEMS_PER_PAGE + idx + 1;
                    const isEven = idx % 2 === 1;
                    return (
                      <tr
                        key={d.id}
                        className={`border-b border-slate-100 transition-colors last:border-0 hover:bg-cyan-50/40 ${
                          isEven ? "bg-gray-400" : "bg-white"
                        }`}
                      >
                        <td className="h-12 px-5 align-middle text-center text-xs font-semibold text-slate-600">
                          {rowNum}
                        </td>
                        <td className="h-12 px-5 align-middle font-semibold text-slate-950">
                          {d.designationname}
                        </td>
                        <td className="h-12 px-5 align-middle text-center">
                          {perms.u && (
                            <button
                              type="button"
                              onClick={() => openEditModal(d)}
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
          {!loading && designations.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
              <p className="text-xs text-slate-600">
                Showing{" "}
                <span className="font-semibold text-slate-700">
                  {(safePage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(safePage * ITEMS_PER_PAGE, designations.length)}
                </span>{" "}
                of <span className="font-semibold text-slate-700">{designations.length}</span> designations
                {searchInput && <span className="ml-1 text-cyan-600">for "{searchInput}"</span>}
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
                          ? "border-slate-950 bg-slate-950 text-white shadow-sm"
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
          <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-base font-semibold text-slate-950">Add Designation</h2>
              <button
                type="button"
                onClick={closeModal}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <label className="block">
                <span className={labelCls}>Designation Name *</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputCls}
                  placeholder="e.g. Assistant Engineer"
                  required
                  autoFocus
                />
              </label>
              {formError && (
                <div className="mt-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{formError}</div>
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
                  className="h-10 rounded-lg bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {saving ? "Saving…" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editModalOpen && editingDesig && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) closeEditModal(); }}
        >
          <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-base font-semibold text-slate-950">
                Edit — <span className="text-cyan-700">{editingDesig.designationname}</span>
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
              <label className="block">
                <span className={labelCls}>Designation Name *</span>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className={inputCls}
                  required
                  autoFocus
                />
              </label>
              {editFormError && (
                <div className="mt-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{editFormError}</div>
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
                  className="h-10 rounded-lg bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-slate-400"
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
