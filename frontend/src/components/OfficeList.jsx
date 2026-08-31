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
const selectCls =
  "h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200";

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

const emptyForm = { officename: "", officeaddress: "", districtoffice_id: "", activity: "", orderno: "" };

export default function OfficeList() {
  const perms = getPerms("OFFICE");
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [districtOffices, setDistrictOffices] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingOffice, setEditingOffice] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editSaving, setEditSaving] = useState(false);
  const [editFormError, setEditFormError] = useState("");

  useEffect(() => {
    loadOffices("");
    requestJson("/api/district-offices/")
      .then((d) => setDistrictOffices(normalizeList(d)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      loadOffices(searchInput);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  async function loadOffices(q) {
    setLoading(true);
    try {
      const qs = q ? `?search=${encodeURIComponent(q)}` : "";
      const data = await requestJson(`/api/offices/${qs}`);
      setOffices(normalizeList(data));
    } catch {
      setOffices([]);
    } finally {
      setLoading(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(offices.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paged = offices.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  function districtName(id) {
    if (!id) return "—";
    return districtOffices.find((d) => d.id === id)?.districtofficename ?? "—";
  }

  function openModal() {
    setForm(emptyForm);
    setFormError("");
    setModalOpen(true);
  }
  function closeModal() { setModalOpen(false); }
  function updateForm(field, value) { setForm((f) => ({ ...f, [field]: value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.officename.trim()) { setFormError("Office name is required."); return; }
    setSaving(true);
    setFormError("");
    try {
      await requestJson("/api/offices/", {
        method: "POST",
        body: JSON.stringify({
          officename: form.officename.trim(),
          officeaddress: form.officeaddress.trim() || null,
          districtoffice_id: form.districtoffice_id ? Number(form.districtoffice_id) : null,
          activity: form.activity !== "" ? Number(form.activity) : 0,
          orderno: form.orderno !== "" ? Number(form.orderno) : 0,
        }),
      });
      closeModal();
      loadOffices(searchInput);
    } catch {
      setFormError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function openEditModal(office) {
    setEditingOffice(office);
    setEditForm({
      officename: office.officename || "",
      officeaddress: office.officeaddress || "",
      districtoffice_id: office.districtoffice_id ? String(office.districtoffice_id) : "",
      activity: office.activity ?? "",
      orderno: office.orderno ?? "",
    });
    setEditFormError("");
    setEditModalOpen(true);
  }
  function closeEditModal() { setEditModalOpen(false); setEditingOffice(null); }
  function updateEditForm(field, value) { setEditForm((f) => ({ ...f, [field]: value })); }

  async function handleEditSubmit(e) {
    e.preventDefault();
    if (!editForm.officename.trim()) { setEditFormError("Office name is required."); return; }
    setEditSaving(true);
    setEditFormError("");
    try {
      await requestJson(`/api/offices/${editingOffice.id}/`, {
        method: "PATCH",
        body: JSON.stringify({
          officename: editForm.officename.trim(),
          officeaddress: editForm.officeaddress.trim() || null,
          districtoffice_id: editForm.districtoffice_id ? Number(editForm.districtoffice_id) : null,
          activity: editForm.activity !== "" ? Number(editForm.activity) : 0,
          orderno: editForm.orderno !== "" ? Number(editForm.orderno) : 0,
        }),
      });
      closeEditModal();
      loadOffices(searchInput);
    } catch {
      setEditFormError("Failed to update. Please try again.");
    } finally {
      setEditSaving(false);
    }
  }

  const ModalForm = ({ values, onChange, onSubmit, onClose, isSaving, error, title }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-950">{title}</h2>
          <button type="button" onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">✕</button>
        </div>
        <form onSubmit={onSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className={labelCls}>Office Name *</span>
              <input value={values.officename} onChange={(e) => onChange("officename", e.target.value)}
                className={inputCls} placeholder="e.g. Mirpur Office" required autoFocus />
            </label>
            <label className="block sm:col-span-2">
              <span className={labelCls}>Office Address</span>
              <input value={values.officeaddress} onChange={(e) => onChange("officeaddress", e.target.value)}
                className={inputCls} placeholder="Full address" />
            </label>
            <div className="block sm:col-span-2">
              <span className={labelCls}>District Office</span>
              <select value={values.districtoffice_id} onChange={(e) => onChange("districtoffice_id", e.target.value)}
                className={selectCls}>
                <option value="">-- Select district office --</option>
                {districtOffices.map((d) => (
                  <option key={d.id} value={d.id}>{d.districtofficename}</option>
                ))}
              </select>
            </div>
            <label className="block">
              <span className={labelCls}>Activity</span>
              <input type="number" min="0" value={values.activity} onChange={(e) => onChange("activity", e.target.value)}
                className={inputCls} placeholder="0" />
            </label>
            <label className="block">
              <span className={labelCls}>Order No.</span>
              <input type="number" min="0" value={values.orderno} onChange={(e) => onChange("orderno", e.target.value)}
                className={inputCls} placeholder="0" />
            </label>
          </div>
          {error && <div className="mt-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose}
              className="h-10 rounded-lg border border-slate-300 px-4 text-sm text-slate-600 transition hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={isSaving}
              className="h-10 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 px-6 text-sm font-semibold text-white transition hover:from-cyan-600 hover:to-emerald-600 disabled:cursor-not-allowed disabled:from-slate-400 disabled:to-slate-400">
              {isSaving ? "Saving…" : title.startsWith("Edit") ? "Save Changes" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#f4f6f8] text-slate-900">

      {/* Page header */}
      <section className="border-b border-slate-200 bg-[#f4f6f8]">
        <div className="mx-auto max-w-6xl px-4 pt-3 pb-2 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="shrink-0 text-xl font-semibold text-slate-950">Office</h1>
            <div className="relative min-w-[200px] flex-1">
              <span className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 transition-opacity duration-300 ${searchInput ? "opacity-0" : "opacity-100"}`}>
                <SearchIcon className="h-4 w-4 text-red-500" />
              </span>
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by office name…"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 py-0 pl-10 pr-3 text-sm font-semibold text-slate-950 outline-none placeholder:font-normal placeholder:text-slate-600 transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
              />
            </div>
            {searchInput && (
              <button type="button" onClick={() => setSearchInput("")}
                className="h-10 shrink-0 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600">
                Clear
              </button>
            )}
            {perms.c && (
              <button type="button" onClick={openModal}
                className="h-10 shrink-0 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 px-5 text-sm font-semibold text-white transition hover:from-cyan-600 hover:to-emerald-600">
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
                  {["#", "Office Name", "Office Address", "District Office", "Activity", "Order No.", "Edit"].map((h, i) => (
                    <th key={h} className={`whitespace-nowrap px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white ${i === 0 || i === 6 ? "text-center" : "text-left"}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center text-sm text-slate-400">
                      <span className="inline-flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-cyan-600" />
                        Loading…
                      </span>
                    </td>
                  </tr>
                ) : paged.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center text-sm text-slate-400">
                      {searchInput ? `No offices found for "${searchInput}".` : "No offices added yet."}
                    </td>
                  </tr>
                ) : (
                  paged.map((o, idx) => {
                    const rowNum = (safePage - 1) * ITEMS_PER_PAGE + idx + 1;
                    const isEven = idx % 2 === 1;
                    return (
                      <tr key={o.id} className={`border-b border-slate-100 transition-colors last:border-0 hover:bg-cyan-50/40 ${isEven ? "bg-slate-50" : "bg-white"}`}>
                        <td className="h-12 px-5 align-middle text-center text-xs font-semibold text-slate-600">{rowNum}</td>
                        <td className="h-12 px-5 align-middle font-semibold text-slate-950">{o.officename || "—"}</td>
                        <td className="h-12 px-5 align-middle text-slate-700">{o.officeaddress || "—"}</td>
                        <td className="h-12 px-5 align-middle text-slate-700">{o.districtoffice_name || districtName(o.districtoffice_id)}</td>
                        <td className="h-12 px-5 align-middle text-slate-700">{o.activity ?? "—"}</td>
                        <td className="h-12 px-5 align-middle text-slate-700">{o.orderno ?? "—"}</td>
                        <td className="h-12 px-5 align-middle text-center">
                          {perms.u && (
                            <button type="button" onClick={() => openEditModal(o)}
                              className="inline-flex items-center justify-center rounded-lg border border-rose-200 bg-white p-2 text-rose-500 transition hover:border-rose-400 hover:bg-rose-50 hover:text-rose-700"
                              title="Edit">
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
          {!loading && offices.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
              <p className="text-xs text-slate-600">
                Showing <span className="font-semibold text-slate-700">{(safePage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(safePage * ITEMS_PER_PAGE, offices.length)}</span>{" "}
                of <span className="font-semibold text-slate-700">{offices.length}</span> offices
                {searchInput && <span className="ml-1 text-cyan-600">for "{searchInput}"</span>}
              </p>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={safePage === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-cyan-400 hover:text-cyan-700 disabled:cursor-not-allowed disabled:opacity-30">
                  <ChevronLeft />
                </button>
                {pageNumbers(safePage, totalPages).map((n, i, arr) => (
                  <span key={n} className="flex items-center gap-1">
                    {i > 0 && arr[i - 1] !== n - 1 && <span className="px-1 text-xs text-slate-300">…</span>}
                    <button type="button" onClick={() => setCurrentPage(n)}
                      className={`h-8 min-w-[2rem] rounded-lg border px-2 text-xs font-semibold transition ${safePage === n ? "border-cyan-600 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-sm" : "border-slate-300 bg-white text-slate-900 hover:border-cyan-400 hover:text-cyan-700"}`}>
                      {n}
                    </button>
                  </span>
                ))}
                <button type="button" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-cyan-400 hover:text-cyan-700 disabled:cursor-not-allowed disabled:opacity-30">
                  <ChevronRight />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {editModalOpen && editingOffice && (
        <ModalForm
          values={editForm}
          onChange={updateEditForm}
          onSubmit={handleEditSubmit}
          onClose={closeEditModal}
          isSaving={editSaving}
          error={editFormError}
          title={`Edit — ${editingOffice.officename || "Office"}`}
        />
      )}

      {modalOpen && (
        <ModalForm
          values={form}
          onChange={updateForm}
          onSubmit={handleSubmit}
          onClose={closeModal}
          isSaving={saving}
          error={formError}
          title="Add Office"
        />
      )}
    </main>
  );
}
