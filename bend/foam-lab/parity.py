#!/usr/bin/env python3
"""Compare complete native Image trees in separate CPU/GPU-default processes."""

from array import array
from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parent
PIXELS = 1024 * 1024


def render(arguments: list[str]) -> tuple[bytes, array]:
    output = subprocess.run(
        [str(ROOT / ".build/backend-frame"), *arguments],
        check=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        timeout=60,
    ).stdout
    pattern = rb"Pix\{\s*(\d+)\s*\}"
    colors = array("I", (int(m[1]) for m in re.finditer(pattern, output)))
    if len(colors) != PIXELS:
        raise AssertionError(f"Unexpected Image pixel count: {len(colors)}")
    # Shape and order must agree as well as leaf count.
    shape = re.sub(pattern, b"Pix{}", output)
    return shape, colors


def compare(reference: tuple[bytes, array], other: tuple[bytes, array]) -> tuple[int, int]:
    if reference[0] != other[0]:
        raise AssertionError("Backend Image trees have different shapes")
    changed = 0
    maximum = 0
    for a, b in zip(reference[1], other[1]):
        if a != b:
            changed += 1
            maximum = max(
                maximum,
                *(abs(((a >> s) & 255) - ((b >> s) & 255)) for s in (0, 8, 16)),
            )
    return changed, maximum


def main() -> None:
    cpu = render(["--gpu", "off", "--threads", "1"])
    parallel = compare(cpu, render(["--gpu", "off", "--threads", "4"]))
    if parallel != (0, 0):
        raise AssertionError(f"Independent CPU pixels changed with thread count: {parallel}")
    changed, maximum = compare(cpu, render([]))
    if maximum > 2:
        raise AssertionError(f"GPU/default channel error exceeds 2/255: {maximum}")
    print(
        f"PASS: {PIXELS} pixels; CPU 1/4 threads identical; "
        f"default-backend differing_pixels={changed}, maximum_channel_error={maximum}/255"
    )
    print("The default ! path uses GPU when available, otherwise Bend's CPU fallback.")


if __name__ == "__main__":
    main()
