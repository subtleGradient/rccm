import Base
import ./session.bend as S
import ./view.bend as V
import ./render.bend as R

# Full tree traversal forces every rendered pixel. This also consumes Image.
# Timings include draw + checksum + its first output line, not just a GPU kernel.
def checksum(image: Image) -> U32:
  match image:
    case Pix{color}:
      color
    case Qua{tl, tr, bl, br}:
      a b c d = checksum(tl) checksum(tr) checksum(bl) checksum(br)
      (a * 3 + b * 5 + c * 7 + d * 11 : U32)

def frames(fuel: Nat, +scene: R.Scene) -> IO(Unit):
  match fuel:
    case 0n:
      IO.pure(Unit, Unit{})
    case 1n+rest:
      do IO<Unit>:
        before : Nat <- IO.now()
        IO.print("checksum " ++ U32.show(checksum(R.draw!(scene))))
        after : Nat <- IO.now()
        IO.print("elapsed_ms " ++ Nat.show(Nat.sub(after, before)))
        frames(rest, scene)

def main() -> IO(Unit):
  frames(4n, V.scene(S.initial(42)))
