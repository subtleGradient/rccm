#!/usr/bin/env python3
"""Independent lessons 11–20 regression gate (stdlib + installed Bend 2).

Run from any cwd: python3 path/to/verify-fields.py [--mutations]
All generated sources, binaries and isolated mutations stay in ignored bend/build.
Fraction polynomial expectations use coefficient/exponent algebra, not Bend's AST
derivative implementation. This verifies encoded operations, not RCCM physics.
"""

import argparse
from fractions import Fraction as Q
import importlib.util
from pathlib import Path
import re
import shutil
import sys
import tempfile


PACKAGE = Path(__file__).resolve().parent
# Reuse process/literal helpers without creating __pycache__ in production.
sys.dont_write_bytecode = True
spec = importlib.util.spec_from_file_location("course_verify", PACKAGE / "verify.py")
helpers = importlib.util.module_from_spec(spec)
spec.loader.exec_module(helpers)
BEND, command = helpers.BEND, helpers.command
rational, measured, positive = helpers.rational, helpers.measured, helpers.positive
AXES = tuple(f"T.{axis}{{}}" for axis in "TXYZ")
ZERO = (0, 0, 0, 0)

DEMOS = {
    "11-ledger": ("alpha_g^2=2/3", "alpha_a^2=3/4", "q=1/2", "product=1/2"),
    "12-normalization": ("U_tx=-1/4", "U_xt=1/4", "U_xy=-3/8", "U_yx=3/8"),
    "13-fields": ("f=15", "dx=8", "dy=3", "dxx=2"),
    "14-clebsch": ("grad lambda cross grad beta=(1,-1,-1)",
                   "curl rotational=(1,-1,-1)",
                   "curl total with transverse=(0,2x,0)=(1,-1,1)"),
    "15-transport": ("material=8", "rho=1, v=(x,0,0): continuity residual=1",
                     "momentum lhs=4", "d(x*x^2)/dx=12", "x*d(x^2)/dx=8"),
    "16-indices": ("raised tt=2", "raised tx=-2", "raised xy=2"),
    "17-contraction": ("S.S=4", "A.A=10", "S.A=0", "U.U=14"),
    "18-compatibility": ("u=(x*y^2,0): 0",
                          "epsilon_xx=epsilon_yy=x^2+y^2, xy=0: 4"),
    "19-fourth-order": ("laplacian=12", "biharmonic=24", "source rc/L0=1: -12",
                        "source rc/L0=2: -84", "biharmonic x^2*y^2: 8"),
    "20-waves": ("Parallel profile readings in leaf order:", "0", "1", "0", "4",
                 "Parallel box_c=1 residuals:", "0", "0", "0", "0",
                 "Mismatch f=(x-2t)^2, c=1: -6"),
}
FAILURES = {
    "11-wrong-denominator": "local_uses_critical",
    "12-frequency-is-speed": "frequency_is_velocity",
    "13-one-product-term": "one_product_term",
    "14-total-curl": "total_is_internal",
    "15-pull-coefficient": "coefficient_is_constant",
    "16-euclidean-time": "time_space_unchanged",
    "17-positive-slip": "slip_is_positive_norm",
    "18-all-strain-fits": "every_strain_is_compatible",
    "19-forgot-square": "radius_is_linear",
    "20-any-speed": "any_speed_solves_wave",
}


def workflows():
    output = command([BEND, PACKAGE / "PROOF.bend"])
    assert "All terms check." in output, output
    for name, readings in DEMOS.items():
        output = command([BEND, PACKAGE / "lessons" / f"{name}.bend"])
        # Format.show deliberately preserves the implementation's unreduced data.
        output = re.sub(r"-?\d+/\d+", lambda m: str(Q(m.group())), output)
        for reading in readings:
            assert reading in output.splitlines(), (name, reading, output)
        if name == "20-waves":
            lines = output.splitlines()
            start = lines.index(readings[0])
            assert lines[start:start + len(readings)] == list(readings), output
    for name, location in FAILURES.items():
        output = command([BEND, PACKAGE / "lessons/counterexamples" / f"{name}.bend"],
                         expected=1)
        assert f"Location: {location}" in output, output
        assert "- expected :" in output and "- observed :" in output, output
        if name == "12-frequency-is-speed":
            assert "Frequency" in output and "Speed" in output, output
    print("PASS: root proof, 10 native demos with expected readings, 10 intended failures")


