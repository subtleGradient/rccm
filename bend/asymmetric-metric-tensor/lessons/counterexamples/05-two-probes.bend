# EXPECTED FAILURE: x^T A x = 0 does not imply x^T A y = 0.
import Base
import ../../tensor.bend as Tensor
import ../../matrix.bend as M
import ../../probes.bend as P
import ../../rational.bend as R
import ../example.bend as Example

def different_vectors_disappear() -> R.IsZero(
  P.bilinear(
    P.basis(Tensor.T{}), M.antisymmetric(Example.sample()), P.basis(Tensor.X{})
  )
):
  {==}
