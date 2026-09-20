import Base
import ../tensor.bend as Tensor

# A deliberately wrong candidate for swapping. It just returns its input.
# This is a teaching countermodel, not part of the tensor implementation.
def no_swap(s: Tensor.Slot) -> Tensor.Slot:
  s

# Even this wrong candidate satisfies the weak "do it twice" requirement.
law noop_twice:
  for s: Tensor.Slot
  {no_swap(no_swap(s)) == s : Tensor.Slot}

def noop_twice(s):
  {==}
