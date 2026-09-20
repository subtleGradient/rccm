import Base
import ./indices.bend as I
import ./tensor.bend as T
import ./rational.bend as R
import ./matrix.bend as M

law time_sign:
  for a: R.Q
  {I.sign(T.T{},a) == R.negate(a) : R.Q}
law x_sign:
  for a: R.Q
  {I.sign(T.X{},a) == a : R.Q}
law y_sign:
  for a: R.Q
  {I.sign(T.Y{},a) == a : R.Q}
law z_sign:
  for a: R.Q
  {I.sign(T.Z{},a) == a : R.Q}
law raise_contents:
  for row: T.Axis
  for column: T.Axis
  for a: R.Q
  {I.raise(T.Slot{row,column},a) == I.sign(row,I.sign(column,a)) : R.Q}
law upper_contents:
  for +slot: T.Slot
  for matrix: M.Matrix
  {I.upper(slot,matrix) == I.raise(slot,M.at(slot,matrix)) : R.Q}
law raise_twice:
  for +slot: T.Slot
  for +a: R.Q
  {I.raise(slot,I.raise(slot,a)) == a : R.Q}
