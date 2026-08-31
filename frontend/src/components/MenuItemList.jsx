import { useEffect, useState } from "react";

const STORAGE_KEY = "menuItemList_v1";

const DEFAULTS = [
  { code: "HEAD_OFFICE",          label: "Head Office",               group: "Basic Setup",  c: true,  r: true,  u: true,  d: false },
  { code: "CIRCLE_OFFICE",        label: "Circle Office",             group: "Basic Setup",  c: true,  r: true,  u: true,  d: false },
  { code: "DISTRICT_OFFICE",      label: "District Office",           group: "Basic Setup",  c: true,  r: true,  u: true,  d: false },
  { code: "OFFICE",               label: "Office",                    group: "Basic Setup",  c: true,  r: true,  u: true,  d: false },
  { code: "DESIGNATION",          label: "Designation",               group: "Basic Setup",  c: true,  r: true,  u: true,  d: false },
  { code: "MONTH_CYCLE",          label: "Month Cycle",               group: "Basic Setup",  c: true,  r: true,  u: true,  d: false },

  { code: "PRODUCT_GROUP",        label: "Product Group",             group: "Product",      c: true,  r: true,  u: true,  d: false },
  { code: "MFC_COMPANY",          label: "Manufacture Company",       group: "Product",      c: true,  r: true,  u: true,  d: false },
  { code: "PRODUCT_INFORMATION",  label: "Product Information",       group: "Product",      c: true,  r: true,  u: true,  d: false },
  { code: "PRODUCT_OPENING_BAL",  label: "Product Opening Balance",   group: "Product",      c: true,  r: true,  u: true,  d: false },
  { code: "SUPPLIER",             label: "Supplier",                  group: "Product",      c: true,  r: true,  u: true,  d: false },
  { code: "CUSTOMER",             label: "Customer",                  group: "Product",      c: true,  r: true,  u: true,  d: false },

  { code: "STOCK_REGISTER",       label: "Stock Register / Purchase", group: "Transaction",  c: true,  r: true,  u: true,  d: false },
  { code: "DISTRIBUTION",         label: "Item Distribution",         group: "Transaction",  c: true,  r: true,  u: true,  d: false },
  { code: "PURCHASE_RETURNS",     label: "Purchase Returns",          group: "Transaction",  c: true,  r: true,  u: true,  d: false },
  { code: "SALES_RETURNS",        label: "Sales Returns",             group: "Transaction",  c: true,  r: true,  u: true,  d: false },
  { code: "DAMAGE",               label: "Damage",                    group: "Transaction",  c: true,  r: true,  u: true,  d: false },
  { code: "REQUISITION",          label: "Requisition",               group: "Transaction",  c: true,  r: true,  u: true,  d: false },
  { code: "REQUISITION_LIST",     label: "Requisition List",          group: "Transaction",  c: false, r: true,  u: false, d: false },
  { code: "BUDGET",               label: "Budget",                    group: "Transaction",  c: true,  r: true,  u: true,  d: false },
  { code: "BUDGET_LIST",          label: "Budget List",               group: "Transaction",  c: false, r: true,  u: false, d: false },
  { code: "PURCHASE_PLANNING",    label: "Purchase Planning",         group: "Transaction",  c: true,  r: true,  u: true,  d: false },

  { code: "USER_REGISTRATION",    label: "User Registration",         group: "Users",        c: true,  r: true,  u: true,  d: false },
  { code: "USER_ROLE",            label: "User Role",                 group: "Users",        c: true,  r: true,  u: true,  d: true  },
  { code: "USER_PERMISSION",      label: "User Permission",           group: "Users",        c: true,  r: true,  u: true,  d: false },
  { code: "MENU_ITEM_LIST",       label: "Menu Item List",            group: "Users",        c: true,  r: true,  u: true,  d: false },

  { code: "PURCHASE_REPORT",      label: "Purchase Report",           group: "Reports",      c: false, r: true,  u: false, d: false },
  { code: "DAILY_PURCHASE_INV",   label: "Daily Purchase Invoice",    group: "Reports",      c: false, r: true,  u: false, d: false },
  { code: "DAILY_PURCHASE_SUM",   label: "Daily Purchase Summary",    group: "Reports",      c: false, r: true,  u: false, d: false },
  { code: "SALES_REPORT",         label: "Sales Report",              group: "Reports",      c: false, r: true,  u: false, d: false },
  { code: "DAILY_SALES_INV",      label: "Daily Sales Invoice",       group: "Reports",      c: false, r: true,  u: false, d: false },
  { code: "PURCHASE_SALES_RPT",   label: "Purchase & Sales Report",   group: "Reports",      c: false, r: true,  u: false, d: false },
  { code: "APPROVED_REQUISITION", label: "Approved Requisition",      group: "Reports",      c: false, r: true,  u: false, d: false },
  { code: "APPROVED_BUDGET",      label: "Approved Budget",           group: "Reports",      c: false, r: true,  u: false, d: false },
];

