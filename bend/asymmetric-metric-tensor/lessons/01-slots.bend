import Base
import ../tensor.bend as Tensor

def axis_name(axis: Tensor.Axis) -> String:
  match axis:
    case Tensor.T{}:
      "t"
    case Tensor.X{}:
      "x"
    case Tensor.Y{}:
      "y"
    case Tensor.Z{}:
      "z"

def slot_name(s: Tensor.Slot) -> String:
  match s:
    case Tensor.Slot{r, c}:
      axis_name(r) ++ axis_name(c)

def map_row(+r: Tensor.Axis) -> String:
  axis_name(r) ++ " | " ++
  slot_name(Tensor.Slot{r, Tensor.T{}}) ++ "  " ++
  slot_name(Tensor.Slot{r, Tensor.X{}}) ++ "  " ++
  slot_name(Tensor.Slot{r, Tensor.Y{}}) ++ "  " ++
  slot_name(Tensor.Slot{r, Tensor.Z{}})

def route(+s: Tensor.Slot) -> String:
  slot_name(s) ++ " -> " ++
  slot_name(Tensor.swap(s)) ++ " -> " ++
  slot_name(Tensor.swap(Tensor.swap(s)))

def main() -> IO(Unit):
  do IO<Unit>:
    IO.print("One tensor sample: row first, column second.")
    IO.print("     t   x   y   z")
    IO.print(map_row(Tensor.T{}))
    IO.print(map_row(Tensor.X{}))
    IO.print(map_row(Tensor.Y{}))
    IO.print(map_row(Tensor.Z{}))
    IO.print("\nSwap a slot, then swap it again:")
    # Change these two axis labels after predicting the route.
    IO.print(route(Tensor.Slot{Tensor.T{}, Tensor.X{}}))
    IO.print("\nOnly an address changed. No component value was negated.")
