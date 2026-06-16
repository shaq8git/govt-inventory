import { useEffect, useState } from "react";

// Shared key with MenuItemList
const MENU_STORAGE_KEY = "menuItemList_v1";
const PERM_STORAGE_KEY = "userPermissions_v1";

const DEFAULT_ROLES = ["System Admin", "Normal User", "Store Admin"];

const DEFAULT_MENU_ITEMS = [
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

function loadMenuItems() {
  try {
    const raw = localStorage.getItem(MENU_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return DEFAULT_MENU_ITEMS;
}

function buildDefaultPerms(menuItems) {
  const all = {};
  const readOnly = {};
  const storeAdmin = {};
  menuItems.forEach(({ code, c, r, u, d, group }) => {
    all[code]       = { c, r, u, d };
    readOnly[code]  = { c: false, r, u: false, d: false };
    const isTxOrProd = group === "Transaction" || group === "Product";
    storeAdmin[code] = {
      c: isTxOrProd ? c : false,
      r,
      u: isTxOrProd ? u : false,
      d: false,
    };
  });
  return { "System Admin": all, "Normal User": readOnly, "Store Admin": storeAdmin };
}

function loadPerms(menuItems) {
  try {
    const raw = localStorage.getItem(PERM_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return buildDefaultPerms(menuItems);
}

async function fetchRoles() {
  try {
    const res = await fetch("/api/userroles/");
    if (!res.ok) return DEFAULT_ROLES;
    const data = await res.json();
    const list = Array.isArray(data) ? data : data.results || [];
    return list.map((r) => r.rolename);
  } catch {
    return DEFAULT_ROLES;
  }
}

export default function UserPermission() {
  const [menuItems] = useState(loadMenuItems);
  const [roles, setRoles] = useState(DEFAULT_ROLES);
  const [perms, setPerms] = useState(() => loadPerms(loadMenuItems()));
  const [activeRole, setActiveRole] = useState(DEFAULT_ROLES[0]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchRoles().then((r) => {
      setRoles(r.length ? r : DEFAULT_ROLES);
      setActiveRole((cur) => (r.includes(cur) ? cur : r[0] ?? DEFAULT_ROLES[0]));
    });
  }, []);

  function handleSubmit() {
    localStorage.setItem(PERM_STORAGE_KEY, JSON.stringify(perms));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function toggle(role, code, key) {
    setPerms((prev) => ({
      ...prev,
      [role]: {
        ...(prev[role] || {}),
        [code]: {
          ...(prev[role]?.[code] || { c: false, r: false, u: false, d: false }),
          [key]: !prev[role]?.[code]?.[key],
        },
      },
    }));
  }

  function getRolePerm(role, code, key) {
    return perms[role]?.[code]?.[key] ?? false;
  }

  // Group menu items
  const grouped = GROUP_ORDER.map((g) => ({
    group: g,
    items: menuItems.filter((m) => m.group === g),
  })).filter((g) => g.items.length > 0);

  const knownGroups = new Set(GROUP_ORDER);
  menuItems
    .map((m) => m.group)
    .filter((g) => !knownGroups.has(g))
    .filter((g, i, a) => a.indexOf(g) === i)
    .forEach((g) => grouped.push({ group: g, items: menuItems.filter((m) => m.group === g) }));

  let rowNum = 0;

  return (
    <main className="min-h-screen bg-[#f4f6f8] text-slate-900">

      {/* Header */}
      <section className="border-b border-slate-200 bg-[#f4f6f8]">
        <div className="mx-auto max-w-6xl px-4 pt-3 pb-2 sm:px-6 lg:px-8">
          <h1 className="text-center text-xl font-semibold text-slate-950">User Permission</h1>
          <p className="mt-1 text-center text-xs text-slate-500">
            Select a role then click any badge to toggle its CRUD access. Changes save automatically.
          </p>
        </div>
      </section>

      {/* Role selector */}
      <section className="mx-auto max-w-6xl px-4 pt-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 shrink-0">Role</label>
          <select
            value={activeRole}
            onChange={(e) => setActiveRole(e.target.value)}
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
          >
            {roles.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>
      </section>

      {/* Permission table */}
      <section className="mx-auto max-w-6xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
          <div className="max-h-[540px] overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="sticky top-0 z-10 border-b border-slate-500 bg-gray-500">
                  <th className="whitespace-nowrap px-4 py-2.5 text-center text-xs font-bold uppercase tracking-widest text-white">#</th>
                  <th className="whitespace-nowrap px-4 py-2.5 text-left   text-xs font-bold uppercase tracking-widest text-white">Code</th>
                  <th className="whitespace-nowrap px-4 py-2.5 text-left   text-xs font-bold uppercase tracking-widest text-white">Menu Item</th>
                  {CRUD_META.map((m) => (
                    <th key={m.key} title={m.title}
                      className="whitespace-nowrap px-4 py-2.5 text-center text-xs font-bold uppercase tracking-widest text-white">
                      {m.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {grouped.map(({ group, items }) => (
                  <>
                    <tr key={group}>
                      <td colSpan={3 + CRUD_META.length}
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
                          {CRUD_META.map((m) => {
                            const allowed = item[m.key]; // what the menu item supports
                            const granted = getRolePerm(activeRole, item.code, m.key);
                            return (
                              <td key={m.key} className="h-11 px-4 align-middle text-center">
                                {allowed ? (
                                  <button
                                    type="button"
                                    title={`${m.title}: click to toggle`}
                                    onClick={() => toggle(activeRole, item.code, m.key)}
                                    className={`inline-flex h-7 w-7 items-center justify-center rounded border text-xs font-bold transition hover:scale-110 active:scale-95 ${granted ? m.on : m.off}`}
                                  >
                                    {granted ? m.label : "—"}
                                  </button>
                                ) : (
                                  <span className="inline-flex h-7 w-7 items-center justify-center text-xs text-slate-200">✕</span>
                                )}
                              </td>
                            );
                          })}
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
              <span className="text-xs text-slate-600">Denied</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-flex h-5 w-5 items-center justify-center text-xs text-slate-300">✕</span>
              <span className="text-xs text-slate-600">Not applicable</span>
            </span>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-5 py-4">
            {saved && (
              <span className="text-sm font-semibold text-emerald-600">Permissions saved.</span>
            )}
            <button
              type="button"
              onClick={handleSubmit}
              className="h-10 rounded-lg bg-slate-950 px-8 text-sm font-semibold text-white transition hover:bg-cyan-700"
            >
              Submit
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
