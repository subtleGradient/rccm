# EXPECTED FAILURE: this file must be rejected by Bend.
# The no-op passes its double-application law but fails the required row.
# Run this file separately; it is not imported by the package proof gate.
import Base
import ../../tensor.bend as Tensor
import ../01-noop.bend as Noop

# At (t,x), a swapped slot must have row x. The no-op still has row t.
def wrong_row() -> {
  Tensor.row(Noop.no_swap(Tensor.Slot{Tensor.T{}, Tensor.X{}}))
  == Tensor.X{} : Tensor.Axis
}:
  {==}
