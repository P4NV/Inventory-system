import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { api, ApiError, type Item } from "@/lib/api.ts";

export function SignalLog() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listItems()
      .then(setItems)
      .catch((err: ApiError) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    const prevItems = items;
    setItems((prev) => prev.filter((i) => i.id !== id));
    try {
      await api.deleteItem(id);
    } catch {
      setItems(prevItems);
    }
  }

  return (
    <div className="rounded-lg border border-line bg-canvas-raised p-5">
      <div className="mb-4 flex items-baseline justify-between">
        <h3 className="font-display text-lg font-semibold text-ink">Signals</h3>
        <span className="font-mono text-xs text-ink-soft">
          round-trips through /items
        </span>
      </div>

      {error && (
        <p className="mb-3 rounded-md bg-warn/10 px-3 py-2 text-sm text-warn">
          {error} — start the API and refresh.
        </p>
      )}

      {loading ? (
        <p className="text-sm text-ink-soft">Loading…</p>
      ) : items.length === 0 && !error ? (
        <p className="text-sm text-ink-soft">
          No items yet. Add some on the inventory page.
        </p>
      ) : (
        <ul className="space-y-1">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <motion.li
                key={item.id}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-canvas"
              >
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${
                    item.isInStock ? "bg-accent" : "bg-ink-soft"
                  }`}
                />
                <span className="flex-1 text-sm text-ink">{item.name}</span>
                <span className="font-mono text-xs text-ink-soft">
                  {item.sku}
                </span>
                <button
                  onClick={() => handleDelete(item.id)}
                  aria-label="Delete item"
                  className="text-ink-soft hover:text-warn"
                >
                  ×
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
