import Base
import ../capacity.bend as Capacity
import ../rational.bend as R
import ../format.bend as Format

def describe(result: Maybe<Capacity.Regular>) -> String:
  match result:
    case None{}:
      "Rejected: zero remaining capacity has no regular reciprocal-bearing tensor."
    case Some{+state}:
      "q = " ++ Format.show(Capacity.q(state)) ++
      ", used = " ++ Format.show(Capacity.used_fraction(state)) ++
      "\nTime diagonal = " ++ Format.show(R.negate(Capacity.q(state))) ++
      ", spatial diagonal = " ++ Format.show(Capacity.inverse(state)) ++
      "\nq * inverse = " ++ Format.show(R.mul(Capacity.q(state), Capacity.inverse(state)))

def main() -> IO(Unit):
  do IO<Unit>:
    IO.print("Pressure shares use the same units; their ratios are dimensionless.")
    # Change the remaining and used shares, not a speed.
    IO.print("\nRemaining 3, used 1:")
    IO.print(describe(Capacity.inspect(3n, 1n)))
    IO.print("\nRemaining 1, used 3:")
    IO.print(describe(Capacity.inspect(1n, 3n)))
    IO.print("\nRemaining 0, used 4:")
    IO.print(describe(Capacity.inspect(0n, 4n)))
    IO.print("\nFractions are exact, not necessarily reduced: 12/12 equals 1.")
