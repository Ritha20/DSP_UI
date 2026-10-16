import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Calendar, Download, FileText, Layers, ListChecks, Mail, MessageCircle, Moon, Quote, Share2, User, Building2, Languages } from "lucide-react";
import { DATASET } from "@/lib/dataset";
import { DownloadTab } from "@/components/dataset/DownloadTab";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Parcels by Right Type — Data Sharing Platform" },
      { name: "description", content: "Land parcels by tenure type across Rwanda: preview, visualize and download the dataset." },
      { property: "og:title", content: "Parcels by Right Type — Data Sharing Platform" },
      { property: "og:description", content: "Preview, chart and download land parcel statistics by right type." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DatasetPage,
});

const TABS = ["Overview", "Metadata", "Explore data"] as const;
const NAV = ["Home", "Datasets", "Institutions", "Research Topics", "Resources", "About"];

function DatasetPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Explore data");
  const d = DATASET;
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full border-2 border-primary/40 bg-accent text-xs font-bold text-primary">RW</span>
            <span className="truncate text-lg font-bold">Data Sharing Platform</span>
          </div>
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((n) => (
              <a key={n} href="#" className={`rounded-md px-4 py-2 text-[15px] font-medium ${n === "Datasets" ? "bg-accent text-accent-foreground" : "text-secondary-foreground hover:bg-muted"}`}>{n}</a>
            ))}
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            <button aria-label="Language" className="hidden size-10 place-items-center rounded-full border border-border sm:grid"><Languages className="size-4" /></button>
            <button aria-label="Theme" className="hidden size-10 place-items-center rounded-full border border-border sm:grid"><Moon className="size-4" /></button>
            <a href="#" className="rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">Dashboard</a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
        <a href="#" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Back</a>

        <section className="rounded-2xl border border-border bg-card p-6 sm:p-10">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold">{d.title}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-success px-3 py-1 text-sm font-semibold text-success-foreground">PUBLIC</span>
                {d.formats.map((f) => <span key={f} className="inline-flex items-center gap-1 rounded bg-muted px-2 py-1 text-xs font-semibold text-secondary-foreground"><FileText className="size-3" />{f}</span>)}
              </div>
            </div>
            <button className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-border px-4 py-2.5"><Share2 className="size-4" />Share</button>
          </div>
          <div className="mt-6 space-y-3 text-secondary-foreground">
            <p>Number of land parcels by type of land right (tenure), by province, district, sector, and cell.</p>
            <p>Published from the Rwanda Land Dashboard (National Land Authority). These are summary statistics - not individual parcel title records.</p>
            <p><b>Data contact:</b> {d.owner.name} ({d.owner.email})</p>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {["land", "nla", "dashboard", "shareable", "public-columns-v2", "admin-levels-v1"].map((t) => (
              <span key={t} className="rounded-full border border-primary/30 bg-accent px-4 py-1 text-sm text-accent-foreground">{t}</span>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-x-10 gap-y-2 border-t border-border pt-6 text-muted-foreground">
            <span className="flex items-center gap-2"><Layers className="size-4" />Columns: <b className="text-foreground">{d.columns.length}</b></span>
            <span className="flex items-center gap-2"><Download className="size-4" />Downloads: <b className="text-foreground">{d.downloads}</b></span>
            <span className="flex items-center gap-2"><Calendar className="size-4" />Last Updated On: <b className="text-foreground">{d.updatedAt}</b></span>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card">
          <div role="tablist" className="flex overflow-x-auto border-b border-border px-2">
            {TABS.map((t) => (
              <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
                className={`-mb-px whitespace-nowrap border-b-2 px-6 py-5 font-medium ${tab === t ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{t}</button>
            ))}
          </div>
          <div className="p-4 sm:p-8">
            {tab === "Overview" && <Overview />}
            {tab === "Metadata" && <Metadata />}
            {tab === "Explore data" && <DownloadTab dataset={d} />}
          </div>
        </section>
      </main>

      <footer className="mt-16 bg-footer text-footer-foreground">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          <div><p className="text-lg font-bold">Data Sharing Platform</p><p className="mt-3 opacity-90">Enabling secure and efficient data sharing between institutions for research and public benefit.</p></div>
          {[["Quick Links", ["Datasets", "Institutions", "Research Topics", "About"]], ["Resources", ["Documentation", "API Access", "User Guide"]], ["Contact", ["Data Sharing Platform", "info@risa.gov.rw"]]].map(([h, ls]) => (
            <div key={h as string}><p className="text-lg font-bold">{h}</p><ul className="mt-3 space-y-2 opacity-90">{(ls as string[]).map((l) => <li key={l}>{l}</li>)}</ul></div>
          ))}
        </div>
        <p className="border-t border-footer-foreground/15 py-6 text-center opacity-90">© 2026 Data Sharing Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}

function Card({ icon: Icon, title, sub, children }: { icon: typeof Quote; title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border p-6">
      <div className="flex gap-4"><span className="grid size-12 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground"><Icon className="size-5" /></span>
        <div><h3 className="text-xl font-semibold">{title}</h3><p className="text-muted-foreground">{sub}</p></div></div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Overview() {
  const d = DATASET;
  return (
    <div className="space-y-8">
      <Card icon={ListChecks} title="Usage Guidelines" sub="Please review and follow these guidelines when accessing and using this dataset:">
        <ul className="list-disc space-y-2 pl-6">
          <li>Cite the source appropriately in any publications or presentations</li>
          <li>Do not redistribute the data without permission</li>
          <li>Report any errors or inconsistencies to the data provider</li>
        </ul>
      </Card>
      <Card icon={Quote} title="Citation" sub="This dataset can be reused and cited in research publications.">
        <p className="rounded-lg border-l-4 border-primary bg-muted p-4 text-sm">{d.provider}. (2026). {d.title} [Dataset]. Data Sharing Platform. https://data.gov.rw/datasets/{d.id}</p>
      </Card>
      <Card icon={MessageCircle} title="Contact Information" sub="For questions about this dataset, please contact the data owner or provider:">
        <p className="text-xs font-semibold uppercase text-muted-foreground">Data owner</p>
        <p className="mt-1 flex items-center gap-2 font-medium"><User className="size-4 text-muted-foreground" />{d.owner.name}</p>
        <a href={`mailto:${d.owner.email}`} className="mt-1 flex items-center gap-2 text-primary"><Mail className="size-4" />{d.owner.email}</a>
        <p className="mt-4 text-xs font-semibold uppercase text-muted-foreground">Provider</p>
        <p className="mt-1 flex items-center gap-2 font-medium"><Building2 className="size-4 text-muted-foreground" />{d.provider}</p>
      </Card>
    </div>
  );
}

function Metadata() {
  return (
    <div>
      <h2 className="text-xl font-semibold">Dataset Metadata</h2>
      <h3 className="mt-6 mb-4 font-semibold">Column Schema ({DATASET.columns.length} columns)</h3>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
            <tr>{["Column name", "Data type", "Classification", "Masking strategy", "Description"].map((h) => <th key={h} className="px-5 py-3 font-semibold">{h}</th>)}</tr>
          </thead>
          <tbody>
            {DATASET.columns.map((c) => (
              <tr key={c.name} className="border-t border-border">
                <td className="px-5 py-4 font-mono">{c.name}</td>
                <td className="px-5 py-4">{c.type}</td>
                <td className="px-5 py-4"><span className="rounded bg-success px-2 py-0.5 text-xs font-semibold text-success-foreground">{c.classification}</span></td>
                <td className="px-5 py-4"><span className="rounded bg-muted px-2 py-0.5 text-xs font-semibold">{c.masking}</span></td>
                <td className="px-5 py-4 text-muted-foreground">{c.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
