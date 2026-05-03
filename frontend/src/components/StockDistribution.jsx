import { useMemo, useState } from "react";
import { stockRegisterData } from "../data/stockRegisterData";

const numberFormat = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

function today() {
  return new Date().toISOString().slice(0, 10);
}

function parseQuantity(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function StockDistribution() {
  const [selectedMonth, setSelectedMonth] = useState(stockRegisterData.months[0] || "");
  const [selectedDate, setSelectedDate] = useState(today());
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [quantities, setQuantities] = useState({});

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

  const distributionTotal = filteredItems.reduce((sum, item) => {
    return sum + parseQuantity(quantities[item.itemNumber]);
  }, 0);

  function updateQuantity(itemNumber, value) {
    setQuantities((current) => ({
      ...current,
      [itemNumber]: value,
    }));
  }

  function clearVisibleQuantities() {
    setQuantities((current) => {
      const next = { ...current };
      filteredItems.forEach((item) => {
        delete next[item.itemNumber];
      });
      return next;
    });
  }

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
                Stock Distribution Entry
              </h1>
            </div>
            <div className="text-sm text-slate-600">
              {filteredItems.length} items · {numberFormat.format(distributionTotal)} entered
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-[180px_180px_minmax(0,1fr)_260px_auto]">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">
                Month
              </span>
              <select
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
                className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              >
                {stockRegisterData.months.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">
                Date
              </span>
              <input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                className="h-11 w-full cursor-pointer rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition hover:border-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">
                Search
              </span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                placeholder="Search by item name or number"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">
                Category
              </span>
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

            <div className="flex items-end">
              <button
                type="button"
                onClick={clearVisibleQuantities}
                className="h-11 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="max-h-[calc(100vh-245px)] overflow-auto">
            <table className="min-w-full border-separate border-spacing-0 text-sm">
              <thead className="sticky top-0 z-10 bg-slate-100 text-left text-xs font-semibold uppercase text-slate-600">
                <tr>
                  <th className="sticky left-0 z-20 w-16 border-b border-slate-200 bg-slate-200 px-3 py-3">
                    No.
                  </th>
                  <th className="sticky left-16 z-20 min-w-72 border-b border-slate-200 bg-slate-200 px-3 py-3">
                    Item
                  </th>
                  <th className="min-w-32 border-b border-slate-200 bg-slate-200 px-3 py-3">
                    Category
                  </th>
                  <th className="w-24 border-b border-slate-200 bg-slate-200 px-3 py-3">
                    Unit
                  </th>
                  <th className="w-32 border-b border-slate-200 bg-slate-200 px-3 py-3 text-right">
                    {selectedMonth} Stock
                  </th>
                  <th className="w-40 border-b border-slate-200 bg-slate-200 px-3 py-3 text-right">
                    Quantity
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.itemNumber} className="odd:bg-white even:bg-gray-300">
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
                    <td className="border-b border-slate-100 px-3 py-3 text-right tabular-nums text-slate-700">
                      {numberFormat.format(item.monthlyAllotment[selectedMonth] || 0)}
                    </td>
                    <td className="border-b border-slate-100 px-3 py-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        inputMode="decimal"
                        value={quantities[item.itemNumber] || ""}
                        onChange={(event) => updateQuantity(item.itemNumber, event.target.value)}
                        className="h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-right text-sm tabular-nums outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                        aria-label={`Quantity for ${item.name} on ${selectedDate}`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="sticky bottom-0 bg-slate-900 text-sm font-semibold text-white">
                <tr>
                  <td className="sticky left-0 z-20 bg-slate-900 px-3 py-3" />
                  <td className="sticky left-16 z-20 bg-slate-900 px-3 py-3">
                    {selectedMonth} · {selectedDate}
                  </td>
                  <td className="px-3 py-3" />
                  <td className="px-3 py-3" />
                  <td className="px-3 py-3 text-right">Distribution total</td>
                  <td className="px-3 py-3 text-right tabular-nums">
                    {numberFormat.format(distributionTotal)}
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
