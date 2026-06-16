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
  ]
    .filter(Boolean)
    .join("  |  ");

  const lastRow = rows[rows.length - 1];
  const totalPur = rows.reduce((s, r) => s + Number(r.purchase_qty ?? 0), 0);
  const totalSal = rows.reduce((s, r) => s + Number(r.sales_qty ?? 0), 0);

  const bodyRows = rows
    .map(
      (r, i) => `
      <tr class="${i % 2 === 0 ? "alt" : ""}">
        <td class="center">${i + 1}</td>
        <td class="center mono">${r.date ?? "—"}</td>
        <td class="center">${Number(r.opening_balance).toFixed(0)}</td>
        <td class="center">${Number(r.purchase_qty) > 0 ? Number(r.purchase_qty).toFixed(0) : "—"}</td>
        <td class="center">${Number(r.sales_qty) > 0 ? Number(r.sales_qty).toFixed(0) : "—"}</td>
        <td class="center">${Number(r.closing_balance).toFixed(0)}</td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Purchase &amp; Sales Report</title>
  <style>
    @page { size: A4 portrait; margin: 15mm 12mm; }
    body { font-family: Arial, sans-serif; font-size: 11px; color: #111; }
    h2 { margin: 0 0 4px; font-size: 16px; }
    .org { font-size: 12px; color: #555; margin-bottom: 2px; }
    .filters { font-size: 10px; color: #444; margin-bottom: 10px; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th { background: #1e293b; color: #fff; padding: 5px 6px; text-align: center; font-size: 10px; text-transform: uppercase; letter-spacing: .04em; }
    th.left { text-align: left; }
    td { padding: 4px 6px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
    tr.alt td { background: #f8fafc; }
    tfoot td { background: #1e293b; color: #fff; font-weight: bold; padding: 5px 6px; text-align: center; }
    .center { text-align: center; }
    .mono { font-family: monospace; }
  </style>
</head>
<body>
  <div class="org">Directorate of Education Engineering, Government of Bangladesh</div>
  <h2>Purchase &amp; Sales Report</h2>
  ${filterLine ? `<div class="filters">${filterLine}</div>` : ""}
  <table>
    <thead>
      <tr>
        <th style="width:28px">#</th>
        <th style="width:90px">Date</th>
        <th style="width:80px">Opening Bal.</th>
        <th style="width:80px">Purchase Qty</th>
        <th style="width:80px">Sales Qty</th>
        <th style="width:80px">Closing Bal.</th>
      </tr>
    </thead>
    <tbody>${bodyRows}</tbody>
    <tfoot>
      <tr>
        <td colspan="2" style="text-align:right; padding-right:8px">Total / Closing</td>
        <td></td>
        <td>${totalPur.toFixed(0)}</td>
        <td>${totalSal.toFixed(0)}</td>
        <td>${lastRow ? Number(lastRow.closing_balance).toFixed(0) : "—"}</td>
      </tr>
    </tfoot>
  </table>
</body>
</html>`;
}

