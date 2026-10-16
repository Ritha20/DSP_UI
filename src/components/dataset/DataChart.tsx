import { useMemo, useState } from "react";
import { BarChart3, Check, Code2, Copy, Download } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { aggregate, classifyColumns, fmt, humanize, type ColumnSchema, type Row } from "@/lib/dataset";

export function DataChart({ headers, rows, schema }: { headers: string[]; rows: Row[]; schema: ColumnSchema[] }) {
  const cols = useMemo(() => classifyColumns(headers, rows, schema), [headers, rows, schema]);
  const groups = cols.filter((c) => c.kind === "category" || c.kind === "date");
  const nums = cols.filter((c) => c.kind === "numeric");
  const group = [...groups].sort((a, b) => a.unique - b.unique)[0]?.name ?? "";
  const value = nums[0]?.name ?? "";

  if (!groups.length) {
    return (
      <section className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
        <BarChart3 className="mx-auto size-8 text-muted-foreground" />
        <h3 className="mt-3 font-semibold">No chartable columns</h3>
        <p className="mt-1 text-sm text-muted-foreground">This dataset has no category or date columns suitable for a meaningful chart.</p>
      </section>
    );
  }

  const { data } = aggregate(rows, group, value || null, "sum", 15);
  const metric = value ? `Total ${humanize(value)}` : "Row count";
  const tip = { formatter: (v: number) => [fmt(v), metric], contentStyle: { borderRadius: 8, border: "1px solid var(--border)", fontSize: 13 } };
  const axis = { fontSize: 12, fill: "var(--muted-foreground)" };

  const embedCode = `<iframe
  width="600"
  height="600"
  src="https://data.gov.rw/datasets/${schema[0]?.name ?? "chart"}/embed"
  frameborder="0"
></iframe>`;

  const [showEmbed, setShowEmbed] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyEmbed = async () => {
    await navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h3 className="text-sm font-medium">Parcels by Right Type — Chart</h3>
        <div className="flex items-center gap-2">
          <div className="group relative">
            <button
              onClick={() => setShowEmbed((v) => !v)}
              className={`grid place-items-center rounded-lg border p-2 transition ${
                showEmbed ? "border-primary bg-accent text-primary" : "border-border hover:bg-muted"
              }`}
            >
              <Code2 className="size-4" />
            </button>
            <div className="pointer-events-none absolute right-0 top-full z-10 mt-2 w-52 rounded-lg border border-border bg-card p-3 opacity-0 shadow-md transition-opacity group-hover:opacity-100">
              <p className="text-xs font-semibold">Embed chart</p>
              <p className="mt-1 text-xs text-muted-foreground">Copy and paste the HTML code into your webpage to embed this chart.</p>
            </div>
          </div>
          <div className="group relative">
            <a
              href="#"
              download
              className="grid place-items-center rounded-lg border border-border p-2 hover:bg-muted"
            >
              <Download className="size-4" />
            </a>
            <div className="pointer-events-none absolute right-0 top-full z-10 mt-2 w-40 rounded-lg border border-border bg-card p-3 opacity-0 shadow-md transition-opacity group-hover:opacity-100">
              <p className="text-xs font-semibold">Download this chart</p>
              <p className="mt-1 text-xs text-muted-foreground">Save the chart as an image to your device.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Embed panel */}
      {showEmbed && (
        <div className="border-b border-border bg-muted/40 px-5 py-4">
          <p className="mb-3 text-sm text-muted-foreground">Copy and paste the HTML code into your webpage to embed this chart.</p>
          <div className="relative">
            <pre className="overflow-x-auto rounded-lg border border-border bg-code px-4 py-3 font-mono text-sm text-code-foreground">{embedCode}</pre>
            <button
              onClick={copyEmbed}
              className="absolute right-3 top-3 flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-sm hover:bg-muted"
            >
              {copied ? <Check className="size-4 text-primary" /> : <Copy className="size-4" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      )}

      <div className="p-5 h-[380px] w-full">
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 8, right: 16, bottom: 40, left: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" tick={axis} angle={-30} textAnchor="end" interval={0} label={{ value: humanize(group), position: "insideBottom", offset: -36, ...axis }} />
              <YAxis tick={axis} tickFormatter={fmt} label={{ value: metric, angle: -90, position: "insideLeft", offset: -4, ...axis }} />
              <Tooltip {...tip} cursor={{ fill: "var(--muted)" }} />
              <Bar dataKey="value" name={metric} fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
      </div>
    </div>
  );
}
