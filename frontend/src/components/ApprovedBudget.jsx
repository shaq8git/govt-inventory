import { useEffect, useState } from "react";
import { getPerms } from "../utils/permissions.js";

const API = "/api";
const token = () => sessionStorage.getItem("storeAuthToken");
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Token ${token()}`,
});

function buildPrintHTML(rows, filters) {
  const filterLine = [
    filters.group && `Group: ${filters.group}`,
    filters.product && `Product: ${filters.product}`,
    filters.dateFrom && `From: ${filters.dateFrom}`,
    filters.dateTo && `To: ${filters.dateTo}`,
  ].filter(Boolean).join("  |  ");

  const bodyRows = rows.map((r, i) => `
    <tr class="${i % 2 === 0 ? "alt" : ""}">
      <td class="center">${i + 1}</td>
      <td class="center mono">${r.budgetdate ?? "—"}</td>
      <td class="center mono">${r.budgetno ?? "—"}</td>
      <td>${r.customer_name ?? "—"}</td>
      <td class="center mono">${r.product_code ?? ""}</td>
      <td>${r.product_group ?? "—"}</td>
      <td>${r.product_name ?? "—"}</td>
      <td class="center">${Number(r.primquantity).toFixed(0)}</td>
      <td class="right">${Number(r.primpurrate).toFixed(2)}</td>
      <td class="center">${Number(r.bdgquantity).toFixed(0)}</td>
      <td class="right">${Number(r.bdgpurrate).toFixed(2)}</td>
    </tr>`).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Approved Budgets</title>
  <style>
    @page { size: A4 landscape; margin: 12mm 14mm; }
    body { font-family: Arial, sans-serif; font-size: 10px; color: #111; }
    .org { font-size: 11px; color: #555; margin-bottom: 2px; }
    h2 { margin: 0 0 4px; font-size: 14px; }
    .filters { font-size: 10px; color: #444; margin-bottom: 8px; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th { background: #1e293b; color: #fff; padding: 5px 5px; text-align: left; font-size: 9px; text-transform: uppercase; letter-spacing: .03em; }
    td { padding: 4px 5px; border-bottom: 1px solid #e2e8f0; }
    tr.alt td { background: #f8fafc; }
    tfoot td { background: #1e293b; color: #fff; font-weight: bold; padding: 5px 5px; }
    .center { text-align: center; }
    .right { text-align: right; }
    .mono { font-family: monospace; }
  </style>
</head>
<body>
  <div class="org">Directorate of Education Engineering, Government of Bangladesh</div>
  <h2>Approved Budgets</h2>
  ${filterLine ? `<div class="filters">${filterLine}</div>` : ""}
  <table>
    <thead>
      <tr>
        <th style="width:24px">#</th>
        <th style="width:76px">Date</th>
        <th style="width:84px">Budget No</th>
        <th style="width:110px">Customer</th>
        <th style="width:52px">Code</th>
        <th style="width:100px">Group</th>
        <th>Product Name</th>
        <th style="width:50px" class="center">Cur Qty</th>
        <th style="width:58px" class="right">Cur Rate</th>
        <th style="width:50px" class="center">Bdg Qty</th>
        <th style="width:60px" class="right">Bdg Price</th>
      </tr>
    </thead>
    <tbody>${bodyRows}</tbody>
    <tfoot>
      <tr>
        <td colspan="7" style="text-align:right">Total</td>
        <td class="center">${rows.reduce((s, r) => s + Number(r.primquantity ?? 0), 0).toFixed(0)}</td>
        <td></td>
        <td class="center">${rows.reduce((s, r) => s + Number(r.bdgquantity ?? 0), 0).toFixed(0)}</td>
        <td></td>
      </tr>
    </tfoot>
  </table>
</body>
</html>`;
}

