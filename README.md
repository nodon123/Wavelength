# Wavelength

An app that helps students who feel isolated or anxious in class by sorting them into color groups and running low-pressure conversations and activities. Built for a Purdue design and innovation course, Fall 2026.

## What's here

- `Wavelength.dc.html` – the clickable prototype exported from Claude Design (student and facilitator flows, four games: Frequency, Community Molecules, Two Truths Trade, Collective Biography).
- `support.js` – runtime the prototype loads (the Claude Design component layer).
- `vendor/` – React 18.3.1, served locally so the site doesn't depend on a CDN.
- `scripts/build.py` – builds the deployable site into `dist/`.
- `docs/design-prompt.md` – the prompt describing the 13 must-have features and real-class requirements for the next revision.
- `docs/playbooks/` – facilitator and classroom playbooks.
- `docs/screenshots/` – color-reveal screenshots.

## Running it locally

Open `Wavelength.dc.html` in a browser, or serve the folder locally:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000/Wavelength.dc.html
```

## Building the site

```sh
python3 scripts/build.py
```

This writes `dist/` (Python 3 only, no other dependencies):

| File | What it's for |
| --- | --- |
| `dist/index.html` | The prototype at the site root. Upload all of `dist/` to any static host. |
| `dist/wavelength-standalone.html` | One self-contained file with the runtime and React inlined. Opens by double-clicking, works offline, and is the file to hand to another tool or AI agent. |

Only Google Fonts still load from the internet; without them the page falls back to system fonts.

## Putting it live

**GitHub Pages (set up already).** `.github/workflows/pages.yml` builds and deploys on every push to `main`. Turn it on once under Settings → Pages → Source: **GitHub Actions**. The site then lives at `https://nodon123.github.io/Wavelength/`, and the export at `https://nodon123.github.io/Wavelength/wavelength-standalone.html`. Each workflow run also attaches `wavelength-standalone.html` as a downloadable artifact.

**Netlify, Vercel, Cloudflare Pages.** Build command `python3 scripts/build.py`, output directory `dist`. Or drag the `dist/` folder onto Netlify Drop.

## Handing it to another agent

Give them `dist/wavelength-standalone.html` (or the whole repo). Everything the prototype does lives in that one file: the template inside `<x-dc>` and the logic in the `<script type="text/x-dc">` block. To edit the source rather than the export, change `Wavelength.dc.html` and re-run the build.
