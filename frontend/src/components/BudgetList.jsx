import { useEffect, useState } from "react";

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

export default function BudgetList() {
  const user = currentUser();
  const [heads, setHeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHead, setSelectedHead] = useState(null);
  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [approveQty, setApproveQty] = useState({});
  const [approveRate, setApproveRate] = useState({});
  const [approving, setApproving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`${API}/budget-heads/`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => setHeads(Array.isArray(d) ? d : (d.results ?? [])))
      .finally(() => setLoading(false));
  }, []);

  function selectHead(head) {
    if (selectedHead?.id === head.id) {
      setSelectedHead(null);
      setItems([]);
      return;
    }
    setSelectedHead(head);
    setApproveQty({});
    setApproveRate({});
    setMessage("");
    setItemsLoading(true);
    fetch(`${API}/budget-items/?budgethead=${head.id}`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => {
        const list = Array.isArray(d) ? d : (d.results ?? []);
        setItems(list);
        const initQty = {};
        const initRate = {};
        list.forEach((it) => {
          initQty[it.id] = it.bdgquantity > 0 ? it.bdgquantity : it.primquantity;
          initRate[it.id] = it.bdgpurrate > 0 ? it.bdgpurrate : it.primpurrate;
        });
        setApproveQty(initQty);
        setApproveRate(initRate);
      })
      .finally(() => setItemsLoading(false));
  }

  async function handleApprove() {
    if (!selectedHead) return;
    setApproving(true);
    setMessage("");
    const today = new Date().toISOString().slice(0, 10);
    try {
      await Promise.all(
        items.map((it) =>
          fetch(`${API}/budget-items/${it.id}/`, {
            method: "PATCH",
            headers: authHeaders(),
            body: JSON.stringify({
              bdgquantity: Number(approveQty[it.id] ?? it.primquantity),
              bdgpurrate: Number(approveRate[it.id] ?? it.primpurrate),
              approveuserinfo_id: user.id ?? 0,
              approvflag: 1,
              approvdate: today,
            }),
          })
        )
      );
      await fetch(`${API}/budget-heads/${selectedHead.id}/`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ upduser_id: user.id ?? 0 }),
      });
      setMessage(`Budget ${selectedHead.budgetno} approved.`);
      const res = await fetch(`${API}/budget-heads/`, { headers: authHeaders() });
      setHeads(Array.isArray(await res.json()) ? await res.clone().json() : []);
      const res2 = await fetch(`${API}/budget-items/?budgethead=${selectedHead.id}`, { headers: authHeaders() });
      const d2 = await res2.json();
      setItems(Array.isArray(d2) ? d2 : (d2.results ?? []));
    } catch {
      setMessage("Approval failed. Please try again.");
    } finally {
      setApproving(false);
    }
  }

  const inputCls = "h-8 w-24 rounded border-2 border-slate-400 bg-white px-2 text-sm text-slate-900 tabular-nums outline-none focus:border-slate-700";
  const pending = heads.filter((h) => !h.upduser_id || h.upduser_id === 0);

  return (
    <main className="min-h-screen bg-[#f4f6f8] text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
          <h1 className="text-2xl font-semibold text-slate-950">Budget List</h1>
          <p className="mt-1 text-sm text-slate-500">Review and approve pending budgets</p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-5 px-4 py-6 sm:px-6">

        <div className="rounded-lg border border-slate-700 bg-slate-800 shadow-sm">
          {loading ? (
            <p className="py-10 text-center text-sm text-slate-400">Loading…</p>
          ) : (
            <table className="min-w-full border-separate border-spacing-0 text-sm">
              <thead className="bg-slate-900 text-xs font-semibold uppercase tracking-wide text-slate-300">
                <tr>
                  <th className="border-b border-slate-700 px-3 py-3 text-center">#</th>
                  <th className="border-b border-slate-700 px-3 py-3 text-left">Date</th>
                  <th className="border-b border-slate-700 px-3 py-3 text-left">Budget No</th>
                  <th className="border-b border-slate-700 px-3 py-3 text-left">Customer</th>
                  <th className="border-b border-slate-700 px-3 py-3 text-center">Items</th>
                  <th className="border-b border-slate-700 px-3 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {pending.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-sm text-slate-400">No pending budgets.</td>
                  </tr>
                ) : pending.map((h, idx) => {
                  const isDark = idx % 2 === 0;
                  const isSelected = selectedHead?.id === h.id;
                  return (
                    <tr key={h.id} className={`${isSelected ? "bg-cyan-50" : isDark ? "bg-gray-400" : "bg-white"} border-b ${isDark ? "border-slate-500" : "border-slate-200"}`}>
                      <td className="px-3 py-2 text-center text-xs font-semibold text-slate-950">{idx + 1}</td>
                      <td className="px-3 py-2 font-mono tabular-nums text-slate-950">{h.budgetdate}</td>
                      <td className="px-3 py-2 font-mono font-semibold text-slate-950">{h.budgetno}</td>
                      <td className="px-3 py-2 text-slate-950">{h.customer_name ?? "—"}</td>
                      <td className="px-3 py-2 text-center text-slate-950">{h.items_count}</td>
                      <td className="px-3 py-2 text-center">
                        <button
                          onClick={() => selectHead(h)}
                          className={`rounded px-3 py-1 text-xs font-semibold transition ${isSelected ? "bg-slate-700 text-white" : "bg-slate-200 text-slate-800 hover:bg-slate-300"}`}
                        >
                          {isSelected ? "Close" : "View"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Items approval panel */}
        {selectedHead && (
          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Budget Items</p>
                <p className="mt-0.5 font-mono font-semibold text-slate-900">{selectedHead.budgetno}</p>
                <p className="text-xs text-slate-500">{selectedHead.customer_name ?? "—"}</p>
              </div>
              <div className="flex items-center gap-3">
                {message && (
                  <span className={`text-sm font-semibold ${message.includes("failed") ? "text-red-600" : "text-emerald-700"}`}>
                    {message}
                  </span>
                )}
                <button
                  onClick={handleApprove}
                  disabled={approving || items.length === 0}
                  className="h-9 rounded bg-emerald-700 px-5 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50"
                >
                  {approving ? "Approving…" : "✓ Approve All"}
                </button>
              </div>
            </div>

            {itemsLoading ? (
              <p className="py-8 text-center text-sm text-slate-400">Loading items…</p>
            ) : (
              <table className="min-w-full border-separate border-spacing-0 text-sm">
                <thead className="bg-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  <tr>
                    <th className="border-b border-slate-200 px-3 py-3 text-center">#</th>
                    <th className="border-b border-slate-200 px-3 py-3 text-center">Code</th>
                    <th className="border-b border-slate-200 px-3 py-3 text-left">Product Name</th>
                    <th className="border-b border-slate-200 px-3 py-3 text-center">Current Qty</th>
                    <th className="border-b border-slate-200 px-3 py-3 text-center">Current Rate</th>
                    <th className="border-b border-slate-200 px-3 py-3 text-center">Budget Qty</th>
                    <th className="border-b border-slate-200 px-3 py-3 text-center">Budget Price (৳)</th>
                    <th className="border-b border-slate-200 px-3 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr><td colSpan={8} className="py-8 text-center text-sm text-slate-400">No items.</td></tr>
                  ) : items.map((it, idx) => {
                    const isDark = idx % 2 === 0;
                    return (
                      <tr key={it.id} className={`${isDark ? "bg-slate-50" : "bg-white"} border-b border-slate-200`}>
                        <td className="px-3 py-2 text-center text-xs font-semibold text-slate-700">{idx + 1}</td>
                        <td className="px-3 py-2 text-center font-mono text-slate-700">{it.product_code}</td>
                        <td className="px-3 py-2 font-medium text-slate-900">{it.product_name}</td>
                        <td className="px-3 py-2 text-center tabular-nums text-slate-700">{Number(it.primquantity).toFixed(0)}</td>
                        <td className="px-3 py-2 text-center tabular-nums text-slate-700">{Number(it.primpurrate).toFixed(2)}</td>
                        <td className="px-3 py-2 text-center">
                          <input type="number" min="0" value={approveQty[it.id] ?? ""} onChange={(e) => setApproveQty((p) => ({ ...p, [it.id]: e.target.value }))} className={inputCls} />
                        </td>
                        <td className="px-3 py-2 text-center">
                          <input type="number" min="0" step="0.01" value={approveRate[it.id] ?? ""} onChange={(e) => setApproveRate((p) => ({ ...p, [it.id]: e.target.value }))} className={inputCls} />
                        </td>
                        <td className="px-3 py-2 text-center">
                          {it.approvflag === 1
                            ? <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">Approved</span>
                            : <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">Pending</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
