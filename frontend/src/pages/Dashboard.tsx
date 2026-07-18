import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";
import { motion, useReducedMotion } from "motion/react";
import { api, type Item } from "@/lib/api";
import { useEffect, useState, useMemo } from "react";

const CHART_COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16"];

interface CategoryStat {
  category: string;
  count: number;
  value: number;
  avgPrice: number;
}

interface MonthlyStat {
  month: string;
  items: number;
  value: number;
}

interface StockStat {
  name: string;
  value: number;
  color: string;
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <article className="rounded-xl border border-line bg-canvas-raised p-6">
      <header className="mb-6">
        <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
        <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>
      </header>
      <div className="h-full">{children}</div>
    </article>
  );
}

export function Dashboard() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    let cancelled = false;
    api.listItems()
      .then((data) => !cancelled && setItems(data))
      .catch(console.error)
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []);

  const categoryData = useMemo<CategoryStat[]>(() => {
    const map = new Map<string, { count: number; value: number }>();
    items.forEach((item) => {
      const existing = map.get(item.category) || { count: 0, value: 0 };
      existing.count += 1;
      existing.value += item.amount * item.price;
      map.set(item.category, existing);
    });
    return Array.from(map.entries())
      .map(([category, data]) => ({
        category,
        ...data,
        avgPrice: data.value / data.count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [items]);

  const monthlyData = useMemo<MonthlyStat[]>(() => {
    const map = new Map<string, { items: number; value: number }>();
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString("default", { month: "short" });
      map.set(key, { items: 0, value: 0 });
    }
    items.forEach((item) => {
      const date = new Date(item.addedAt);
      const key = date.toLocaleString("default", { month: "short" });
      const existing = map.get(key) || { items: 0, value: 0 };
      existing.items += 1;
      existing.value += item.amount * item.price;
      map.set(key, existing);
    });
    return Array.from(map.entries()).map(([month, data]) => ({ month, ...data }));
  }, [items]);

  const stockDistribution = useMemo<StockStat[]>(() => {
    const inStock = items.filter((i) => i.isInStock).length;
    const outOfStock = items.length - inStock;
    const lowStock = items.filter((i) => i.isInStock && i.amount <= 10).length;
    return [
      { name: "In Stock", value: inStock - lowStock, color: CHART_COLORS[1] },
      { name: "Low Stock (≤10)", value: lowStock, color: CHART_COLORS[2] },
      { name: "Out of Stock", value: outOfStock, color: CHART_COLORS[3] },
    ].filter((d) => d.value > 0);
  }, [items]);

  const totalValue = items.reduce((sum, i) => sum + i.amount * i.price, 0);
  const totalItems = items.length;
  const inStockCount = items.filter((i) => i.isInStock).length;
  const categoriesCount = categoryData.length;
  const avgPrice = totalItems > 0 ? totalValue / totalItems : 0;

  const kpiCards = [
    { label: "Total Items", value: totalItems.toLocaleString(), icon: "📦", color: CHART_COLORS[0] },
    { label: "Total Value", value: `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: "💰", color: CHART_COLORS[1] },
    { label: "In Stock", value: `${inStockCount} / ${totalItems}`, icon: "✅", color: CHART_COLORS[2] },
    { label: "Categories", value: categoriesCount.toLocaleString(), icon: "📂", color: CHART_COLORS[3] },
    { label: "Avg Price/Item", value: `$${avgPrice.toFixed(2)}`, icon: "📊", color: CHART_COLORS[4] },
    { label: "Stock Health", value: totalItems > 0 ? `${Math.round((inStockCount / totalItems) * 100)}%` : "0%", icon: "💚", color: CHART_COLORS[5] },
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-accent border-t-transparent" />
      </div>
    );
  }

  const tooltipFormatter = ((value: any, name?: string) => {
    const v = typeof value === "number" ? value : 0;
    const n = name ?? "";
    return n === "count" || n === "items"
      ? [v, n === "count" ? "Items" : "Items Added"]
      : [`$${v.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, n === "value" ? "Total Value" : "Total Value"];
  }) as any;

  const valueTooltipFormatter = ((value: any) => {
    const v = typeof value === "number" ? value : 0;
    return [`$${v.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, "Total Value"];
  }) as any;

  const countTooltipFormatter = ((value: any) => {
    const v = typeof value === "number" ? value : 0;
    return [v, "Items"];
  }) as any;

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <motion.header
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: -12 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
      >
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-accent">Analytics Dashboard</p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-ink">Inventory Analytics</h1>
          <p className="mt-2 text-ink-soft">Real-time insights into your inventory performance</p>
        </div>
        <div className="flex items-center gap-3 text-sm text-ink-soft">
          <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-accent">
            <span className="relative flex h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
          </span>
          <span>Live Data</span>
        </div>
      </motion.header>

      <motion.section
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 16 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
      >
        {kpiCards.map((card, i) => (
          <motion.article
            key={card.label}
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 16 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 + i * 0.05 }}
            className="relative rounded-xl border border-line bg-canvas-raised p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-ink-soft">{card.label}</p>
                <p className="mt-1 font-display text-2xl font-semibold text-ink tabular-nums" style={{ color: card.color }}>
                  {card.value}
                </p>
              </div>
              <span className="text-2xl" aria-hidden="true">{card.icon}</span>
            </div>
            <div className="absolute bottom-4 right-4 h-2 w-16 rounded-full bg-line">
              <div className="h-full w-1/3 rounded-full" style={{ backgroundColor: card.color }} />
            </div>
          </motion.article>
        ))}
      </motion.section>

      <motion.section
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 16 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="grid gap-6 lg:grid-cols-2"
      >
        <ChartCard title="Items by Category" subtitle="Distribution of inventory items across categories">
          <ResponsiveContainer width="100%" height={340}>
            <BarChart
              data={categoryData}
              layout="vertical"
              margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis
                type="number"
                tick={{ fill: "#9ca3af", fontSize: 12, fontFamily: "inherit" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="category"
                width={120}
                tick={{ fill: "#6b7280", fontSize: 13, fontFamily: "inherit", fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "none",
                  borderRadius: "8px",
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  padding: "12px 16px",
                }}
                labelStyle={{ color: "#f3f4f6", fontSize: 13, fontWeight: 600, fontFamily: "inherit" }}
                formatter={tooltipFormatter}
                itemStyle={{ padding: "4px 0" }}
              />
              <Legend
                wrapperStyle={{ paddingTop: 8 }}
                formatter={(value) => (value === "count" ? "Item Count" : "Total Value ($)")}
                iconType="circle"
                iconSize={8}
              />
              <Bar
                dataKey="count"
                name="Item Count"
                fill={CHART_COLORS[0]}
                radius={[0, 4, 4, 0]}
                maxBarSize={28}
              >
                {categoryData.map((_, i) => (
                  <Cell key={`count-${i}`} fill={CHART_COLORS[0]} />
                ))}
              </Bar>
              <Bar
                dataKey="value"
                name="Total Value"
                fill={CHART_COLORS[1]}
                radius={[0, 4, 4, 0]}
                maxBarSize={28}
              >
                {categoryData.map((_, i) => (
                  <Cell key={`value-${i}`} fill={CHART_COLORS[1]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly Activity (Last 6 Months)" subtitle="Items added and total value by month">
          <ResponsiveContainer width="100%" height={340}>
            <BarChart
              data={monthlyData}
              margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: "#6b7280", fontSize: 13, fontFamily: "inherit", fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="number"
                tick={{ fill: "#9ca3af", fontSize: 12, fontFamily: "inherit" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "none",
                  borderRadius: "8px",
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  padding: "12px 16px",
                }}
                labelStyle={{ color: "#f3f4f6", fontSize: 13, fontWeight: 600, fontFamily: "inherit" }}
                formatter={tooltipFormatter}
                itemStyle={{ padding: "4px 0" }}
              />
              <Legend
                wrapperStyle={{ paddingTop: 8 }}
                formatter={(value) => (value === "items" ? "Items Added" : "Total Value ($)")}
                iconType="circle"
                iconSize={8}
              />
              <Bar
                dataKey="items"
                name="Items Added"
                fill={CHART_COLORS[0]}
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              >
                {monthlyData.map((_, i) => (
                  <Cell key={`items-${i}`} fill={CHART_COLORS[0]} />
                ))}
              </Bar>
              <Bar
                dataKey="value"
                name="Total Value"
                fill={CHART_COLORS[1]}
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              >
                {monthlyData.map((_, i) => (
                  <Cell key={`value-${i}`} fill={CHART_COLORS[1]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </motion.section>

      <motion.section
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 16 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="grid gap-6 lg:grid-cols-3"
      >
        <ChartCard title="Stock Health Overview" subtitle="Current inventory status distribution">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={stockDistribution}
              layout="vertical"
              margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis
                type="number"
                tick={{ fill: "#9ca3af", fontSize: 12, fontFamily: "inherit" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={100}
                tick={{ fill: "#6b7280", fontSize: 13, fontFamily: "inherit", fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "none",
                  borderRadius: "8px",
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  padding: "12px 16px",
                }}
                labelStyle={{ color: "#f3f4f6", fontSize: 13, fontWeight: 600, fontFamily: "inherit" }}
                formatter={countTooltipFormatter}
              />
              <Bar
                dataKey="value"
                fill={CHART_COLORS[1]}
                radius={[0, 4, 4, 0]}
                maxBarSize={32}
              >
                {stockDistribution.map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Category Value Distribution" subtitle="Total inventory value by category">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={categoryData.slice(0, 6)}
              layout="vertical"
              margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis
                type="number"
                tick={{ fill: "#9ca3af", fontSize: 12, fontFamily: "inherit" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="category"
                width={120}
                tick={{ fill: "#6b7280", fontSize: 13, fontFamily: "inherit", fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "none",
                  borderRadius: "8px",
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  padding: "12px 16px",
                }}
                labelStyle={{ color: "#f3f4f6", fontSize: 13, fontWeight: 600, fontFamily: "inherit" }}
                formatter={valueTooltipFormatter}
              />
              <Bar
                dataKey="value"
                fill={CHART_COLORS[4]}
                radius={[0, 4, 4, 0]}
                maxBarSize={36}
              >
                {categoryData.slice(0, 6).map((_, i) => (
                  <Cell key={`top-${i}`} fill={CHART_COLORS[4]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top Categories by Items" subtitle="Categories with most inventory items">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={categoryData.slice(0, 6)}
              layout="vertical"
              margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis
                type="number"
                tick={{ fill: "#9ca3af", fontSize: 12, fontFamily: "inherit" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="category"
                width={120}
                tick={{ fill: "#6b7280", fontSize: 13, fontFamily: "inherit", fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "none",
                  borderRadius: "8px",
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  padding: "12px 16px",
                }}
                labelStyle={{ color: "#f3f4f6", fontSize: 13, fontWeight: 600, fontFamily: "inherit" }}
                formatter={countTooltipFormatter}
              />
              <Bar
                dataKey="count"
                fill={CHART_COLORS[5]}
                radius={[0, 4, 4, 0]}
                maxBarSize={36}
              >
                {categoryData.slice(0, 6).map((_, i) => (
                  <Cell key={`top-count-${i}`} fill={CHART_COLORS[5]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </motion.section>
    </div>
  );
}