# Sparse coefficient maps supply an oracle independently of the expression tree.
def const(n):
    return {ZERO: Q(n)}


def coord(axis):
    return {tuple(int(i == axis) for i in range(4)): Q(1)}


def add(*polys):
    result = {}
    for poly in polys:
        for powers, coefficient in poly.items():
            result[powers] = result.get(powers, Q(0)) + coefficient
    return {p: c for p, c in result.items() if c}


def mul(a, b):
    result = {}
    for p, c in a.items():
        for q, d in b.items():
            powers = tuple(x + y for x, y in zip(p, q))
            result[powers] = result.get(powers, Q(0)) + c * d
    return {p: c for p, c in result.items() if c}


def derivative(poly, axis):
    return {tuple(n - int(i == axis) for i, n in enumerate(p)): c * p[axis]
            for p, c in poly.items() if p[axis]}


def evaluate(poly, point):
    total = Q(0)
    for powers, coefficient in poly.items():
        for value, power in zip(point, powers):
            coefficient *= Q(value) ** power
        total += coefficient
    return total


def expr(poly):
    terms = []
    for powers, coefficient in sorted(poly.items()):
        term = f"F.Const{{{rational(coefficient)}}}"
        for axis, power in enumerate(powers):
            for _ in range(power):
                term = f"F.Mul{{{term}, F.Coord{{{AXES[axis]}}}}}"
        terms.append(term)
    result = terms[0] if terms else "F.Const{R.zero()}"
    for term in terms[1:]:
        result = f"F.Add{{{result}, {term}}}"
    return result


def gradient(poly):
    return tuple(derivative(poly, i) for i in (1, 2, 3))


def cross(a, b):
    return tuple(add(mul(a[j], b[k]), mul(const(-1), mul(a[k], b[j])))
                 for j, k in ((1, 2), (2, 0), (0, 1)))


def curl(vector):
    return tuple(add(derivative(vector[k], j + 1),
                     mul(const(-1), derivative(vector[j], k + 1)))
                 for j, k in ((1, 2), (2, 0), (0, 1)))


def dot(a, b):
    return add(*(mul(x, y) for x, y in zip(a, b)))


def divergence(vector):
    return add(*(derivative(p, i) for i, p in enumerate(vector, 1)))


def vector_expr(vector):
    return "C.Vector{" + ", ".join(expr(p) for p in vector) + "}"


def laplacian(poly):
    return add(*(derivative(derivative(poly, i), i) for i in (1, 2, 3)))


def matrix_expr(rows, redundant=0):
    return "M.Matrix{" + ",".join(
        "M.Row{" + ",".join(rational(v, redundant) for v in row) + "}"
        for row in rows) + "}"


def contraction(a, b):
    # All sixteen independently weighted components, not the recipe invariant.
    return sum(((-1 if (i == 0) != (j == 0) else 1) * a[i][j] * b[i][j]
                for i in range(4) for j in range(4)), Q(0))


