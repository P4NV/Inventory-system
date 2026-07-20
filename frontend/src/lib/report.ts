import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Item } from "./api";

export type ReportPeriod = "daily" | "monthly" | "yearly";

function periodRange(period: ReportPeriod) {
  const now = new Date();
  let start: Date;
  switch (period) {
    case "daily": {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    }
    case "monthly": {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    }
    case "yearly": {
      start = new Date(now.getFullYear(), 0, 1);
      break;
    }
  }
  return { start, end: now };
}

export function filterItemsByPeriod(items: Item[], period: ReportPeriod): Item[] {
  const { start, end } = periodRange(period);
  return items.filter((item) => {
    const d = new Date(item.addedAt);
    return d >= start && d <= end;
  });
}

export function generateReport(items: Item[], period: ReportPeriod): jsPDF {
  const { start, end } = periodRange(period);
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  const totalValue = items.reduce((s, i) => s + i.amount * i.price, 0);
  const inStock = items.filter((i) => i.isInStock).length;
  const outOfStock = items.length - inStock;

  const doc = new jsPDF({ unit: "mm", format: "a4" });

  // Header
  doc.setFillColor(20, 22, 25);
  doc.rect(0, 0, 210, 48, "F");
  doc.setTextColor(115, 206, 252);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Inventory Report", 20, 24);
  doc.setTextColor(160, 164, 170);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`${period.charAt(0).toUpperCase() + period.slice(1)} · ${fmt(start)} – ${fmt(end)}`, 20, 36);

  // Summary
  doc.setTextColor(230, 232, 234);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Summary", 20, 64);

  const summaryY = 74;
  const colW = 50;
  const rows: { label: string; value: string; color: [number, number, number] }[] = [
    { label: "Total Items", value: String(items.length), color: [115, 206, 252] as const },
    { label: "Total Value", value: `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, color: [74, 222, 128] as const },
    { label: "In Stock", value: `${inStock} / ${items.length}`, color: [74, 222, 128] as const },
    { label: "Out of Stock", value: String(outOfStock), color: [255, 107, 107] as const },
  ];
  rows.forEach((r, i) => {
    const x = 20 + i * colW;
    doc.setFillColor(28, 29, 31);
    doc.roundedRect(x, summaryY, colW - 4, 22, 2, 2, "F");
    doc.setTextColor(...r.color);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(r.value, x + 6, summaryY + 10);
    doc.setTextColor(160, 164, 170);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(r.label, x + 6, summaryY + 18);
  });

  // Table
  autoTable(doc, {
    startY: summaryY + 34,
    head: [["Name", "SKU", "Category", "Qty", "Price", "Stock"]],
    body: items.map((item) => [
      item.name,
      item.sku,
      item.category,
      String(item.amount),
      `$${item.price.toFixed(2)}`,
      item.isInStock ? "In stock" : "Out of stock",
    ]),
    theme: "grid",
    styles: {
      fontSize: 8,
      textColor: [200, 202, 206],
      lineColor: [40, 42, 45],
      lineWidth: 0.5,
    },
    headStyles: {
      fillColor: [20, 22, 25],
      textColor: [115, 206, 252],
      fontSize: 8,
      fontStyle: "bold",
    },
    bodyStyles: {
      fillColor: [24, 25, 27],
    },
    alternateRowStyles: {
      fillColor: [28, 29, 31],
    },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 30 },
      2: { cellWidth: 25 },
      3: { cellWidth: 16, halign: "right" },
      4: { cellWidth: 22, halign: "right" },
      5: { cellWidth: 20, halign: "center" },
    },
    margin: { top: 50 },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(20, 22, 25);
    doc.rect(0, 285, 210, 12, "F");
    doc.setTextColor(100, 104, 110);
    doc.setFontSize(7);
    doc.text(`Generated on ${fmt(new Date())} · Page ${i} of ${pageCount}`, 20, 293);
  }

  return doc;
}

export function downloadReport(items: Item[], period: ReportPeriod) {
  const filtered = filterItemsByPeriod(items, period);
  const doc = generateReport(filtered, period);
  const label = period === "daily" ? "daily" : period === "monthly" ? "monthly" : "yearly";
  doc.save(`inventory-report-${label}-${new Date().toISOString().slice(0, 10)}.pdf`);
}
