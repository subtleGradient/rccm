import Base
import ../../indices.bend as I
import ../../tensor.bend as T
import ../../rational.bend as R

def time_space_unchanged() -> R.Same(I.raise(T.Slot{T.T{},T.X{}},R.one()),R.one()):
  {==}
