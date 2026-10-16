# DSP UI

This folder contains two separate things that run differently from each other.

---

## 1. Main React App (`src/`)

A React dashboard built with TanStack Router, Tailwind CSS, Recharts, and shadcn/ui components. It includes dataset views, charts, data previews, download tabs, and API access panels.

Requires Node.js to run.

```sh
npm install
npm run dev
```

Then open the local URL printed in the terminal (usually `http://localhost:5173`).

Other useful commands:

```sh
npm run build      # production build
npm run test       # run tests
npm run lint       # lint the code
```

---

## 2. CSV Chart Studio (`vega_lite/chart-studio.html`)

A standalone, self-contained HTML file — no install needed. Upload a CSV, get chart suggestions, tweak them, and copy the Vega-Lite spec.

It loads all its dependencies (Vega-Lite 5, PapaParse, fonts) from CDN, so it just needs an internet connection.

**To run it, open it directly in your browser — just double-click the file in Finder.**

Or serve it locally if you run into file-upload issues:

```sh
cd vega_lite
python3 -m http.server 8000
```

Then open `http://localhost:8000/chart-studio.html`.

> This file has nothing to do with the visualation it is just a help of an overview how the vega lite is built.