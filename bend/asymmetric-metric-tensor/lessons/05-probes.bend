import Base
import ../tensor.bend as Tensor
import ../matrix.bend as M
import ../probes.bend as P
import ../rational.bend as R
import ../format.bend as Format
import ./example.bend as Example

def direction() -> P.Vector4:
  P.Vector4{R.one(), R.one(), R.zero(), R.zero()}

def main() -> IO(Unit):
  +sample = Example.sample()
  +matrix = M.assemble(sample)
  +skew = M.antisymmetric(sample)
  do IO<Unit>:
    IO.print("Two basis probes can see the antisymmetric part:")
    IO.print("t^T A x = " ++ Format.show(P.bilinear(P.basis(Tensor.T{}), skew, P.basis(Tensor.X{}))))
    IO.print("x^T A t = " ++ Format.show(P.bilinear(P.basis(Tensor.X{}), skew, P.basis(Tensor.T{}))))
    IO.print("\nUse the same vector w=(1,1,0,0) on both sides:")
    IO.print("w^T A w = " ++ Format.show(P.bilinear(direction(), skew, direction())))
    IO.print("w^T U w = " ++ Format.show(P.bilinear(direction(), matrix, direction())))
    IO.print("For this example: -3/4 + 4/3 = 7/12.")
    IO.print("\nRecover entries from the stored matrix, not from its recipe:")
    IO.print("S_tt = " ++ Format.show(P.symmetric_entry(Tensor.Slot{Tensor.T{}, Tensor.T{}}, matrix)))
    IO.print("S_tx = " ++ Format.show(P.symmetric_entry(Tensor.Slot{Tensor.T{}, Tensor.X{}}, matrix)))
    IO.print("A_tx = " ++ Format.show(P.antisymmetric_entry(Tensor.Slot{Tensor.T{}, Tensor.X{}}, matrix)))
    IO.print("\nExact fractions may be unreduced: compare values with Same.")
