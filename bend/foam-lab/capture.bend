import Base
import ./render.bend as R
import ./view.bend as V
import ./fixtures.bend as Fixtures

# Canonical GUI pixel function -> deterministic PPM, no screenshot permissions,
# display server, substitute renderer, hand-painted frame or foreign effect.
def triplet(+rgb: U32) -> String:
  U32.show(U32.and(U32.shrn(rgb, 16n), 255)) ++ " " ++
  U32.show(U32.and(U32.shrn(rgb, 8n), 255)) ++ " " ++
  U32.show(U32.and(rgb, 255)) ++ " "

def stripe(+depth: Nat, +image: R.Scene, +x: U32, +width: U32, +y: F32) -> String:
  match depth:
    case 0n:
      triplet(R.pixel(image, (U32.to_f32(x) + 0.5 : F32), y))
    case 1n+rest:
      +half = U32.shr(width)
      stripe(rest, image, x, half, y) ++
      stripe(rest, image, (x + half : U32), half, y)

def rows(fuel: Nat, +image: R.Scene, +y: U32) -> IO(Unit):
  match fuel:
    case 0n:
      IO.pure(Unit, Unit{})
    case 1n+rest:
      do IO<Unit>:
        IO.print(stripe(10n, image, 0, 1024, (U32.to_f32(y) + 0.5 : F32)))
        rows(rest, image, (y + 1 : U32))

def pick_mode(test: Bool, yes: U32, no: U32) -> U32:
  match test:
    case True{}:
      yes
    case False{}:
      no

def kind_arg(value: String) -> U32:
  +arg = value
  pick_mode(String.eq(arg, "voids"), 1,
    pick_mode(String.eq(arg, "time"), 2,
      pick_mode(String.eq(arg, "boundary"), 3, 0)))

def arguments(args: List<String>) -> U32:
  match args:
    case mode <> _:
      kind_arg(mode)
    case _:
      0

def capture(kind: U32) -> IO(Unit):
  +image = V.scene(Fixtures.choose(kind))
  do IO<Unit>:
    IO.print("P3")
    IO.print("1024 768")
    IO.print("255")
    rows(768n, image, 0)

def main() -> IO(Unit):
  do IO<Unit>:
    args : List<String> <- IO.args()
    capture(arguments(args))
