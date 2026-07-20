import type { Item } from "./api";

export type SearchablePage = {
  title: string;
  path: string;
  description?: string;
  keywords?: string[];
};

export type ItemResult = {
  kind: "item";
  id: string;
  name: string;
  sku: string;
  category: string;
  score: number;
  matchField: "name" | "sku" | "category";
};

export type PageResult = {
  kind: "page";
  id: string;
  title: string;
  path: string;
  description?: string;
  score: number;
};

export type SearchResult = ItemResult | PageResult;

export type GroupedResults = {
  itemsByCategory: Array<{ category: string; items: ItemResult[] }>;
  pages: PageResult[];
  total: number;
};

const DEFAULT_PAGES: SearchablePage[] = [
  { title: "Home", path: "/", description: "Inventory overview & quick actions", keywords: ["home", "overview", "stats"] },
  { title: "Dashboard", path: "/dashboard", description: "Analytics & charts", keywords: ["dashboard", "analytics", "charts", "reports"] },
  { title: "Inventory", path: "/inventory", description: "Manage stock & items", keywords: ["inventory", "items", "stock", "products"] },
];

function score(haystack: string, needle: string): number {
  if (!haystack || !needle) return 0;
  const h = haystack.toLowerCase();
  const n = needle.toLowerCase();
  if (h === n) return 1000;
  if (h.startsWith(n)) return 500 - (h.length - n.length);
  const idx = h.indexOf(n);
  if (idx === -1) return 0;
  return 300 - idx;
}

function bestFieldScore(item: Item, q: string): { score: number; field: ItemResult["matchField"] } {
  const sName = score(item.name, q);
  const sSku = score(item.sku, q);
  const sCat = score(item.category, q);
  const best = Math.max(sName, sSku, sCat);
  let field: ItemResult["matchField"] = "name";
  if (sSku === best) field = "sku";
  else if (sCat === best) field = "category";
  return { score: best, field };
}

export function searchItems(items: Item[], query: string, limit = 8): ItemResult[] {
  const q = query.trim();
  if (!q) return [];
  const ranked = items
    .map((item) => {
      const { score, field } = bestFieldScore(item, q);
      return { kind: "item" as const, id: item.id, name: item.name, sku: item.sku, category: item.category, score, matchField: field };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  return ranked;
}

export function searchPages(query: string, pages: SearchablePage[] = DEFAULT_PAGES, limit = 4): PageResult[] {
  const q = query.trim();
  if (!q) return [];
  return pages
    .map((p) => {
      const sTitle = score(p.title, q);
      const sPath = score(p.path, q);
      const sDesc = score(p.description ?? "", q);
      const sKw = (p.keywords ?? []).reduce((acc, k) => Math.max(acc, score(k, q)), 0);
      const best = Math.max(sTitle, sPath, sDesc, sKw);
      return { kind: "page" as const, id: p.path, title: p.title, path: p.path, description: p.description, score: best };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function groupResults(items: ItemResult[], pages: PageResult[]): GroupedResults {
  const byCat = new Map<string, ItemResult[]>();
  for (const it of items) {
    const list = byCat.get(it.category) ?? [];
    list.push(it);
    byCat.set(it.category, list);
  }
  return {
    itemsByCategory: Array.from(byCat.entries())
      .map(([category, items]) => ({ category, items }))
      .sort((a, b) => a.category.localeCompare(b.category)),
    pages,
    total: items.length + pages.length,
  };
}
