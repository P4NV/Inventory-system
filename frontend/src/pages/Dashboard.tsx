import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
  LabelList,
} from "recharts";
import { motion, useReducedMotion } from "motion/react";
import { api, LOW_STOCK_THRESHOLD, type Item } from "@/lib/api";
import { useEffect, useState, useMemo } from "react";
import { Package, DollarSign, CheckCircle2, FolderOpen, TrendingUp, HeartPulse } from "lucide-react";

const COLORS = {
  cyan: "#73cefc",
  green: "#4ade80",
  amber: "#f5a623",
  red: "#ff6b6b",
  purple: "#a78bfa",
  teal: "#22d3ee",
  ink: "#eff0f0",
  muted: "#7a7e85",
  line: "#2d2d2f",
  surface: "#1c1c1e",
};

const PALETTE = ["#73cefc", "#4ade80", "#f5a623", "#a78bfa", "#22d3ee", "#f97373", "#f0abfc", "#86efac"];

function chartPalette(len: number) {
  return PALETTE.slice(0, len);
}

interface CategoryStat {
  category: string;
  count: number;
  value: number;
}

interface MonthlyStat {
  month: string;
  items: number;
}

interface StockStat {
  name: string;
  value: number;
  color: string;
}

function ChartCard({ title, subtitle, children, className = "" }: { title: string; subtitle: string; children: React.ReactNode; className?: string }) {
  return (
    <article className={`rounded-xl border border-line bg-canvas-raised p-6 ${className}`}>
      <header className="mb-5">
        <h3 className="font-display text-base font-semibold text-ink">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-ink-muted">{subtitle}</p>}
      </header>
      <div className="h-full">{children}</div>
    </article>
  );
}

const sharedTooltipStyle = {
  backgroundColor: COLORS.surface,
  border: "none",
  borderRadius: "8px",
  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
  padding: "8px 12px",
};

