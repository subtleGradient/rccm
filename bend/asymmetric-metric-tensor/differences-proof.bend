import Base
import ./rational.bend as R
import ./units.bend as U
import ./differences-laws.bend as Laws
import ./rational-laws.bend as RL
import ./rational-proof.bend as RP
import ./balance-laws.bend as BL
import ./balance-proof.bend as BP

def Laws.quotient_contents(n, d, left, right):
  {==}

def Laws.constant_field(spacing, value):
  BL.mul_zero_value(U.inverse_value(U.Length{}, spacing),
    R.sub(value, value), RL.sub_equal(value, value, {==}))
