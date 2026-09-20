import Base
import ./tensor.bend as Tensor
import ./capacity.bend as Capacity
import ./matrix.bend as M
import ./rational.bend as R

# Independent entry-by-entry transcription of eq:unified_matrix.
# This is the contract table, not a call back to the assembler.
def prescribed(slot: Tensor.Slot, sample: M.Sample) -> R.Q:
  match slot sample:
    case Tensor.Slot{Tensor.T{}, Tensor.T{}} M.Sample{capacity, _, _, _, _, _, _}:
      R.negate(Capacity.q(capacity))
    case Tensor.Slot{Tensor.T{}, Tensor.X{}} M.Sample{_, ex, _, _, _, _, _}:
      R.negate(ex)
    case Tensor.Slot{Tensor.T{}, Tensor.Y{}} M.Sample{_, _, ey, _, _, _, _}:
      R.negate(ey)
    case Tensor.Slot{Tensor.T{}, Tensor.Z{}} M.Sample{_, _, _, ez, _, _, _}:
      R.negate(ez)
    case Tensor.Slot{Tensor.X{}, Tensor.T{}} M.Sample{_, ex, _, _, _, _, _}:
      ex
    case Tensor.Slot{Tensor.X{}, Tensor.X{}} M.Sample{capacity, _, _, _, _, _, _}:
      Capacity.inverse(capacity)
    case Tensor.Slot{Tensor.X{}, Tensor.Y{}} M.Sample{_, _, _, _, _, _, bz}:
      R.negate(bz)
    case Tensor.Slot{Tensor.X{}, Tensor.Z{}} M.Sample{_, _, _, _, _, by, _}:
      by
    case Tensor.Slot{Tensor.Y{}, Tensor.T{}} M.Sample{_, _, ey, _, _, _, _}:
      ey
    case Tensor.Slot{Tensor.Y{}, Tensor.X{}} M.Sample{_, _, _, _, _, _, bz}:
      bz
    case Tensor.Slot{Tensor.Y{}, Tensor.Y{}} M.Sample{capacity, _, _, _, _, _, _}:
      Capacity.inverse(capacity)
    case Tensor.Slot{Tensor.Y{}, Tensor.Z{}} M.Sample{_, _, _, _, bx, _, _}:
      R.negate(bx)
    case Tensor.Slot{Tensor.Z{}, Tensor.T{}} M.Sample{_, _, _, ez, _, _, _}:
      ez
    case Tensor.Slot{Tensor.Z{}, Tensor.X{}} M.Sample{_, _, _, _, _, by, _}:
      R.negate(by)
    case Tensor.Slot{Tensor.Z{}, Tensor.Y{}} M.Sample{_, _, _, _, bx, _, _}:
      bx
    case Tensor.Slot{Tensor.Z{}, Tensor.Z{}} M.Sample{capacity, _, _, _, _, _, _}:
      Capacity.inverse(capacity)

law component_table:
  for sample: M.Sample
  for slot: Tensor.Slot
  {M.at(slot, M.assemble(sample)) == prescribed(slot, sample) : R.Q}

law transpose_at:
  for matrix: M.Matrix
  for slot: Tensor.Slot
  {M.at(slot, M.transpose(matrix)) == M.at(Tensor.swap(slot), matrix) : R.Q}

law symmetric_transpose:
  for sample: M.Sample
  {M.transpose(M.symmetric(sample)) == M.symmetric(sample) : M.Matrix}

law antisymmetric_transpose:
  for sample: M.Sample
  {M.transpose(M.antisymmetric(sample)) == M.negate(M.antisymmetric(sample)) : M.Matrix}

law assembled_sum:
  for sample: M.Sample
  for slot: Tensor.Slot
  {R.add(M.at(slot, M.symmetric(sample)), M.at(slot, M.antisymmetric(sample))) == M.at(slot, M.assemble(sample)) : R.Q}

law unloaded:
  {M.assemble(M.vacuum()) == M.Matrix{
    M.Row{R.negate(R.one()), R.zero(), R.zero(), R.zero()},
    M.Row{R.zero(), R.one(), R.zero(), R.zero()},
    M.Row{R.zero(), R.zero(), R.one(), R.zero()},
    M.Row{R.zero(), R.zero(), R.zero(), R.one()}
  } : M.Matrix}
