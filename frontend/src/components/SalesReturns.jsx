import { useEffect, useRef, useState } from "react";

const API = "/api";
const token = () => sessionStorage.getItem("storeAuthToken");

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Token ${token()}`,
});

const emptyRow = (tempId) => ({
  tempId,
  product_id: "",
  productname: "",
  prodcode: "",
  quantity: "",
  salesrate: "",
  saved: false,
  itemId: null,
  saving: false,
  error: "",
});

const emptyHead = () => ({ date: "", customer_id: "", remark: "" });

export default function SalesReturns() {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [rrVouchercodeId, setRrVouchercodeId] = useState(null);
  const [headForm, setHeadForm] = useState(emptyHead());
  const [headId, setHeadId] = useState(null);
  const [invoiceNo, setInvoiceNo] = useState(null);
  const [rows, setRows] = useState([emptyRow(1)]);
  const nextTempId = useRef(2);

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
        const rr = list.find((v) => v.shortname === "RR");
        if (rr) setRrVouchercodeId(rr.id);
      });
  }, []);

  function updateHead(field, value) {
    setHeadForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateRow(tempId, field, value) {
    setRows((prev) =>
      prev.map((r) => (r.tempId === tempId ? { ...r, [field]: value, error: "" } : r))
    );
  }

  function handleProductChange(tempId, productId) {
    const prod = products.find((p) => String(p.id) === String(productId));
    if (!prod) {
      updateRow(tempId, "product_id", productId);
      return;
    }
    setRows((prev) =>
      prev.map((r) =>
        r.tempId === tempId
          ? {
              ...r,
              product_id: productId,
              productname: prod.productname,
              prodcode: prod.prodcode,
              salesrate: prod.salesrate ?? "",
              quantity: r.quantity,
              error: "",
            }
          : r
      )
    );
  }

  async function handleSaveRow(tempId) {
    const row = rows.find((r) => r.tempId === tempId);
    if (!row) return;

    if (!row.product_id) {
      setRows((prev) =>
        prev.map((r) => (r.tempId === tempId ? { ...r, error: "Select a product." } : r))
      );
      return;
    }
    if (!row.quantity || Number(row.quantity) <= 0) {
      setRows((prev) =>
        prev.map((r) => (r.tempId === tempId ? { ...r, error: "Enter a valid quantity." } : r))
      );
      return;
    }

    setRows((prev) =>
      prev.map((r) => (r.tempId === tempId ? { ...r, saving: true, error: "" } : r))
    );

    let currentHeadId = headId;

    if (!currentHeadId) {
      if (!headForm.date) {
        setRows((prev) =>
          prev.map((r) =>
            r.tempId === tempId ? { ...r, saving: false, error: "Date is required." } : r
          )
        );
        return;
      }
      if (!headForm.customer_id) {
        setRows((prev) =>
          prev.map((r) =>
            r.tempId === tempId
              ? { ...r, saving: false, error: "Select a customer in the head section." }
              : r
          )
        );
        return;
      }
      try {
        const res = await fetch(`${API}/slret-heads/`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            customer: headForm.customer_id,
            vouchercode: rrVouchercodeId || null,
            invoicedate: headForm.date || null,
            remark: headForm.remark,
            items: [],
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(JSON.stringify(err));
        }
        const data = await res.json();
        currentHeadId = data.id;
        setHeadId(data.id);
        setInvoiceNo(data.invoiceno ?? null);
      } catch {
        setRows((prev) =>
          prev.map((r) =>
            r.tempId === tempId
              ? { ...r, saving: false, error: "Failed to create return head." }
              : r
          )
        );
        return;
      }
    }

    try {
      const res = await fetch(`${API}/slret-items/`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          slrethead: currentHeadId,
          product: Number(row.product_id),
          quantity: Number(row.quantity),
          salesrate: Number(row.salesrate) || 0,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(JSON.stringify(err));
      }
      const data = await res.json();
      const newId = nextTempId.current++;
      setRows((prev) => [
        ...prev.map((r) =>
          r.tempId === tempId ? { ...r, saved: true, saving: false, itemId: data.id } : r
        ),
        emptyRow(newId),
      ]);
      setHeadId(null);
      setInvoiceNo(null);
      setHeadForm(emptyHead());
    } catch {
      setRows((prev) =>
        prev.map((r) =>
          r.tempId === tempId ? { ...r, saving: false, error: "Failed to save item." } : r
        )
      );
    }
  }

  async function handleDeleteRow(tempId) {
    const row = rows.find((r) => r.tempId === tempId);
    if (!row) return;

    if (!row.saved || !row.itemId) {
      setRows((prev) => prev.filter((r) => r.tempId !== tempId));
      return;
    }

    try {
      const res = await fetch(`${API}/slret-items/${row.itemId}/`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok && res.status !== 204) throw new Error("Delete failed");
      setRows((prev) => {
        const remaining = prev.filter((r) => r.tempId !== tempId);
        if (remaining.length === 0) {
          const newId = nextTempId.current++;
          return [emptyRow(newId)];
        }
        return remaining;
      });
    } catch {
      setRows((prev) =>
        prev.map((r) => (r.tempId === tempId ? { ...r, error: "Delete failed." } : r))
      );
    }
  }

  const headLocked = headId !== null;
  const inputCls =
    "h-9 w-full rounded border-2 border-slate-600 bg-white px-2 text-sm text-slate-900 outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-300 disabled:bg-slate-100 disabled:text-slate-500";

  return (
    <main className="min-h-screen bg-[#f4f6f8] text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-slate-950">Sales Returns</h1>
          <p className="mt-1 text-sm text-slate-500">Record items returned by customer</p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">
        {/* Head section */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col items-center gap-3 px-5 py-5">
            <div className="w-64">
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={headForm.date}
                onChange={(e) => updateHead("date", e.target.value)}
                disabled={headLocked}
                className={inputCls}
              />
            </div>
            <div className="w-64">
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Customer <span className="text-red-500">*</span>
              </label>
              <select
                value={headForm.customer_id}
                onChange={(e) => updateHead("customer_id", e.target.value)}
                disabled={headLocked}
                className={inputCls}
              >
                <option value="">-- Select Customer --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.costname}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-64">
              <label className="mb-1 block text-sm font-semibold text-slate-700">Remark</label>
              <input
                type="text"
                value={headForm.remark}
                onChange={(e) => updateHead("remark", e.target.value)}
                disabled={headLocked}
                placeholder="Optional remark"
                className={inputCls}
              />
            </div>
          </div>
        </div>

        {/* Items section */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="border-b border-slate-200 px-3 py-3 text-center">#</th>
                  <th className="min-w-64 border-b border-slate-200 px-3 py-3 text-left">Product</th>
                  <th className="w-28 border-b border-slate-200 px-3 py-3 text-center">Quantity</th>
                  <th className="w-32 border-b border-slate-200 px-3 py-3 text-center">Sales Rate</th>
                  <th className="w-24 border-b border-slate-200 px-3 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => {
                  const isAlt = idx % 2 === 1;
                  const rowCls = row.saved
                    ? "bg-emerald-50"
                    : isAlt
                    ? "bg-slate-50"
                    : "bg-white";
                  const cellText = "text-slate-900";
                  return (
                    <tr key={row.tempId} className={`${rowCls} border-b border-slate-100 last:border-0`}>
                      <td className={`px-3 py-2 text-center text-xs font-semibold ${cellText}`}>
                        {idx + 1}
                      </td>
                      <td className="px-3 py-2">
                        {row.saved ? (
                          <span className={`font-medium ${cellText}`}>
                            {row.prodcode} — {row.productname}
                          </span>
                        ) : (
                          <select
                            value={row.product_id}
                            onChange={(e) => handleProductChange(row.tempId, e.target.value)}
                            className="h-9 w-full rounded-lg border border-slate-300 bg-white px-2 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
                          >
                            <option value="">-- Select Product --</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.prodcode} — {p.productname}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {row.saved ? (
                          <span className={`block text-center tabular-nums ${cellText}`}>
                            {row.quantity}
                          </span>
                        ) : (
                          <input
                            type="number"
                            min="0"
                            value={row.quantity}
                            onChange={(e) => updateRow(row.tempId, "quantity", e.target.value)}
                            className="h-9 w-full rounded-lg border border-slate-300 bg-white px-2 text-center text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
                            placeholder="0"
                          />
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {row.saved ? (
                          <span className={`block text-center tabular-nums ${cellText}`}>
                            {row.salesrate}
                          </span>
                        ) : (
                          <input
                            readOnly
                            value={row.salesrate}
                            className="h-9 w-full rounded-lg border border-slate-200 bg-slate-100 px-2 text-center text-sm text-slate-500 cursor-default"
                            placeholder="0.00"
                          />
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-center gap-2">
                          {row.saved ? (
                            <button
                              onClick={() => handleDeleteRow(row.tempId)}
                              title="Delete row"
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-300 bg-red-50 text-red-600 transition hover:bg-red-100 hover:border-red-400"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSaveRow(row.tempId)}
                              disabled={row.saving}
                              title="Save row"
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-300 bg-cyan-50 text-cyan-700 transition hover:bg-cyan-100 disabled:opacity-50"
                            >
                              {row.saving ? (
                                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                </svg>
                              )}
                            </button>
                          )}
                        </div>
                        {row.error && (
                          <p className="mt-1 text-center text-xs text-rose-600">{row.error}</p>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {rows.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-400">
              No items yet. Fill in the form above and press + to add.
            </p>
          )}
        </div>

        {invoiceNo && (
          <p className="text-right text-xs text-slate-500">
            Invoice No:{" "}
            <span className="font-mono font-semibold text-slate-800">{invoiceNo}</span>
          </p>
        )}
      </div>
    </main>
  );
}
