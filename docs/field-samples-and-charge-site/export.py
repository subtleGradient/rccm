#!/usr/bin/env python3
"""Export the reviewed guide into its separate Sites source checkout."""
import argparse
import json
from html.parser import HTMLParser
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
SOURCE = HERE.parent / "field-samples-and-charge.html"
DEFAULT_OUTPUT = ROOT / ".sites" / "field-samples-and-charge"
PUBLIC_URL = "https://field-samples-and-charge.subtlegradient.chatgpt.site"

PUBLIC_LINKS = {
    "../RCCM-GfX-2.tex": "https://github.com/subtleGradient/rccm/blob/main/RCCM-GfX-2.tex",
    "asymmetric-tensor-cheat-sheet.html": "https://asymmetric-tensor-guide.subtlegradient.chatgpt.site",
    "charge-rotation-audit.md": "https://github.com/subtleGradient/rccm/blob/main/docs/charge-rotation-audit.md",
}


class References(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.links = []
        self.assets = []
        self.figures = 0

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            if attrs["id"] in self.ids:
                raise ValueError("Duplicate document id")
            self.ids.add(attrs["id"])
        if tag == "a":
            self.links.append(attrs.get("href", ""))
        if "src" in attrs:
            self.assets.append(attrs["src"])
        if tag == "svg":
            self.figures += 1


def export(output):
    source = SOURCE.read_text()
    source = source.replace("</head>", (
        f'<link rel="canonical" href="{PUBLIC_URL}/">\n'
        '<meta property="og:type" content="website">\n'
        '<meta property="og:title" content="Field Samples &amp; Electric Charge">\n'
        '<meta property="og:description" content="An illustrated RCCM cheat sheet: local tensor readings, enclosing electric flux, and how many samples determine charge.">\n'
        f'<meta property="og:url" content="{PUBLIC_URL}/">\n</head>'
    ))
    for local, public in PUBLIC_LINKS.items():
        needle = f'href="{local}"'
        if needle not in source:
            raise ValueError(f"Expected source reference: {local}")
        source = source.replace(needle, f'href="{public}"')
    # This companion exists locally, but has not been published. Keep the
    # public package to the requested cheat sheet rather than exporting it.
    local_companion = ' · <a href="the-fluid-does-the-doing.md">The fluid does the doing</a>'
    if local_companion not in source:
        raise ValueError("Expected local companion reference")
    source = source.replace(local_companion, "")
    source = source.replace(
        "Self-contained · works offline · print to PDF",
        '<a href="/index.html" download="field-samples-and-charge.html">Download HTML</a> · print to PDF',
    )

    refs = References()
    refs.feed(source)
    assert refs.figures == 11, "Keep all eleven reviewed SVG figures"
    assert not refs.assets, "The guide is self-contained"
    assert "/Users/" not in source and "file://" not in source
    for link in refs.links:
        if link.startswith("#"):
            assert link[1:] in refs.ids, link
        else:
            assert link.startswith("https://") or link == "/index.html", link

    output = output.resolve()
    assert output == DEFAULT_OUTPUT.resolve(), "Use this guide's dedicated checkout"
    (output / "dist").mkdir(parents=True, exist_ok=True)
    (output / ".openai").mkdir(exist_ok=True)
    hosting = json.loads((HERE / ".openai" / "hosting.json").read_text())
    current = output / ".openai" / "hosting.json"
    if current.exists():
        existing = json.loads(current.read_text())
        if existing.get("project_id"):
            assert existing["project_id"] == hosting.get("project_id"), "Never rebind an existing site"
    current.write_text(json.dumps(hosting, indent=2) + "\n")
    (output / "dist" / "index.html").write_text(source)
    (output / "README.md").write_text(
        "# Field Samples & Electric Charge\n\n"
        "Static publication of the RCCM illustrated cheat sheet.\n"
        "The reviewed authoring source is docs/field-samples-and-charge.html in the RCCM repository.\n"
        "Re-export with docs/field-samples-and-charge-site/export.py.\n"
        "No build step or runtime dependency is required.\n"
    )
    published = sorted(str(p.relative_to(output / "dist")) for p in (output / "dist").rglob("*") if p.is_file())
    assert published == ["index.html"], published
    print(json.dumps({"output": str(output), "public_files": published, "illustrations": refs.figures}))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    export(parser.parse_args().output)
