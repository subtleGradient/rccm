import Base

# One sample, no background load or shear.
# RCCM-GfX-2.tex section 2; RCCM-Condensed.tex eq:admittance_pressure_ratio.
# Both fields are dimensionless fractions of P_c, not pressures in pascals.
type Budget is Data:
  Budget{dynamic_fraction: F32, alpha_s_sq: F32}

# Bend matches parameters, so dispatch the computed validity flag here.
def checked(valid: Bool, +speed_fraction: F32) -> Maybe<Budget>:
  match valid:
    case False{}:
      None{}
    case True{}:
      +dynamic_fraction = (speed_fraction * speed_fraction : F32)
      Some{Budget{dynamic_fraction, (1.0 - dynamic_fraction : F32)}}

# speed_fraction = |v| / c. Accept [0, 1], including the exhausted boundary.
# Invalid inputs (including NaN and infinities) return None, never a clamp.
def sample(+speed_fraction: F32) -> Maybe<Budget>:
  checked(
    (speed_fraction >= 0.0 : F32) && (speed_fraction <= 1.0 : F32),
    speed_fraction
  )
