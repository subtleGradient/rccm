import Base
import ./render.bend as R
import ./field.bend as F
import ./control.bend as C

# Finite executable renderer regressions, not physical-model proofs.
def fixture(view: C.View) -> R.Scene:
  R.make_scene(F.Frame{0.0, 41, 0.8, 0.5, 0.0}, R.NoGhosts{},
    view, C.Paused{}, False{}, False{}, 0.7, 512.0, 376.0, 0.3, 1, 0)

def complement(+q: F32) -> Bool:
  Bool.xor(R.visible(C.Medium{}, q, 0.7),
    R.visible(C.Voids{}, q, 0.7))

def checks() -> Bool:
  +scene = fixture(C.Medium{})
  complement(0.2) &&
  complement(0.7) &&
  complement(0.9) &&
  U32.is_eq(R.rgb(255.0, 128.0, 0.0), 4286578943) &&
  U32.is_eq(R.pixel(scene, 0.0, 0.0), 594460) &&
  U32.is_eq(R.pixel(scene, 400.0, 300.0), R.pixel(scene, 400.0, 300.0)) &&
  F32.is_eq(R.world_x(960.0), 1.6) &&
  F32.is_eq(R.world_y(656.0), 1.0) &&
  F32.is_eq(R.ghost_line(3n, R.NoGhosts{}, 0.8, 0.5, 0.7, 0.6, 0.0), 0.0)

def finish(ok: Bool) -> IO(Unit):
  match ok:
    case False{}: IO.die(Unit, 1, "FAIL: renderer regression")
    case True{}: IO.print("PASS: renderer complement, packing, coordinates, deterministic pixels, empty ghosts")

def main() -> IO(Unit):
  finish(checks())
