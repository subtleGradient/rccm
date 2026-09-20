#!/usr/bin/env python3
"""Native course regression/oracle checks; optional isolated implementation mutations.

Run from any directory: python3 path/to/verify.py [--mutations]
Uses only Python's standard library and the installed Bend 2 executable.
Temporary builds/copies stay in ignored bend/build; production files never change.
"""

import argparse
import os
from fractions import Fraction as Q
from pathlib import Path
import re
import shutil
import subprocess
import tempfile


PACKAGE = Path(__file__).resolve().parent
BEND = os.environ.get("BEND", "bend")
ENV = dict(os.environ, BEND_NO_TELEMETRY="1")
DEMOS = (
    "01-slots", "02-pairs", "03-capacity", "04-assembly", "05-probes",
    "06-coordinates", "07-stress", "08-differences", "09-flux", "10-evolution",
)
FAILURES = {
    "01-noop-row": "wrong_row",
    "02-copy-rejected": "copied_is_opposite",
    "03-zero-reciprocal": "exhausted_has_inverse",
    "04-wrong-twist": "wrong_twist",
    "05-two-probes": "different_vectors_disappear",
    "06-one-index": "one_index_is_enough",
    "07-wrong-units": "wrong_scale",
    "08-no-spacing": "missing_distance",
    "09-row-column": "wrong_transport_index",
    "10-zero-time-resets": "zero_time_stops_motion",
}


def command(args, cwd=PACKAGE, expected=0):
    result = subprocess.run(
        [str(a) for a in args], cwd=cwd, env=ENV, text=True,
        stdout=subprocess.PIPE, stderr=subprocess.STDOUT, timeout=120,
    )
    if result.returncode != expected:
        raise AssertionError(f"{args}: exit {result.returncode}\n{result.stdout}")
    return result.stdout


def check_workflows():
    output = command([BEND, PACKAGE / "PROOF.bend"])
    assert "All terms check." in output, output
    for name in DEMOS:
        assert command([BEND, PACKAGE / "lessons" / f"{name}.bend"]).strip()
    command([BEND, PACKAGE / "lessons/01-noop.bend"])
    for name, location in FAILURES.items():
        output = command(
            [BEND, PACKAGE / "lessons/counterexamples" / f"{name}.bend"], expected=1,
        )
        assert f"Location: {location}" in output, output
        assert "- expected :" in output and "- observed :" in output, output
        if name == "07-wrong-units":
            assert "Pressure" in output and "Length" in output, output
    output = command([BEND, PACKAGE.parent / "tests.bend"])
    assert "PASS: 10 pressure sample cases" in output, output
    print("PASS: root proof, 10 native demos, weak-law example, 10 intended failures, pressure regressions")


def rational(value, redundant=0):
    """A Bend rational literal; optional equal signed parts exercise noncanonical data."""
    value = Q(value)
    p = max(value.numerator, 0) + redundant
    n = max(-value.numerator, 0) + redundant
    return f"R.Fraction{{{p}n, {n}n, {value.denominator - 1}n}}"


def positive(value):
    value = Q(value)
    assert value > 0
    return f"U.Positive{{{value.numerator - 1}n, {value.denominator - 1}n}}"


def duration(value):
    value = Q(value)
    assert value >= 0
    return f"E.Duration{{{value.numerator}n, {value.denominator - 1}n}}"


def measured(value, redundant=0):
    return f"U.Measure{{{rational(value, redundant)}}}"


def faces(values):
    return "F.Faces{" + ", ".join(measured(x, i) for i, x in enumerate(values)) + "}"


def state(p, q):
    return f"E.State{{{measured(p, 1)}, {measured(q, 2)}}}"


