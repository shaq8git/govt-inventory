import { useEffect, useState } from "react";
import { getPerms } from "../utils/permissions.js";

const API = "/api";
const token = () => sessionStorage.getItem("storeAuthToken");
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Token ${token()}`,
});

function buildPrintHTML(head, items) {
  const totalQty = items.reduce((s, r) => s + Number(r.quantity ?? 0), 0);
  const totalAmount = items.reduce((s, r) => s + Number(r.purprice ?? 0), 0);

  const bodyRows = items
    .map(
      (r, i) => `
      <tr class="${i % 2 === 0 ? "alt" : ""}">
        <td class="center">${i + 1}</td>
        <td class="center mono">${r.product_code ?? ""}</td>
        <td>${r.product_group ?? "—"}</td>
        <td>${r.product_name ?? "—"}</td>
        <td class="center">${r.quantity}</td>
        <td class="right">${Number(r.purrate).toFixed(2)}</td>
        <td class="right">${Number(r.purprice).toFixed(2)}</td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Purchase Invoice ${head.invoiceno}</title>
  <style>
    @page { size: A4 portrait; margin: 15mm 12mm; }
    body { font-family: Arial, sans-serif; font-size: 11px; color: #111; }
    .org { font-size: 12px; color: #555; margin-bottom: 2px; }
    h2 { margin: 0 0 8px; font-size: 15px; }
    .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 16px; margin-bottom: 12px; font-size: 11px; }
    .meta span { color: #555; }
    .meta strong { color: #111; }
    hr { border: none; border-top: 1px solid #cbd5e1; margin: 10px 0; }
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
  <h2>Purchase Invoice</h2>
  <hr/>
  <div class="meta">
    <div><span>Date: </span><strong>${head.invoicedate ?? "—"}</strong></div>
    <div><span>Invoice No: </span><strong>${head.invoiceno}</strong></div>
    <div><span>Supplier: </span><strong>${head.supplier_name ?? "—"}</strong></div>
    <div><span>Remark: </span><strong>${head.remark || "—"}</strong></div>
  </div>
  <hr/>
  <table>
    <thead>
      <tr>
        <th style="width:28px">#</th>
        <th style="width:60px">Code</th>
        <th style="width:120px">Group</th>
        <th>Product Name</th>
        <th style="width:40px" class="center">Qty</th>
        <th style="width:70px" class="right">Rate (৳)</th>
        <th style="width:80px" class="right">Amount (৳)</th>
      </tr>
    </thead>
    <tbody>${bodyRows}</tbody>
    <tfoot>
      <tr>
        <td colspan="4" style="text-align:right">Total</td>
        <td class="center">${totalQty}</td>
        <td></td>
        <td class="right">${totalAmount.toFixed(2)}</td>
      </tr>
    </tfoot>
  </table>
</body>
</html>`;
}

function InvoiceModal({ head, onClose }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/purchase-items/?purchasehead=${head.id}`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => setItems(Array.isArray(d) ? d : (d.results ?? [])))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [head.id]);

  function handlePrint() {
    const win = window.open("", "_blank");
    win.document.write(buildPrintHTML(head, items));
    win.document.close();
    win.focus();
    win.print();
  }

  const totalQty = items.reduce((s, r) => s + Number(r.quantity ?? 0), 0);
  const totalAmount = items.reduce((s, r) => s + Number(r.purprice ?? 0), 0);

  return (
    /* backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* modal panel */}
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-xl border border-slate-700 bg-white shadow-2xl">

        {/* modal header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="grid grid-cols-2 gap-x-10 gap-y-0.5 text-sm">
            <div>
              <span className="text-slate-500">Date</span>
              <p className="font-mono font-semibold text-slate-900">{head.invoicedate}</p>
            </div>
            <div>
              <span className="text-slate-500">Invoice No</span>
              <p className="font-mono font-semibold text-slate-900">{head.invoiceno}</p>
            </div>
            <div>
              <span className="text-slate-500">Supplier</span>
              <p className="font-semibold text-slate-900">{head.supplier_name ?? "—"}</p>
            </div>
            <div>
              <span className="text-slate-500">Remark</span>
              <p className="text-slate-700">{head.remark || "—"}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={loading}
              className="flex h-9 items-center gap-2 rounded border border-rose-600 bg-rose-50 px-4 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-40"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v5a2 2 0 002 2h1v2a1 1 0 001 1h8a1 1 0 001-1v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a1 1 0 00-1-1H6a1 1 0 00-1 1zm2 0h6v3H7V4zm-1 9a1 1 0 100 2h8a1 1 0 100-2H6zm0 2v2h8v-2H6z" clipRule="evenodd" />
              </svg>
              Print / PDF
            </button>
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded border border-slate-300 bg-slate-50 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              title="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* modal body — scrollable */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {loading ? (
            <p className="py-12 text-center text-sm text-slate-400">Loading items…</p>
          ) : (
            <div className="rounded-b-xl border-slate-700 bg-slate-800">
              <table className="min-w-full border-separate border-spacing-0 text-sm">
                <thead className="sticky top-0 bg-slate-900 text-xs font-semibold uppercase tracking-wide text-slate-300">
                  <tr>
                    <th className="border-b border-slate-700 px-3 py-3 text-center">#</th>
                    <th className="border-b border-slate-700 px-3 py-3 text-center">Code</th>
                    <th className="border-b border-slate-700 px-3 py-3 text-left">Group</th>
                    <th className="min-w-44 border-b border-slate-700 px-3 py-3 text-left">Product Name</th>
                    <th className="w-20 border-b border-slate-700 px-3 py-3 text-center">Qty</th>
                    <th className="w-28 border-b border-slate-700 px-3 py-3 text-right">Rate (৳)</th>
                    <th className="w-28 border-b border-slate-700 px-3 py-3 text-right">Amount (৳)</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-sm text-slate-400">No items found.</td>
                    </tr>
                  ) : (
                    <>
                      {items.map((r, idx) => {
                        const isDark = idx % 2 === 0;
                        return (
                          <tr
                            key={r.id}
                            className={`${isDark ? "bg-gray-400" : "bg-white"} border-b ${isDark ? "border-slate-500" : "border-slate-200"} last:border-0`}
                          >
                            <td className="px-3 py-2 text-center text-xs font-semibold text-slate-950">{idx + 1}</td>
                            <td className="px-3 py-2 text-center font-mono text-slate-950">{r.product_code}</td>
                            <td className="px-3 py-2 text-xs text-slate-950">{r.product_group ?? "—"}</td>
                            <td className="px-3 py-2 font-medium text-slate-950">{r.product_name}</td>
                            <td className="px-3 py-2 text-center tabular-nums text-slate-950">{r.quantity}</td>
                            <td className="px-3 py-2 text-right tabular-nums text-slate-950">{Number(r.purrate).toFixed(2)}</td>
                            <td className="px-3 py-2 text-right tabular-nums text-slate-950">{Number(r.purprice).toFixed(2)}</td>
                          </tr>
                        );
                      })}
                      <tr className="bg-slate-900 font-semibold text-slate-100">
                        <td colSpan={4} className="px-3 py-2 text-right text-xs uppercase tracking-wide">Total</td>
                        <td className="px-3 py-2 text-center tabular-nums">{totalQty}</td>
                        <td className="px-3 py-2" />
                        <td className="px-3 py-2 text-right tabular-nums">{totalAmount.toFixed(2)}</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DailyPurchaseInvoice() {
  const perms = getPerms("DAILY_PURCHASE_INV");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [heads, setHeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedHead, setSelectedHead] = useState(null);

  async function handleGenerate() {
    setLoading(true);
    setSearched(true);
    setSelectedHead(null);
    const params = new URLSearchParams();
    if (dateFrom) params.set("invoicedate__gte", dateFrom);
    if (dateTo) params.set("invoicedate__lte", dateTo);
    try {
      const res = await fetch(`${API}/purchase-heads/?${params}`, { headers: authHeaders() });
      const data = await res.json();
      setHeads(Array.isArray(data) ? data : (data.results ?? []));
    } catch {
      setHeads([]);
    } finally {
      setLoading(false);
    }
  }

  const inputCls =
    "h-9 rounded border-2 border-slate-600 bg-white px-2 text-sm text-slate-900 outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-300";

  return (
    <main className="min-h-screen bg-[#f4f6f8] text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-slate-950">Daily Purchase Invoice</h1>
          <p className="mt-1 text-sm text-slate-500">Browse invoices by date range and view item details</p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">

        {/* Filter bar */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-end gap-4 px-5 py-5">
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
          </div>
        </div>

        {/* Invoice list */}
        {searched && (
          <div className="rounded-lg border border-slate-700 bg-slate-800 shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-0 text-sm">
                <thead className="bg-slate-900 text-xs font-semibold uppercase tracking-wide text-slate-300">
                  <tr>
                    <th className="border-b border-slate-700 px-3 py-3 text-center">#</th>
                    <th className="border-b border-slate-700 px-3 py-3 text-left">Date</th>
                    <th className="border-b border-slate-700 px-3 py-3 text-left">Invoice No</th>
                    <th className="border-b border-slate-700 px-3 py-3 text-left">Supplier</th>
                    <th className="border-b border-slate-700 px-3 py-3 text-left">Remark</th>
                  </tr>
                </thead>
                <tbody>
                  {heads.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-sm text-slate-400">No invoices found.</td>
                    </tr>
                  ) : heads.map((h, idx) => {
                    const isDark = idx % 2 === 0;
                    return (
                      <tr
                        key={h.id}
                        className={`${isDark ? "bg-gray-400" : "bg-white"} border-b ${isDark ? "border-slate-500" : "border-slate-200"} last:border-0`}
                      >
                        <td className="px-3 py-2 text-center text-xs font-semibold text-slate-950">{idx + 1}</td>
                        <td className="px-3 py-2 font-mono tabular-nums text-slate-950">{h.invoicedate}</td>
                        <td className="px-3 py-2">
                          <button
                            onClick={() => setSelectedHead(h)}
                            className="font-mono font-semibold text-cyan-700 underline decoration-dotted hover:decoration-solid"
                          >
                            {h.invoiceno}
                          </button>
                        </td>
                        <td className="px-3 py-2 text-slate-950">{h.supplier_name ?? "—"}</td>
                        <td className="px-3 py-2 text-xs text-slate-950">{h.remark || ""}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedHead && (
        <InvoiceModal head={selectedHead} onClose={() => setSelectedHead(null)} />
      )}
    </main>
  );
}
