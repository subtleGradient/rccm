import Base
import ../../tensor.bend as T
import ../../stress.bend as S
import ../../flux.bend as F
import ../../units.bend as U
import ../../rational.bend as R
import ../field.bend as Example

# T_xy and T_yx have opposite signs in the twist fixture.
law wrong_transport_index:
  R.Same(U.value(U.Pressure{}, F.x_flux(U.Positive{1n, 0n}, F.Y{}, Example.twist())),
    U.value(U.Pressure{}, S.component(U.Positive{1n, 0n}, T.Slot{T.Y{}, T.X{}}, Example.twist())))

def wrong_transport_index():
  {==}
