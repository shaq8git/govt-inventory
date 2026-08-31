import { useEffect, useState } from "react";
import { getPerms } from "../utils/permissions.js";

const API = "/api";
const token = () => sessionStorage.getItem("storeAuthToken");

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Token ${token()}`,
});

function buildPrintHTML(rows, filters) {
  const totalQty = rows.reduce((s, r) => s + Number(r.quantity ?? 0), 0);
  const totalAmount = rows.reduce((s, r) => s + Number(r.purprice ?? 0), 0);

  const filterLine = [
    filters.group && `Group: ${filters.group}`,
    filters.product && `Product: ${filters.product}`,
    filters.dateFrom && `From: ${filters.dateFrom}`,
    filters.dateTo && `To: ${filters.dateTo}`,
  ]
    .filter(Boolean)
    .join("  |  ");

  const bodyRows = rows
    .map(
      (r, i) => `
      <tr class="${i % 2 === 0 ? "alt" : ""}">
        <td class="center">${i + 1}</td>
        <td class="center mono">${r.invoicedate ?? "—"}</td>
        <td class="center mono">${r.invoiceno ?? "—"}</td>
        <td>${r.product_code ?? ""} — ${r.product_name ?? ""}${r.product_group ? ` <span class="grp">(${r.product_group})</span>` : ""}</td>
        <td>${r.supplier_name ?? "—"}</td>
        <td class="center">${r.quantity}</td>
        <td class="right">${Number(r.purrate).toFixed(2)}</td>
        <td class="right">${Number(r.purprice).toFixed(2)}</td>
        <td>${r.remark || ""}</td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Purchase Report</title>
  <style>
    @page { size: A4 landscape; margin: 15mm 12mm; }
    body { font-family: Arial, sans-serif; font-size: 11px; color: #111; }
    h2 { margin: 0 0 4px; font-size: 16px; }
    .org { font-size: 12px; color: #555; margin-bottom: 2px; }
    .filters { font-size: 10px; color: #666; margin-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th { background: #1e293b; color: #fff; padding: 5px 6px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: .04em; }
    td { padding: 4px 6px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
    tr.alt td { background: #f8fafc; }
    tfoot td { background: #1e293b; color: #fff; font-weight: bold; padding: 5px 6px; }
    .center { text-align: center; }
    .right { text-align: right; }
    .mono { font-family: monospace; }
    .grp { color: #64748b; font-size: 9px; }
  </style>
</head>
<body>
  <div class="org">Directorate of Education Engineering, Government of Bangladesh</div>
  <h2>Purchase Report</h2>
  ${filterLine ? `<div class="filters">${filterLine}</div>` : ""}
  <table>
    <thead>
      <tr>
        <th style="width:28px">#</th>
        <th style="width:80px">Date</th>
        <th style="width:90px">Invoice No</th>
        <th>Product</th>
        <th style="width:130px">Supplier</th>
        <th style="width:40px" class="center">Qty</th>
        <th style="width:60px" class="right">Rate</th>
        <th style="width:70px" class="right">Amount</th>
        <th style="width:100px">Remark</th>
      </tr>
    </thead>
    <tbody>${bodyRows}</tbody>
    <tfoot>
      <tr>
        <td colspan="5" style="text-align:right">Total</td>
        <td class="center">${totalQty}</td>
        <td></td>
        <td class="right">${totalAmount.toFixed(2)}</td>
        <td></td>
      </tr>
    </tfoot>
  </table>
</body>
</html>`;
}

export default function PurchaseReport() {
  const perms = getPerms("PURCHASE_REPORT");
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
    if (selectedProduct) params.set("product", selectedProduct);
    else if (selectedGroup) params.set("product__productgroup", selectedGroup);
    if (dateFrom) params.set("purchasehead__invoicedate__gte", dateFrom);
    if (dateTo) params.set("purchasehead__invoicedate__lte", dateTo);

    try {
      const res = await fetch(`${API}/purchase-items/?${params.toString()}`, {
        headers: authHeaders(),
      });
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
    const html = buildPrintHTML(rows, {
      group: groupLabel,
      product: productLabel,
      dateFrom,
      dateTo,
    });
    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
  }

  const totalQty = rows.reduce((s, r) => s + Number(r.quantity ?? 0), 0);
  const totalAmount = rows.reduce((s, r) => s + Number(r.purprice ?? 0), 0);

  const inputCls =
    "h-9 rounded border-2 border-slate-600 bg-white px-2 text-sm text-slate-900 outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-300";

  return (
    <main className="min-h-screen bg-[#f4f6f8] text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-slate-950">Purchase Report</h1>
          <p className="mt-1 text-sm text-slate-500">Filter purchase records by product and date</p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">
        {/* Filter section */}
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
              <label className="text-sm font-semibold text-slate-700">Product</label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className={`${inputCls} w-56`}
              >
                <option value="">-- All Products --</option>
                {filteredProducts.map((p) => (
                  <option key={p.id} value={p.id}>{p.prodcode} — {p.productname}</option>
                ))}
              </select>
            </div>

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
              className="h-9 rounded-lg bg-cyan-700 px-5 text-sm font-semibold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-40"
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
          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-0 text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="border-b border-slate-200 px-3 py-3 text-center">#</th>
                    <th className="border-b border-slate-200 px-3 py-3 text-left">Date</th>
                    <th className="border-b border-slate-200 px-3 py-3 text-left">Invoice No</th>
                    <th className="min-w-48 border-b border-slate-200 px-3 py-3 text-left">Product</th>
                    <th className="border-b border-slate-200 px-3 py-3 text-left">Supplier</th>
                    <th className="w-24 border-b border-slate-200 px-3 py-3 text-center">Qty</th>
                    <th className="w-28 border-b border-slate-200 px-3 py-3 text-right">Rate</th>
                    <th className="w-32 border-b border-slate-200 px-3 py-3 text-right">Amount</th>
                    <th className="border-b border-slate-200 px-3 py-3 text-left">Remark</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-sm text-slate-400">
                        No records found.
                      </td>
                    </tr>
                  ) : (
                    <>
                      {rows.map((row, idx) => {
                        const isDark = idx % 2 === 0;
                        const rowCls = isDark ? "bg-slate-50" : "bg-white";
                        const cellText = "text-slate-950";
                        const borderCls = isDark ? "border-slate-200" : "border-slate-200";
                        return (
                          <tr key={row.id} className={`${rowCls} border-b ${borderCls} last:border-0`}>
                            <td className={`px-3 py-2 text-center text-xs font-semibold ${cellText}`}>{idx + 1}</td>
                            <td className={`px-3 py-2 font-mono tabular-nums ${cellText}`}>{row.invoicedate ?? "—"}</td>
                            <td className={`px-3 py-2 font-mono ${cellText}`}>{row.invoiceno ?? "—"}</td>
                            <td className={`px-3 py-2 ${cellText}`}>
                              <span className="font-medium">{row.product_code} — {row.product_name}</span>
                              {row.product_group && (
                                <span className="ml-1 text-xs text-slate-500">({row.product_group})</span>
                              )}
                            </td>
                            <td className={`px-3 py-2 ${cellText}`}>{row.supplier_name ?? "—"}</td>
                            <td className={`px-3 py-2 text-center tabular-nums ${cellText}`}>{row.quantity}</td>
                            <td className={`px-3 py-2 text-right tabular-nums ${cellText}`}>{Number(row.purrate).toFixed(2)}</td>
                            <td className={`px-3 py-2 text-right tabular-nums ${cellText}`}>{Number(row.purprice).toFixed(2)}</td>
                            <td className={`px-3 py-2 text-xs ${cellText}`}>{row.remark || ""}</td>
                          </tr>
                        );
                      })}
                      <tr className="bg-slate-100 font-semibold text-slate-900">
                        <td colSpan={5} className="px-3 py-2 text-right text-xs uppercase tracking-wide">Total</td>
                        <td className="px-3 py-2 text-center tabular-nums">{totalQty}</td>
                        <td className="px-3 py-2"></td>
                        <td className="px-3 py-2 text-right tabular-nums">{totalAmount.toFixed(2)}</td>
                        <td className="px-3 py-2"></td>
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