def advanced_oracle(emit, scalar, points):
    # Noncanonical signed parts are safe here: no high-order differentiation.
    for value in (Q(-2, 3), Q(1, 2), Q(0)):
        rows = [[value + i - j for j in range(4)] for i in range(4)]
        source = matrix_expr(rows, redundant=1)
        for i in range(4):
            for j in range(4):
                slot = f"T.Slot{{{AXES[i]},{AXES[j]}}}"
                sign = -1 if (i == 0) != (j == 0) else 1
                emit(f"I.raise({slot},{rational(value, 1)})", sign * value)
                emit(f"I.raise({slot},I.raise({slot},{rational(value, 1)}))", value)
                emit(f"I.upper({slot},{source})", sign * rows[i][j])

    # Dense arbitrary matrices and single-slot masks catch omitted terms even
    # when a dense sum could cancel. Integer entries keep unreduced sums small.
    for seed in (1, 2, 3):
        a = [[Q((7*i + 3*j + seed) % 7 - 3) for j in range(4)] for i in range(4)]
        b = [[Q((2*i + 5*j + seed) % 9 - 4) for j in range(4)] for i in range(4)]
        aa, bb = matrix_expr(a), matrix_expr(b)
        emit(f"J.contract({aa},{bb})", contraction(a, b))
        for i in range(4):
            for j in range(4):
                mask = [[Q(int((r, c) == (i, j))) for c in range(4)] for r in range(4)]
                emit(f"J.contract({matrix_expr(mask)},{bb})", contraction(mask, b))
        # Generate a general S/A split, not just the course's e_x/b_z recipe.
        s = [[(a[i][j] + a[j][i]) / 2 for j in range(4)] for i in range(4)]
        skew = [[(a[i][j] - a[j][i]) / 2 for j in range(4)] for i in range(4)]
        # Scale by two before evaluation to avoid 16-term unreduced denominators.
        s = [[2*v for v in row] for row in s]
        skew = [[2*v for v in row] for row in skew]
        full = [[s[i][j] + skew[i][j] for j in range(4)] for i in range(4)]
        ss, ats = matrix_expr(s), matrix_expr(skew)
        for left, right, ls, rs in ((s, s, ss, ss), (skew, skew, ats, ats),
                                    (s, skew, ss, ats), (skew, s, ats, ss)):
            emit(f"J.contract({ls},{rs})", contraction(left, right))
        emit(f"J.contract({matrix_expr(full)},{matrix_expr(full)})",
             contraction(s, s) + contraction(skew, skew))
        emit(f"J.cross_pair({rational(seed)},{rational(Q(-1, 2))})", 0)

    # Also exercise the actual recipe's generated S/A components, with all six
    # supplied signed contributions and several capacities, not just its demo.
    for seed in (0, 1, 2):
        ex, ey, ez, bx, by, bz = values = tuple((seed + 2*i) % 5 - 2 for i in range(6))
        sample = f"M.Sample{{K.Regular{{0n,{seed}n}}," + ",".join(
            rational(v) for v in values) + "}"
        q = Q(1, 1 + seed)
        s = [[Q(0) for _ in range(4)] for _ in range(4)]
        for i in range(4):
            s[i][i] = -q if i == 0 else 1/q
        a = ((0, -ex, -ey, -ez), (ex, 0, -bz, by),
             (ey, bz, 0, -bx), (ez, -by, bx, 0))
        ss, ats = f"M.symmetric({sample})", f"M.antisymmetric({sample})"
        for left, right, ls, rs in ((s, s, ss, ss), (a, a, ats, ats),
                                    (s, a, ss, ats), (a, s, ats, ss)):
            emit(f"J.contract({ls},{rs})", contraction(left, right))
        emit(f"J.contract(M.assemble({sample}),M.assemble({sample}))",
             contraction(s, s) + contraction(a, a))

    t, x, y, z = (coord(i) for i in range(4))
    xy = mul(x, y)
    for point in points:
        row = "M.Row{" + ",".join(rational(v) for v in point) + "}"
        for ux, uy in ((mul(x, mul(y, y)), mul(mul(x, x), y)),
                       (add(mul(x, y), mul(y, y)), mul(x, mul(x, y)))):
            xx, yy = derivative(ux, 1), derivative(uy, 2)
            shear = mul(const(Q(1, 2)), add(derivative(ux, 2), derivative(uy, 1)))
            inc = add(derivative(derivative(xx, 2), 2),
                      derivative(derivative(yy, 1), 1),
                      mul(const(-2), derivative(derivative(shear, 1), 2)))
            scalar(f"H.inc(H.from_displacement({expr(ux)},{expr(uy)}))", inc, point, row)
        # Independent strain fields, including a mixed shear whose contribution
        # is essential and a varying incompatibility rather than only constants.
        for xx, shear, yy in ((mul(y, y), xy, mul(x, x)),
                              (mul(x, mul(y, y)), mul(x, xy), mul(x, x)),
                              (const(0), xy, const(0))):
            inc = add(derivative(derivative(xx, 2), 2),
                      derivative(derivative(yy, 1), 1),
                      mul(const(-2), derivative(derivative(shear, 1), 2)))
            scalar(f"H.inc(H.Strain{{{expr(xx)},{expr(shear)},{expr(yy)}}})", inc, point, row)

        # Small monomials, integer points: never expand high-derivative ASTs at
        # fractional coordinates (unreduced exact arithmetic grows exponentially).
        for field in (const(3), mul(t, t), mul(mul(x, x), mul(y, y)),
                      mul(mul(z, z), mul(z, z)), mul(mul(x, x), y)):
            lap = laplacian(field)
            bi = laplacian(lap)
            fs = expr(field)
            scalar(f"O.laplacian({fs})", lap, point, row)
            scalar(f"O.biharmonic({fs})", bi, point, row)
            for radius in (0, 2, Q(1, 2)):
                scalar(f"O.poisson({fs},{rational(radius)})",
                       add(lap, mul(const(-radius**2), bi)), point, row)

        for speed, c in ((1, 1), (2, 1), (2, 2), (-2, 2), (1, 2)):
            field = mul(add(x, mul(const(-speed), t)), add(x, mul(const(-speed), t)))
            scalar(f"W.profile({rational(speed)})", field, point, row)
            residual = add(laplacian(field),
                           mul(const(-Q(1, c*c)), derivative(derivative(field, 0), 0)))
            scalar(f"W.box(W.profile({rational(speed)}),{positive(c)})", residual, point, row)
        a, b = mul(x, x), mul(t, t)
        for c in (1, 2):
            ra, rb = laplacian(a), mul(const(-Q(1, c*c)), derivative(derivative(b, 0), 0))
            scalar(f"W.box(F.Add{{{expr(a)},{expr(b)}}},{positive(c)})",
                   add(ra, rb), point, row)
            scalar(f"F.Add{{W.box({expr(a)},{positive(c)}),W.box({expr(b)},{positive(c)})}}",
                   add(ra, rb), point, row)