def oracle(directory):
    """Generate independent expectations, compile actual API calls, compare exact values."""
    expected = {}
    calls = []
    definitions = []
    axes = ("T.T{}", "T.X{}", "T.Y{}", "T.Z{}")

    def emit(expression, value):
        key = f"v{len(expected)}"
        expected[key] = Q(value)
        calls.append(f'    emit("{key}", {expression})')

    # An arbitrary nonsymmetric, non-recipe matrix catches hidden recipe assumptions.
    matrices = [
        [[Q((-1) ** (i + j) * (1 + 4 * i + j), 1 + j % 3)
          for j in range(4)] for i in range(4)],
        [[Q(-3, 4), Q(-1, 2), Q(1, 3), 0],
         [Q(1, 2), Q(4, 3), Q(-1, 3), 0],
         [Q(-1, 3), Q(1, 3), Q(4, 3), 0],
         [0, 0, 0, Q(4, 3)]],
    ]
    permutation = (0, 2, 3, 1)  # new -> old, independent of Bend's old_axis
    for number, matrix in enumerate(matrices):
        rows = ["M.Row{" + ", ".join(rational(x, number) for x in row) + "}" for row in matrix]
        definitions.append(f"def matrix{number}() -> M.Matrix:\n  M.Matrix{{{', '.join(rows)}}}")
        source = f"matrix{number}()"
        for i in range(4):
            for j in range(4):
                slot = f"T.Slot{{{axes[i]}, {axes[j]}}}"
                emit(f"M.at({slot}, C.cycle({source}))", matrix[permutation[i]][permutation[j]])
                emit(f"M.at({slot}, C.cycle(C.cycle(C.cycle({source}))))", matrix[i][j])
                baseline = -1 if i == j == 0 else int(i == j)
                for scale in (Q(2), Q(3, 2)):
                    emit(f"U.value(U.Pressure{{}}, S.component({positive(scale)}, {slot}, {source}))",
                         scale * (matrix[i][j] - baseline))
        for j, axis in enumerate(("F.X{}", "F.Y{}", "F.Z{}"), start=1):
            emit(f"U.value(U.Pressure{{}}, F.x_flux({positive(2)}, {axis}, {source}))",
                 2 * (matrix[1][j] - int(j == 1)))

    for left, right, width in (
        (0, 2, 1), (0, 2, 2), (2, 0, 1), (2, 2, Q(3, 2)),
        (Q(-1, 2), Q(2, 3), Q(3, 2)), (Q(1, 3), Q(1, 3), 2),
    ):
        emit(f"U.value(U.ForceDensity{{}}, D.gradient({positive(width)}, "
             f"{measured(left, 2)}, {measured(right, 3)}))", (Q(right) - Q(left)) / width)

    for values in ((0, -2, 0), (3, 1, 0), (Q(-3, 2), Q(1, 3), Q(1, 2)), (2, -3, 2)):
        for width in (Q(1), Q(2), Q(3, 2)):
            call = f"F.rates({positive(width)}, {faces(values)})"
            emit(f"rate_left({call})", (values[0] - values[1]) / width)
            emit(f"rate_right({call})", (values[1] - values[2]) / width)
            emit(f"U.value(U.ForceDensity{{}}, F.total({call}))", (values[0] - values[2]) / width)

    # Integer face values keep repeated unreduced denominators small.
    for p, q, values in (
        (Q(1), Q(3), (0, -2, 0)),
        (Q(-2), Q(1, 2), (3, 1, 0)),
        (Q(1, 3), Q(-1, 3), (0, 2, 0)),
    ):
        for width in (Q(1), Q(2)):
            for dt in (Q(0), Q(1, 2)):
                for fuel in (0, 1, 3):
                    call = f"E.run({fuel}n, {duration(dt)}, {positive(width)}, {faces(values)}, {state(p, q)})"
                    left = p + fuel * dt * (values[0] - values[1]) / width
                    right = q + fuel * dt * (values[1] - values[2]) / width
                    emit(f"state_left({call})", left)
                    emit(f"state_right({call})", right)
                    emit(f"U.value(U.MomentumDensity{{}}, E.total({call}))", left + right)

    source = """import Base
import ./package/rational.bend as R
import ./package/tensor.bend as T
import ./package/matrix.bend as M
import ./package/coordinates.bend as C
import ./package/units.bend as U
import ./package/stress.bend as S
import ./package/differences.bend as D
import ./package/flux.bend as F
import ./package/evolution.bend as E
import ./package/format.bend as Format

def emit(label: String, value: R.Q) -> IO(Unit):
  IO.print(label ++ "=" ++ Format.show(value))
def rate_left(rates: F.Rates) -> R.Q:
  match rates:
    case F.Rates{left, right}:
      U.value(U.ForceDensity{}, left)
def rate_right(rates: F.Rates) -> R.Q:
  match rates:
    case F.Rates{left, right}:
      U.value(U.ForceDensity{}, right)
def state_left(state: E.State) -> R.Q:
  match state:
    case E.State{left, right}:
      U.value(U.MomentumDensity{}, left)
def state_right(state: E.State) -> R.Q:
  match state:
    case E.State{left, right}:
      U.value(U.MomentumDensity{}, right)
"""
    path = directory / "oracle.bend"
    path.write_text(source + "\n" + "\n\n".join(definitions) +
                    "\n\ndef main() -> IO(Unit):\n  do IO<Unit>:\n" + "\n".join(calls) + "\n")
    binary = directory / "oracle"
    command([BEND, path, "-o", binary], cwd=directory)
    for threads in (1, 2):
        output = command([binary, "--threads", str(threads)], cwd=directory)
        actual = {}
        for line in output.splitlines():
            match = re.fullmatch(r"(v\d+)=(-?\d+(?:/\d+)?)", line)
            assert match, f"Unexpected oracle output: {line}"
            key, value = match.groups()
            assert key not in actual, f"Repeated oracle result: {key}"
            actual[key] = Q(value)
        assert actual.keys() == expected.keys(), "Missing or additional oracle readings"
        for key, value in expected.items():
            assert actual[key] == value, f"{key}: observed {actual[key]}, expected {value}"
    print(f"PASS: {len(expected)} independent exact API readings, native CPU threads 1 and 2")


