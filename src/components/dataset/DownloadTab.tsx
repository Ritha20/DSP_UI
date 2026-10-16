import { useEffect, useState } from "react";
import { AlertCircle, Download, FileSpreadsheet, Loader2 } from "lucide-react";
import { DATASET, formatBytes, parseCsv, type Dataset, type Row } from "@/lib/dataset";
import { ApiAccess } from "./ApiAccess";
import { DataPreview } from "./DataPreview";
import { DataChart } from "./DataChart";

const MAX_PREVIEW_BYTES = 5 * 1024 * 1024; // only sample the first 5 MB of large files

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; headers: string[]; rows: Row[]; truncated: boolean; size: number };

export function DownloadTab({ dataset = DATASET }: { dataset?: Dataset }) {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(dataset.csvUrl);
        if (!res.ok) throw new Error(`Could not load the dataset (HTTP ${res.status}).`);
        const size = Number(res.headers.get("content-length")) || 0;
        let text = await res.text();
        let cut = false;
        if (text.length > MAX_PREVIEW_BYTES) { text = text.slice(0, text.lastIndexOf("\n", MAX_PREVIEW_BYTES)); cut = true; }
        const parsed = parseCsv(text, 1000);
        if (alive) setState({ status: "ready", ...parsed, truncated: parsed.truncated || cut, size: size || new Blob([text]).size });
      } catch (e) {
        if (alive) setState({ status: "error", message: e instanceof Error ? e.message : "Failed to load data." });
      }
    })();
    return () => { alive = false; };
  }, [dataset.csvUrl]);

  const downloadJson = () => {
    if (state.status !== "ready") return;
    const blob = new Blob([JSON.stringify(state.rows, null, 2)], { type: "application/json" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `${slug(dataset.title)}.json` });
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const [view, setView] = useState<"preview" | "chart">("preview");

  return (
    <div className="space-y-6">
      {/* Single card with Preview / Chart tabs */}
      <section>
        <div role="tablist" className="flex gap-1 rounded-lg bg-accent p-1 w-fit">
          {(["preview", "chart"] as const).map((v) => (
            <button key={v} role="tab" aria-selected={view === v} onClick={() => setView(v)}
              className={`whitespace-nowrap rounded-md px-3 py-1 text-xs font-medium transition ${
                view === v ? "bg-card text-foreground shadow-sm" : "text-accent-foreground hover:text-foreground"
              }`}>
              {v === "chart" ? "Chart" : "Preview"}
            </button>
          ))}
        </div>
        <div className="p-4 sm:p-6">
          {state.status === "loading" && (
            <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
              <Loader2 className="size-5 animate-spin" /> Loading data…
            </div>
          )}
          {state.status === "error" && (
            <div className="flex items-start gap-3 rounded-xl border border-destructive/30 p-5 text-sm">
              <AlertCircle className="size-5 shrink-0 text-destructive" />
              <div><p className="font-medium">Preview unavailable</p><p className="text-muted-foreground">{state.message}</p></div>
            </div>
          )}
          {state.status === "ready" && view === "chart" && state.rows.length > 0 && (
            <DataChart headers={state.headers} rows={state.rows} schema={dataset.columns} />
          )}
          {state.status === "ready" && view === "preview" && (state.rows.length ? (
            <DataPreview headers={state.headers} rows={state.rows} schema={dataset.columns} truncated={state.truncated} />
          ) : (
            <div className="py-10 text-center text-muted-foreground">This dataset has no rows yet.</div>
          ))}
        </div>
      </section>

      {/* Download card — original, unchanged */}
      <DownloadCard dataset={dataset} state={state} onJson={downloadJson} />

      {/* API access */}
      <div className="flex flex-col gap-2 rounded-xl border border-primary/25 bg-accent/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="text-sm font-semibold">An API key is required</p><p className="text-xs text-muted-foreground">Requests to this endpoint need a free API key.</p></div>
        <a href="#" className="inline-flex h-8 items-center justify-center rounded-md bg-primary px-4 text-xs font-medium text-primary-foreground hover:bg-primary/90">Get an API key</a>
      </div>
      <ApiAccess dataset={dataset} />
    </div>
  );
}

function DownloadCard({ dataset, state, onJson }: { dataset: Dataset; state: State; onJson: () => void }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-base font-semibold">Download Dataset</h3>
          <p className="text-sm text-muted-foreground">{dataset.title}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-1">
        <a href={dataset.csvUrl} download={`${slug(dataset.title)}.csv`} className="group flex items-center gap-4 rounded-xl border border-border p-4 transition hover:border-primary hover:shadow-sm">
          <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground"><FileSpreadsheet className="size-5" /></span>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold">Download CSV</span>
            <span className="block text-sm text-muted-foreground">All rows · {state.status === "ready" ? formatBytes(state.size) : "…"}</span>
          </span>
          <Download className="size-5 text-muted-foreground group-hover:text-primary" />
        </a>
      </div>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="flex gap-1.5"><dt className="text-muted-foreground">{label}:</dt><dd className="font-semibold">{value}</dd></div>;
}
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");
