import Base
import ../../coordinates.bend as C
import ../../tensor.bend as T
import ../../matrix.bend as M
import ../../rational.bend as R
import ../example.bend as Example

# Valid code, wrong tensor transformation: only the row label changes.
def row_only(row: T.Axis, column: T.Axis, matrix: M.Matrix) -> R.Q:
  M.at(T.Slot{C.old_axis(row), column}, matrix)

# At new zx: the bad candidate reads old xx=4/3, not old xy=-1/3.
law one_index_is_enough:
  {row_only(T.Z{}, T.X{}, M.assemble(Example.sample())) == M.at(T.Slot{T.Z{}, T.X{}}, C.cycle(M.assemble(Example.sample()))) : R.Q}

def one_index_is_enough():
  {==}
