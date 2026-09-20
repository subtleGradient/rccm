import Base
import ../waves.bend as W
import ../batch.bend as B
import ../fields.bend as F
import ../units.bend as U
import ../matrix.bend as M
import ../rational.bend as R
import ../format.bend as Format

def show(tree: B.Tree<R.Q>) -> IO(Unit):
  match tree:
    case B.Leaf{value}:
      IO.print(Format.show(value))
    case B.Fork{left,right}:
      do IO<Unit>:
        show(left)
        show(right)

def main() -> IO(Unit):
  do IO<Unit>:
    IO.print("f=(x-t)^2; points (t,x)=(0,0),(0,1),(1,1),(1,3)")
    IO.print("Parallel profile readings in leaf order:")
    show(B.map(~M.Row,~R.Q,~W.reading,B.points()))
    IO.print("Parallel box_c=1 residuals:")
    show(B.map(~M.Row,~R.Q,~W.residual,B.points()))
    IO.print("Mismatch f=(x-2t)^2, c=1: " ++ Format.show(
      F.eval(W.box(W.profile(R.fraction(2n,0n)),U.Positive{0n,0n}),F.origin())))
