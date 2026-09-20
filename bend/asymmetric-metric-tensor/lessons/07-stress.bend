import Base
import ../units.bend as U
import ../tensor.bend as Tensor
import ../matrix.bend as M
import ../stress.bend as S
import ../format.bend as Format
import ./example.bend as Example

def reading(+scale: U.Positive<U.Pressure{}>, slot: Tensor.Slot) -> String:
  Format.show(U.value(U.Pressure{}, S.component(scale, slot, M.assemble(Example.sample()))))

def main() -> IO(Unit):
  +scale = {U.Positive{11n, 0n} : U.Positive<U.Pressure{}>}
  tt xx = reading(scale, Tensor.Slot{Tensor.T{}, Tensor.T{}}) reading(scale, Tensor.Slot{Tensor.X{}, Tensor.X{}})
  tx xy = reading(scale, Tensor.Slot{Tensor.T{}, Tensor.X{}}) reading(scale, Tensor.Slot{Tensor.X{}, Tensor.Y{}})
  do IO<Unit>:
    IO.print("q=3/4, Pc=12 Pa; raw lower-index readings:")
    IO.print("T_tt = " ++ tt ++ " Pa")
    IO.print("T_xx = " ++ xx ++ " Pa")
    IO.print("T_tx = " ++ tx ++ " Pa")
    IO.print("T_xy = " ++ xy ++ " Pa")