def oracle(directory):
    expected, calls = {}, []

    def emit(expression, value):
        key = f"v{len(expected)}"
        expected[key] = Q(value)
        calls.append(f'    emit("{key}", {expression})')

    for static, local, macro in ((1, 0, 0), (1, 0, 3), (2, 3, 0),
                                  (2, 1, 4), (4, 2, 1), (3, 3, 3)):
        budget = f"L.Budget{{{static-1}n,{local}n,{macro}n}}"
        emit(f"L.total({budget})", Q(static, static + local + macro))
        emit(f"L.ambient({budget})", Q(static + local, static + local + macro))
        emit(f"L.local_fraction({budget})", Q(static, static + local))
        emit(f"R.mul(L.ambient({budget}), L.local_fraction({budget}))",
             Q(static, static + local + macro))
        emit(f"K.inverse(L.capacity({budget}))", Q(static + local + macro, static))

    for alpha, speed, c, time, omega in (
        (0, -2, 3, 2, 3), (1, 0, 2, 1, 0), (-1, 3, 2, Q(1, 2), -2),
        (Q(1, 2), -1, Q(3, 2), 2, Q(1, 2)), (2, 1, 1, Q(1, 3), -3),
    ):
        a, v, light, tp, w = measured(alpha, 1), measured(speed), positive(c), positive(time), measured(omega)
        slip, twist = Q(alpha) * speed / c, Q(alpha) * time * omega
        emit(f"U.value(U.Unitless{{}}, N.slip({a},{v},{light}))", slip)
        emit(f"U.value(U.Unitless{{}}, N.twist({a},{tp},{w}))", twist)
        matrix = f"M.assemble(N.plane(K.Regular{{1n,3n}},{a},{v},{light},{tp},{w}))"
        values = ((Q(-2, 5), -slip, 0, 0), (slip, Q(5, 2), -twist, 0),
                  (0, twist, Q(5, 2), 0), (0, 0, 0, Q(5, 2)))
        for i in range(4):
            for j in range(4):
                emit(f"M.at(T.Slot{{{AXES[i]},{AXES[j]}}},{matrix})", values[i][j])

    t, x, y, z = (coord(i) for i in range(4))
    # Integers for compound fields: the production arithmetic is unreduced.
    # The separate affine field below exercises fractional points safely.
    polys = (const(-2), add(t, mul(x, y), mul(const(-2), z)),
             add(mul(x, x), mul(y, z), mul(t, z)),
             add(mul(mul(x, x), y), mul(t, t)))
    points = ((0, 0, 0, 0), (1, -2, 1, 2), (-1, 1, -2, -1))

    def scalar(call, poly, point, row):
        emit(f"F.eval({call},{row})", evaluate(poly, point))

    def vector(call, polys, point, row):
        for i, poly in enumerate((const(0), *polys)):
            emit(f"M.row_at({AXES[i]}, C.eval({call},{row}))", evaluate(poly, point))

    for point in points:
        row = "M.Row{" + ",".join(rational(v) for v in point) + "}"
        for poly in polys:
            source = expr(poly)
            scalar(source, poly, point, row)
            scalar(f"F.neg({source})", mul(const(-1), poly), point, row)
            for axis in range(4):
                d = derivative(poly, axis)
                scalar(f"F.diff({source},{AXES[axis]})", d, point, row)
                scalar(f"F.second({source},{AXES[axis]})",
                       derivative(d, axis), point, row)
            vector(f"C.gradient({source})", gradient(poly), point, row)

        lam, beta, h = add(x, mul(const(-1), z)), add(mul(y, z), t), mul(x, y)
        transverse = (y, z, x)
        rotation = tuple(mul(lam, p) for p in gradient(beta))
        velocity = tuple(add(a, b, c) for a, b, c in zip(gradient(h), transverse, rotation))
        ls, bs = expr(lam), expr(beta)
        vs = f"C.velocity({expr(h)},{vector_expr(transverse)},{ls},{bs})"
        vector(f"C.rotational({ls},{bs})", rotation, point, row)
        vector(f"C.omega({ls},{bs})", cross(gradient(lam), gradient(beta)), point, row)
        vector(f"C.curl(C.rotational({ls},{bs}))", curl(rotation), point, row)
        vector(vs, velocity, point, row)
        vector(f"C.curl({vs})", curl(velocity), point, row)
        scalar(f"D.divergence({vs})", divergence(velocity), point, row)
        scalar(f"D.dot({vector_expr(transverse)},{vs})", dot(transverse, velocity), point, row)
        density = add(const(2), t, x)
        ds = expr(density)
        scalar(f"D.material({ds},{vs})",
               add(derivative(density, 0), dot(velocity, gradient(density))), point, row)
        scalar(f"D.continuity({ds},{vs})",
               add(derivative(density, 0), divergence(tuple(mul(density, v) for v in velocity))),
               point, row)
        speed = add(t, x)
        scalar(f"D.momentum1d({ds},{expr(speed)})",
               add(derivative(mul(density, speed), 0),
                   derivative(mul(density, mul(speed, speed)), 1)), point, row)

    affine = add(const(Q(-1, 2)), mul(const(Q(1, 2)), x), z)
    for point in ((Q(1, 2), Q(-1, 2), 1, Q(1, 2)), (0, Q(1, 2), -1, 0)):
        row = "M.Row{" + ",".join(rational(v) for v in point) + "}"
        scalar(expr(affine), affine, point, row)
        for axis in range(4):
            scalar(f"F.diff({expr(affine)},{AXES[axis]})",
                   derivative(affine, axis), point, row)

    advanced_oracle(emit, scalar, points)

    # Path labels verify every leaf AND its position/shape, including an
    # unbalanced tree; merely summing or checking distinct values would miss loss.
    tree_points = ((0, 0, 1, 0), (0, 1, 2, 0), (1, 3, -1, 0),
                   (1, 4, 0, 0), (-1, 3, 3, 0))

    def tree_source(tree, path, function, prefix):
        if isinstance(tree, int):
            point = tree_points[tree]
            expected[prefix + path] = (Q((point[1] - point[0])**2) if function == "W.reading"
                                       else Q(2*point[1]**2 + 2*point[2]**2 - 2))
            return "B.Leaf{M.Row{" + ",".join(rational(v) for v in point) + "}}"
        left, right = tree
        return ("B.Fork{" + tree_source(left, path + "0", function, prefix) + "," +
                tree_source(right, path + "1", function, prefix) + "}")

    for number, shape in enumerate((((0, 1), (2, 3)), (0, (1, (2, (3, 4)))))):
        for kind, function in enumerate(("W.reading", "batch_residual")):
            prefix = f"b{number}{kind}"
            tree = tree_source(shape, "", function, prefix)
            calls.append(f'    emit_tree(B.map(~M.Row,~R.Q,~{function},{tree}),"{prefix}")')

    imports = (("rational", "R"), ("units", "U"), ("tensor", "T"), ("matrix", "M"),
               ("capacity", "K"), ("ledger", "L"), ("normalization", "N"),
               ("fields", "F"), ("clebsch", "C"), ("transport", "D"), ("format", "Format"),
               ("indices", "I"), ("contraction", "J"), ("compatibility", "H"),
               ("operators", "O"), ("waves", "W"), ("batch", "B"))
    source = "import Base\n" + "".join(
        f"import ./package/{name}.bend as {alias}\n" for name, alias in imports)
    source += """
def emit(label: String, value: R.Q) -> IO(Unit):
  IO.print(label ++ "=" ++ Format.show(value))

def emit_tree(tree: B.Tree<R.Q>, +label: String) -> IO(Unit):
  match tree:
    case B.Leaf{value}:
      emit(label,value)
    case B.Fork{left,right}:
      do IO<Unit>:
        emit_tree(left,label ++ "0")
        emit_tree(right,label ++ "1")

def batch_residual(point: M.Row) -> R.Q:
  F.eval(W.box(F.Add{O.mixed(),F.square(F.Coord{T.T{}})},U.Positive{0n,0n}),point)

def main() -> IO(Unit):
  do IO<Unit>:
"""
    path, binary = directory / "fields-oracle.bend", directory / "fields-oracle"
    path.write_text(source + "\n".join(calls) + "\n")
    command([BEND, path, "-o", binary], cwd=directory)
    outputs = []
    for threads in (1, 2):
        output = command([binary, "--threads", str(threads)], cwd=directory)
        outputs.append(output)
        actual = {}
        for line in output.splitlines():
            match = re.fullmatch(r"([vb]\d+)=(-?\d+(?:/\d+)?)", line)
            assert match, f"Unexpected oracle output: {line}"
            key, value = match.groups()
            assert key not in actual, f"Duplicate result: {key}"
            actual[key] = Q(value)
        assert actual.keys() == expected.keys(), "Missing or additional oracle readings"
        assert list(actual) == list(expected), "Oracle leaf/readout order changed"
        for key, value in expected.items():
            assert actual[key] == value, f"{key}: observed {actual[key]}, expected {value}"
    assert outputs[0] == outputs[1], "Thread-dependent output"
    print(f"PASS: {len(expected)} independent Fraction readings; native threads 1 and 2 agree")


