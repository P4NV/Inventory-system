import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { api, ApiError, type Item } from "@/lib/api";

export function SignalLog() {
  const [items, setItems] = useState<Item[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listItems()
      .then(setItems)
      .catch((err: ApiError) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const title = draft.trim();
    if (!title) return;
    setDraft("");
    try {
      const created = await api.createItem(title);
      setItems((prev) => [created, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save that signal");
    }
  }

  async function handleToggle(item: Item) {
    const next = { ...item, done: !item.done };
    setItems((prev) => prev.map((i) => (i.id === item.id ? next : i)));
    try {
      await api.toggleItem(item.id, next.done);
    } catch {
      setItems((prev) => prev.map((i) => (i.id === item.id ? item : i)));
    }
  }

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

      <form onSubmit={handleAdd} className="mb-4 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Log a signal…"
          className="flex-1 rounded-md border border-line bg-canvas px-3 py-2 text-sm text-ink placeholder:text-ink-soft/70 focus:border-accent"
        />
        <button
          type="submit"
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-strong"
        >
          Add
        </button>
      </form>

      {error && (
        <p className="mb-3 rounded-md bg-warn/10 px-3 py-2 text-sm text-warn">
          {error} — start the API and refresh.
        </p>
      )}

      {loading ? (
        <p className="text-sm text-ink-soft">Loading…</p>
      ) : items.length === 0 && !error ? (
        <p className="text-sm text-ink-soft">
          No signals yet. Add one above — it's saved in Postgres.
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
                <button
                  onClick={() => handleToggle(item)}
                  aria-pressed={item.done}
                  aria-label={item.done ? "Mark unresolved" : "Mark resolved"}
                  className={`h-4 w-4 shrink-0 rounded border ${
                    item.done ? "border-accent bg-accent" : "border-line"
                  }`}
                />
                <span
                  className={`flex-1 text-sm ${
                    item.done ? "text-ink-soft line-through" : "text-ink"
                  }`}
                >
                  {item.title}
                </span>
                <button
                  onClick={() => handleDelete(item.id)}
                  aria-label="Delete signal"
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
