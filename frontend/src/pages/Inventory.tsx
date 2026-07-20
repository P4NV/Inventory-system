import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { InventoryManager } from "@/components/features/InventoryManager.tsx";
import { useInventory } from "@/lib/inventory-context.tsx";
import { downloadReport, type ReportPeriod } from "@/lib/report.ts";
import { FileDown } from "lucide-react";

const periods: { label: string; value: ReportPeriod }[] = [
  { label: "Daily", value: "daily" },
  { label: "Monthly", value: "monthly" },
  { label: "Yearly", value: "yearly" },
];

export function Inventory() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q")?.trim() ?? "";
  const { items } = useInventory();

  const matches = useMemo(() => {
    if (!q) return items;
    const n = q.toLowerCase();
    return items.filter(
      (i) =>
        i.name.toLowerCase().includes(n) ||
        i.sku.toLowerCase().includes(n) ||
        i.category.toLowerCase().includes(n),
    );
  }, [items, q]);

  function clearQuery() {
    const next = new URLSearchParams(params);
    next.delete("q");
    setParams(next, { replace: true });
  }

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-accent">Management</p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-ink">
            Inventory
          </h1>
          <p className="mt-2 text-ink-soft">Manage your stock and items</p>
        </div>
        <div className="flex gap-1.5">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => downloadReport(items, p.value)}
              className="flex items-center gap-1.5 rounded-lg border border-line bg-canvas-raised px-3 py-2 text-xs font-medium text-ink-soft hover:bg-canvas-overlay hover:text-ink transition-colors"
            >
              <FileDown size={13} className="text-accent" />
              {p.label}
            </button>
          ))}
        </div>
      </div>
      {q && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/5 px-4 py-2 text-sm">
          <span className="text-ink-soft">Showing results for</span>
          <span className="font-medium text-accent">"{q}"</span>
          <span className="text-ink-muted">({matches.length} match{matches.length !== 1 ? "es" : ""})</span>
          <button
            onClick={clearQuery}
            className="ml-auto rounded-md px-2 py-0.5 text-xs text-ink-muted hover:bg-canvas-overlay hover:text-ink"
          >
            Clear
          </button>
        </div>
      )}
      <InventoryManager items={items} filteredItems={matches} query={q} onClearQuery={clearQuery} />
    </div>
  );
}