export default function PurchaseSalesReport() {
  const perms = getPerms("PURCHASE_SALES_RPT");
  const [productGroups, setProductGroups] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [appliedLabels, setAppliedLabels] = useState({ group: "", product: "", dateFrom: "", dateTo: "" });

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
    setAppliedLabels({
      group: productGroups.find((g) => String(g.id) === String(selectedGroup))?.groupname ?? "",
      product: products.find((p) => String(p.id) === String(selectedProduct))?.productname ?? "",
      dateFrom,
      dateTo,
    });
    const params = new URLSearchParams();
    if (selectedProduct) params.set("product", selectedProduct);
    else if (selectedGroup) params.set("product_group", selectedGroup);
    if (dateFrom) params.set("date_from", dateFrom);
    if (dateTo) params.set("date_to", dateTo);

    try {
      const res = await fetch(`${API}/purchase-sales-report/?${params}`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
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

  const totalPur = rows.reduce((s, r) => s + Number(r.purchase_qty ?? 0), 0);
  const totalSal = rows.reduce((s, r) => s + Number(r.sales_qty ?? 0), 0);
  const lastRow = rows[rows.length - 1];

  const inputCls =
    "h-9 rounded border-2 border-slate-600 bg-white px-2 text-sm text-slate-900 outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-300";

  return (
    <main className="min-h-screen bg-[#f4f6f8] text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-slate-950">Purchase &amp; Sales Report</h1>
          <p className="mt-1 text-sm text-slate-500">
            Daily stock ledger — opening balance, purchases, sales and closing balance per day
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">

        {/* Filter bar */}
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
                  <option key={g.id} value={g.id}>{g.groupname}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-slate-700">Product Name</label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className={`${inputCls} w-60`}
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

            <button
              onClick={handleGenerate}
              disabled={loading || !perms.c}
              className="h-9 rounded bg-slate-800 px-5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? "Loading…" : "Generate"}
            </button>

            {rows.length > 0 && (
              <button
                onClick={handlePrint}
                className="flex h-9 items-center gap-2 rounded border border-rose-600 bg-rose-50 px-4 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v5a2 2 0 002 2h1v2a1 1 0 001 1h8a1 1 0 001-1v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a1 1 0 00-1-1H6a1 1 0 00-1 1zm2 0h6v3H7V4zm-1 9a1 1 0 100 2h8a1 1 0 100-2H6zm0 2v2h8v-2H6z" clipRule="evenodd" />
                </svg>
                Print / PDF
              </button>
            )}
          </div>
        </div>

        {/* Table header info */}
        {searched && (
          <div className="rounded-lg border border-slate-200 bg-white px-6 py-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-x-8 gap-y-1">
              {appliedLabels.group && (
                <div className="text-sm">
                  <span className="font-semibold text-slate-500 uppercase tracking-wide text-xs">Product Group</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{appliedLabels.group}</p>
                </div>
              )}
              {appliedLabels.product && (
                <div className="text-sm">
                  <span className="font-semibold text-slate-500 uppercase tracking-wide text-xs">Product Name</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{appliedLabels.product}</p>
                </div>
              )}
              {(appliedLabels.dateFrom || appliedLabels.dateTo) && (
                <div className="text-sm">
                  <span className="font-semibold text-slate-500 uppercase tracking-wide text-xs">Period</span>
                  <p className="font-mono font-semibold text-slate-900 mt-0.5">
                    {appliedLabels.dateFrom || "—"} &nbsp;→&nbsp; {appliedLabels.dateTo || "—"}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Ledger table */}
        {searched && (
          <div className="rounded-lg border border-slate-700 bg-slate-800 shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-0 text-sm">
                <thead className="bg-slate-900 text-xs font-semibold uppercase tracking-wide text-slate-300">
                  <tr>
                    <th className="border-b border-slate-700 px-3 py-3 text-center">#</th>
                    <th className="border-b border-slate-700 px-3 py-3 text-center">Date</th>
                    <th className="w-32 border-b border-slate-700 px-3 py-3 text-center">Opening Bal.</th>
                    <th className="w-32 border-b border-slate-700 px-3 py-3 text-center">Purchase Qty</th>
                    <th className="w-32 border-b border-slate-700 px-3 py-3 text-center">Sales Qty</th>
                    <th className="w-32 border-b border-slate-700 px-3 py-3 text-center">Closing Bal.</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-sm text-slate-400">
                        No transactions found for the selected filters and date range.
                      </td>
                    </tr>
                  ) : (
                    <>
                      {rows.map((row, idx) => {
                        const isDark = idx % 2 === 0;
                        const hasPur = Number(row.purchase_qty) > 0;
                        const hasSal = Number(row.sales_qty) > 0;
                        return (
                          <tr
                            key={row.date}
                            className={`${isDark ? "bg-gray-400" : "bg-white"} border-b ${isDark ? "border-slate-500" : "border-slate-200"} last:border-0`}
                          >
                            <td className="px-3 py-2 text-center text-xs font-semibold text-slate-950">{idx + 1}</td>
                            <td className="px-3 py-2 text-center font-mono tabular-nums text-slate-950">{row.date}</td>
                            <td className="px-3 py-2 text-center tabular-nums text-slate-950">
                              {Number(row.opening_balance).toFixed(0)}
                            </td>
                            <td className="px-3 py-2 text-center tabular-nums">
                              {hasPur
                                ? <span className="font-semibold text-emerald-700">{Number(row.purchase_qty).toFixed(0)}</span>
                                : <span className="text-slate-400">—</span>}
                            </td>
                            <td className="px-3 py-2 text-center tabular-nums">
                              {hasSal
                                ? <span className="font-semibold text-rose-700">{Number(row.sales_qty).toFixed(0)}</span>
                                : <span className="text-slate-400">—</span>}
                            </td>
                            <td className="px-3 py-2 text-center tabular-nums font-semibold text-slate-950">
                              {Number(row.closing_balance).toFixed(0)}
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="bg-slate-900 font-semibold text-slate-100">
                        <td colSpan={2} className="px-3 py-2 text-right text-xs uppercase tracking-wide">Total / Closing</td>
                        <td className="px-3 py-2" />
                        <td className="px-3 py-2 text-center tabular-nums text-emerald-300">{totalPur.toFixed(0)}</td>
                        <td className="px-3 py-2 text-center tabular-nums text-rose-300">{totalSal.toFixed(0)}</td>
                        <td className="px-3 py-2 text-center tabular-nums">
                          {lastRow ? Number(lastRow.closing_balance).toFixed(0) : "—"}
                        </td>
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
