import { useEffect, useState } from "react";
import {
  api,
  ApiError,
  CATEGORIES,
  type Item,
  type CreateItemInput,
} from "@/lib/api.ts";
import { Modal } from "@/components/ui/Modal.tsx";

const emptyForm: CreateItemInput = {
  name: "",
  sku: "",
  amount: 0,
  price: 0,
  category: "general",
  isInStock: true,
};

export function InventoryManager() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<CreateItemInput>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .listItems()
      .then(setItems)
      .catch((err: ApiError) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function openModal() {
    setForm(emptyForm);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setForm(emptyForm);
  }

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
      closeModal();
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
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-error-soft px-4 py-3 text-sm text-error">
          <span>⚠</span>
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-error/70 hover:text-error">✕</button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-soft">
          {items.length} item{items.length !== 1 && "s"}
        </p>
        <button
          onClick={openModal}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-strong active:scale-[0.98]"
        >
          + Add item
        </button>
      </div>

      {items.length === 0 && !error ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line bg-canvas-raised py-16">
          <span className="text-4xl text-ink-muted">📦</span>
          <p className="mt-4 text-sm text-ink-soft">No items yet</p>
          <button onClick={openModal} className="mt-3 text-sm text-accent hover:text-accent-strong">
            Add your first item
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-line bg-canvas-raised">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-canvas text-xs uppercase tracking-wider text-ink-muted">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">SKU</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium text-right">Qty</th>
                  <th className="px-4 py-3 font-medium text-right">Price</th>
                  <th className="px-4 py-3 font-medium">Stock</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-line last:border-0 hover:bg-canvas/50 transition-colors"
                  >
                    <td className="px-4 py-3.5 font-medium text-ink">
                      {item.name}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-ink-muted">
                      {item.sku}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-block rounded-md bg-canvas px-2 py-0.5 text-xs text-ink-soft">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right tabular-nums text-ink">
                      {item.amount}
                    </td>
                    <td className="px-4 py-3.5 text-right tabular-nums text-ink">
                      ${item.price.toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => handleToggleStock(item)}
                        className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                          item.isInStock
                            ? "bg-success-soft text-success hover:bg-success-soft/80"
                            : "bg-ink-soft/10 text-ink-muted hover:bg-ink-soft/20"
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${item.isInStock ? "bg-success" : "bg-ink-muted"}`} />
                        {item.isInStock ? "In stock" : "Out of stock"}
                      </button>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="rounded-md px-2 py-1 text-xs text-ink-muted hover:bg-error-soft hover:text-error transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={modalOpen} onClose={closeModal} title="Add item">
        <form onSubmit={handleAdd} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Name
            </label>
            <input
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="Item name"
              autoFocus
              className="w-full rounded-lg border border-line bg-canvas px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">
                SKU
              </label>
              <input
                value={form.sku}
                onChange={(e) => setField("sku", e.target.value)}
                placeholder="WDG-001"
                className="w-full rounded-lg border border-line bg-canvas px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setField("category", e.target.value)}
                className="w-full rounded-lg border border-line bg-canvas px-3.5 py-2.5 text-sm text-ink focus:border-accent focus:outline-none transition-colors"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">
                Quantity
              </label>
              <input
                type="number"
                min={0}
                value={form.amount}
                onChange={(e) => setField("amount", Number(e.target.value))}
                className="w-full rounded-lg border border-line bg-canvas px-3.5 py-2.5 text-sm text-ink focus:border-accent focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">
                Price
              </label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={form.price}
                onChange={(e) => setField("price", Number(e.target.value))}
                className="w-full rounded-lg border border-line bg-canvas px-3.5 py-2.5 text-sm text-ink focus:border-accent focus:outline-none transition-colors"
              />
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              id="inStock"
              checked={form.isInStock ?? true}
              onChange={(e) => setField("isInStock", e.target.checked)}
              className="h-4 w-4 rounded border-line accent-accent"
            />
            <span className="text-sm text-ink">In stock</span>
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-lg px-4 py-2.5 text-sm text-ink-soft hover:bg-canvas-overlay hover:text-ink transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !form.name.trim() || !form.sku.trim()}
              className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-strong disabled:opacity-50 active:scale-[0.98]"
            >
              {saving ? "Adding…" : "Add item"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}