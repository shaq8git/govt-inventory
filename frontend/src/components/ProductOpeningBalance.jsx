import { useEffect, useState } from "react";

const ITEMS_PER_PAGE = 15;

function ChevronLeft({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRight({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function pageNumbers(current, total) {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current]);
  if (current > 1) pages.add(current - 1);
  if (current < total) pages.add(current + 1);
  return [...pages].sort((a, b) => a - b);
}

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
  const [currentPage, setCurrentPage] = useState(1);
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState("");
  const [postSuccess, setPostSuccess] = useState(false);

  useEffect(() => { loadProducts(); }, []);

  const filtered = products
    .filter((p) => p.productname.toLowerCase().includes(searchInput.toLowerCase()))
    .sort((a, b) => {
      const ga = (a.productgroup_name ?? "").toLowerCase();
      const gb = (b.productgroup_name ?? "").toLowerCase();
      if (ga < gb) return -1;
      if (ga > gb) return 1;
      return (a.productname ?? "").toLowerCase().localeCompare((b.productname ?? "").toLowerCase());
    });
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paged = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  function handleSearch(val) {
    setSearchInput(val);
    setCurrentPage(1);
  }

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
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="shrink-0 text-xl font-semibold text-slate-950">Product Opening Balance</h1>
            <div className="relative min-w-[200px] flex-1">
              <span className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 transition-opacity duration-300 ${searchInput ? "opacity-0" : "opacity-100"}`}>
                <SearchIcon className="h-4 w-4 text-red-500" />
              </span>
              <input
                value={searchInput}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search by product name…"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 py-0 pl-10 pr-3 text-sm font-semibold text-slate-950 outline-none placeholder:font-normal placeholder:text-slate-600 transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
              />
            </div>
            {searchInput && (
              <button
                type="button"
                onClick={() => handleSearch("")}
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
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="sticky top-0 z-10 border-b border-cyan-700 bg-gradient-to-r from-cyan-600 to-emerald-600">
                  {["#", "Product Group", "Product Name", "Opening Quantity", "Action"].map((h, i) => (
                    <th
                      key={h}
                      className={`whitespace-nowrap px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white ${
                        i === 0 || i === 3 || i === 4 ? "text-center" : "text-left"
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
                    <td colSpan={5} className="px-5 py-16 text-center text-sm text-slate-400">
                      <span className="inline-flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-cyan-600" />
                        Loading…
                      </span>
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-16 text-center text-sm text-slate-400">
                      {searchInput ? `No products found for "${searchInput}".` : "No products found."}
                    </td>
                  </tr>
                ) : (
                  paged.map((p, idx) => {
                    const rowNum = (safePage - 1) * ITEMS_PER_PAGE + idx + 1;
                    const isEven = idx % 2 === 1;
                    const isSaving = !!savingRows[p.id];
                    const isSaved = !!savedRows[p.id];
                    const err = rowErrors[p.id];
                    return (
                      <tr
                        key={p.id}
                        className={`border-b border-slate-100 transition-colors last:border-0 ${
                          isEven ? "bg-slate-50" : "bg-white"
                        }`}
                      >
                        <td className="h-12 px-5 align-middle text-center text-xs font-semibold text-slate-600">
                          {rowNum}
                        </td>
                        <td className="h-12 px-5 align-middle text-sm text-slate-700">
                          {p.productgroup_name ?? "—"}
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
                              className="h-9 w-36 rounded-lg border-2 border-slate-300 bg-white px-3 text-center text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
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

          {/* Pagination + Post bar */}
          {!loading && products.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
              <div className="flex flex-col gap-1">
                <p className="text-xs text-slate-600">
                  Showing{" "}
                  <span className="font-semibold text-slate-700">
                    {(safePage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(safePage * ITEMS_PER_PAGE, filtered.length)}
                  </span>{" "}
                  of <span className="font-semibold text-slate-700">{filtered.length}</span> products
                  {searchInput && <span className="ml-1 text-cyan-600">for "{searchInput}"</span>}
                </p>
                {postError && <span className="text-xs text-rose-600">{postError}</span>}
                {postSuccess && <span className="text-xs font-semibold text-emerald-600">Posted successfully.</span>}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={safePage === 1}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-cyan-400 hover:text-cyan-700 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ChevronLeft />
                  </button>
                  {pageNumbers(safePage, totalPages).map((n, i, arr) => (
                    <span key={n} className="flex items-center gap-1">
                      {i > 0 && arr[i - 1] !== n - 1 && (
                        <span className="px-1 text-xs text-slate-300">…</span>
                      )}
                      <button
                        type="button"
                        onClick={() => setCurrentPage(n)}
                        className={`h-8 min-w-[2rem] rounded-lg border px-2 text-xs font-semibold transition ${
                          safePage === n
                            ? "border-cyan-600 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-sm"
                            : "border-slate-300 bg-white text-slate-900 hover:border-cyan-400 hover:text-cyan-700"
                        }`}
                      >
                        {n}
                      </button>
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safePage === totalPages}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-cyan-400 hover:text-cyan-700 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ChevronRight />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handlePosting}
                  disabled={posting}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:from-cyan-600 hover:to-emerald-600 disabled:cursor-not-allowed disabled:from-slate-400 disabled:to-slate-400"
                >
                  {posting ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-white" />
                  ) : (
                    <IconPost className="h-4 w-4" />
                  )}
                  {posting ? "Posting…" : "Posting"}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
