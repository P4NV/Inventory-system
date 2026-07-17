import { useEffect, useState } from "react";
import {
  api,
  ApiError,
  type Item,
  type CreateItemInput,
} from "@/lib/api.ts";

const emptyForm: CreateItemInput = {
  name: "",
  sku: "",
  amount: 0,
  price: 0,
  isInStock: true,
};

export function InventoryManager() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CreateItemInput>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .listItems()
      .then(setItems)
      .catch((err: ApiError) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function setField<K extends keyof CreateItemInput>(
    key: K,
    value: CreateItemInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.sku.trim()) return;
    setSaving(true);
    try {
      const created = await api.createItem(form);
      setItems((prev) => [created, ...prev]);
      setForm(emptyForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add item");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStock(item: Item) {
    const next = !item.isInStock;
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, isInStock: next } : i)),
    );
    try {
      await api.updateItem(item.id, { isInStock: next });
    } catch {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? item : i)),
      );
      setError("Failed to update item");
    }
  }

  async function handleDelete(id: string) {
    const prev = items;
    setItems((prev) => prev.filter((i) => i.id !== id));
    try {
      await api.deleteItem(id);
    } catch {
      setItems(prev);
      setError("Failed to delete item");
    }
  }

  if (loading) {
    return <p className="text-sm text-ink-soft">Loading inventory…</p>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <p className="rounded-md bg-warn/10 px-3 py-2 text-sm text-warn">
          {error}
        </p>
      )}

      <form onSubmit={handleAdd} className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <input
          value={form.name}
          onChange={(e) => setField("name", e.target.value)}
          placeholder="Item name"
          className="rounded-md border border-line bg-canvas px-3 py-2 text-sm text-ink placeholder:text-ink-soft/70 focus:border-accent"
        />
        <input
          value={form.sku}
          onChange={(e) => setField("sku", e.target.value)}
          placeholder="SKU"
          className="rounded-md border border-line bg-canvas px-3 py-2 text-sm text-ink placeholder:text-ink-soft/70 focus:border-accent"
        />
        <input
          type="number"
          min={0}
          value={form.amount}
          onChange={(e) => setField("amount", Number(e.target.value))}
          placeholder="Qty"
          className="rounded-md border border-line bg-canvas px-3 py-2 text-sm text-ink placeholder:text-ink-soft/70 focus:border-accent"
        />
        <input
          type="number"
          min={0}
          step={0.01}
          value={form.price}
          onChange={(e) => setField("price", Number(e.target.value))}
          placeholder="Price"
          className="rounded-md border border-line bg-canvas px-3 py-2 text-sm text-ink placeholder:text-ink-soft/70 focus:border-accent"
        />
        <button
          type="submit"
          disabled={saving || !form.name.trim() || !form.sku.trim()}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-strong disabled:opacity-50"
        >
          Add
        </button>
      </form>

      {items.length === 0 && !error ? (
        <p className="text-sm text-ink-soft">No items yet. Add one above.</p>
      ) : (
        <div className="rounded-lg border border-line bg-canvas-raised">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wider text-ink-soft">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3 text-right">Qty</th>
                <th className="px-4 py-3 text-right">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-line last:border-0"
                >
                  <td className="px-4 py-3 font-medium text-ink">
                    {item.name}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-soft">
                    {item.sku}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {item.amount}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    ${item.price.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleStock(item)}
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
                        item.isInStock
                          ? "bg-accent/10 text-accent hover:bg-accent/20"
                          : "bg-ink-soft/10 text-ink-soft hover:bg-ink-soft/20"
                      }`}
                    >
                      {item.isInStock ? "In stock" : "Out of stock"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-xs text-ink-soft hover:text-warn"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-ink-soft">
        {items.length} item{items.length !== 1 && "s"} total
      </p>
    </div>
  );
}
