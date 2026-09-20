#!/usr/bin/env python3
"""Run both halves of the twenty-lesson course from any working directory."""

import argparse
from pathlib import Path
import subprocess
import sys


def main():
    if not __debug__:
        raise SystemExit("Run without Python -O: assertions are verification gates.")
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--mutations", action="store_true",
                        help="also reject broken implementations in isolated copies")
    options = parser.parse_args()
    package = Path(__file__).resolve().parent
    for suite in ("verify.py", "verify-fields.py"):
        args = [sys.executable, "-u", str(package / suite)]
        if options.mutations:
            args.append("--mutations")
        subprocess.run(args, cwd=package, check=True)
    print("PASS: complete twenty-lesson course")


if __name__ == "__main__":
    main()
