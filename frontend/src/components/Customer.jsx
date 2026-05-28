import { useEffect, useState } from "react";

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

const emptyForm = { costname: "", deskname: "", desklocation: "", contact: "", address: "", shipingadr: "" };

export default function Customer() {
  const [customers, setCustomers] = useState([]);
  const [desks, setDesks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editSaving, setEditSaving] = useState(false);
  const [editFormError, setEditFormError] = useState("");

  useEffect(() => {
    loadCustomers("");
    requestJson("/api/desks/").then((d) => setDesks(normalizeList(d))).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      loadCustomers(searchInput);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  async function loadCustomers(q) {
    setLoading(true);
    try {
      const qs = q ? `?search=${encodeURIComponent(q)}` : "";
      const data = await requestJson(`/api/customers/${qs}`);
      setCustomers(normalizeList(data));
    } catch {
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(customers.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paged = customers.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  function openModal() {
    setForm(emptyForm);
    setFormError("");
    setModalOpen(true);
  }

  function closeModal() { setModalOpen(false); }
  function updateForm(field, value) { setForm((f) => ({ ...f, [field]: value })); }

  function openEditModal(customer) {
    setEditingCustomer(customer);
    const existingDesk = desks.find((d) => String(d.id) === String(customer.desk));
    setEditForm({
      costname: customer.costname || "",
      deskname: existingDesk?.deskname || "",
      desklocation: existingDesk?.location || "",
      contact: customer.contact || "",
      address: customer.address || "",
      shipingadr: customer.shipingadr || "",
    });
    setEditFormError("");
    setEditModalOpen(true);
  }

  function closeEditModal() {
    setEditModalOpen(false);
    setEditingCustomer(null);
  }

  function updateEditForm(field, value) { setEditForm((f) => ({ ...f, [field]: value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.costname.trim()) { setFormError("Customer name is required."); return; }
    setSaving(true);
    setFormError("");
    try {
      let deskId = null;
      if (form.deskname.trim()) {
        const desk = await requestJson("/api/desks/", {
          method: "POST",
          body: JSON.stringify({ deskname: form.deskname.trim(), location: form.desklocation.trim() || null }),
        });
        deskId = desk.id;
        setDesks((prev) => [...prev, desk]);
      }
      await requestJson("/api/customers/", {
        method: "POST",
        body: JSON.stringify({
          costname: form.costname.trim(),
          desk: deskId,
          contact: form.contact.trim() || null,
          address: form.address.trim() || null,
          shipingadr: form.shipingadr.trim() || null,
        }),
      });
      closeModal();
      loadCustomers(searchInput);
    } catch {
      setFormError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleEditSubmit(e) {
    e.preventDefault();
    if (!editForm.costname.trim()) { setEditFormError("Customer name is required."); return; }
    setEditSaving(true);
    setEditFormError("");
    try {
      let deskId = editingCustomer.desk ?? null;
      if (editForm.deskname.trim()) {
        if (deskId) {
          await requestJson(`/api/desks/${deskId}/`, {
            method: "PATCH",
            body: JSON.stringify({ deskname: editForm.deskname.trim(), location: editForm.desklocation.trim() || null }),
          });
          setDesks((prev) => prev.map((d) => String(d.id) === String(deskId)
            ? { ...d, deskname: editForm.deskname.trim(), location: editForm.desklocation.trim() || null }
            : d));
        } else {
          const desk = await requestJson("/api/desks/", {
            method: "POST",
            body: JSON.stringify({ deskname: editForm.deskname.trim(), location: editForm.desklocation.trim() || null }),
          });
          deskId = desk.id;
          setDesks((prev) => [...prev, desk]);
        }
      } else {
        deskId = null;
      }
      await requestJson(`/api/customers/${editingCustomer.id}/`, {
        method: "PATCH",
        body: JSON.stringify({
          costname: editForm.costname.trim(),
          desk: deskId,
          contact: editForm.contact.trim() || null,
          address: editForm.address.trim() || null,
          shipingadr: editForm.shipingadr.trim() || null,
        }),
      });
      closeEditModal();
      loadCustomers(searchInput);
    } catch {
      setEditFormError("Failed to update. Please try again.");
    } finally {
      setEditSaving(false);
    }
  }

  function deskNameForId(id) {
    const d = desks.find((x) => String(x.id) === String(id));
    return d ? d.deskname : "—";
  }

  return (
    <main className="min-h-screen bg-[#f4f6f8] text-slate-900">

      {/* Page header */}
      <section className="border-b border-slate-200 bg-[#f4f6f8]">
        <div className="mx-auto max-w-6xl px-4 pt-3 pb-2 sm:px-6 lg:px-8">
          <h1 className="text-center text-xl font-semibold text-slate-950">Customer</h1>
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
                placeholder="Search by name, contact or address…"
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

            <button
              type="button"
              onClick={openModal}
              className="h-10 shrink-0 rounded-lg bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-cyan-700"
            >
              + Add
            </button>
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
                  {["#", "Customer Name", "Desk", "Contact", "Address", "Shipping Address", "Edit"].map((h, i) => (
                    <th
                      key={h}
                      className={`whitespace-nowrap px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white ${
                        i === 0 || i === 6 ? "text-center" : "text-left"
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
                      {searchInput ? `No customers found for "${searchInput}".` : "No customers added yet."}
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
                          isEven ? "bg-gray-400" : "bg-white"
                        }`}
                      >
                        <td className="h-12 px-5 align-middle text-center text-xs font-semibold text-slate-600">
                          {rowNum}
                        </td>
                        <td className="h-12 px-5 align-middle font-semibold text-slate-950">
                          {c.costname || "—"}
                        </td>
                        <td className="h-12 px-5 align-middle text-slate-950">
                          {c.desk ? deskNameForId(c.desk) : "—"}
                        </td>
                        <td className="h-12 px-5 align-middle text-slate-950">
                          {c.contact || "—"}
                        </td>
                        <td className="h-12 px-5 align-middle text-slate-950">
                          {c.address || "—"}
                        </td>
                        <td className="h-12 px-5 align-middle text-slate-950">
                          {c.shipingadr || "—"}
                        </td>
                        <td className="h-12 px-5 align-middle text-center">
                          <button
                            type="button"
                            onClick={() => openEditModal(c)}
                            className="inline-flex items-center justify-center rounded-lg border border-rose-200 bg-white p-2 text-rose-500 transition hover:border-rose-400 hover:bg-rose-50 hover:text-rose-700"
                            title="Edit"
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

          {/* Pagination */}
          {!loading && customers.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
              <p className="text-xs text-slate-600">
                Showing{" "}
                <span className="font-semibold text-slate-700">
                  {(safePage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(safePage * ITEMS_PER_PAGE, customers.length)}
                </span>{" "}
                of <span className="font-semibold text-slate-700">{customers.length}</span> customers
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
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-base font-semibold text-slate-950">Add Customer</h2>
              <button type="button" onClick={closeModal}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className={labelCls}>Customer Name *</span>
                  <input
                    value={form.costname}
                    onChange={(e) => updateForm("costname", e.target.value)}
                    className={inputCls}
                    placeholder="e.g. John Smith"
                    required autoFocus
                  />
                </label>
                <label className="block">
                  <span className={labelCls}>Desk Name</span>
                  <input
                    value={form.deskname}
                    onChange={(e) => updateForm("deskname", e.target.value)}
                    className={inputCls}
                    placeholder="e.g. Front Desk"
                  />
                </label>
                <label className="block">
                  <span className={labelCls}>Desk Location</span>
                  <input
                    value={form.desklocation}
                    onChange={(e) => updateForm("desklocation", e.target.value)}
                    className={inputCls}
                    placeholder="e.g. Ground Floor"
                  />
                </label>
                <label className="block">
                  <span className={labelCls}>Contact</span>
                  <input
                    value={form.contact}
                    onChange={(e) => updateForm("contact", e.target.value)}
                    className={inputCls}
                    placeholder="Phone or email"
                  />
                </label>
                <label className="block">
                  <span className={labelCls}>Address</span>
                  <input
                    value={form.address}
                    onChange={(e) => updateForm("address", e.target.value)}
                    className={inputCls}
                    placeholder="Office address"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className={labelCls}>Shipping Address</span>
                  <input
                    value={form.shipingadr}
                    onChange={(e) => updateForm("shipingadr", e.target.value)}
                    className={inputCls}
                    placeholder="Delivery / shipping address"
                  />
                </label>
              </div>

              {formError && (
                <div className="mt-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {formError}
                </div>
              )}

              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={closeModal}
                  className="h-10 rounded-lg border border-slate-300 px-4 text-sm text-slate-600 transition hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="h-10 rounded-lg bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-slate-400">
                  {saving ? "Saving…" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editModalOpen && editingCustomer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) closeEditModal(); }}
        >
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-base font-semibold text-slate-950">
                Edit — <span className="text-cyan-700">{editingCustomer.costname}</span>
              </h2>
              <button type="button" onClick={closeEditModal}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
                ✕
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className={labelCls}>Customer Name *</span>
                  <input
                    value={editForm.costname}
                    onChange={(e) => updateEditForm("costname", e.target.value)}
                    className={inputCls}
                    placeholder="e.g. John Smith"
                    required autoFocus
                  />
                </label>
                <label className="block">
                  <span className={labelCls}>Desk Name</span>
                  <input
                    value={editForm.deskname}
                    onChange={(e) => updateEditForm("deskname", e.target.value)}
                    className={inputCls}
                    placeholder="e.g. Front Desk"
                  />
                </label>
                <label className="block">
                  <span className={labelCls}>Desk Location</span>
                  <input
                    value={editForm.desklocation}
                    onChange={(e) => updateEditForm("desklocation", e.target.value)}
                    className={inputCls}
                    placeholder="e.g. Ground Floor"
                  />
                </label>
                <label className="block">
                  <span className={labelCls}>Contact</span>
                  <input
                    value={editForm.contact}
                    onChange={(e) => updateEditForm("contact", e.target.value)}
                    className={inputCls}
                    placeholder="Phone or email"
                  />
                </label>
                <label className="block">
                  <span className={labelCls}>Address</span>
                  <input
                    value={editForm.address}
                    onChange={(e) => updateEditForm("address", e.target.value)}
                    className={inputCls}
                    placeholder="Office address"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className={labelCls}>Shipping Address</span>
                  <input
                    value={editForm.shipingadr}
                    onChange={(e) => updateEditForm("shipingadr", e.target.value)}
                    className={inputCls}
                    placeholder="Delivery / shipping address"
                  />
                </label>
              </div>

              {editFormError && (
                <div className="mt-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {editFormError}
                </div>
              )}

              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={closeEditModal}
                  className="h-10 rounded-lg border border-slate-300 px-4 text-sm text-slate-600 transition hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" disabled={editSaving}
                  className="h-10 rounded-lg bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-slate-400">
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
