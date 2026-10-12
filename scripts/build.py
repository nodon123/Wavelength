#!/usr/bin/env python3
"""Build the deployable site into dist/.

dist/index.html             - the prototype, served at the site root
dist/Wavelength.dc.html     - same page under its original name
dist/support.js, dist/vendor/ - runtime and React the two pages above load
dist/wavelength-standalone.html - one self-contained file (runtime and React
                               inlined) for handing to another tool or agent

React is served from vendor/ instead of unpkg, so the site has no CDN
dependency apart from Google Fonts (which fall back to system fonts).
"""
import pathlib
import shutil

ROOT = pathlib.Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"
SCRIPT_TAG = '<script src="./support.js"></script>'
# support.js skips its CDN load when window.React and window.ReactDOM exist,
# so these must come before it.
VENDOR = ["react.production.min.js", "react-dom.production.min.js"]


def inline(js):
    if "</script" in js.lower():
        raise SystemExit("script contains </script; cannot inline safely")
    # support.js re-fetches the page and scans its text for the first <x-dc>
    # and last </x-dc>. Its own "<x-dc" literals would match once inlined, so
    # spell the hyphen as \x2d (it only appears inside strings and regexes).
    js = js.replace("<x-dc", "<x\\x2ddc").replace("</x-dc", "</x\\x2ddc")
    return f"<script>\n{js}\n</script>"


def main():
    page = (ROOT / "Wavelength.dc.html").read_text(encoding="utf-8")
    if SCRIPT_TAG not in page:
        raise SystemExit(f"expected {SCRIPT_TAG!r} in Wavelength.dc.html")

    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir()

    shutil.copy(ROOT / "support.js", DIST / "support.js")
    shutil.copytree(ROOT / "vendor", DIST / "vendor")
    hosted = page.replace(
        SCRIPT_TAG,
        "".join(f'<script src="./vendor/{v}"></script>\n' for v in VENDOR) + SCRIPT_TAG,
        1,
    )
    (DIST / "Wavelength.dc.html").write_text(hosted, encoding="utf-8")
    (DIST / "index.html").write_text(hosted, encoding="utf-8")
    (DIST / ".nojekyll").write_text("", encoding="utf-8")

    scripts = [(ROOT / "vendor" / v).read_text(encoding="utf-8") for v in VENDOR]
    scripts.append((ROOT / "support.js").read_text(encoding="utf-8"))
    standalone = page.replace(SCRIPT_TAG, "\n".join(inline(js) for js in scripts), 1)
    (DIST / "wavelength-standalone.html").write_text(standalone, encoding="utf-8")

    for f in sorted(p for p in DIST.rglob("*") if p.is_file()):
        print(f"{f.relative_to(ROOT)}  {f.stat().st_size:,} bytes")


if __name__ == "__main__":
    main()
