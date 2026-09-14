"""Smoke checks for this cavity fixture; not a grid-convergence validation."""
import json
import math
from pathlib import Path
import re
import sys

case = Path(sys.argv[1])
mesh = (case / "log.checkMesh").read_text()
solver = (case / "log.icoFoam").read_text()
assert "Mesh OK." in mesh, "Mesh failed"
assert re.search(r"cells:\s+1600\b", mesh), "Expected 40 x 40 x 1 cells"
assert re.search(r"Time = 2\s", solver), "Did not reach 2 seconds"
assert solver.rstrip().endswith("End"), "Solver did not finish cleanly"
assert not re.search(r"\b(?:nan|inf)\b|FOAM FATAL", solver, re.I), "Non-finite solver output"
courant = [float(x) for x in re.findall(r"Courant Number mean: \S+ max: (\S+)", solver)]
# PISO logs an intermediate correction and then the final correction per step.
# Check the final corrected flux at each step, not the unfinished iterate.
steps = re.split(r"\nTime = [^\n]+\n", solver)[1:]
continuity = [float(re.findall(r"sum local = (\S+),", step)[-1]) for step in steps]
assert courant and max(courant) < 1, "Courant number outside demo envelope"
assert continuity and max(continuity) < 1e-5, "Large local continuity error"
times = sorted(float(p.name) for p in case.iterdir() if p.is_dir() and re.fullmatch(r"\d+(?:\.\d+)?", p.name))
assert len(times) == 81 and times[-1] == 2, "Missing saved frames"
for name, components in [("U", 3), ("p", 1), ("grad(U)", 9), ("vorticity", 3)]:
    contents = (case / "2" / name).read_text()
    values = re.search(r"internalField\s+nonuniform\s+List<\w+>\s+(\d+)\s*\((.*?)\)\s*;", contents, re.S)
    assert values and int(values[1]) == 1600, f"Missing {name} cells"
    numbers = [float(x) for x in re.findall(r"[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?", values[2])]
    assert len(numbers) == 1600 * components and all(map(math.isfinite, numbers)), f"Invalid {name}"
    if name == "U":
        assert max(abs(x) for x in numbers[2::3]) < 1e-12, "Unexpected out-of-plane flow"
        assert min(numbers[::3]) < -0.05 and max(numbers[::3]) > 0.5, "Expected return flow and lid entrainment"
print(json.dumps({"status": "PASS", "cells": 1600, "saved_times": len(times), "end_time_s": times[-1], "max_Courant": max(courant), "max_step_final_local_continuity_error": max(continuity), "final_local_continuity_error": continuity[-1]}, indent=2))
