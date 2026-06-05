import { useEffect, useRef, useState } from "react";

const API = "/api";
const token = () => sessionStorage.getItem("storeAuthToken");
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Token ${token()}`,
});
const currentUser = () => {
  try { return JSON.parse(sessionStorage.getItem("storeAuthUser") || "{}"); }
  catch { return {}; }
};

export default function Requisition() {
  const user = currentUser();
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [groups, setGroups] = useState([]);
  const [products, setProducts] = useState([]);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [groupFilter, setGroupFilter] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [rows, setRows] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const nextId = useRef(1);

  useEffect(() => {
    fetch(`${API}/customers/`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => setCustomers(Array.isArray(d) ? d : (d.results ?? [])));
    fetch(`${API}/product-groups/`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => setGroups(Array.isArray(d) ? d : (d.results ?? [])));
    fetch(`${API}/products/?page_size=10000`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => setProducts(Array.isArray(d) ? d : (d.results ?? [])));
  }, []);

  const filteredProducts = groupFilter
    ? products.filter((p) => String(p.productgroup) === String(groupFilter))
    : products;

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
    const group = groups.find((g) => String(g.id) === String(prod.productgroup));
    setRows((prev) => [
      ...prev,
      {
        id: nextId.current++,
        product_id: prod.id,
        product_name: prod.productname,
        product_code: `${group?.groupcode ?? ""}${prod.prodcode}`,
        group_name: group?.groupname ?? "",
        quantity: Number(quantity),
      },
    ]);
    setSelectedProduct("");
    setQuantity("");
  }

  function removeRow(id) {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  async function handleSubmit() {
    if (!selectedCustomer) { setError("Select a customer."); return; }
    if (!date) { setError("Select a date."); return; }
    if (rows.length === 0) { setError("Add at least one product."); return; }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/requisition-heads/`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          customer: Number(selectedCustomer),
          requisitiondate: date,
          cruser_id: user.id ?? 0,
          items: rows.map((r) => ({
            product: r.product_id,
            primquantity: r.quantity,
            reqquantity: 0,
          })),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(JSON.stringify(err));
      }
      const data = await res.json();
      setSuccess(`Requisition ${data.requisitionno} submitted successfully.`);
      setRows([]);
    } catch (e) {
      setError(`Failed to submit: ${e.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  const inputCls = "h-9 rounded border-2 border-slate-600 bg-white px-2 text-sm text-slate-900 outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-300";

  return (
    <main className="min-h-screen bg-[#f4f6f8] text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6">
          <h1 className="text-2xl font-semibold text-slate-950">Requisition</h1>
          <p className="mt-1 text-sm text-slate-500">Submit a product requisition for approval</p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl space-y-5 px-4 py-6 sm:px-6">

        {/* Customer + date */}
        <div className="rounded-lg border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-slate-700">Customer</label>
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className={`${inputCls} w-72`}
              >
                <option value="">-- Select Customer --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.costname}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-slate-700">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`${inputCls} w-40`}
              />
            </div>
          </div>
        </div>

        {/* Add product row */}
        <div className="rounded-lg border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <p className="mb-3 text-sm font-semibold text-slate-700">Add Product</p>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-600">Product Group</label>
              <select
                value={groupFilter}
                onChange={(e) => { setGroupFilter(e.target.value); setSelectedProduct(""); }}
                className={`${inputCls} w-44`}
              >
                <option value="">-- All Groups --</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>{g.groupcode} — {g.groupname}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-600">Product Code &amp; Name</label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className={`${inputCls} w-72`}
              >
                <option value="">-- Select Product --</option>
                {filteredProducts.map((p) => (
                  <option key={p.id} value={p.id}>{p.prodcode} — {p.productname}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-600">Quantity</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddRow()}
                className={`${inputCls} w-28`}
                placeholder="0"
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

        {/* Items table */}
        {rows.length > 0 && (
          <div className="rounded-lg border border-slate-700 bg-slate-800 shadow-sm">
            <table className="min-w-full border-separate border-spacing-0 text-sm">
              <thead className="bg-slate-900 text-xs font-semibold uppercase tracking-wide text-slate-300">
                <tr>
                  <th className="border-b border-slate-700 px-3 py-3 text-center">#</th>
                  <th className="border-b border-slate-700 px-3 py-3 text-center">Code</th>
                  <th className="border-b border-slate-700 px-3 py-3 text-left">Group</th>
                  <th className="border-b border-slate-700 px-3 py-3 text-left">Product Name</th>
                  <th className="border-b border-slate-700 px-3 py-3 text-center">Qty</th>
                  <th className="border-b border-slate-700 px-3 py-3 text-center">Remove</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => {
                  const isDark = idx % 2 === 0;
                  return (
                    <tr key={r.id} className={`${isDark ? "bg-gray-400" : "bg-white"} border-b ${isDark ? "border-slate-500" : "border-slate-200"}`}>
                      <td className="px-3 py-2 text-center text-xs font-semibold text-slate-950">{idx + 1}</td>
                      <td className="px-3 py-2 text-center font-mono text-slate-950">{r.product_code}</td>
                      <td className="px-3 py-2 text-xs text-slate-950">{r.group_name}</td>
                      <td className="px-3 py-2 font-medium text-slate-950">{r.product_name}</td>
                      <td className="px-3 py-2 text-center tabular-nums text-slate-950">{r.quantity}</td>
                      <td className="px-3 py-2 text-center">
                        <button
                          onClick={() => removeRow(r.id)}
                          className="rounded px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50"
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
              className="h-10 rounded bg-emerald-700 px-8 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50"
            >
              {submitting ? "Submitting…" : "Submit Requisition"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
