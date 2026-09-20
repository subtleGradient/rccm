# EXPECTED FAILURE: copying a nonzero value does not make an antisymmetric pair.
# Run separately; this fixture must not be imported by PROOF.bend.
import Base
import ../../exact.bend as Exact
import ../../tensor.bend as Tensor

# A copied +3 is not the required -3 in the second slot.
def copied_is_opposite() -> {
  Tensor.symmetric_pair(Exact.from_nat(3n))
  == Tensor.ComponentPair{
    Exact.from_nat(3n), Exact.negate(Exact.from_nat(3n))
  } : Tensor.ComponentPair
}:
  {==}
