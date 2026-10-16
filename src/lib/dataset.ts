export type ColumnSchema = {
  name: string;
  type: string;
  classification: string;
  masking: string;
  description: string;
};

export type Dataset = {
  id: string;
  title: string;
  formats: string[];
  csvUrl: string;
  columns: ColumnSchema[];
  downloads: number;
  updatedAt: string;
  provider: string;
  owner: { name: string; email: string };
};

export const DATASET: Dataset = {
  id: "00a0d1ce-8340-4c18-893f-f5bd8ab3d9cf",
  title: "Parcels by Right Type",
  formats: ["CSV", "JSON"],
  csvUrl: "/data/parcels-by-right-type.csv",
  downloads: 18,
  updatedAt: "2026-10-07 14:21:21",
  provider: "Ministry of Environment",
  owner: { name: "Athanase Akumuntu", email: "aakumuntu@environment.gov.rw" },
  columns: [
    { name: "province_name", type: "VARCHAR", classification: "PUBLIC", masking: "NONE", description: "Name of the province." },
    { name: "district_name", type: "VARCHAR", classification: "PUBLIC", masking: "NONE", description: "Name of the district." },
    { name: "sector_name", type: "VARCHAR", classification: "PUBLIC", masking: "NONE", description: "Name of the sector." },
    { name: "cell_name", type: "VARCHAR", classification: "PUBLIC", masking: "NONE", description: "Name of the cell." },
    { name: "description", type: "VARCHAR", classification: "PUBLIC", masking: "NONE", description: "Type of land right (tenure) for the parcels counted in this row." },
    { name: "total_parcels", type: "BIGINT", classification: "PUBLIC", masking: "NONE", description: "Number of parcels." },
  ],
};

export type Row = Record<string, string>;

/** Minimal RFC-4180 CSV parser (quotes, escaped quotes, CRLF). */
export function parseCsv(text: string, maxRows = 5000): { headers: string[]; rows: Row[]; truncated: boolean } {
  const out: string[][] = [];
  let field = "", row: string[] = [], q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') q = false;
      else field += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.some((v) => v !== "")) out.push(row);
      row = [];
      if (out.length > maxRows) break;
    } else field += c;
  }
  if (field || row.length) { row.push(field); out.push(row); }
  const [headers = [], ...body] = out;
  const truncated = body.length > maxRows;
  const rows = body.slice(0, maxRows).map((r) => Object.fromEntries(headers.map((h, i) => [h, r[i] ?? ""])));
  return { headers, rows, truncated };
}

const NUMERIC_TYPES = /INT|DECIMAL|NUMERIC|FLOAT|DOUBLE|REAL|NUMBER/i;
export const toNum = (v: string) => (v === "" ? NaN : Number(v.replace(/,/g, "")));

export type ColumnKind = "numeric" | "category" | "date" | "other";

export function classifyColumns(headers: string[], rows: Row[], schema: ColumnSchema[] = []) {
  return headers.map((h) => {
    const declared = schema.find((s) => s.name === h)?.type ?? "";
    const vals = rows.map((r) => r[h] ?? "").filter((v) => v !== "");
    const unique = new Set(vals).size;
    const numericShare = vals.length ? vals.filter((v) => !isNaN(toNum(v))).length / vals.length : 0;
    let kind: ColumnKind = "other";
    if (/DATE|TIME/i.test(declared) || (vals.length && vals.every((v) => /^\d{4}-\d{2}(-\d{2})?/.test(v)))) kind = "date";
    else if (NUMERIC_TYPES.test(declared) || numericShare > 0.95) kind = "numeric";
    else if (unique >= 2 && unique <= Math.max(50, rows.length * 0.5)) kind = "category";
    return { name: h, kind, unique };
  });
}

export type Agg = "sum" | "avg" | "count";

export function aggregate(rows: Row[], groupBy: string, value: string | null, agg: Agg, limit = 15) {
  const m = new Map<string, { s: number; n: number }>();
  for (const r of rows) {
    const k = r[groupBy] || "(blank)";
    const e = m.get(k) ?? { s: 0, n: 0 };
    const v = value ? toNum(r[value] ?? "") : 1;
    if (!isNaN(v)) { e.s += v; e.n++; }
    m.set(k, e);
  }
  const data = [...m.entries()].map(([name, { s, n }]) => ({
    name,
    value: agg === "count" ? n : agg === "avg" ? (n ? s / n : 0) : s,
  }));
  return { data: data.sort((a, b) => b.value - a.value).slice(0, limit), total: data.length };
}

export const fmt = (n: number) => new Intl.NumberFormat("en", { maximumFractionDigits: 1 }).format(n);
export const formatBytes = (b: number) =>
  b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;
export const humanize = (s: string) => s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
