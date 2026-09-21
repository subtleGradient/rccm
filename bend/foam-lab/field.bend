# Driven pressure ledger, NOT a fluid or bubble PDE.
# q = P_static/Pc = 1 - sum(prescribed external load fractions).
# Iso-q pockets are display geometry, not material bubbles. Time moves the
# prescribed background stamps; it does not integrate autonomous dynamics.
# Inputs: finite time (seconds), finite x in [0,1.6], y in [0,1], finite
# nonnegative brush amplitude. q <= 0 is the boundary/invalid diagnostic:
# caller must freeze/reject it. No reciprocal, q clamp, or postyield update.
import Base

type Frame is Data:
  Frame{time: F32, seed: U32, brush_x: F32, brush_y: F32, brush: F32}

type Sample is Data:
  Sample{q: F32, gx: F32, gy: F32}

# Internal stamp result: positive load and analytic gradient of remaining q.
type Load is Data:
  Load{amount: F32, gx: F32, gy: F32}

def add_load(a: Load, b: Load) -> Load:
  match a b:
    case Load{a, ax, ay} Load{b, bx, by}:
      Load{(a + b : F32), (ax + bx : F32), (ay + by : F32)}

def capacity(load: Load) -> Sample:
  match load:
    case Load{amount, gx, gy}:
      Sample{(1.0 - amount : F32), (gx * 5.0 : F32), (gy * 5.0 : F32)}

def subtract_load(base: Sample, brush: Load) -> Sample:
  match base brush:
    case Sample{q, gx, gy} Load{amount, dx, dy}:
      Sample{(q - amount : F32), (gx + dx : F32), (gy + dy : F32)}

def domain_width() -> F32:
  1.6

def domain_height() -> F32:
  1.0

def cell_size() -> F32:
  0.2

def brush_radius() -> F32:
  0.22

def hash(+n: U32) -> U32:
  +a = ((n .^. (n >> 16n)) * 2146121005 : U32)
  +b = ((a .^. (a >> 15n)) * 2221713035 : U32)
  (b .^. (b >> 16n) : U32)

# Keep 24 bits before conversion so the integer is exactly representable.
def unit(n: U32) -> F32:
  (U32.to_f32((n .&. 16777215 : U32)) / 16777215.0 : F32)

# s = 1 - (dx^2 + dy^2)/radius^2; load = amplitude * max(0,s)^3.
# Its contribution to grad(q) is +6*amplitude*s^2*(dx,dy)/radius^2.
# Branching, rather than generic Bool.pick, keeps hot scalar values unboxed.
def kernel(active: Bool, +s: F32, amplitude: F32, +inv_r2: F32, dx: F32, dy: F32) -> Load:
  match active:
    case False{}:
      Load{0.0, 0.0, 0.0}
    case True{}:
      +a = (amplitude * s * s : F32)
      +g = (6.0 * a * inv_r2 : F32)
      Load{(a * s : F32), (g * dx : F32), (g * dy : F32)}

def stamp(+dx: F32, +dy: F32, +inv_r2: F32, amplitude: F32) -> Load:
  +s = (1.0 - (dx * dx + dy * dy) * inv_r2 : F32)
  kernel((s > 0.0 : F32), s, amplitude, inv_r2, dx, dy)

# Coordinates here are in cells, not normalized domain units.
# Center offset from cell middle is bounded by .13 + .07 = .2 per axis.
# The support radius is exactly one cell. A cell outside the local 3x3 has
# nearest possible center >=1.3 cells away, so contributes exactly zero.
def cell(+time: F32, +seed: U32, +cx: U32, +cy: U32, x: F32, y: F32) -> Load:
  +h = hash((seed .^. (cx * 374761393) .^. (cy * 668265263) : U32))
  +hx = unit(h)
  +hy = unit(hash((h + 1 : U32)))
  +phase = (unit(hash((h + 2 : U32))) * 6.2831853 : F32)
  jx = ((hx - 0.5) * 0.26 + 0.07 * F32.sin((time * 0.37 + phase : F32)) : F32)
  jy = ((hy - 0.5) * 0.26 + 0.07 * F32.sin((time * 0.29 + phase + 1.7 : F32)) : F32)
  amplitude = (0.35 + 0.20 * unit(hash((h + 3 : U32))) : F32)
  stamp((x - 0.5 - jx : F32), (y - 0.5 - jy : F32), 1.0, amplitude)

# Flat tail loop: nine units of structural fuel and an inexpensive U32 index.
# No fork, non-tail recursion, scene, or per-sample list; termination checked.
# Local coordinates avoid subtracting two large converted hash-cell indices.
def neighbors(fuel: Nat, +n: U32, +time: F32, +seed: U32, +cx: U32, +cy: U32, +fx: F32, +fy: F32, acc: Load) -> Load:
  match fuel:
    case 0n:
      acc
    case 1n+left:
      +ox = (n % 3 : U32)
      +oy = (n / 3 : U32)
      load = cell(time, seed, (cx + ox - 1 : U32), (cy + oy - 1 : U32),
        (fx + 1.0 - U32.to_f32(ox) : F32), (fy + 1.0 - U32.to_f32(oy) : F32))
      neighbors(left, (n + 1 : U32), time, seed, cx, cy, fx, fy, add_load(acc, load))

def background(time: F32, seed: U32, x: F32, y: F32) -> Sample:
  +sx = (x * 5.0 : F32)
  +sy = (y * 5.0 : F32)
  +ix = F32.floor(sx)
  +iy = F32.floor(sy)
  # Offset before U32 conversion prevents unsigned underflow at domain edges.
  # Offset is an index convention only: this is not a physical wall or tank.
  capacity(neighbors(9n, 0, time, seed, F32.to_u32((ix + 16.0 : F32)), F32.to_u32((iy + 16.0 : F32)),
    (sx - ix : F32), (sy - iy : F32), Load{0.0, 0.0, 0.0}))

def sample(frame: Frame, +x: F32, +y: F32) -> Sample:
  Frame{time, seed, bx, by, brush} = frame
  subtract_load(background(time, seed, x, y),
    stamp((x - bx : F32), (y - by : F32),
      (1.0 / (brush_radius() * brush_radius()) : F32), brush))
