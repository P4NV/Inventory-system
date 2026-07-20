import { NavLink } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { api, LOW_STOCK_THRESHOLD, type Item } from "@/lib/api";
import { useEffect, useState } from "react";
import { Package, DollarSign, CheckCircle2, XCircle, BarChart3, ClipboardList } from "lucide-react";

interface Stats {
  totalItems: number;
  totalValue: number;
  inStock: number;
  outOfStock: number;
  lowStock: number;
  categories: number;
}

const statCards = [
  { key: "totalItems", label: "Total Items", icon: Package, accent: "text-accent" },
  { key: "totalValue", label: "Total Value", icon: DollarSign, accent: "text-emerald-400" },
  { key: "inStock", label: "In Stock", icon: CheckCircle2, accent: "text-emerald-400" },
  { key: "outOfStock", label: "Out of Stock", icon: XCircle, accent: "text-warn" },
];

const navCards = [
  { title: "Dashboard", path: "/dashboard", description: "Analytics & overview", icon: BarChart3, accent: "border-accent hover:border-accent/50" },
  { title: "Inventory", path: "/inventory", description: "Manage stock & items", icon: ClipboardList, accent: "border-emerald-500 hover:border-emerald-500/50" },
];

export function Home() {
  const prefersReducedMotion = useReducedMotion();
  const [stats, setStats] = useState<Stats>({
    totalItems: 0,
    totalValue: 0,
    inStock: 0,
    outOfStock: 0,
    lowStock: 0,
    categories: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.listItems()
      .then((items: Item[]) => {
        if (!mounted) return;
        const totalItems = items.length;
        const totalValue = items.reduce((sum, i) => sum + i.amount * i.price, 0);
        const inStock = items.filter((i) => i.isInStock).length;
        const outOfStock = totalItems - inStock;
        const lowStock = items.filter((i) => i.isInStock && i.amount <= LOW_STOCK_THRESHOLD).length;
        const categories = new Set(items.map((i) => i.category)).size;
        setStats({ totalItems, totalValue, inStock, outOfStock, lowStock, categories });
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  const formatValue = (value: number) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.header
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <p className="font-mono text-xs uppercase tracking-widest text-accent">
          Inventory Management
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          Inventory Dashboard
        </h1>
        <p className="mt-2 text-ink-soft">Real-time view of your inventory status</p>
      </motion.header>

      <motion.section
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 16 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-10"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.article
                key={card.key}
                initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
                animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.05 }}
                className="rounded-xl border border-line bg-canvas-raised p-6 transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-ink-soft">{card.label}</p>
                    <p className={`mt-2 font-display text-3xl font-semibold tabular-nums ${card.accent}`}>
                      {loading ? (
                        <span className="animate-pulse bg-line h-8 w-24 inline-block rounded" />
                      ) : card.key === "totalValue" ? (
                        formatValue(stats[card.key as keyof Stats] as number)
                      ) : (
                        (stats[card.key as keyof Stats] as number).toLocaleString()
                      )}
                    </p>
                  </div>
                  <Icon size={24} className="text-ink-muted" />
                </div>
                {card.key === "inStock" && stats.totalItems > 0 && (
                  <div className="mt-4 h-2 rounded-full bg-line overflow-hidden">
                    <motion.div
                      initial={false}
                      animate={{ width: `${((stats.inStock / stats.totalItems) * 100).toFixed(0)}%` }}
                      transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                      className="h-full bg-accent"
                      style={{ width: `${((stats.inStock / stats.totalItems) * 100).toFixed(0)}%` }}
                    />
                  </div>
                )}
              </motion.article>
            );
          })}
        </div>
      </motion.section>

      <motion.section
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 16 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold text-ink">Quick Actions</h2>
            <p className="mt-1 text-sm text-ink-soft">Navigate to key sections of your inventory</p>
          </div>
          {stats.lowStock > 0 && (
            <span className="rounded-full bg-warn/10 px-3 py-1 text-sm font-medium text-warn">
              {stats.lowStock} low stock item{stats.lowStock !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {navCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.article
                key={card.path}
                initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
                animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.25 + i * 0.05 }}
              >
                <NavLink
                  to={card.path}
                  className={({ isActive }) =>
                    `relative flex h-full items-center gap-4 rounded-xl border-2 bg-canvas-raised p-6 transition-all duration-200 ${
                      isActive
                        ? "border-accent bg-accent/5 shadow-md"
                        : `border-line hover:border-accent/50 ${card.accent}`
                    }`
                  }
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10" aria-hidden="true">
                    <Icon size={22} className="text-accent" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-lg font-semibold text-ink truncate">{card.title}</h3>
                    <p className="mt-1 text-sm text-ink-soft truncate">{card.description}</p>
                  </div>
                  <span className="text-ink-soft" aria-hidden="true">→</span>
                </NavLink>
              </motion.article>
            );
          })}
        </div>
      </motion.section>
    </div>
  );
}