MUTATIONS = (
    ("ledger.bend", "R.fraction(1n+p, Nat.add(p, local))",
     "R.fraction(1n+p, Nat.add(p, Nat.add(local, macro)))", "local uses critical denominator"),
    ("normalization.bend", "U.inverse_value(U.Speed{}, c)",
     "U.positive_value(U.Speed{}, c)", "slip multiplies by c"),
    ("normalization.bend", "U.positive_value(U.Time{}, tp)",
     "U.inverse_value(U.Time{}, tp)", "twist divides by time"),
    ("fields.bend", "Add{Mul{diff(left, axis), right}, Mul{left, diff(right, axis)}}",
     "Mul{diff(left, axis), right}", "missing second product-rule term"),
    ("clebsch.bend", "F.sub(F.diff(z, T.Y{}), F.diff(y, T.Z{}))",
     "F.sub(F.diff(y, T.Z{}), F.diff(z, T.Y{}))", "reversed x curl orientation"),
    ("clebsch.bend", "F.sub(F.Mul{y, w}, F.Mul{z, v})",
     "F.sub(F.Mul{z, v}, F.Mul{y, w})", "reversed x cross orientation"),
    ("transport.bend", "F.Add{F.diff(field,T.T{}), dot(velocity, C.gradient(field))}",
     "dot(velocity, C.gradient(field))", "missing local time derivative"),
    ("transport.bend", "divergence(C.scale(density,velocity))",
     "F.Mul{density,divergence(velocity)}", "density pulled outside divergence"),
    ("indices.bend", "sign(row,sign(column,value))",
     "sign(row,value)", "raise only one index"),
    ("contraction.bend", "P.sum4(t,x,y,z)",
     "P.sum4(t,x,y,R.zero())", "drop final contraction row"),
    ("contraction.bend", "R.mul(az,I.raise(T.Slot{axis,T.Z{}},bz))",
     "R.mul(az,bz)", "omit z-column metric sign"),
    ("compatibility.bend", "R.fraction(1n,1n)",
     "R.one()", "omit symmetric strain half"),
    ("compatibility.bend",
     "F.Add{F.diff(F.diff(xy,T.X{}),T.Y{}),F.diff(F.diff(xy,T.Y{}),T.X{})}",
     "F.diff(F.diff(xy,T.X{}),T.Y{})", "drop second mixed incompatibility term"),
    ("operators.bend", "F.Add{F.Add{x,y},F.second(field,T.Z{})}",
     "F.Add{x,y}", "drop z Laplacian"),
    ("operators.bend", "laplacian(laplacian(field))",
     "laplacian(field)", "replace fourth order by second order"),
    ("operators.bend", "R.mul(radius,radius)",
     "radius", "linear source radius"),
    ("waves.bend", "U.inverse_value(U.Unitless{},c)",
     "U.positive_value(U.Unitless{},c)", "multiply by wave speed squared"),
    ("waves.bend", "F.second(field,T.T{})",
     "F.second(field,T.X{})", "use x instead of time in wave operator"),
    ("batch.bend", "Fork{a,b}",
     "Fork{b,a}", "reverse parallel branch order"),
    ("batch.bend", "Fork{a,b}",
     "a", "drop right parallel branch"),
    ("fields.bend", "case T.Z{} T.Z{}:\n      R.one()",
     "case T.Z{} T.Z{}:\n      R.one()\n    case T.T{} T.Z{}:\n      R.one()",
     "selective wrong coordinate derivative"),
)


