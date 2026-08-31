import { useEffect, useMemo, useState } from "react";
import { stockRegisterData } from "../data/stockRegisterData.js";
import { IoSearchSharp } from "react-icons/io5";

const unitOptions = [
  ["piece", "Piece"],
  ["ream", "Ream"],
  ["box", "Box"],
  ["roll", "Roll"],
  ["set", "Set"],
  ["kg", "Kg"],
  ["litre", "Litre"],
  ["packet", "Packet"],
  ["other", "Other"],
];

const unitMap = {
  Ream: "ream",
  Piece: "piece",
  Kg: "kg",
  Set: "set",
};

const workbookItems = stockRegisterData.items.map((item) => ({
  item_number: item.itemNumber,
  name: item.name,
  category_name: item.category,
  unit: unitMap[item.unit] || "other",
}));

async function requestJson(url, options) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with ${response.status}`);
  }

  return response.status === 204 ? null : response.json();
}

function normalizeList(data) {
  return Array.isArray(data) ? data : data.results || [];
}

function apiPath(url) {
  if (!url?.startsWith("http")) {
    return url;
  }

  const parsedUrl = new URL(url);
  return `${parsedUrl.pathname}${parsedUrl.search}`;
}

async function requestAllPages(url) {
  let nextUrl = url;
  const results = [];

  while (nextUrl) {
    const data = await requestJson(apiPath(nextUrl));
    results.push(...normalizeList(data));
    nextUrl = data?.next || null;
  }

  return results;
}

export default function StockAdd() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [editRows, setEditRows] = useState({});
  const [savingRows, setSavingRows] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [form, setForm] = useState({
    categoryName: "",
    categoryId: "",
    itemNumber: "",
    itemName: "",
    unit: "piece",
  });

  useEffect(() => {
    loadData();
  }, []);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return items;
    }

    return items.filter((item) => {
      return (
        item.name.toLowerCase().includes(normalizedQuery) ||
        item.category_name?.toLowerCase().includes(normalizedQuery) ||
        String(item.item_number).includes(normalizedQuery)
      );
    });
  }, [items, query]);

  const missingWorkbookCount = useMemo(() => {
    const existingNumbers = new Set(items.filter((item) => item.id).map((item) => item.item_number));
    return workbookItems.filter((item) => !existingNumbers.has(item.item_number)).length;
  }, [items]);

  const nextItemNumber = useMemo(() => {
    const maxNumber = items.reduce((max, item) => Math.max(max, item.item_number || 0), 0);
    return maxNumber + 1;
  }, [items]);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [categoryData, itemData] = await Promise.all([
        requestAllPages("/api/categories/"),
        requestAllPages("/api/items/?ordering=item_number"),
      ]);
      const mergedItems = mergeWorkbookItems(itemData, categoryData);
      setCategories(categoryData);
      setItems(mergedItems);
      setEditRows(makeEditRows(mergedItems));
    } catch (apiError) {
      setError("Could not load categories/items. Make sure Django is running.");
    } finally {
      setLoading(false);
    }
  }

  function makeEditRows(itemList) {
    return itemList.reduce((rows, item) => {
      rows[item.item_number] = {
        item_number: String(item.item_number),
        name: item.name || "",
        category: item.category ? String(item.category) : "",
        category_name: item.category_name || "",
        unit: item.unit || "piece",
      };
      return rows;
    }, {});
  }

  function mergeWorkbookItems(apiItems, categoryList) {
    const categoryByName = new Map(categoryList.map((category) => [category.name, category]));
    const apiItemByNumber = new Map(apiItems.map((item) => [item.item_number, item]));
    const merged = workbookItems.map((item) => {
      const apiItem = apiItemByNumber.get(item.item_number);
      if (apiItem) {
        return apiItem;
      }

      const category = categoryByName.get(item.category_name);
      return {
        ...item,
        id: null,
        category: category?.id || "",
        pendingDatabaseSync: true,
      };
    });

    const workbookNumbers = new Set(workbookItems.map((item) => item.item_number));
    const extraItems = apiItems.filter((item) => !workbookNumbers.has(item.item_number));
    return [...merged, ...extraItems].sort((a, b) => a.item_number - b.item_number);
  }

  function updateEditRow(itemNumber, field, value) {
    setEditRows((current) => ({
      ...current,
      [itemNumber]: {
        ...current[itemNumber],
        [field]: value,
      },
    }));
  }

  async function ensureCategory(categoryName, categoryMap) {
    const normalizedName = categoryName.trim();
    const existingCategory = categoryMap.get(normalizedName.toLowerCase());
    if (existingCategory) {
      return existingCategory;
    }

    const createdCategory = await requestJson("/api/categories/", {
      method: "POST",
      body: JSON.stringify({ name: normalizedName }),
    });
    categoryMap.set(createdCategory.name.toLowerCase(), createdCategory);
    return createdCategory;
  }

  async function syncWorkbookItems() {
    setSyncing(true);
    setError("");
    setNotice("");

    try {
      const categoryMap = new Map(categories.map((category) => [category.name.toLowerCase(), category]));
      const itemByNumber = new Map(items.filter((item) => item.id).map((item) => [item.item_number, item]));

      for (const workbookItem of workbookItems) {
        const category = await ensureCategory(workbookItem.category_name, categoryMap);
        const existingItem = itemByNumber.get(workbookItem.item_number);
        const payload = {
          item_number: workbookItem.item_number,
          name: workbookItem.name,
          unit: workbookItem.unit,
          category: category.id,
        };

        if (existingItem) {
          await requestJson(`/api/items/${existingItem.id}/`, {
            method: "PATCH",
            body: JSON.stringify(payload),
          });
        } else {
          await requestJson("/api/items/", {
            method: "POST",
            body: JSON.stringify(payload),
          });
        }
      }

      setNotice("All 118 stock items are synced to the database.");
      await loadData();
    } catch (apiError) {
      setError("Could not sync the 118 stock items to the database.");
    } finally {
      setSyncing(false);
    }
  }

  async function saveRow(item) {
    const row = editRows[item.item_number];
    if (!row) {
      return;
    }

    const itemNumber = Number(row.item_number);
    const itemName = row.name.trim();
    let categoryId = Number(row.category);

    if (!itemNumber || !itemName || (item.id && !categoryId)) {
      setError("Item number, item name, category, and unit are required before updating.");
      return;
    }

    setSavingRows((current) => ({ ...current, [item.item_number]: true }));
    setError("");
    setNotice("");

    try {
      if (!categoryId) {
        const categoryMap = new Map(categories.map((category) => [category.name.toLowerCase(), category]));
        const category = await ensureCategory(item.category_name || row.category_name, categoryMap);
        categoryId = category.id;
      }

      const payload = {
        item_number: itemNumber,
        name: itemName,
        category: categoryId,
        unit: row.unit,
      };

      if (item.id) {
        await requestJson(`/api/items/${item.id}/`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        setNotice(`Item ${itemNumber} updated in the database.`);
      } else {
        await requestJson("/api/items/", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setNotice(`Item ${itemNumber} created in the database.`);
      }
      await loadData();
    } catch (apiError) {
      setError("Could not update this item. Check duplicate item number and required fields.");
    } finally {
      setSavingRows((current) => ({ ...current, [item.item_number]: false }));
    }
  }

  function updateForm(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
      ...(field === "categoryId" ? { categoryName: "" } : {}),
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    const itemNumber = Number(form.itemNumber || nextItemNumber);
    const itemName = form.itemName.trim();
    const newCategoryName = form.categoryName.trim();

    if (!itemNumber || !itemName || (!form.categoryId && !newCategoryName)) {
      setError("Category, item number, item name, and unit are required.");
      setSaving(false);
      return;
    }

    try {
      let categoryId = form.categoryId;

      if (!categoryId) {
        const existingCategory = categories.find(
          (category) => category.name.toLowerCase() === newCategoryName.toLowerCase(),
        );

        if (existingCategory) {
          categoryId = existingCategory.id;
        } else {
          const createdCategory = await requestJson("/api/categories/", {
            method: "POST",
            body: JSON.stringify({ name: newCategoryName }),
          });
          categoryId = createdCategory.id;
        }
      }

      await requestJson("/api/items/", {
        method: "POST",
        body: JSON.stringify({
          item_number: itemNumber,
          name: itemName,
          unit: form.unit,
          category: Number(categoryId),
        }),
      });

      setForm({
        categoryName: "",
        categoryId: String(categoryId),
        itemNumber: "",
        itemName: "",
        unit: form.unit,
      });
      setNotice("Stock item added.");
      await loadData();
    } catch (apiError) {
      setError("Could not save. Check duplicate item number or backend connection.");
    } finally {
      setSaving(false);
    }
  }

  return (
    
    
    <main className="min-h-screen bg-red text-slate-900" style={{ backgroundColor: '#ffffff' }}>
      <section className="border-b border-slate-200 bg-red-200">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
            
              <h1 className="mt-1 text-2xl font-semibold text-slate-900 sm:text-3xl">
                Add Stock Category and Item
              </h1>
              <p className="mt-1 text-sm font-semibold text-gray-600">
                Showing the 118 workbook items. {missingWorkbookCount} item{missingWorkbookCount === 1 ? "" : "s"} still need database sync.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={syncWorkbookItems}
                disabled={syncing}
                className="h-10 rounded-md bg-cyan-700 px-4 text-sm font-semibold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:bg-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-200"
              >
                {syncing ? "Syncing" : "Sync 118 Items"}
              </button>
              <button
                type="button"
                onClick={loadData}
                className="h-10 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                Refresh
              </button>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid gap-3 lg:grid-cols-[220px_minmax(0,1fr)_150px_minmax(0,1fr)_140px_auto]"
          >
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase text-slate-700">
                Existing Category
              </span>
              <select
                value={form.categoryId}
                onChange={(event) => updateForm("categoryId", event.target.value)}
                className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              >
                <option value="">New category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase text-slate-700">
                New Category
              </span>
              <input
                value={form.categoryName}
                onChange={(event) => updateForm("categoryName", event.target.value)}
                disabled={Boolean(form.categoryId)}
                className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition disabled:bg-slate-100 disabled:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                placeholder="Category name"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase text-slate-700">
                Item No.
              </span>
              <input
                type="number"
                min="1"
                value={form.itemNumber}
                onChange={(event) => updateForm("itemNumber", event.target.value)}
                className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                placeholder={String(nextItemNumber)}
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase text-slate-700">
                Item Name
              </span>
              <input
                value={form.itemName}
                onChange={(event) => updateForm("itemName", event.target.value)}
                className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                placeholder="Stock item name"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase text-slate-700">
                Unit
              </span>
              <select
                value={form.unit}
                onChange={(event) => updateForm("unit", event.target.value)}
                className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              >
                {unitOptions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={saving}
                className="h-11 rounded-md bg-cyan-700 px-5 text-sm font-semibold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:bg-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-300"
              >
                {saving ? "Saving" : "Add"}
              </button>
            </div>
          </form>

          {(error || notice) && (
            <div
              className={`rounded-md border px-3 py-2 text-sm ${
                error
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
              }`}
            >
              {error || notice}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">

       
        <div className="mb-3">
          
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-11 w-full rounded-md border border-slate-300 bg-gray-200 px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 placeholder:text-gray-900 "
           
            placeholder="              Search existing items by name, category, or item number"

          />
          <div >
            <IoSearchSharp className="relative -top-8 left-3 text-gray-400" />
          </div>
           
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="max-h-[calc(100vh-340px)] overflow-auto">
            <table className="min-w-full border-separate border-spacing-0 text-sm">
              <thead className="sticky top-0 z-10 bg-slate-100 text-left text-xs font-semibold uppercase text-slate-700">
                <tr>
                  <th className="w-20 border-b border-slate-400 px-3 py-3">No.</th>
                  <th className="min-w-72 border-b border-slate-400 px-3 py-3">Item</th>
                  <th className="min-w-48 border-b border-slate-400 px-3 py-3">Category</th>
                  <th className="w-28 border-b border-slate-400 px-3 py-3">Unit</th>
                  <th className="w-32 border-b border-slate-400 px-3 py-3">Status</th>
                  <th className="w-28 border-b border-slate-400 px-3 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="px-3 py-8 text-center text-slate-500" colSpan="6">
                      Loading stock items
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                    const row = editRows[item.item_number] || {};
                    const rowKey = item.id || `workbook-${item.item_number}`;

                    return (
                      <tr key={rowKey} className="odd:bg-white even:bg-slate-50">
                        <td className="border-b border-slate-100 px-3 py-2">
                          <input
                            type="number"
                            min="1"
                            max="999"
                            value={row.item_number || ""}
                            onChange={(event) => updateEditRow(item.item_number, "item_number", event.target.value)}
                            className="h-9 w-20 rounded-md border border-slate-300 bg-white px-2 text-sm font-medium text-slate-700 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                          />
                        </td>
                        <td className="border-b border-slate-100 px-3 py-2">
                          <input
                            value={row.name || ""}
                            onChange={(event) => updateEditRow(item.item_number, "name", event.target.value)}
                            className="h-9 w-full min-w-72 rounded-md border border-slate-300 bg-white px-2 text-sm font-medium text-slate-950 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                          />
                        </td>
                        <td className="border-b border-slate-100 px-3 py-2">
                          {item.id ? (
                            <select
                              value={row.category || ""}
                              onChange={(event) => updateEditRow(item.item_number, "category", event.target.value)}
                              className="h-9 w-full min-w-48 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-700 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                            >
                              <option value="">Select category</option>
                              {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                  {category.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="block min-w-48 rounded-md border border-slate-200 bg-slate-100 px-2 py-2 text-sm text-slate-600">
                              {item.category_name}
                            </span>
                          )}
                        </td>
                        <td className="border-b border-slate-100 px-3 py-2">
                          <select
                            value={row.unit || "piece"}
                            onChange={(event) => updateEditRow(item.item_number, "unit", event.target.value)}
                            className="h-9 w-28 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-700 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                          >
                            {unitOptions.map(([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="border-b border-slate-100 px-3 py-2 text-sm">
                          {item.id ? (
                            <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                              In database
                            </span>
                          ) : (
                            <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                              Needs sync
                            </span>
                          )}
                        </td>
                        <td className="border-b border-slate-100 px-3 py-2">
                          <button
                            type="button"
                            onClick={() => saveRow(item)}
                            disabled={savingRows[item.item_number]}
                            className="h-9 rounded-md bg-cyan-700 px-3 text-xs font-semibold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                          >
                            {savingRows[item.item_number] ? "Saving" : item.id ? "Update" : "Create"}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
