import { useMemo } from "react";
import { useInventory } from "@/lib/inventory-context.tsx";
import type { Item } from "@/lib/api";

interface InventoryManagerProps {
  items: Item[];
  filteredItems?: Item[];
  query?: string;
  onClearQuery?: () => void;
}

export function InventoryManager({ items, filteredItems, query, onClearQuery }: InventoryManagerProps) {
  const { loading, error } = useInventory();

  const displayItems = useMemo(() => {
    if (filteredItems) return filteredItems;
    return items;
  }, [filteredItems, items]);

  const showingFiltered = !!query && !!filteredItems;

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
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-soft">
          {displayItems.length} item{displayItems.length !== 1 && "s"}
        </p>
      </div>

      {displayItems.length === 0 && !error ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line bg-canvas-raised py-16">
          <span className="text-4xl text-ink-muted">📦</span>
          <p className="mt-4 text-sm text-ink-soft">
            {showingFiltered ? `No items match "${query}"` : "No items yet"}
          </p>
          {showingFiltered && (
            <button onClick={onClearQuery} className="mt-3 text-sm text-accent hover:text-accent-strong">
              Clear search
            </button>
          )}
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
                </tr>
              </thead>
              <tbody>
                {displayItems.map((item) => (
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
                      <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ${
                        item.isInStock
                          ? "bg-success-soft text-success"
                          : "bg-ink-soft/10 text-ink-muted"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${item.isInStock ? "bg-success" : "bg-ink-muted"}`} />
                        {item.isInStock ? "In stock" : "Out of stock"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
