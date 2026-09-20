import Base
import ./tensor.bend as Tensor
import ./exact.bend as Exact
import ./rational-laws.bend as RationalLaws
import ./capacity-laws.bend as CapacityLaws
import ./matrix-laws.bend as MatrixLaws
import ./probes-laws.bend as ProbeLaws
import ./coordinates-laws.bend as CoordinateLaws
import ./units-laws.bend as UnitLaws
import ./stress-laws.bend as StressLaws
import ./balance-laws.bend as BalanceLaws
import ./differences-laws.bend as DifferenceLaws
import ./flux-laws.bend as FluxLaws
import ./evolution-laws.bend as EvolutionLaws
import ./ledger-laws.bend as LedgerLaws
import ./normalization-laws.bend as NormalizationLaws
import ./fields-laws.bend as FieldLaws
import ./clebsch-laws.bend as ClebschLaws
import ./transport-laws.bend as TransportLaws
import ./indices-laws.bend as IndexLaws

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

# Lesson 2: mirror or reverse.
# Positive{p} encodes 1+p, so conversion preserves the natural magnitude.
law from_nat_zero:
  {Exact.from_nat(0n) == Exact.Zero{} : Exact.Signed}

law from_nat_successor:
  for p: Nat
  {Exact.from_nat(1n+p) == Exact.Positive{p} : Exact.Signed}

# Specify the sign operation itself: double negation alone admits a no-op.
law negate_zero:
  {Exact.negate(Exact.Zero{}) == Exact.Zero{} : Exact.Signed}

law negate_positive:
  for p: Nat
  {Exact.negate(Exact.Positive{p}) == Exact.Negative{p} : Exact.Signed}

law negate_negative:
  for p: Nat
  {Exact.negate(Exact.Negative{p}) == Exact.Positive{p} : Exact.Signed}

law negate_twice:
  for value: Exact.Signed
  {Exact.negate(Exact.negate(value)) == value : Exact.Signed}

# Constructors preserve the supplied value and fill the other slot by rule.
# Their outputs are generic pairs; not every ComponentPair is antisymmetric.
law symmetric_entries:
  for value: Exact.Signed
  {Tensor.symmetric_pair(value) == Tensor.ComponentPair{value, value} : Tensor.ComponentPair}

law antisymmetric_entries:
  for value: Exact.Signed
  {Tensor.antisymmetric_pair(value) == Tensor.ComponentPair{value, Exact.negate(value)} : Tensor.ComponentPair}

law transpose_pair_entries:
  for here: Exact.Signed
  for across: Exact.Signed
  {Tensor.transpose_pair(Tensor.ComponentPair{here, across}) == Tensor.ComponentPair{across, here} : Tensor.ComponentPair}

law negate_pair_entries:
  for here: Exact.Signed
  for across: Exact.Signed
  {Tensor.negate_pair(Tensor.ComponentPair{here, across}) == Tensor.ComponentPair{Exact.negate(here), Exact.negate(across)} : Tensor.ComponentPair}

# The two structural invariants: S^T = S and A^T = -A, for these pairs.
law symmetric_transpose:
  for value: Exact.Signed
  {Tensor.transpose_pair(Tensor.symmetric_pair(value)) == Tensor.symmetric_pair(value) : Tensor.ComponentPair}

law antisymmetric_transpose:
  for value: Exact.Signed
  {Tensor.transpose_pair(Tensor.antisymmetric_pair(value)) == Tensor.negate_pair(Tensor.antisymmetric_pair(value)) : Tensor.ComponentPair}
