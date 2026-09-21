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

def quadrant(right: Bool, down: Bool, tl: Image, tr: Image, bl: Image, br: Image) -> Image:
  match right down:
    case False{} False{}: tl
    case True{} False{}: tr
    case False{} True{}: bl
    case True{} True{}: br

def image_pixel(fuel: Nat, image: Image, +x: U32, +y: U32, size: U32) -> U32:
  match fuel image:
    case _ Pix{color}: color
    case 0n _: 0
    case 1n+rest Qua{tl, tr, bl, br}:
      +half = U32.shr(size)
      image_pixel(rest, quadrant((x >= half : U32), (y >= half : U32), tl, tr, bl, br),
                  (x % half : U32), (y % half : U32), half)

def image_agreement() -> Bool:
  +scene = fixture(C.Medium{})
  U32.is_eq(image_pixel(10n, R.draw(scene), 100, 696, 1024), R.pixel(scene, 100.5, 696.5)) &&
  U32.is_eq(image_pixel(10n, R.draw(scene), 400, 300, 1024), R.pixel(scene, 400.5, 300.5))

def inspector_domain() -> Bool:
  +frame = {F.Frame{0.0, 42, 0.8, 0.5, 0.0} : F.Frame}
  String.eq(R.inspect_text(True{}, frame, 0.0, 0.0), "") &&
  String.eq(R.inspect_text(True{}, frame, 960.0, 376.0), "") &&
  String.eq(R.inspect_text(True{}, frame, 512.0, 656.0), "") &&
  Bool.not(String.eq(R.inspect_text(True{}, frame, 512.0, 376.0), ""))

def checks() -> Bool:
  +scene = fixture(C.Medium{})
  complement(0.2) &&
  complement(0.7) &&
  complement(0.9) &&
  U32.is_eq(R.rgb(255.0, 128.0, 0.0), 4286578943) &&
  U32.is_eq(R.pixel(scene, 0.0, 0.0), 594460) &&
  image_agreement() && inspector_domain() &&
  F32.is_eq(R.world_x(960.0), 1.6) &&
  F32.is_eq(R.world_y(656.0), 1.0) &&
  F32.is_eq(R.ghost_line(3n, R.NoGhosts{}, 0.8, 0.5, 0.7, 0.6, 0.0), 0.0)

def finish(ok: Bool) -> IO(Unit):
  match ok:
    case False{}: IO.die(Unit, 1, "FAIL: renderer regression")
    case True{}: IO.print("PASS: renderer complement, packing, image/capture sampling, inspector domain, empty ghosts")

def main() -> IO(Unit):
  finish(checks())
