# vega_lite

This folder contains a standalone CSV Chart Studio built with Vega-Lite 5.

It lives alongside the main DSP_UI app but runs completely independently — no build step, no npm install.

---

## Files

### `chart-studio.html`
An all-in-one chart builder. Upload a CSV, pick a chart type, tweak it, and copy the Vega-Lite spec.
All dependencies (Vega-Lite, PapaParse, fonts) are loaded from CDN — just needs an internet connection.

### DSP_UI (main app — one level up)
The main React dashboard. Requires Node.js/Bun and a proper dev server.

---

## How to run each

### chart-studio.html — open directly in the browser
**Option A:** Double-click the file in Finder — it opens straight in your browser.

**Option B:** Serve it locally (recommended if you run into file-upload issues):
```sh
cd vega_lite
python3 -m http.server 8000
```
Then visit: `http://localhost:8000/chart-studio.html`

---

### DSP_UI main app — run with npm or Bun
```sh
cd ..          # go back to the DSP_UI root
npm install
npm run dev
```
Or with Bun:
```sh
bun install
bun run dev
```
Then visit the local URL printed in the terminal (usually `http://localhost:5173`).
