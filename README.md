# Wavelength

An app that helps students who feel isolated or anxious in class by sorting them into color groups and running low-pressure conversations and activities. Built for a Purdue design and innovation course, Fall 2026.

## What's here

- `Wavelength.dc.html` – the clickable prototype exported from Claude Design (student and facilitator flows, four games: Frequency, Community Molecules, Two Truths Trade, Collective Biography).
- `support.js` – runtime the prototype loads (React and the Claude Design component layer).
- `docs/design-prompt.md` – the prompt describing the 13 must-have features and real-class requirements for the next revision.
- `docs/playbooks/` – facilitator and classroom playbooks.
- `docs/screenshots/` – color-reveal screenshots.

## Running it

Open `Wavelength.dc.html` in a browser, or serve the folder locally:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000/Wavelength.dc.html
```

It needs internet access for Google Fonts and the React CDN.
