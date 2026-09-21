# Finite native F32 regressions, NOT universal mathematical or physical proof.
# Run: BEND_NO_TELEMETRY=1 bend bend/foam-lab/field-tests.bend
import Base
import ./field.bend as Field

type Stats is Data:
  Stats{lo: F32, hi: F32, ok: Bool, count: U32}

def q(s: Field.Sample) -> F32:
  match s:
    case Field.Sample{value, _, _}:
      value

def near(a: F32, b: F32, tolerance: F32) -> Bool:
  (F32.abs((a - b : F32)) <= tolerance : F32)

def identical(a: Field.Sample, b: Field.Sample) -> Bool:
  match a b:
    case Field.Sample{aq, ax, ay} Field.Sample{bq, bx, by}:
      U32.is_eq(F32.bits(aq), F32.bits(bq)) &&
      U32.is_eq(F32.bits(ax), F32.bits(bx)) &&
      U32.is_eq(F32.bits(ay), F32.bits(by))

def update(stats: Stats, sample: Field.Sample, replay: Field.Sample) -> Stats:
  match stats sample:
    case Stats{lo, hi, ok, count} Field.Sample{+value, +gx, +gy}:
      Stats{F32.min(lo, value), F32.max(hi, value),
        ok && (value > 0.0 : F32) && (value <= 1.0 : F32) &&
        (F32.abs(gx) < 100.0 : F32) && (F32.abs(gy) < 100.0 : F32) &&
        identical(Field.Sample{value, gx, gy}, replay), (count + 1 : U32)}

def row(fuel: Nat, +i: U32, +y: F32, +frame: Field.Frame, stats: Stats) -> Stats:
  match fuel:
    case 0n:
      stats
    case 1n+left:
      +x = (U32.to_f32(i) / 100.0 : F32)
      row(left, (i + 1 : U32), y, frame,
        update(stats, Field.sample(frame, x, y), Field.sample(frame, x, y)))

def grid(fuel: Nat, +j: U32, +frame: Field.Frame, stats: Stats) -> Stats:
  match fuel:
    case 0n:
      stats
    case 1n+left:
      grid(left, (j + 1 : U32), frame,
        row(161n, 0, (U32.to_f32(j) / 100.0 : F32), frame, stats))

def require(ok: Bool, name: String) -> IO(Unit):
  match ok:
    case False{}:
      IO.die(Unit, 1, "FAIL: " ++ name)
    case True{}:
      IO.print("PASS: " ++ name)

def report(seed: U32, time: F32, stats: Stats) -> IO(Unit):
  match stats:
    case Stats{lo, hi, ok, +count}:
      do IO<Unit>:
        IO.print("seed=" ++ U32.show(seed) ++ " time=" ++ F32.show(time) ++
          " q=[" ++ F32.show(lo) ++ ", " ++ F32.show(hi) ++ "] n=" ++ U32.show(count))
        require(ok && U32.is_eq(count, 16261), "finite positive capacity, q<=1, bit-identical replay")

# Four seeds x four times, each covering both domain edges and cell boundaries.
def frames(fuel: Nat, +i: U32) -> IO(Unit):
  match fuel:
    case 0n:
      IO.pure(Unit, Unit{})
    case 1n+left:
      +seed = ((i % 4) * 2654435761 : U32)
      +time = (U32.to_f32((i / 4 : U32)) * 13.7 : F32)
      frame = {Field.Frame{time, seed, 0.8, 0.5, 0.0} : Field.Frame}
      do IO<Unit>:
        report(seed, time, grid(101n, 0, frame, Stats{1.0, 0.0, True{}, 0}))
        frames(left, (i + 1 : U32))

def brush_center(+x: F32, +y: F32) -> Bool:
  +base = q(Field.sample(Field.Frame{2.0, 42, x, y, 0.0}, x, y))
  +light = q(Field.sample(Field.Frame{2.0, 42, x, y, 0.2}, x, y))
  +heavy = q(Field.sample(Field.Frame{2.0, 42, x, y, 0.6}, x, y))
  +overdraw = q(Field.sample(Field.Frame{2.0, 42, x, y, 1.5}, x, y))
  zero = q(Field.sample(Field.Frame{2.0, 42, x, y, base}, x, y))
  (heavy < light : F32) && (light < base : F32) &&
  near((base - light : F32), 0.2, 0.000001) &&
  near((base - heavy : F32), 0.6, 0.000001) &&
  near(overdraw, (base - 1.5 : F32), 0.000001) &&
  (overdraw < 0.0 : F32) && F32.is_eq(zero, 0.0)

def outside_brush(+x: F32, +y: F32) -> Bool:
  identical(Field.sample(Field.Frame{7.0, 99, 0.8, 0.5, 0.0}, x, y),
    Field.sample(Field.Frame{7.0, 99, 0.8, 0.5, 2.0}, x, y))

def brush_checks() -> Bool:
  brush_center(0.0, 0.0) && brush_center(0.8, 0.5) &&
  brush_center(1.6, 1.0) && brush_center(0.371, 0.683) &&
  outside_brush(0.0, 0.0) && outside_brush(1.03, 0.5) &&
  outside_brush(0.8, 0.73) && outside_brush(1.6, 1.0)

def gradient_error(sample: Field.Sample, dx: F32, dy: F32) -> F32:
  match sample:
    case Field.Sample{_, gx, gy}:
      F32.max(F32.abs((gx - dx : F32)), F32.abs((gy - dy : F32)))

