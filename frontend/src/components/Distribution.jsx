import { useEffect, useRef, useState } from "react";

const API = "/api";
const token = () => sessionStorage.getItem("storeAuthToken");

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Token ${token()}`,
});

const emptyHead = () => ({ date: "", customer_id: "", remark: "" });

export default function Distribution() {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [rcVouchercodeId, setRcVouchercodeId] = useState(null);
  const [headForm, setHeadForm] = useState(emptyHead());
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [salesrate, setSalesrate] = useState("");
  const [rows, setRows] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const nextId = useRef(1);

  useEffect(() => {
    fetch(`${API}/customers/`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => setCustomers(Array.isArray(d) ? d : (d.results ?? [])));
    fetch(`${API}/products/?page_size=10000`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => setProducts(Array.isArray(d) ? d : (d.results ?? [])));
    fetch(`${API}/voucher-codes/`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => {
        const list = Array.isArray(d) ? d : (d.results ?? []);
        const rc = list.find((v) => v.shortname === "RC");
        if (rc) setRcVouchercodeId(rc.id);
      });
  }, []);

  function updateHead(field, value) {
    setHeadForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleProductSelect(productId) {
    setSelectedProduct(productId);
    const prod = products.find((p) => String(p.id) === String(productId));
    setSalesrate(prod ? (prod.salesrate ?? "") : "");
  }

  function handleAddRow() {
    if (!selectedProduct || !quantity || Number(quantity) <= 0) {
      setError("Select a product and enter a valid quantity.");
      return;
    }
    const prod = products.find((p) => String(p.id) === String(selectedProduct));
    if (!prod) return;
    // Prevent duplicate product
    if (rows.some((r) => String(r.product_id) === String(selectedProduct))) {
      setError("This product is already in the list.");
      return;
    }
    setError("");
    setRows((prev) => [
      ...prev,
      {
        id: nextId.current++,
        product_id: prod.id,
        product_name: prod.productname,
        prodcode: prod.prodcode,
        quantity: Number(quantity),
        salesrate: Number(salesrate) || 0,
      },
    ]);
    setSelectedProduct("");
    setQuantity("");
    setSalesrate("");
  }

  function removeRow(id) {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  async function handleSubmit() {
    if (!headForm.date) { setError("Select a date."); return; }
    if (!headForm.customer_id) { setError("Select a customer."); return; }
    if (rows.length === 0) { setError("Add at least one product."); return; }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/sales-heads/`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          customer: Number(headForm.customer_id),
          vouchercode: rcVouchercodeId || null,
          invoicedate: headForm.date,
          remark: headForm.remark,
          items: rows.map((r) => ({
            product: r.product_id,
            quantity: r.quantity,
            salesrate: r.salesrate,
          })),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(JSON.stringify(err));
      }
      const data = await res.json();
      setSuccess(`Sales invoice ${data.invoiceno} saved successfully.`);
      setRows([]);
    } catch (e) {
      setError(`Failed to save: ${e.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  const inputCls = "h-9 rounded border-2 border-slate-600 bg-white px-2 text-sm text-slate-900 outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-300";

  return (
    <main className="min-h-screen bg-[#f4f6f8] text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-slate-950">Receiver Distribution</h1>
          <p className="mt-1 text-sm text-slate-500">Record items to distribute to receiver</p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">
        {/* Head section */}
        <div className="rounded-lg border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-slate-700">Date</label>
              <input
                type="date"
                value={headForm.date}
                onChange={(e) => updateHead("date", e.target.value)}
                className={`${inputCls} w-44`}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-slate-700">
                Customer <span className="text-red-500">*</span>
              </label>
              <select
                value={headForm.customer_id}
                onChange={(e) => updateHead("customer_id", e.target.value)}
                className={`${inputCls} w-72`}
              >
                <option value="">-- Select Customer --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.costname}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-slate-700">Remark</label>
              <input
                type="text"
                value={headForm.remark}
                onChange={(e) => updateHead("remark", e.target.value)}
                placeholder="Optional remark"
                className={`${inputCls} w-64`}
              />
            </div>
          </div>
        </div>

        {/* Add item */}
        <div className="rounded-lg border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <p className="mb-3 text-sm font-semibold text-slate-700">Add Item</p>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-600">Product Code &amp; Name</label>
              <select
                value={selectedProduct}
                onChange={(e) => handleProductSelect(e.target.value)}
                className={`${inputCls} w-72`}
              >
                <option value="">-- Select Product --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.prodcode} — {p.productname}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-600">Quantity</label>
              <input
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddRow()}
                className={`${inputCls} w-24`}
                placeholder="0"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-600">Sales Rate</label>
              <input
                readOnly
                value={salesrate}
                className={`${inputCls} w-28 cursor-default bg-slate-100 text-slate-500`}
                placeholder="0.00"
              />
            </div>
            <button
              onClick={handleAddRow}
              className="h-9 rounded bg-slate-700 px-5 text-sm font-semibold text-white hover:bg-slate-600"
            >
              + Add
            </button>
          </div>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>

        {/* Staged items */}
        {rows.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full border-separate border-spacing-0 text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="border-b border-slate-200 px-3 py-3 text-center">#</th>
                  <th className="min-w-64 border-b border-slate-200 px-3 py-3 text-left">Product</th>
                  <th className="w-28 border-b border-slate-200 px-3 py-3 text-center">Quantity</th>
                  <th className="w-32 border-b border-slate-200 px-3 py-3 text-center">Sales Rate</th>
                  <th className="w-20 border-b border-slate-200 px-3 py-3 text-center">Remove</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => {
                  const isDark = idx % 2 === 0;
                  return (
                    <tr key={r.id} className={`${isDark ? "bg-slate-50" : "bg-white"} border-b ${isDark ? "border-slate-200" : "border-slate-200"}`}>
                      <td className="px-3 py-2 text-center text-xs font-semibold text-slate-950">{idx + 1}</td>
                      <td className="px-3 py-2 font-medium text-slate-950">{r.prodcode} — {r.product_name}</td>
                      <td className="px-3 py-2 text-center tabular-nums text-slate-950">{r.quantity}</td>
                      <td className="px-3 py-2 text-center tabular-nums text-slate-950">{r.salesrate}</td>
                      <td className="px-3 py-2 text-center">
                        <button
                          onClick={() => removeRow(r.id)}
                          className="rounded px-2 py-1 text-2xl font-black leading-none text-rose-700 hover:bg-rose-50"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {success && (
          <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-800">
            {success}
          </div>
        )}

        {rows.length > 0 && (
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-700 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-800 disabled:opacity-50"
            >
              {submitting && (
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              )}
              {submitting ? "Saving…" : "Save All"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
