import Base
import ./units.bend as U
import ./rational.bend as R
import ./tensor.bend as Tensor
import ./matrix.bend as M

# Lower-index Cartesian reference, in t,x,y,z order.
def eta() -> M.Matrix:
  M.Matrix{
    M.Row{R.negate(R.one()), R.zero(), R.zero(), R.zero()},
    M.Row{R.zero(), R.one(), R.zero(), R.zero()},
    M.Row{R.zero(), R.zero(), R.one(), R.zero()},
    M.Row{R.zero(), R.zero(), R.zero(), R.one()}
  }

# Focused definition: RCCM-GfX-2.tex, eq:field_equation.
# No index raising, constitutive inference, or derivative occurs here.
def component(+scale: U.Positive<U.Pressure{}>, +slot: Tensor.Slot, matrix: M.Matrix) -> U.Quantity<U.Pressure{}>:
  U.Measure{R.mul(U.positive_value(U.Pressure{}, scale),
    R.sub(M.at(slot, matrix), M.at(slot, eta())))}