def derivative(+frame: Field.Frame, +x: F32, +y: F32) -> F32:
  # h=.0005: small against radius=.2, large against F32 subtraction noise.
  dx = ((q(Field.sample(frame, (x + 0.0005 : F32), y)) -
    q(Field.sample(frame, (x - 0.0005 : F32), y))) / 0.001 : F32)
  dy = ((q(Field.sample(frame, x, (y + 0.0005 : F32))) -
    q(Field.sample(frame, x, (y - 0.0005 : F32)))) / 0.001 : F32)
  gradient_error(Field.sample(frame, x, y), dx, dy)

def gradient_row(fuel: Nat, +i: U32, +y: F32, +frame: Field.Frame, error: F32) -> F32:
  match fuel:
    case 0n:
      error
    case 1n+left:
      x = (0.037 + U32.to_f32(i) * 0.08 : F32)
      gradient_row(left, (i + 1 : U32), y, frame, F32.max(error, derivative(frame, x, y)))

def gradients(fuel: Nat, +j: U32, +frame: Field.Frame, error: F32) -> F32:
  match fuel:
    case 0n:
      error
    case 1n+left:
      gradients(left, (j + 1 : U32), frame,
        gradient_row(20n, 0, (0.041 + U32.to_f32(j) * 0.08 : F32), frame, error))

def gradient_report(+error: F32) -> IO(Unit):
  do IO<Unit>:
    IO.print("max centered-difference gradient error=" ++ F32.show(error))
    require((error < 0.004 : F32), "analytic dq/dx,dq/dy; h=.0005, tolerance=.004")

def driven_checks() -> Bool:
  +base = q(Field.background(0.0, 42, 0.37, 0.59))
  other_time = q(Field.background(2.0, 42, 0.37, 0.59))
  other_seed = q(Field.background(0.0, 43, 0.37, 0.59))
  (F32.abs((base - other_time : F32)) > 0.00001 : F32) &&
  (F32.abs((base - other_seed : F32)) > 0.00001 : F32)

def kernel_check(load: Field.Load, amount: F32, dx: F32, dy: F32) -> Bool:
  match load:
    case Field.Load{a, gx, gy}:
      near(a, amount, 0.000001) && near(gx, dx, 0.000001) && near(gy, dy, 0.000001)

def kernel_checks() -> Bool:
  kernel_check(Field.stamp(0.0, 0.0, 1.0, 0.5), 0.5, 0.0, 0.0) &&
  kernel_check(Field.stamp(0.5, 0.0, 1.0, 0.5), 0.2109375, 0.84375, 0.0) &&
  kernel_check(Field.stamp(1.0, 0.0, 1.0, 0.5), 0.0, 0.0, 0.0) &&
  kernel_check(Field.stamp(2.0, 0.0, 1.0, 0.5), 0.0, 0.0, 0.0)

# Independent 5x5 neighborhood enumeration catches omissions in the hot 3x3.
# This shares only the stamp definition, not the neighbor offsets or iteration.
def reference_cells(fuel: Nat, +i: U32, +time: F32, +seed: U32, +cx: U32, +cy: U32, +fx: F32, +fy: F32, acc: Field.Load) -> Field.Load:
  match fuel:
    case 0n:
      acc
    case 1n+left:
      +ox = (i % 5 : U32)
      +oy = (i / 5 : U32)
      load = Field.cell(time, seed, (cx + ox - 2 : U32), (cy + oy - 2 : U32),
        (fx + 2.0 - U32.to_f32(ox) : F32), (fy + 2.0 - U32.to_f32(oy) : F32))
      reference_cells(left, (i + 1 : U32), time, seed, cx, cy, fx, fy, Field.add_load(acc, load))

def reference(+time: F32, +seed: U32, +x: F32, +y: F32) -> Bool:
  +sx = (x * 5.0 : F32)
  +sy = (y * 5.0 : F32)
  +ix = F32.floor(sx)
  +iy = F32.floor(sy)
  wide = Field.capacity(reference_cells(25n, 0, time, seed,
    F32.to_u32((ix + 16.0 : F32)), F32.to_u32((iy + 16.0 : F32)),
    (sx - ix : F32), (sy - iy : F32), Field.Load{0.0, 0.0, 0.0}))
  # Different floating addition paths/coordinate subtraction can round apart.
  near(q(wide), q(Field.background(time, seed, x, y)), 0.000001)

def references(fuel: Nat, +i: U32, ok: Bool) -> Bool:
  match fuel:
    case 0n:
      ok
    case 1n+left:
      references(left, (i + 1 : U32), ok &&
        reference((U32.to_f32(i) * 0.71 : F32), (i * 2654435761 : U32),
          (U32.to_f32((i % 17 : U32)) * 0.1 : F32),
          (U32.to_f32((i % 11 : U32)) * 0.1 : F32)))

def main() -> IO(Unit):
  do IO<Unit>:
    require(kernel_checks(), "independent cubic-kernel values and compact support")
    require(brush_checks(), "brush monotonicity, exact boundary, unclamped overdraw, compact support")
    require(driven_checks(), "seed and prescribed drive time change the field")
    require(references(187n, 0, True{}), "3x3 agrees with wider 5x5 reference")
    gradient_report(F32.max(
      gradients(12n, 0, Field.Frame{0.0, 0, 0.8, 0.5, 0.0}, 0.0),
      F32.max(
        gradients(12n, 0, Field.Frame{2.0, 42, 0.8, 0.5, 0.2}, 0.0),
        gradients(12n, 0, Field.Frame{41.1, 4294967295, 0.371, 0.683, 1.5}, 0.0))))
    frames(16n, 0)
    IO.print("PASS: 260176 baseline samples/replays, 720 gradients, finite fixtures only")
