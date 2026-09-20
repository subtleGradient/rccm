import Base
import ./pressure.bend as Pressure

def describe(result: Maybe<Pressure.Budget>) -> String:
  match result:
    case None{}:
      "Outside this sample's domain: use a speed fraction from 0 to 1."
    case Some{Pressure.Budget{dynamic_fraction, alpha_s_sq}}:
      "P_dyn / P_c = " ++ F32.show(dynamic_fraction) ++
      "\nP_static / P_c = alpha_s_sq = " ++ F32.show(alpha_s_sq)

# Change only this number. Predict both fields before running again.
def main() -> IO(Unit):
  IO.print(describe(Pressure.sample(0.5)))