def mutations(package):
    # Snapshot every Bend source, including the root gate and all laws/proofs.
    originals = {p.relative_to(package): p.read_bytes() for p in package.rglob("*.bend")}
    assert "All terms check." in command([BEND, package / "PROOF.bend"], cwd=package)
    for filename, before, after, label in MUTATIONS:
        path = package / filename
        original = path.read_text()
        assert original.count(before) == 1, f"Mutation drift: {label}"
        try:
            path.write_text(original.replace(before, after))
            command([BEND, path, "--check-only"], cwd=package)
            output = command([BEND, package / "PROOF.bend"], cwd=package, expected=1)
            assert "- expected :" in output and "- observed :" in output, (label, output)
        finally:
            path.write_bytes(originals[Path(filename)])
        assert all((package / p).read_bytes() == data for p, data in originals.items())
        print(f"PASS mutation: {label}")
    print(f"PASS: {len(MUTATIONS)} isolated well-typed mutations rejected by unchanged root proof")


def main():
    if not __debug__:
        raise SystemExit("Run without Python -O: assertions are part of this gate.")
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--mutations", action="store_true", help="also check isolated implementation mutants")
    options = parser.parse_args()
    workflows()
    build = PACKAGE.parent / "build"
    build.mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="fields-verify-", dir=build) as name:
        directory = Path(name)
        package = directory / "package"
        shutil.copytree(PACKAGE, package, ignore=shutil.ignore_patterns("__pycache__"))
        oracle(directory)
        if options.mutations:
            mutations(package)


if __name__ == "__main__":
    main()
