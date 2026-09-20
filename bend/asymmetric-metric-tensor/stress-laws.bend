import Base
import ./units.bend as U
import ./rational.bend as R
import ./tensor.bend as Tensor
import ./matrix.bend as M
import ./capacity.bend as C
import ./stress.bend as S

# AI-drafted contracts for human review. No physical identification is proved.
law eta_table:
  {S.eta() == M.Matrix{
    M.Row{R.Fraction{0n, 1n, 0n}, R.zero(), R.zero(), R.zero()},
    M.Row{R.zero(), R.one(), R.zero(), R.zero()},
    M.Row{R.zero(), R.zero(), R.one(), R.zero()},
    M.Row{R.zero(), R.zero(), R.zero(), R.one()}
  } : M.Matrix}

# Arbitrary input table and address, not merely an assembled sample.
law content:
  for scale: U.Positive<U.Pressure{}>
  for slot: Tensor.Slot
  for matrix: M.Matrix
  {U.value(U.Pressure{}, S.component(scale, slot, matrix))
    == R.mul(U.positive_value(U.Pressure{}, scale),
      R.sub(M.at(slot, matrix), M.at(slot, M.Matrix{
        M.Row{R.Fraction{0n, 1n, 0n}, R.zero(), R.zero(), R.zero()},
        M.Row{R.zero(), R.one(), R.zero(), R.zero()},
        M.Row{R.zero(), R.zero(), R.one(), R.zero()},
        M.Row{R.zero(), R.zero(), R.zero(), R.one()}
      }))) : R.Q}

law baseline_zero:
  for scale: U.Positive<U.Pressure{}>
  for slot: Tensor.Slot
  R.IsZero(U.value(U.Pressure{}, S.component(scale, slot, S.eta())))

law temporal:
  for scale: U.Positive<U.Pressure{}>
  for capacity: C.Regular
  for ex: R.Q
  for ey: R.Q
  for ez: R.Q
  for bx: R.Q
  for by: R.Q
  for bz: R.Q
  {U.value(U.Pressure{}, S.component(scale, Tensor.Slot{Tensor.T{}, Tensor.T{}},
    M.assemble(M.Sample{capacity, ex, ey, ez, bx, by, bz})))
    == R.mul(U.positive_value(U.Pressure{}, scale), R.sub(R.one(), C.q(capacity))) : R.Q}

# Three spatial axes are selected explicitly, excluding the temporal slot.
type Spatial is Data:
  X{}
  Y{}
  Z{}

def axis(s: Spatial) -> Tensor.Axis:
  match s:
    case X{}:
      Tensor.X{}
    case Y{}:
      Tensor.Y{}
    case Z{}:
      Tensor.Z{}

law spatial:
  for scale: U.Positive<U.Pressure{}>
  for direction: Spatial
  for capacity: C.Regular
  for ex: R.Q
  for ey: R.Q
  for ez: R.Q
  for bx: R.Q
  for by: R.Q
  for bz: R.Q
  {U.value(U.Pressure{}, S.component(scale, Tensor.Slot{axis(direction), axis(direction)},
    M.assemble(M.Sample{capacity, ex, ey, ez, bx, by, bz})))
    == R.mul(U.positive_value(U.Pressure{}, scale), R.sub(C.inverse(capacity), R.one())) : R.Q}
