# EXPECTED FAILURE: the xy entry is -b_z, not +b_z.
import Base
import ../../tensor.bend as Tensor
import ../../matrix.bend as M
import ../../rational.bend as R
import ../example.bend as Example

def wrong_twist() -> R.Same(
  M.at(Tensor.Slot{Tensor.X{}, Tensor.Y{}}, M.assemble(Example.sample())),
  R.fraction(1n, 2n)
):
  {==}
