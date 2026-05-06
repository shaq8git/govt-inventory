import { useEffect, useState } from "react";

async function requestJson(url, options) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
    ...options,
  });
  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err ? JSON.stringify(err) : `Request failed with ${response.status}`);
  }
  return response.status === 204 ? null : response.json();
}

function normalizeList(data) {
  return Array.isArray(data) ? data : data.results || [];
}

function IconSave({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

function IconCheck({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function SearchIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
      strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="m16.5 16.5 4 4" />
    </svg>
  );
}

function IconPost({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22l-4-9-9-4 20-7z" />
    </svg>
  );
}

export default function ProductOpeningBalance() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({});
  const [savingRows, setSavingRows] = useState({});
  const [savedRows, setSavedRows] = useState({});
  const [rowErrors, setRowErrors] = useState({});
  const [searchInput, setSearchInput] = useState("");
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState("");
  const [postSuccess, setPostSuccess] = useState(false);

  useEffect(() => { loadProducts(); }, []);

  async function loadProducts() {
    setLoading(true);
    try {
      const data = await requestJson("/api/products/");
      const list = normalizeList(data);
      setProducts(list);
      const init = {};
      list.forEach((p) => { init[p.id] = p.openqty !== undefined ? p.openqty : ""; });
      setQuantities(init);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  function updateQty(id, value) {
    setQuantities((q) => ({ ...q, [id]: value }));
    setSavedRows((s) => ({ ...s, [id]: false }));
    setRowErrors((e) => ({ ...e, [id]: "" }));
  }

  async function saveRow(product) {
    const qty = quantities[product.id];
    if (qty === "" || qty === undefined || qty === null) {
      setRowErrors((e) => ({ ...e, [product.id]: "Enter a quantity." }));
      return;
    }
    setSavingRows((s) => ({ ...s, [product.id]: true }));
    setRowErrors((e) => ({ ...e, [product.id]: "" }));
    try {
      await requestJson(`/api/products/${product.id}/`, {
        method: "PATCH",
        body: JSON.stringify({ openqty: Number(qty) }),
      });
      setSavedRows((s) => ({ ...s, [product.id]: true }));
    } catch {
      setRowErrors((e) => ({ ...e, [product.id]: "Save failed." }));
    } finally {
      setSavingRows((s) => ({ ...s, [product.id]: false }));
    }
  }

  async function handlePosting() {
    setPosting(true);
    setPostError("");
    setPostSuccess(false);
    try {
      await Promise.all(
        products.map((p) =>
          requestJson(`/api/products/${p.id}/`, {
            method: "PATCH",
            body: JSON.stringify({ openflag: 1 }),
          })
        )
      );
      setPostSuccess(true);
    } catch {
      setPostError("Posting failed. Please try again.");
    } finally {
      setPosting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f6f8] text-slate-900">

      {/* Page header */}
      <section className="border-b border-slate-200 bg-[#f4f6f8]">
        <div className="mx-auto max-w-4xl px-4 pt-3 pb-2 sm:px-6 lg:px-8">
          <h1 className="text-center text-xl font-semibold text-slate-950">Product Opening Balance</h1>
          <div className="mt-2 flex items-center gap-3">
            <div className="relative flex-1">
              <span className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 transition-opacity duration-300 ${searchInput ? "opacity-0" : "opacity-100"}`}>
                <SearchIcon className="h-4 w-4 text-red-500" />
              </span>
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by product name…"
                className="h-10 w-full rounded-lg border border-slate-400 bg-slate-200 py-0 pl-10 pr-3 text-sm font-semibold text-slate-950 outline-none placeholder:font-normal placeholder:text-slate-600 transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
              />
            </div>
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="h-10 shrink-0 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Table */}
      <section className="mx-auto max-w-4xl px-4 py-2 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
          <div className="max-h-[520px] overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="sticky top-0 z-10 border-b border-slate-500 bg-gray-500">
                  {["#", "Product Name", "Opening Quantity", "Action"].map((h, i) => (
                    <th
                      key={h}
                      className={`whitespace-nowrap px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white ${
                        i === 0 || i === 2 || i === 3 ? "text-center" : "text-left"
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-16 text-center text-sm text-slate-400">
                      <span className="inline-flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-cyan-600" />
                        Loading…
                      </span>
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-16 text-center text-sm text-slate-400">
                      {searchInput ? `No products found for "${searchInput}".` : "No products found."}
                    </td>
                  </tr>
                ) : (
                  products
                  .filter((p) => p.productname.toLowerCase().includes(searchInput.toLowerCase()))
                  .map((p, idx) => {
                    const isEven = idx % 2 === 1;
                    const isSaving = !!savingRows[p.id];
                    const isSaved = !!savedRows[p.id];
                    const err = rowErrors[p.id];
                    return (
                      <tr
                        key={p.id}
                        className={`border-b border-slate-100 transition-colors last:border-0 ${
                          isEven ? "bg-gray-400" : "bg-white"
                        }`}
                      >
                        <td className="h-12 px-5 align-middle text-center text-xs font-semibold text-slate-600">
                          {idx + 1}
                        </td>
                        <td className="h-12 px-5 align-middle font-semibold text-slate-950">
                          {p.productname}
                        </td>
                        <td className="h-12 px-4 align-middle text-center">
                          <div className="inline-flex flex-col items-center gap-0.5">
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={quantities[p.id] ?? ""}
                              onChange={(e) => updateQty(p.id, e.target.value)}
                              className="h-9 w-36 rounded-lg border-2 border-slate-600 bg-slate-800 px-3 text-center text-sm font-semibold text-white outline-none placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
                            />
                            {err && (
                              <span className="text-xs text-rose-600">{err}</span>
                            )}
                          </div>
                        </td>
                        <td className="h-12 px-5 align-middle text-center">
                          <button
                            type="button"
                            onClick={() => saveRow(p)}
                            disabled={isSaving}
                            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                              isSaved
                                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                                : "border-cyan-300 bg-cyan-50 text-cyan-700 hover:bg-cyan-100"
                            }`}
                          >
                            {isSaving ? (
                              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-cyan-600" />
                            ) : isSaved ? (
                              <IconCheck className="h-3.5 w-3.5" />
                            ) : (
                              <IconSave className="h-3.5 w-3.5" />
                            )}
                            {isSaving ? "Saving…" : isSaved ? "Saved" : "Save"}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Bottom posting bar */}
          {!loading && products.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3">
              <div>
                {postError && (
                  <span className="text-sm text-rose-600">{postError}</span>
                )}
                {postSuccess && (
                  <span className="text-sm font-semibold text-emerald-600">
                    Posted successfully.
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handlePosting}
                disabled={posting}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {posting ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-white" />
                ) : (
                  <IconPost className="h-4 w-4" />
                )}
                {posting ? "Posting…" : "Posting"}
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
