import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Check, ChevronDown, ChevronLeft, ChevronRight, Copy, Download, EyeOff, Filter, Info, Printer, RotateCw, Table2, X } from "lucide-react";
import type { ColumnSchema, Row } from "@/lib/dataset";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuItem, DropdownMenuLabel } from "@/components/ui/dropdown-menu";

const PAGE_SIZES = [10, 25, 50, 100, 1000];

export function DataPreview({ headers, rows, schema, truncated }: { headers: string[]; rows: Row[]; schema: ColumnSchema[]; truncated: boolean }) {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(100);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(true);
  const [hidden, setHidden] = useState<string[]>([]);
  const [sort, setSort] = useState<{ column: string; direction: "asc" | "desc" } | null>(null);
  const [compact, setCompact] = useState(false);
  const [notice, setNotice] = useState("");
  const isNum = (h: string) => /INT|DEC|NUM|FLOAT|DOUBLE/i.test(schema.find((s) => s.name === h)?.type ?? "");
  const columns = headers.filter((h) => !hidden.includes(h));
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = rows.filter((r) => (!q || headers.some((h) => (r[h] ?? "").toLowerCase().includes(q))) && headers.every((h) => !filters[h]?.trim() || (r[h] ?? "").toLowerCase().includes(filters[h].trim().toLowerCase())));
    if (sort) {
      const numeric = /INT|DEC|NUM|FLOAT|DOUBLE/i.test(schema.find((s) => s.name === sort.column)?.type ?? "");
      result.sort((a, b) => {
        const av = a[sort.column] ?? "", bv = b[sort.column] ?? "";
        const comparison = numeric ? Number(av) - Number(bv) : av.localeCompare(bv, undefined, { numeric: true });
        return sort.direction === "asc" ? comparison : -comparison;
      });
    }
    return result;
  }, [rows, headers, query, filters, sort, schema]);
  const pages = Math.max(1, Math.ceil(filtered.length / size));
  const p = Math.min(page, pages - 1);
  const visible = filtered.slice(p * size, p * size + size);
  const pageNumbers = Array.from({ length: pages }, (_, i) => i).filter((i) => i === 0 || i === pages - 1 || Math.abs(i - p) <= 2);
  const activeFilters = Object.values(filters).filter((v) => v.trim()).length;
  const reset = () => { setQuery(""); setFilters({}); setSort(null); setHidden([]); setPage(0); setNotice(""); };
  const serialize = (separator: string) => [columns, ...filtered.map((r) => columns.map((h) => r[h] ?? ""))].map((r) => r.map((v) => separator === "," ? `"${v.replace(/"/g, '""')}"` : v.replace(/[\t\r\n]/g, " ")).join(separator)).join("\n");
  const exportData = (format: "csv" | "json") => {
    const text = format === "csv" ? serialize(",") : JSON.stringify(filtered.map((r) => Object.fromEntries(columns.map((h) => [h, r[h] ?? ""]))), null, 2);
    const url = URL.createObjectURL(new Blob([text], { type: format === "csv" ? "text/csv;charset=utf-8" : "application/json" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: `parcels-by-right-type-preview.${format}` });
    a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(serialize("\t")); setNotice("Filtered data copied."); }
    catch { setNotice("Could not copy data. Try downloading it instead."); }
  };
  const print = () => {
    const popup = window.open("", "_blank", "width=1000,height=700");
    if (!popup) { setNotice("Allow pop-ups to print this table."); return; }
    popup.document.title = "Parcels by Right Type — Data Preview";
    const heading = popup.document.createElement("h1"); heading.textContent = "Parcels by Right Type"; popup.document.body.append(heading);
    const table = popup.document.createElement("table"); table.setAttribute("border", "1"); table.setAttribute("cellpadding", "6");
    [columns, ...filtered.map((r) => columns.map((h) => r[h] ?? ""))].forEach((values, i) => {
      const tr = popup.document.createElement("tr"); values.forEach((value) => { const cell = popup.document.createElement(i === 0 ? "th" : "td"); cell.textContent = value; tr.append(cell); }); table.append(tr);
    });
    popup.document.body.append(table); popup.focus(); popup.print();
  };

  return (
    <section aria-label="Data Preview" className="min-w-0 text-sm">
      <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-4 flex items-center gap-3">
        <Button onClick={() => setShowFilters((v) => !v)} aria-expanded={showFilters} className="rounded-sm shadow-none"><Filter />Add Filter{activeFilters > 0 && <span>({activeFilters})</span>}</Button>
        {activeFilters > 0 && <Button variant="ghost" size="sm" onClick={() => { setFilters({}); setPage(0); }}><X />Clear filters</Button>}
      </div>
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <label className="flex items-center gap-2">Show
            <select aria-label="Entries per page" value={size} onChange={(e) => { setSize(Number(e.target.value)); setPage(0); }} className="h-9 w-20 rounded-sm border border-input bg-card px-2 outline-none focus:ring-1 focus:ring-ring">
              {PAGE_SIZES.map((s) => <option key={s}>{s}</option>)}
            </select>entries:
          </label>
          <p>Showing {filtered.length ? p * size + 1 : 0} to {Math.min((p + 1) * size, filtered.length).toLocaleString()} of {filtered.length.toLocaleString()} entries{filtered.length !== rows.length && <span className="text-muted-foreground"> (filtered from {rows.length.toLocaleString()})</span>}{truncated && <span className="text-muted-foreground"> · sampled rows</span>}</p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <div role="toolbar" aria-label="Table tools" className="flex rounded-sm border border-border bg-card [&>button]:rounded-none [&>button]:border-r [&>button]:border-border [&>button:last-child]:border-r-0">
            <Button variant="ghost" size="icon" title="Toggle compact rows" aria-label="Toggle compact rows" aria-pressed={compact} onClick={() => setCompact((v) => !v)}><Table2 /></Button>
            <Button variant="ghost" size="icon" title="Copy filtered data" aria-label="Copy filtered data" onClick={copy}><Copy /></Button>
            <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" title="Show or hide columns" aria-label="Show or hide columns" className="h-9 gap-2 px-3"><EyeOff /><ChevronDown className="size-3" /></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end"><DropdownMenuLabel>Visible columns</DropdownMenuLabel>{headers.map((h) => <DropdownMenuCheckboxItem key={h} checked={!hidden.includes(h)} disabled={columns.length === 1 && columns.includes(h)} onSelect={(e) => e.preventDefault()} onCheckedChange={(checked) => setHidden((v) => checked ? v.filter((c) => c !== h) : [...v, h])}>{h}</DropdownMenuCheckboxItem>)}</DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" title="Export filtered data" aria-label="Export filtered data" className="h-9 gap-2 px-3"><Download /><ChevronDown className="size-3" /></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end"><DropdownMenuLabel>Export filtered rows</DropdownMenuLabel><DropdownMenuItem onSelect={() => exportData("csv")}>Download CSV</DropdownMenuItem><DropdownMenuItem onSelect={() => exportData("json")}>Download JSON</DropdownMenuItem></DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon" title="Reset table" aria-label="Reset table" onClick={reset}><RotateCw className="text-primary" /></Button>
            <Button variant="ghost" size="icon" title="Print filtered data" aria-label="Print filtered data" onClick={print}><Printer /></Button>
          </div>
          <label className="flex w-full items-center gap-2 sm:w-auto">Search:<Input aria-label="Search data" value={query} onChange={(e) => { setQuery(e.target.value); setPage(0); }} className="h-8 w-full rounded-sm bg-card sm:w-44" /></label>
        </div>
      </div>
      {notice && <p role="status" className="mb-2 flex items-center gap-2 text-primary"><Check className="size-4" />{notice}</p>}
      <div className="max-h-[500px] overflow-auto border border-border">
        <table className="w-full min-w-[860px] border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-card">
            <tr>
              <th className="w-16 border-b border-r border-border px-3 py-2.5 text-left font-semibold">_id</th>
              {columns.map((h) => <th key={h} aria-sort={sort?.column === h ? sort.direction === "asc" ? "ascending" : "descending" : "none"} className="border-b border-r border-border text-left last:border-r-0">
                <Button variant="ghost" onClick={() => { setSort({ column: h, direction: sort?.column === h && sort.direction === "asc" ? "desc" : "asc" }); setPage(0); }} aria-label={`Sort by ${h}`} className="h-10 w-full justify-between gap-4 rounded-none px-3 font-semibold">
                  {h}{sort?.column === h ? sort.direction === "asc" ? <ArrowUp className="text-primary" /> : <ArrowDown className="text-primary" /> : <ArrowUpDown className="text-muted-foreground/50" />}
                </Button>
              </th>)}
            </tr>
            {showFilters && <tr>
              <th className="border-b border-r border-border p-2"><Button variant="outline" size="sm" aria-label="Clear column filters" title="Clear column filters" onClick={() => { setFilters({}); setPage(0); }} className="px-2"><Filter className="size-3" /><X className="size-3" /></Button></th>
              {columns.map((h) => <th key={h} className="border-b border-r border-border p-2 last:border-r-0"><Input aria-label={`Filter ${h}`} value={filters[h] ?? ""} onChange={(e) => { setFilters((v) => ({ ...v, [h]: e.target.value })); setPage(0); }} className="h-9 min-w-24 rounded-sm bg-card font-normal" /></th>)}
            </tr>}
          </thead>
          <tbody>{visible.map((r, i) => <tr key={p * size + i} className="even:bg-muted/70 hover:bg-accent/40">
            <td className={`border-b border-r border-border px-3 text-right tabular-nums text-muted-foreground ${compact ? "py-1.5" : "py-2.5"}`}>{rows.indexOf(r) + 1}</td>
            {columns.map((h) => <td key={h} className={`whitespace-nowrap border-b border-r border-border px-3 last:border-r-0 ${compact ? "py-1.5" : "py-2.5"} ${isNum(h) ? "tabular-nums" : ""}`}>{r[h] || <span className="text-muted-foreground">—</span>}</td>)}
          </tr>)}{!visible.length && <tr><td colSpan={columns.length + 1} className="py-12 text-center text-muted-foreground">No entries match your filters.</td></tr>}</tbody>
        </table>
      </div>
      <footer className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 text-xs leading-5"><p className="flex items-center gap-1.5 font-semibold text-primary"><span className="break-all">parcels-by-right-type.csv</span><Info className="size-3.5 shrink-0" /></p><p className="flex items-center gap-1.5"><span className="font-semibold">Sort</span><span className="text-muted-foreground">: {sort ? `${sort.column} ${sort.direction === "asc" ? "↑" : "↓"}` : "_id ↑"}</span></p></div>
        <nav aria-label="Data pagination" className="flex flex-wrap items-center">
          <Button variant="outline" size="icon" aria-label="Previous page" disabled={p === 0} onClick={() => setPage(p - 1)} className="rounded-none rounded-l-sm shadow-none"><ChevronLeft /></Button>
          {pageNumbers.map((n, i) => <span key={n} className="flex">{i > 0 && n - pageNumbers[i - 1]! > 1 && <span className="grid size-9 place-items-center border-y border-r border-border text-muted-foreground">…</span>}<Button aria-label={`Page ${n + 1}`} aria-current={p === n ? "page" : undefined} variant={p === n ? "default" : "outline"} onClick={() => setPage(n)} className="size-9 rounded-none border-l-0 px-0 shadow-none">{n + 1}</Button></span>)}
          <Button variant="outline" size="icon" aria-label="Next page" disabled={p >= pages - 1} onClick={() => setPage(p + 1)} className="rounded-none rounded-r-sm border-l-0 shadow-none"><ChevronRight /></Button>
        </nav>
      </footer>
      </div>
    </section>
  );
}