export default function ApprovedBudget() {
  const perms = getPerms("APPROVED_BUDGET");
  const [productGroups, setProductGroups] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    fetch(`${API}/product-groups/`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => setProductGroups(Array.isArray(d) ? d : (d.results ?? [])));
    fetch(`${API}/products/?page_size=10000`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => setProducts(Array.isArray(d) ? d : (d.results ?? [])));
  }, []);

  const filteredProducts = selectedGroup
    ? products.filter((p) => String(p.productgroup) === String(selectedGroup))
    : products;

  async function handleGenerate() {
    setLoading(true);
    setSearched(true);
    const params = new URLSearchParams();
    params.set("approvflag", "1");
    if (selectedProduct) params.set("product", selectedProduct);
    else if (selectedGroup) params.set("product__productgroup", selectedGroup);
    if (dateFrom) params.set("budgethead__budgetdate__gte", dateFrom);
    if (dateTo) params.set("budgethead__budgetdate__lte", dateTo);
    try {
      const res = await fetch(`${API}/budget-items/?${params}`, { headers: authHeaders() });
      const data = await res.json();
      setRows(Array.isArray(data) ? data : (data.results ?? []));
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  function handlePrint() {
    const groupLabel = productGroups.find((g) => String(g.id) === String(selectedGroup))?.groupname ?? "";
    const productLabel = products.find((p) => String(p.id) === String(selectedProduct))?.productname ?? "";
    const win = window.open("", "_blank");
    win.document.write(buildPrintHTML(rows, { group: groupLabel, product: productLabel, dateFrom, dateTo }));
    win.document.close();
    win.focus();
    win.print();
  }

  const inputCls = "h-9 rounded border-2 border-slate-600 bg-white px-2 text-sm text-slate-900 outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-300";

  return (
    <main className="min-h-screen bg-[#f4f6f8] text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-slate-950">Approved Budgets</h1>
          <p className="mt-1 text-sm text-slate-500">View all approved budget items — filter by date and product</p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">

        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-end gap-4 px-5 py-5">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-slate-700">Product Group</label>
              <select
                value={selectedGroup}
                onChange={(e) => { setSelectedGroup(e.target.value); setSelectedProduct(""); }}
                className={`${inputCls} w-48`}
              >
                <option value="">-- All Groups --</option>
                {productGroups.map((g) => (
                  <option key={g.id} value={g.id}>{g.groupcode} — {g.groupname}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-slate-700">Product Code &amp; Name</label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className={`${inputCls} w-64`}
              >
                <option value="">-- All Products --</option>
                {filteredProducts.map((p) => (
                  <option key={p.id} value={p.id}>{p.prodcode} — {p.productname}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-slate-700">Date From</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={`${inputCls} w-40`} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-slate-700">Date To</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={`${inputCls} w-40`} />
            </div>
            <button onClick={handleGenerate} disabled={loading || !perms.c} className="h-9 rounded bg-slate-800 px-5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40">
              {loading ? "Loading…" : "Generate"}
            </button>
            {rows.length > 0 && (
              <button onClick={handlePrint} className="flex h-9 items-center gap-2 rounded border border-rose-600 bg-rose-50 px-4 text-sm font-semibold text-rose-700 transition hover:bg-rose-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v5a2 2 0 002 2h1v2a1 1 0 001 1h8a1 1 0 001-1v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a1 1 0 00-1-1H6a1 1 0 00-1 1zm2 0h6v3H7V4zm-1 9a1 1 0 100 2h8a1 1 0 100-2H6zm0 2v2h8v-2H6z" clipRule="evenodd" />
                </svg>
                Print / PDF
              </button>
            )}
          </div>
        </div>

        {searched && (
          <div className="rounded-lg border border-slate-700 bg-slate-800 shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-0 text-sm">
                <thead className="bg-slate-900 text-xs font-semibold uppercase tracking-wide text-slate-300">
                  <tr>
                    <th className="border-b border-slate-700 px-3 py-3 text-center">#</th>
                    <th className="border-b border-slate-700 px-3 py-3 text-left">Date</th>
                    <th className="border-b border-slate-700 px-3 py-3 text-left">Budget No</th>
                    <th className="border-b border-slate-700 px-3 py-3 text-left">Customer</th>
                    <th className="border-b border-slate-700 px-3 py-3 text-center">Code</th>
                    <th className="border-b border-slate-700 px-3 py-3 text-left">Group</th>
                    <th className="border-b border-slate-700 px-3 py-3 text-left">Product Name</th>
                    <th className="w-20 border-b border-slate-700 px-3 py-3 text-center">Cur Qty</th>
                    <th className="w-24 border-b border-slate-700 px-3 py-3 text-right">Cur Rate</th>
                    <th className="w-20 border-b border-slate-700 px-3 py-3 text-center">Bdg Qty</th>
                    <th className="w-24 border-b border-slate-700 px-3 py-3 text-right">Bdg Price (৳)</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr><td colSpan={11} className="py-8 text-center text-sm text-slate-400">No approved budgets found.</td></tr>
                  ) : (
                    <>
                      {rows.map((r, idx) => {
                        const isDark = idx % 2 === 0;
                        return (
                          <tr key={r.id} className={`${isDark ? "bg-gray-400" : "bg-white"} border-b ${isDark ? "border-slate-500" : "border-slate-200"} last:border-0`}>
                            <td className="px-3 py-2 text-center text-xs font-semibold text-slate-950">{idx + 1}</td>
                            <td className="px-3 py-2 font-mono tabular-nums text-slate-950">{r.budgetdate}</td>
                            <td className="px-3 py-2 font-mono text-slate-950">{r.budgetno}</td>
                            <td className="px-3 py-2 text-slate-950">{r.customer_name ?? "—"}</td>
                            <td className="px-3 py-2 text-center font-mono text-slate-950">{r.product_code}</td>
                            <td className="px-3 py-2 text-xs text-slate-950">{r.product_group ?? "—"}</td>
                            <td className="px-3 py-2 font-medium text-slate-950">{r.product_name}</td>
                            <td className="px-3 py-2 text-center tabular-nums text-slate-950">{Number(r.primquantity).toFixed(0)}</td>
                            <td className="px-3 py-2 text-right tabular-nums text-slate-950">{Number(r.primpurrate).toFixed(2)}</td>
                            <td className="px-3 py-2 text-center tabular-nums text-emerald-700 font-semibold">{Number(r.bdgquantity).toFixed(0)}</td>
                            <td className="px-3 py-2 text-right tabular-nums text-emerald-700 font-semibold">{Number(r.bdgpurrate).toFixed(2)}</td>
                          </tr>
                        );
                      })}
                      <tr className="bg-slate-900 font-semibold text-slate-100">
                        <td colSpan={7} className="px-3 py-2 text-right text-xs uppercase tracking-wide">Total</td>
                        <td className="px-3 py-2 text-center tabular-nums">{rows.reduce((s, r) => s + Number(r.primquantity ?? 0), 0).toFixed(0)}</td>
                        <td className="px-3 py-2" />
                        <td className="px-3 py-2 text-center tabular-nums text-emerald-300">{rows.reduce((s, r) => s + Number(r.bdgquantity ?? 0), 0).toFixed(0)}</td>
                        <td className="px-3 py-2" />
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
