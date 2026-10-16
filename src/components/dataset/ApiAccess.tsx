import { Fragment, useMemo, useState } from "react";
import { Check, ChevronDown, ChevronRight, Copy, Download } from "lucide-react";
import type { Dataset } from "@/lib/dataset";
import { Input } from "@/components/ui/input";

type Field = { name: string; type: string; description: string; children?: Field[] };

const PAGINATION_FIELDS: Field[] = [
  { name: "page", type: "NUMBER", description: "Current 1-based page number." },
  { name: "limit", type: "NUMBER", description: "Rows per page." },
  { name: "count", type: "NUMBER", description: "Number of rows returned in this page." },
  { name: "totalItems", type: "NUMBER", description: "Total number of rows across all pages. Null when the data provider could not count them." },
  { name: "totalPages", type: "NUMBER", description: "Total number of pages at this limit. Null when totalItems is unknown." },
];

export function ApiAccess({ dataset }: { dataset: Dataset }) {
  const [view, setView] = useState<"table" | "json">("table");
  const [page, setPage] = useState("1");
  const [limit, setLimit] = useState("100");
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [open, setOpen] = useState<Record<string, boolean>>({ data: false, pagination: false });

  const fields: Field[] = useMemo(
    () => [
      {
        name: "data",
        type: "OBJECT[]",
        description: "Rows for the current page, publicly available columns only.",
        children: dataset.columns.map((c) => ({ name: c.name, type: c.type, description: `<p>${c.description}</p>` })),
      },
      { name: "pagination", type: "OBJECT", description: "Paging metadata for the result set.", children: PAGINATION_FIELDS },
    ],
    [dataset.columns],
  );

  const curl = `curl -f -H "X-API-Key: <YOUR_API_KEY>" "https://api.data.gov.rw/api/v1/datasets/public/${dataset.id}/download?format=json&page=${page.trim() || "1"}&limit=${limit.trim() || "100"}"`;

  const jsonText = useMemo(
    () =>
      JSON.stringify(
        {
          data: [Object.fromEntries(dataset.columns.map((c) => [c.name, c.type]))],
          pagination: Object.fromEntries(PAGINATION_FIELDS.map((f) => [f.name, f.type])),
        },
        null,
        2,
      ),
    [dataset.columns],
  );

  const html = useMemo(
    () =>
      jsonText
        .replace(/&/g, "&" + "amp;")
        .replace(/</g, "&" + "lt;")
        .replace(/"([^"]+)":/g, '<span class="text-primary">"$1"</span>:')
        .replace(/: "([^"]*)"/g, ': <span class="text-success">"$1"</span>'),
    [jsonText],
  );

  const copy = async (text: string, done: () => void) => {
    try {
      await navigator.clipboard.writeText(text);
      done();
    } catch {
      /* clipboard unavailable */
    }
  };

  const typeBadge = (t: string) =>
    t.startsWith("OBJECT") ? (
      <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">{t}</span>
    ) : (
      <span className="font-mono text-xs text-muted-foreground">{t}</span>
    );

  const toggle = (name: string) => setOpen((o) => ({ ...o, [name]: !o[name] }));

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between px-5 py-3">
        <h3 className="font-semibold">Access via API</h3>
        <div className="flex items-center gap-2">
          <select
            aria-label="Request format"
            defaultValue="curl"
            className="h-9 rounded-md border border-border bg-card px-3 text-sm outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="curl">cURL</option>
          </select>
          <button
            onClick={() => copy(curl, () => setCopiedCurl(true))}
            aria-label="Copy request"
            className="grid size-9 place-items-center rounded-md border border-border hover:bg-muted"
          >
            {copiedCurl ? <Check className="size-4 text-primary" /> : <Copy className="size-4" />}
          </button>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-border bg-muted/40 px-5 py-3 text-sm">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Query</span>
        <label className="flex items-center gap-2">
          page
          <Input aria-label="Page number" value={page} onChange={(e) => setPage(e.target.value.replace(/[^\d]/g, ""))} className="h-9 w-24 rounded-sm bg-card" />
        </label>
        <label className="flex items-center gap-2">
          limit
          <Input aria-label="Rows per page" value={limit} onChange={(e) => setLimit(e.target.value.replace(/[^\d]/g, ""))} className="h-9 w-24 rounded-sm bg-card" />
        </label>
      </div>
      <pre className="overflow-x-auto bg-code px-5 py-4 font-mono text-sm text-code-foreground">{curl}</pre>

      <div className="border-t border-border">
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2">
            <Download className="size-4 text-muted-foreground" />
            <h4 className="font-semibold">Response Body</h4>
            <span className="grid size-6 place-items-center rounded-full bg-muted text-xs font-semibold">{fields.length}</span>
          </div>
          <div role="group" aria-label="Response view" className="flex rounded-md border border-border p-0.5">
            <button
              onClick={() => setView("table")}
              aria-pressed={view === "table"}
              className={`flex items-center gap-1.5 rounded px-3 py-1 text-sm font-medium ${view === "table" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Table
            </button>
            <button
              onClick={() => setView("json")}
              aria-pressed={view === "json"}
              className={`rounded px-3 py-1 text-sm font-medium ${view === "json" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {"{ }"} JSON
            </button>
          </div>
        </div>

        {view === "table" ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
                <tr>
                  {["Field", "Type", "Description"].map((h) => (
                    <th key={h} className="px-5 py-3 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fields.map((f) => (
                  <Fragment key={f.name}>
                    <tr className="border-t border-border">
                      <td className="px-5 py-4">
                        <button onClick={() => toggle(f.name)} aria-expanded={!!open[f.name]} className="flex items-center gap-2 text-left">
                          {open[f.name] ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}
                          <span className="rounded bg-muted px-2 py-0.5 font-mono text-sm">{f.name}</span>
                        </button>
                      </td>
                      <td className="px-5 py-4">{typeBadge(f.type)}</td>
                      <td className="px-5 py-4 text-muted-foreground">{f.description}</td>
                    </tr>
                    {open[f.name] &&
                      f.children?.map((c) => (
                        <tr key={c.name} className="border-t border-border">
                          <td className="py-4 pl-14 pr-5">
                            <span className="rounded bg-muted px-2 py-0.5 font-mono text-sm">{c.name}</span>
                          </td>
                          <td className="px-5 py-4">{typeBadge(c.type)}</td>
                          <td className="px-5 py-4 text-muted-foreground">{c.description}</td>
                        </tr>
                      ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="relative border-t border-border">
            <button
              onClick={() => copy(jsonText, () => setCopiedJson(true))}
              className="absolute right-5 top-3 flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-sm hover:bg-muted"
            >
              {copiedJson ? <Check className="size-4 text-primary" /> : <Copy className="size-4" />}
              {copiedJson ? "Copied" : "Copy"}
            </button>
            <pre
              className="overflow-x-auto px-5 py-4 font-mono text-sm leading-6"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        )}
      </div>
    </section>
  );
}
