#!/usr/bin/env python3
"""Record deterministic, offscreen screenshots from the native Bend renderer.

Only PNG encoding and provenance are Python. Every pixel comes from the same
render.pixel function used by the interactive Image tree. No Pillow, ffmpeg,
screen-recording permission, substitute visual model or external service.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import platform
import struct
import subprocess
import zlib

ROOT = Path(__file__).resolve().parent
MODES = ("medium", "voids", "time", "boundary")


def chunk(kind: bytes, payload: bytes) -> bytes:
    return (
        struct.pack(">I", len(payload))
        + kind
        + payload
        + struct.pack(">I", zlib.crc32(kind + payload) & 0xFFFFFFFF)
    )


def png_from_ppm(ppm: bytes) -> tuple[bytes, bytes]:
    parts = ppm.split()
    if parts[:4] != [b"P3", b"1024", b"768", b"255"]:
        raise ValueError("Capture did not produce the exact expected P3 header")
    pixels = bytes(map(int, parts[4:]))
    if len(pixels) != 1024 * 768 * 3:
        raise ValueError(f"Wrong pixel count: {len(pixels)}")
    scanlines = b"".join(
        b"\0" + pixels[y * 3072 : (y + 1) * 3072] for y in range(768)
    )
    png = (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", struct.pack(">IIBBBBB", 1024, 768, 8, 2, 0, 0, 0))
        + chunk(b"IDAT", zlib.compress(scanlines, 9))
        + chunk(b"IEND", b"")
    )
    return png, pixels


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--bend", default="bend")
    parser.add_argument("--output", type=Path, default=ROOT / "screenshots")
    parser.add_argument("--executable", type=Path, default=ROOT / ".build/capture")
    args = parser.parse_args()
    env = dict(os.environ, BEND_NO_TELEMETRY="1")
    executable = args.executable.resolve()
    args.output.mkdir(parents=True, exist_ok=True)
    records = []
    frame_hashes = set()
    for mode in MODES:
        run = subprocess.run(
            [str(executable), mode],
            cwd=ROOT,
            env=env,
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=120,
        )
        png, pixels = png_from_ppm(run.stdout)
        name = f"{mode}.png"
        (args.output / name).write_bytes(png)
        digest = hashlib.sha256(pixels).hexdigest()
        frame_hashes.add(digest)
        records.append(
            {
                "file": name,
                "fixture_argument": mode,
                "rgb_sha256": digest,
                "png_sha256": hashlib.sha256(png).hexdigest(),
                "width": 1024,
                "height": 768,
            }
        )
        print(f"Recorded {name}: {digest}")
    if len(frame_hashes) != len(MODES):
        raise RuntimeError("Capture modes unexpectedly produced identical frames")
    sources = {
        p.name: hashlib.sha256(p.read_bytes()).hexdigest()
        for p in sorted(ROOT.glob("*.bend"))
    }
    version = subprocess.run(
        [args.bend, "version"], check=True, capture_output=True, text=True, env=env
    ).stdout.strip()
    revision = subprocess.run(
        ["git", "rev-parse", "HEAD"], cwd=ROOT, check=True, capture_output=True, text=True
    ).stdout.strip()
    manifest = {
        "method": "Native CPU evaluation of the canonical GUI pixel function",
        "not_os_window_capture": True,
        "state_provenance": "fixtures.bend replays the same session advance and failure path as the app",
        "seed": 42,
        "source_commit_at_capture": revision,
        "source_sha256": sources,
        "bend_version": version,
        "platform": platform.platform(),
        "frames": records,
        "claim_boundary": "Driven pressure-ledger pockets, not a cavitation or matter solver",
    }
    (args.output / "manifest.json").write_text(
        json.dumps(manifest, indent=2, sort_keys=True) + "\n"
    )


if __name__ == "__main__":
    main()
