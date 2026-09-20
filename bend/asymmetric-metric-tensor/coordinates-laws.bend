import Base
import ./coordinates.bend as C
import ./tensor.bend as T
import ./matrix.bend as M
import ./rational.bend as R

# AI-drafted contracts: require human review, not already human-approved.
# Fix the direction independently, so a reverse cycle cannot pass unnoticed.
law time_axis:
  {C.old_axis(T.T{}) == T.T{} : T.Axis}
law x_axis:
  {C.old_axis(T.X{}) == T.Y{} : T.Axis}
law y_axis:
  {C.old_axis(T.Y{}) == T.Z{} : T.Axis}
law z_axis:
  {C.old_axis(T.Z{}) == T.X{} : T.Axis}

law component:
  for matrix: M.Matrix
  for row: T.Axis
  for column: T.Axis
  {M.at(T.Slot{row, column}, C.cycle(matrix)) == M.at(T.Slot{C.old_axis(row), C.old_axis(column)}, matrix) : R.Q}

law three_cycles:
  for matrix: M.Matrix
  {C.cycle(C.cycle(C.cycle(matrix))) == matrix : M.Matrix}

law transpose_commutes:
  for matrix: M.Matrix
  {M.transpose(C.cycle(matrix)) == C.cycle(M.transpose(matrix)) : M.Matrix}

law negate_commutes:
  for matrix: M.Matrix
  {M.negate(C.cycle(matrix)) == C.cycle(M.negate(matrix)) : M.Matrix}

# These implications preserve the structure of arbitrary stored matrices.
law symmetric_preserved:
  for matrix: M.Matrix
  for symmetric: {M.transpose(matrix) == matrix : M.Matrix}
  {M.transpose(C.cycle(matrix)) == C.cycle(matrix) : M.Matrix}

law antisymmetric_preserved:
  for +matrix: M.Matrix
  for antisymmetric: {M.transpose(matrix) == M.negate(matrix) : M.Matrix}
  {M.transpose(C.cycle(matrix)) == M.negate(C.cycle(matrix)) : M.Matrix}
