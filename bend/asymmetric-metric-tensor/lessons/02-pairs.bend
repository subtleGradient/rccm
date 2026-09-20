import Base
import ../exact.bend as Exact
import ../tensor.bend as Tensor

def signed_name(value: Exact.Signed) -> String:
  match value:
    case Exact.Zero{}:
      "0"
    case Exact.Positive{p}:
      "+" ++ Nat.show(1n+p)
    case Exact.Negative{p}:
      "-" ++ Nat.show(1n+p)

def pair_name(pair: Tensor.ComponentPair) -> String:
  match pair:
    case Tensor.ComponentPair{here, across}:
      "(" ++ signed_name(here) ++ ", " ++ signed_name(across) ++ ")"

def demonstrate(+slip: Exact.Signed) -> IO(Unit):
  +mirror = Tensor.symmetric_pair(slip)
  # The source's (tx, xt) entries are (-e_x, +e_x).
  +opposite = Tensor.antisymmetric_pair(Exact.negate(slip))
  do IO<Unit>:
    IO.print("Sign-only integer exercise, not a complete fluid state.")
    IO.print("\nGeneric symmetric pair -> transpose:")
    IO.print(pair_name(mirror) ++ " -> " ++
      pair_name(Tensor.transpose_pair(mirror)))
    IO.print("\nSource pair order: (tx, xt); e_x = " ++ signed_name(slip))
    IO.print("Original:          " ++ pair_name(opposite))
    IO.print("Transpose pair:    " ++ pair_name(Tensor.transpose_pair(opposite)))
    IO.print("Negate both:       " ++ pair_name(Tensor.negate_pair(opposite)))
    IO.print("Reverse e_x:       " ++ pair_name(
      Tensor.antisymmetric_pair(Exact.negate(Exact.negate(slip)))))
    IO.print("\nTransposition and negation agree on this antisymmetric pair.")
    IO.print("They are different operations on a general pair.")

def main() -> IO(Unit):
  # Predict, then try 0n, or Exact.negate(Exact.from_nat(3n)).
  demonstrate(Exact.from_nat(3n))
