import { useState } from "react";
import { getPerms } from "../utils/permissions.js";

const API = "/api";
const token = () => sessionStorage.getItem("storeAuthToken");
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Token ${token()}`,
});

function buildPrintHTML(rows, filters) {
  const totalQty = rows.reduce((s, r) => s + Number(r.total_qty ?? 0), 0);
  const totalAmount = rows.reduce((s, r) => s + Number(r.total_amount ?? 0), 0);

  const bodyRows = rows
    .map(
      (r, i) => `
      <tr class="${i % 2 === 0 ? "alt" : ""}">
        <td class="center">${i + 1}</td>
        <td class="center mono">${r.date ?? "—"}</td>
        <td class="center mono">${r.product_code ?? ""}</td>
        <td>${r.product_group ?? "—"}</td>
        <td>${r.product_name ?? "—"}</td>
        <td class="center">${r.total_qty}</td>
        <td class="right">${Number(r.total_amount).toFixed(2)}</td>
      </tr>`
    )
    .join("");

  const dateRange =
    filters.dateFrom && filters.dateTo
      ? `${filters.dateFrom} to ${filters.dateTo}`
      : filters.dateFrom
      ? `From ${filters.dateFrom}`
      : filters.dateTo
      ? `Up to ${filters.dateTo}`
      : "All dates";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Daily Purchase Summary</title>
  <style>
    @page { size: A4 landscape; margin: 12mm 14mm; }
    body { font-family: Arial, sans-serif; font-size: 11px; color: #111; }
    .org { font-size: 11px; color: #555; margin-bottom: 2px; }
    h2 { margin: 0 0 4px; font-size: 15px; }
    .sub { font-size: 11px; color: #555; margin-bottom: 10px; }
    hr { border: none; border-top: 1px solid #cbd5e1; margin: 8px 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th { background: #1e293b; color: #fff; padding: 5px 6px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: .04em; }
    td { padding: 4px 6px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
    tr.alt td { background: #f8fafc; }
    tfoot td { background: #1e293b; color: #fff; font-weight: bold; padding: 5px 6px; }
    .center { text-align: center; }
    .right { text-align: right; }
    .mono { font-family: monospace; }
  </style>
</head>
<body>
  <div class="org">Directorate of Education Engineering, Government of Bangladesh</div>
  <h2>Daily Purchase Summary</h2>
  <div class="sub">Period: ${dateRange}</div>
  <hr/>
  <table>
    <thead>
      <tr>
        <th style="width:28px">#</th>
        <th style="width:80px">Date</th>
        <th style="width:60px">Code</th>
        <th style="width:130px">Group</th>
        <th>Product Name</th>
        <th style="width:50px" class="center">Total Qty</th>
        <th style="width:90px" class="right">Total Amount (৳)</th>
      </tr>
    </thead>
    <tbody>${bodyRows}</tbody>
    <tfoot>
      <tr>
        <td colspan="5" style="text-align:right">Total</td>
        <td class="center">${totalQty}</td>
        <td class="right">${totalAmount.toFixed(2)}</td>
      </tr>
    </tfoot>
  </table>
</body>
</html>`;
}

export default function DailyPurchaseSummary() {
  const perms = getPerms("DAILY_PURCHASE_SUM");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    setSearched(true);
    const params = new URLSearchParams();
    if (dateFrom) params.set("date_from", dateFrom);
    if (dateTo) params.set("date_to", dateTo);
    try {
      const res = await fetch(`${API}/purchase-summary/?${params}`, {
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
    const win = window.open("", "_blank");
    win.document.write(buildPrintHTML(rows, { dateFrom, dateTo }));
    win.document.close();
    win.focus();
    win.print();
  }

  const totalQty = rows.reduce((s, r) => s + Number(r.total_qty ?? 0), 0);
  const totalAmount = rows.reduce((s, r) => s + Number(r.total_amount ?? 0), 0);

  const inputCls =
    "h-9 rounded border-2 border-slate-600 bg-white px-2 text-sm text-slate-900 outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-300";

  return (
    <main className="min-h-screen bg-[#f4f6f8] text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-slate-950">Daily Purchase Summary</h1>
          <p className="mt-1 text-sm text-slate-500">
            Aggregated totals per product per day across all suppliers
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">

        {/* Filter bar */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-end gap-4 px-5 py-5">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-slate-700">Date From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className={`${inputCls} w-40`}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-slate-700">Date To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className={`${inputCls} w-40`}
              />
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

        {/* Results table */}
        {searched && (
          <div className="rounded-lg border border-slate-700 bg-slate-800 shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-0 text-sm">
                <thead className="bg-slate-900 text-xs font-semibold uppercase tracking-wide text-slate-300">
                  <tr>
                    <th className="border-b border-slate-700 px-3 py-3 text-center">#</th>
                    <th className="border-b border-slate-700 px-3 py-3 text-left">Date</th>
                    <th className="border-b border-slate-700 px-3 py-3 text-center">Code</th>
                    <th className="border-b border-slate-700 px-3 py-3 text-left">Group</th>
                    <th className="border-b border-slate-700 px-3 py-3 text-left">Product Name</th>
                    <th className="border-b border-slate-700 px-3 py-3 text-center">Total Qty</th>
                    <th className="border-b border-slate-700 px-3 py-3 text-right">Total Amount (৳)</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-sm text-slate-400">
                        No data found for the selected period.
                      </td>
                    </tr>
                  ) : (
                    <>
                      {rows.map((r, idx) => {
                        const isDark = idx % 2 === 0;
                        return (
                          <tr
                            key={`${r.date}-${r.product_code}`}
                            className={`${isDark ? "bg-gray-400" : "bg-white"} border-b ${isDark ? "border-slate-500" : "border-slate-200"} last:border-0`}
                          >
                            <td className="px-3 py-2 text-center text-xs font-semibold text-slate-950">{idx + 1}</td>
                            <td className="px-3 py-2 font-mono tabular-nums text-slate-950">{r.date}</td>
                            <td className="px-3 py-2 text-center font-mono text-slate-950">{r.product_code}</td>
                            <td className="px-3 py-2 text-xs text-slate-950">{r.product_group ?? "—"}</td>
                            <td className="px-3 py-2 font-medium text-slate-950">{r.product_name}</td>
                            <td className="px-3 py-2 text-center tabular-nums text-slate-950">{r.total_qty}</td>
                            <td className="px-3 py-2 text-right tabular-nums text-slate-950">
                              {Number(r.total_amount).toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="bg-slate-900 font-semibold text-slate-100">
                        <td colSpan={5} className="px-3 py-2 text-right text-xs uppercase tracking-wide">
                          Total
                        </td>
                        <td className="px-3 py-2 text-center tabular-nums">{totalQty}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{totalAmount.toFixed(2)}</td>
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