# All mutants are ordinary well-typed implementations before the unchanged gate rejects them.
MUTATIONS = (
    ("coordinates.bend", "M.Row{tt, ty, tz, tx}", "M.Row{tt, tx, tz, ty}", "misplaced coordinate"),
    ("units.bend", "R.fraction(1n+d, n)", "R.fraction(1n+n, d)", "wrong reciprocal"),
    ("stress.bend", "R.sub(M.at(slot, matrix), M.at(slot, eta()))", "M.at(slot, matrix)", "missing baseline"),
    ("stress.bend", "U.positive_value(U.Pressure{}, scale)", "R.one()", "missing pressure scale"),
    ("differences.bend",
     "R.mul(U.inverse_value(U.Length{}, spacing),\n    R.sub(U.value(U.Pressure{}, right), U.value(U.Pressure{}, left)))",
     "R.sub(U.value(U.Pressure{}, right), U.value(U.Pressure{}, left))", "missing distance"),
    ("differences.bend",
     "R.sub(U.value(U.Pressure{}, right), U.value(U.Pressure{}, left))",
     "R.sub(U.value(U.Pressure{}, left), U.value(U.Pressure{}, right))", "reversed slope"),
    ("flux.bend", "T.Slot{T.X{}, axis(momentum)}", "T.Slot{axis(momentum), T.X{}}", "wrong transport index"),
    ("flux.bend", "gain(width, middle, right)", "gain(width, right, middle)", "interior sign"),
    ("evolution.bend",
     "R.add(U.value(U.MomentumDensity{}, momentum),\n    R.mul(coefficient, R.sub(U.value(U.Pressure{}, left), U.value(U.Pressure{}, right))))",
     "R.mul(coefficient, R.sub(U.value(U.Pressure{}, left), U.value(U.Pressure{}, right)))", "discarded momentum"),
    ("evolution.bend", "U.add(U.MomentumDensity{}, left, right)", "left", "false total"),
    ("evolution.bend", "R.fraction(n, d)", "R.one()", "ignored duration"),
    ("evolution.bend",
     "run(remaining, dt, width, faces, step(dt, width, faces, state))", "state", "ignored fuel"),
)


def mutations(package):
    for filename, before, after, label in MUTATIONS:
        path = package / filename
        original = path.read_text()
        assert original.count(before) == 1, f"Mutation drift: {label}"
        try:
            path.write_text(original.replace(before, after))
            command([BEND, path, "--check-only"], cwd=package)
            output = command([BEND, package / "PROOF.bend"], cwd=package, expected=1)
            assert "- expected :" in output and "- observed :" in output, output
        finally:
            path.write_text(original)
    gate = package / "PROOF.bend"
    original = gate.read_text()
    try:
        gate.write_text(original.replace("import ./evolution-proof.bend as EvolutionProof\n", ""))
        output = command([BEND, gate], cwd=package, expected=1)
        assert "TODO" in output and "not a valid proof" in output, output
    finally:
        gate.write_text(original)
    print(f"PASS: {len(MUTATIONS)} well-typed implementation mutations and missing-proof rejection")


def main():
    if not __debug__:
        raise SystemExit("Run without Python -O: assertions are part of this verification gate.")
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--mutations", action="store_true", help="also falsify isolated implementations")
    options = parser.parse_args()
    check_workflows()
    build = PACKAGE.parent / "build"
    build.mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="tensor-verify-", dir=build) as name:
        directory = Path(name)
        package = directory / "package"
        shutil.copytree(PACKAGE, package, ignore=shutil.ignore_patterns("__pycache__"))
        oracle(directory)
        if options.mutations:
            mutations(package)


if __name__ == "__main__":
    main()
