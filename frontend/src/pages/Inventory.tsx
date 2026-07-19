import { InventoryManager } from "@/components/features/InventoryManager.tsx";

export function Inventory() {
  return (
    <div>
      <div className="mb-8">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">Management</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-ink">
          Inventory
        </h1>
        <p className="mt-2 text-ink-soft">Manage your stock and items</p>
      </div>
      <InventoryManager />
    </div>
  );
}