const sharedLabelStyle = { color: COLORS.ink, fontSize: 13, fontWeight: 600 };

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
      const prev = map.get(item.category) || { count: 0, value: 0 };
      prev.count += 1;
      prev.value += item.amount * item.price;
      map.set(item.category, prev);
    });
    return Array.from(map.entries())
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [items]);

  const monthlyData = useMemo<MonthlyStat[]>(() => {
    const now = new Date();
    const months = new Map<string, number>();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.set(d.toLocaleString("default", { month: "short" }), 0);
    }
    items.forEach((item) => {
      const key = new Date(item.addedAt).toLocaleString("default", { month: "short" });
      months.set(key, (months.get(key) || 0) + 1);
    });
    return Array.from(months.entries()).map(([month, items]) => ({ month, items }));
  }, [items]);

  const stockDistribution = useMemo<StockStat[]>(() => {
    const inStock = items.filter((i) => i.isInStock).length;
    const outOfStock = items.length - inStock;
    const lowStock = items.filter((i) => i.isInStock && i.amount <= LOW_STOCK_THRESHOLD).length;
    return [
      { name: "In Stock", value: inStock - lowStock, color: COLORS.green },
      { name: "Low Stock", value: lowStock, color: COLORS.amber },
      { name: "Out of Stock", value: outOfStock, color: COLORS.red },
    ].filter((d) => d.value > 0);
  }, [items]);

  const totalValue = items.reduce((sum, i) => sum + i.amount * i.price, 0);
  const totalItems = items.length;
  const inStockCount = items.filter((i) => i.isInStock).length;
  const categoriesCount = categoryData.length;
  const avgPrice = totalItems > 0 ? totalValue / totalItems : 0;

  const kpiCards = [
    { label: "Total Items", value: totalItems.toLocaleString(), icon: Package, color: COLORS.cyan },
    { label: "Total Value", value: `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: DollarSign, color: COLORS.green },
    { label: "In Stock", value: `${inStockCount} / ${totalItems}`, icon: CheckCircle2, color: COLORS.green },
    { label: "Categories", value: categoriesCount.toLocaleString(), icon: FolderOpen, color: COLORS.amber },
    { label: "Avg Price / Item", value: `$${avgPrice.toFixed(2)}`, icon: TrendingUp, color: COLORS.purple },
    { label: "Stock Health", value: totalItems > 0 ? `${Math.round((inStockCount / totalItems) * 100)}%` : "0%", icon: HeartPulse, color: COLORS.teal },
  ];

  const renderCustomTooltip = (content: string, color: string) =>
    ({ active, payload, label }: any) => {
      if (!active || !payload?.length) return null;
      return (
        <div style={sharedTooltipStyle}>
          <p style={sharedLabelStyle}>{label}</p>
          {payload.map((entry: any, i: number) => (
            <p key={i} style={{ color: entry.color || color, fontSize: 13, marginTop: 2 }}>
              {content}: <span style={{ fontWeight: 600 }}>{entry.value}</span>
            </p>
          ))}
        </div>
      );
    };

  const renderPieTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0];
    return (
      <div style={sharedTooltipStyle}>
        <p style={{ color: d.payload.color, fontSize: 13, fontWeight: 600 }}>{d.name}</p>
        <p style={{ color: COLORS.ink, fontSize: 13, marginTop: 2 }}>
          {d.value} item{d.value !== 1 ? "s" : ""}
        </p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <motion.header
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: -12 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <p className="font-mono text-xs uppercase tracking-widest text-accent">Analytics Dashboard</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-ink">Inventory Analytics</h1>
        <p className="mt-1 text-sm text-ink-muted">Real-time insights into your inventory performance</p>
      </motion.header>

      <motion.section
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 16 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
      >
        {kpiCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.article
              key={card.label}
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 + i * 0.04 }}
              className="rounded-xl border border-line bg-canvas-raised p-4"
            >
              <div className="flex items-center justify-between">
                <p className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">{card.label}</p>
                <Icon size={15} className="text-ink-muted/50" />
              </div>
              <p className="mt-1.5 font-display text-xl font-semibold tabular-nums" style={{ color: card.color }}>
                {card.value}
              </p>
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
        <ChartCard title="Items by Category" subtitle="Count of items grouped by category">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData} layout="vertical" margin={{ top: 4, right: 24, left: 0, bottom: 4 }}>
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="category"
                width={90}
                tick={{ fill: COLORS.muted, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip cursor={{ fill: "rgba(255,255,255,0.03)" }} content={renderCustomTooltip("Items", COLORS.cyan)} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={20}>
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={chartPalette(categoryData.length)[i]} />
                ))}
                <LabelList dataKey="count" position="right" fill={COLORS.muted} fontSize={12} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Category Inventory Value" subtitle="Total dollar value by category">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData} layout="vertical" margin={{ top: 4, right: 24, left: 0, bottom: 4 }}>
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="category"
                width={90}
                tick={{ fill: COLORS.muted, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
                content={({ active, payload, label }: any) => {
                  if (!active || !payload?.length) return null;
                  const v = payload[0].value;
                  return (
                    <div style={sharedTooltipStyle}>
                      <p style={sharedLabelStyle}>{label}</p>
                      <p style={{ color: COLORS.green, fontSize: 13, marginTop: 2 }}>
                        Value: <span style={{ fontWeight: 600 }}>${v.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={20}>
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={chartPalette(categoryData.length).toReversed()[i]} />
                ))}
                <LabelList
                  dataKey="value"
                  position="right"
                  fill={COLORS.muted}
                  fontSize={11}
                  formatter={(v: any) => `$${Number(v) >= 1000 ? `${(Number(v) / 1000).toFixed(1)}k` : Number(v).toFixed(0)}`}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </motion.section>

      <motion.section
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 16 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="grid gap-6 lg:grid-cols-5"
      >
        <div className="lg:col-span-3">
          <ChartCard title="Monthly Activity" subtitle="Items added per month (last 6 months)">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyData} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                <XAxis
                  dataKey="month"
                  tick={{ fill: COLORS.muted, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip cursor={{ fill: "rgba(255,255,255,0.03)" }} content={renderCustomTooltip("Items added", COLORS.cyan)} />
                <Bar dataKey="items" radius={[4, 4, 0, 0]} maxBarSize={48} fill={COLORS.cyan}>
                  <LabelList dataKey="items" position="top" fill={COLORS.muted} fontSize={12} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="lg:col-span-2">
          <ChartCard title="Stock Health" subtitle="Breakdown of inventory stock levels">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={stockDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={48}
                  paddingAngle={3}
                  stroke="none"
                >
                  {stockDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                  <LabelList
                    dataKey="value"
                    position="inside"
                    fill="#fff"
                    fontSize={14}
                    fontWeight={700}
                  />
                </Pie>
                <Tooltip content={renderPieTooltip} />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12, color: COLORS.muted, paddingTop: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </motion.section>
    </div>
  );
}
