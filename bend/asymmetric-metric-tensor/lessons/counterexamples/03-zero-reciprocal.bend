# EXPECTED FAILURE: exhausted capacity cannot supply a regular tensor state.
import Base
import ../../capacity.bend as Capacity

def exhausted_has_inverse() -> {
  Capacity.inspect(0n, 4n) == Some{Capacity.Regular{0n, 4n}} : Maybe<Capacity.Regular>
}:
  {==}
