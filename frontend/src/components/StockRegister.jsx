import { useMemo, useState } from "react";
import { stockRegisterData } from "../data/stockRegisterData";

const numberFormat = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

function formatQuantity(value) {
  return value ? numberFormat.format(value) : "";
}

export default function StockRegister() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const categories = useMemo(() => {
    return ["All", ...new Set(stockRegisterData.items.map((item) => item.category))];
  }, []);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return stockRegisterData.items.filter((item) => {
      const matchesCategory = category === "All" || item.category === category;
      const matchesQuery =
        !normalizedQuery ||
        item.name.toLowerCase().includes(normalizedQuery) ||
        String(item.itemNumber).includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  const monthlyTotals = useMemo(() => {
    return stockRegisterData.months.reduce((totals, month) => {
      totals[month] = filteredItems.reduce(
        (sum, item) => sum + (item.monthlyAllotment[month] || 0),
        0,
      );
      return totals;
    }, {});
  }, [filteredItems]);

  const grandTotal = filteredItems.reduce((sum, item) => sum + item.total, 0);

  return (
    <main className="min-h-screen bg-[#f4f6f8] text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
                Fiscal Year {stockRegisterData.fiscalYear}
              </p>
              <h1 className="mt-1 text-2xl font-semibold text-slate-950 sm:text-3xl">
                Monthly Stock Allotment Register
              </h1>
            </div>
            <div className="text-sm text-slate-600">
              {filteredItems.length} items · {numberFormat.format(grandTotal)} total allotted
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_260px]">
            <label className="block">
              <span className="sr-only">Search items</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                placeholder="Search by item name or number"
              />
            </label>
            <label className="block">
              <span className="sr-only">Category</span>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              >
                {categories.map((option) => (
                  <option key={option} value={option}>
                    {option === "All" ? "All categories" : option}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="max-h-[calc(100vh-220px)] overflow-auto">
            <table className="min-w-full border-separate border-spacing-0 text-sm">
              <thead className="sticky top-0 z-10 bg-slate-100 text-left text-xs font-semibold uppercase text-slate-600">
                <tr>
                  <th className="sticky left-0 z-20 w-16 border-b border-slate-200 bg-slate-100 px-3 py-3">
                    No.
                  </th>
                  <th className="sticky left-16 z-20 min-w-64 border-b border-slate-200 bg-slate-100 px-3 py-3">
                    Item
                  </th>
                  <th className="min-w-32 border-b border-slate-200 px-3 py-3">
                    Category
                  </th>
                  <th className="w-24 border-b border-slate-200 px-3 py-3">
                    Unit
                  </th>
                  {stockRegisterData.months.map((month) => (
                    <th
                      key={month}
                      className="w-24 border-b border-slate-200 px-3 py-3 text-right"
                    >
                      {month}
                    </th>
                  ))}
                  <th className="w-28 border-b border-slate-200 px-3 py-3 text-right">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.itemNumber} className="odd:bg-white even:bg-slate-50">
                    <td className="sticky left-0 z-10 border-b border-slate-100 bg-inherit px-3 py-3 font-medium text-slate-600">
                      {item.itemNumber}
                    </td>
                    <td className="sticky left-16 z-10 border-b border-slate-100 bg-inherit px-3 py-3 font-medium text-slate-950">
                      {item.name}
                    </td>
                    <td className="border-b border-slate-100 px-3 py-3 text-slate-600">
                      {item.category}
                    </td>
                    <td className="border-b border-slate-100 px-3 py-3 text-slate-600">
                      {item.unit}
                    </td>
                    {stockRegisterData.months.map((month) => (
                      <td
                        key={month}
                        className="border-b border-slate-100 px-3 py-3 text-right tabular-nums"
                      >
                        {formatQuantity(item.monthlyAllotment[month])}
                      </td>
                    ))}
                    <td className="border-b border-slate-100 px-3 py-3 text-right font-semibold tabular-nums text-slate-950">
                      {formatQuantity(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="sticky bottom-0 bg-slate-900 text-sm font-semibold text-white">
                <tr>
                  <td className="sticky left-0 z-20 bg-slate-900 px-3 py-3" />
                  <td className="sticky left-16 z-20 bg-slate-900 px-3 py-3">
                    Visible total
                  </td>
                  <td className="px-3 py-3" />
                  <td className="px-3 py-3" />
                  {stockRegisterData.months.map((month) => (
                    <td key={month} className="px-3 py-3 text-right tabular-nums">
                      {formatQuantity(monthlyTotals[month])}
                    </td>
                  ))}
                  <td className="px-3 py-3 text-right tabular-nums">
                    {formatQuantity(grandTotal)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
