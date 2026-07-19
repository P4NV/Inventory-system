import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { motion, useReducedMotion } from "motion/react";
import { api, type Item } from "@/lib/api";
import { useEffect, useState, useMemo } from "react";
import { Package, DollarSign, CheckCircle2, FolderOpen, TrendingUp, HeartPulse } from "lucide-react";

const BAR_COLOR = "#73cefc";
const CHART_THEME = {
  grid: "#2d2d2f",
  tick: "#7a7e85",
  label: "#a8acb0",
  tooltipBg: "#1c1c1e",
  tooltipText: "#eff0f0",
};

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
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
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
      { name: "In Stock", value: inStock - lowStock, color: "#4ade80" },
      { name: "Low Stock (≤10)", value: lowStock, color: "#f5a623" },
      { name: "Out of Stock", value: outOfStock, color: "#ff6b6b" },
    ].filter((d) => d.value > 0);
  }, [items]);

  const totalValue = items.reduce((sum, i) => sum + i.amount * i.price, 0);
  const totalItems = items.length;
  const inStockCount = items.filter((i) => i.isInStock).length;
  const categoriesCount = categoryData.length;
  const avgPrice = totalItems > 0 ? totalValue / totalItems : 0;

  const kpiCards = [
    { label: "Total Items", value: totalItems.toLocaleString(), icon: Package, color: "#73cefc" },
    { label: "Total Value", value: `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: DollarSign, color: "#4ade80" },
    { label: "In Stock", value: `${inStockCount} / ${totalItems}`, icon: CheckCircle2, color: "#4ade80" },
    { label: "Categories", value: categoriesCount.toLocaleString(), icon: FolderOpen, color: "#f5a623" },
    { label: "Avg Price/Item", value: `$${avgPrice.toFixed(2)}`, icon: TrendingUp, color: "#a78bfa" },
    { label: "Stock Health", value: totalItems > 0 ? `${Math.round((inStockCount / totalItems) * 100)}%` : "0%", icon: HeartPulse, color: "#22d3ee" },
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-accent border-t-transparent" />
      </div>
    );
  }

  const tooltipFn = (value: number, name?: string) => {
    const v = typeof value === "number" ? value : 0;
    return name === "value" || name === "totalValue"
      ? [`$${v.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, "Value"]
      : [v, "Items"];
  };

  const stockTooltipFn = (value: number) => {
    return [typeof value === "number" ? value : 0, "Items"];
  };

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
      </motion.header>

      <motion.section
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 16 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
      >
        {kpiCards.map((card, i) => {
          const Icon = card.icon;
          return (
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
                <Icon size={20} className="text-ink-muted" />
              </div>
              <div className="absolute bottom-4 right-4 h-2 w-16 rounded-full bg-line">
                <div className="h-full w-1/3 rounded-full" style={{ backgroundColor: card.color }} />
              </div>
            </motion.article>
          );
        })}
      </motion.section>

      <motion.section
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 16 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="grid gap-6 lg:grid-cols-2"
      >
        <ChartCard title="Items by Category" subtitle="Distribution of items across categories">
          <ResponsiveContainer width="100%" height={340}>
            <BarChart
              data={categoryData}
              layout="vertical"
              margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
            >
              <CartesianGrid stroke={CHART_THEME.grid} strokeDasharray="3 3" vertical={false} />
              <XAxis
                type="number"
                tick={{ fill: CHART_THEME.tick, fontSize: 12, fontFamily: "inherit" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="category"
                width={100}
                tick={{ fill: CHART_THEME.label, fontSize: 12, fontFamily: "inherit" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.04)" }}
                contentStyle={{
                  backgroundColor: CHART_THEME.tooltipBg,
                  border: "none",
                  borderRadius: "8px",
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  padding: "10px 14px",
                }}
                labelStyle={{ color: CHART_THEME.tooltipText, fontSize: 13, fontWeight: 600, fontFamily: "inherit" }}
                formatter={tooltipFn}
              />
              <Bar
                dataKey="count"
                fill={BAR_COLOR}
                radius={[0, 4, 4, 0]}
                maxBarSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly Activity (Last 6 Months)" subtitle="Items added per month">
          <ResponsiveContainer width="100%" height={340}>
            <BarChart
              data={monthlyData}
              margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
            >
              <CartesianGrid stroke={CHART_THEME.grid} strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: CHART_THEME.label, fontSize: 12, fontFamily: "inherit", fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="number"
                tick={{ fill: CHART_THEME.tick, fontSize: 12, fontFamily: "inherit" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.04)" }}
                contentStyle={{
                  backgroundColor: CHART_THEME.tooltipBg,
                  border: "none",
                  borderRadius: "8px",
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  padding: "10px 14px",
                }}
                labelStyle={{ color: CHART_THEME.tooltipText, fontSize: 13, fontWeight: 600, fontFamily: "inherit" }}
                formatter={tooltipFn}
              />
              <Bar
                dataKey="items"
                fill={BAR_COLOR}
                radius={[4, 4, 0, 0]}
                maxBarSize={36}
              />
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
        <ChartCard title="Stock Health" subtitle="Current inventory status">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={stockDistribution}
              layout="vertical"
              margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
            >
              <CartesianGrid stroke={CHART_THEME.grid} strokeDasharray="3 3" vertical={false} />
              <XAxis
                type="number"
                tick={{ fill: CHART_THEME.tick, fontSize: 12, fontFamily: "inherit" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={100}
                tick={{ fill: CHART_THEME.label, fontSize: 12, fontFamily: "inherit" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.04)" }}
                contentStyle={{
                  backgroundColor: CHART_THEME.tooltipBg,
                  border: "none",
                  borderRadius: "8px",
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  padding: "10px 14px",
                }}
                labelStyle={{ color: CHART_THEME.tooltipText, fontSize: 13, fontWeight: 600, fontFamily: "inherit" }}
                formatter={stockTooltipFn}
              />
              <Bar
                dataKey="value"
                radius={[0, 4, 4, 0]}
                maxBarSize={24}
              >
                {stockDistribution.map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Category Value" subtitle="Total inventory value by category">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={categoryData.slice(0, 6)}
              layout="vertical"
              margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
            >
              <CartesianGrid stroke={CHART_THEME.grid} strokeDasharray="3 3" vertical={false} />
              <XAxis
                type="number"
                tick={{ fill: CHART_THEME.tick, fontSize: 12, fontFamily: "inherit" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="category"
                width={100}
                tick={{ fill: CHART_THEME.label, fontSize: 12, fontFamily: "inherit" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.04)" }}
                contentStyle={{
                  backgroundColor: CHART_THEME.tooltipBg,
                  border: "none",
                  borderRadius: "8px",
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  padding: "10px 14px",
                }}
                labelStyle={{ color: CHART_THEME.tooltipText, fontSize: 13, fontWeight: 600, fontFamily: "inherit" }}
                formatter={tooltipFn}
              />
              <Bar
                dataKey="value"
                fill={BAR_COLOR}
                radius={[0, 4, 4, 0]}
                maxBarSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top Categories by Items" subtitle="Categories with most items">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={categoryData.slice(0, 6)}
              layout="vertical"
              margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
            >
              <CartesianGrid stroke={CHART_THEME.grid} strokeDasharray="3 3" vertical={false} />
              <XAxis
                type="number"
                tick={{ fill: CHART_THEME.tick, fontSize: 12, fontFamily: "inherit" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="category"
                width={100}
                tick={{ fill: CHART_THEME.label, fontSize: 12, fontFamily: "inherit" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.04)" }}
                contentStyle={{
                  backgroundColor: CHART_THEME.tooltipBg,
                  border: "none",
                  borderRadius: "8px",
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  padding: "10px 14px",
                }}
                labelStyle={{ color: CHART_THEME.tooltipText, fontSize: 13, fontWeight: 600, fontFamily: "inherit" }}
                formatter={tooltipFn}
              />
              <Bar
                dataKey="count"
                fill={BAR_COLOR}
                radius={[0, 4, 4, 0]}
                maxBarSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </motion.section>
    </div>
  );
}