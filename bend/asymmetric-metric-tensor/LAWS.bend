import Base
import ./tensor.bend as Tensor

# Lesson 1 contracts from the agreed course plan.
# Treat future changes as specification changes requiring human review.
# Keep these independent of the proofs; do not weaken them to pass a gate.

law swap_row:
  for s: Tensor.Slot
  {Tensor.row(Tensor.swap(s)) == Tensor.column(s) : Tensor.Axis}

law swap_column:
  for s: Tensor.Slot
  {Tensor.column(Tensor.swap(s)) == Tensor.row(s) : Tensor.Axis}

law swap_twice:
  for s: Tensor.Slot
  {Tensor.swap(Tensor.swap(s)) == s : Tensor.Slot}
