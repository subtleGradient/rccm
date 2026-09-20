import Base
import ../../units.bend as U
import ../../tensor.bend as Tensor
import ../../stress.bend as S

# Deliberately rejected: a positive length is not a pressure scale.
def wrong_scale() -> U.Quantity<U.Pressure{}>:
  length = {U.Positive{11n, 0n} : U.Positive<U.Length{}>}
  S.component(length, Tensor.Slot{Tensor.T{}, Tensor.T{}}, S.eta())