const GROUP_ORDER = ["Basic Setup", "Product", "Transaction", "Users", "Reports"];

const GROUP_COLORS = {
  "Basic Setup":  "bg-slate-600",
  "Product":      "bg-teal-700",
  "Transaction":  "bg-indigo-700",
  "Users":        "bg-violet-700",
  "Reports":      "bg-orange-700",
};

const CRUD_META = [
  { key: "c", label: "C", title: "Create", on: "bg-emerald-100 text-emerald-700 border-emerald-300", off: "bg-slate-100 text-slate-300 border-slate-200" },
  { key: "r", label: "R", title: "Read",   on: "bg-cyan-100 text-cyan-700 border-cyan-300",          off: "bg-slate-100 text-slate-300 border-slate-200" },
  { key: "u", label: "U", title: "Update", on: "bg-amber-100 text-amber-700 border-amber-300",       off: "bg-slate-100 text-slate-300 border-slate-200" },
  { key: "d", label: "D", title: "Delete", on: "bg-rose-100 text-rose-700 border-rose-300",          off: "bg-slate-100 text-slate-300 border-slate-200" },
];

const EMPTY_FORM = { code: "", label: "", group: "Basic Setup", c: true, r: true, u: true, d: false };

const inputCls = "h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200";
const labelCls = "mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500";

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return DEFAULTS;
}

function save(rows) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

