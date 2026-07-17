import { InventoryManager } from "@/components/features/InventoryManager.tsx";

export function Inventory() {
  return (
    <div className="mx-auto max-w-4/5">
      <h1 className="font-display text-3xl font-semibold text-ink">
        Inventory
      </h1>
      <p className="mt-2 mb-8 text-ink-soft">
        Manage your inventory
      </p>
      <InventoryManager />
    </div>
  );
}