export default function MenuItemList() {
  const [rows, setRows] = useState(load);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");

  useEffect(() => { save(rows); }, [rows]);

  function toggleCrud(code, key) {
    setRows((prev) =>
      prev.map((r) => r.code === code ? { ...r, [key]: !r[key] } : r)
    );
  }

  function deleteRow(code) {
    setRows((prev) => prev.filter((r) => r.code !== code));
  }

  function deleteRow(code) {
    setRows((prev) => prev.filter((r) => r.code !== code));
  }

  function openModal() {
    setForm(EMPTY_FORM);
    setFormError("");
    setModalOpen(true);
  }

  function handleAdd(e) {
    e.preventDefault();
    const code = form.code.trim().toUpperCase().replace(/\s+/g, "_");
    if (!code) { setFormError("Code is required."); return; }
    if (!form.label.trim()) { setFormError("Item name is required."); return; }
    if (rows.some((r) => r.code === code)) { setFormError("A menu item with this code already exists."); return; }
    setRows((prev) => [...prev, { ...form, code }]);
    setModalOpen(false);
  }

  const grouped = GROUP_ORDER.map((g) => ({
    group: g,
    items: rows.filter((r) => r.group === g),
  })).filter((g) => g.items.length > 0);

  // custom groups not in GROUP_ORDER
  const knownGroups = new Set(GROUP_ORDER);
  const extraGroups = [...new Set(rows.map((r) => r.group).filter((g) => !knownGroups.has(g)))];
  extraGroups.forEach((g) => grouped.push({ group: g, items: rows.filter((r) => r.group === g) }));

  let rowNum = 0;

  return (
    <main className="min-h-screen bg-[#f4f6f8] text-slate-900">

      {/* Header */}
      <section className="border-b border-slate-200 bg-[#f4f6f8]">
        <div className="mx-auto max-w-6xl px-4 pt-3 pb-2 sm:px-6 lg:px-8">
          <h1 className="text-center text-xl font-semibold text-slate-950">Menu Item List</h1>
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              All menu items and their applicable CRUD operations — used for User Permission setup.
              Click any <span className="font-semibold">C / R / U / D</span> badge to toggle it.
            </p>
            <button
              type="button"
              onClick={openModal}
              className="h-10 shrink-0 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 px-5 text-sm font-semibold text-white transition hover:from-cyan-600 hover:to-emerald-600"
            >
              + Add
            </button>
          </div>
        </div>
      </section>

      {/* Table */}
      <section className="mx-auto max-w-6xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
          <div className="max-h-[580px] overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="sticky top-0 z-10 border-b border-cyan-700 bg-gradient-to-r from-cyan-600 to-emerald-600">
                  <th className="whitespace-nowrap px-4 py-2.5 text-center text-xs font-bold uppercase tracking-widest text-white">#</th>
                  <th className="whitespace-nowrap px-4 py-2.5 text-left   text-xs font-bold uppercase tracking-widest text-white">Code</th>
                  <th className="whitespace-nowrap px-4 py-2.5 text-left   text-xs font-bold uppercase tracking-widest text-white">Menu Item</th>
                  {CRUD_META.map((m) => (
                    <th key={m.key} title={m.title}
                      className="whitespace-nowrap px-4 py-2.5 text-center text-xs font-bold uppercase tracking-widest text-white">
                      {m.label}
                    </th>
                  ))}
                  <th className="whitespace-nowrap px-4 py-2.5 text-center text-xs font-bold uppercase tracking-widest text-white">Del</th>
                </tr>
              </thead>
              <tbody>
                {grouped.map(({ group, items }) => (
                  <>
                    <tr key={group}>
                      <td colSpan={4 + CRUD_META.length}
                        className={`px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white ${GROUP_COLORS[group] ?? "bg-slate-500"}`}>
                        {group}
                      </td>
                    </tr>
                    {items.map((item, idx) => {
                      rowNum += 1;
                      return (
                        <tr key={item.code}
                          className={`border-b border-slate-100 last:border-0 hover:bg-cyan-50/40 ${idx % 2 === 1 ? "bg-gray-100" : "bg-white"}`}>
                          <td className="h-11 px-4 align-middle text-center text-xs font-semibold text-slate-500">{rowNum}</td>
                          <td className="h-11 px-4 align-middle font-mono text-xs font-semibold text-slate-600">{item.code}</td>
                          <td className="h-11 px-4 align-middle font-semibold text-slate-950">{item.label}</td>
                          {CRUD_META.map((m) => (
                            <td key={m.key} className="h-11 px-4 align-middle text-center">
                              <button
                                type="button"
                                title={`${m.title}: click to toggle`}
                                onClick={() => toggleCrud(item.code, m.key)}
                                className={`inline-flex h-7 w-7 items-center justify-center rounded border text-xs font-bold transition hover:scale-110 active:scale-95 ${item[m.key] ? m.on : m.off}`}
                              >
                                {item[m.key] ? m.label : "—"}
                              </button>
                            </td>
                          ))}
                          <td className="h-11 px-4 align-middle text-center">
                            <button
                              type="button"
                              onClick={() => deleteRow(item.code)}
                              className="inline-flex h-7 w-7 items-center justify-center rounded border border-rose-200 bg-white text-base font-bold text-rose-500 transition hover:border-rose-400 hover:bg-rose-50 hover:text-rose-700"
                              title="Delete"
                            >
                              ×
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 border-t border-slate-100 px-5 py-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Legend:</span>
            {CRUD_META.map((m) => (
              <span key={m.key} className="flex items-center gap-1.5">
                <span className={`inline-flex h-5 w-5 items-center justify-center rounded border text-xs font-bold ${m.on}`}>{m.label}</span>
                <span className="text-xs text-slate-600">{m.title}</span>
              </span>
            ))}
            <span className="flex items-center gap-1.5">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded border text-xs font-bold bg-slate-100 text-slate-300 border-slate-200">—</span>
              <span className="text-xs text-slate-600">Disabled</span>
            </span>
          </div>
        </div>
      </section>

      {/* Add modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}
        >
          <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-base font-semibold text-slate-950">Add Menu Item</h2>
              <button type="button" onClick={() => setModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
                ✕
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4 p-6">
              <label className="block">
                <span className={labelCls}>Code *</span>
                <input
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                  className={inputCls}
                  placeholder="e.g. STOCK_TRANSFER"
                  autoFocus
                />
                <p className="mt-1 text-xs text-slate-400">Uppercase letters and underscores. Spaces are auto-converted.</p>
              </label>

              <label className="block">
                <span className={labelCls}>Item Name *</span>
                <input
                  value={form.label}
                  onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                  className={inputCls}
                  placeholder="e.g. Stock Transfer"
                />
              </label>

              <label className="block">
                <span className={labelCls}>Group</span>
                <select
                  value={form.group}
                  onChange={(e) => setForm((f) => ({ ...f, group: e.target.value }))}
                  className={inputCls}
                >
                  {GROUP_ORDER.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </label>

              <div>
                <span className={labelCls}>CRUD Permissions</span>
                <div className="mt-1 flex gap-3">
                  {CRUD_META.map((m) => (
                    <label key={m.key} className="flex cursor-pointer flex-col items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, [m.key]: !f[m.key] }))}
                        className={`inline-flex h-8 w-8 items-center justify-center rounded border text-sm font-bold transition hover:scale-110 ${form[m.key] ? m.on : m.off}`}
                      >
                        {form[m.key] ? m.label : "—"}
                      </button>
                      <span className="text-xs text-slate-500">{m.title}</span>
                    </label>
                  ))}
                </div>
              </div>

              {formError && (
                <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{formError}</div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)}
                  className="h-10 rounded-lg border border-slate-300 px-4 text-sm text-slate-600 transition hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit"
                  className="h-10 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 px-6 text-sm font-semibold text-white transition hover:from-cyan-600 hover:to-emerald-600">
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
