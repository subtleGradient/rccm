import Base
import ../matrix.bend as M
import ../format.bend as Format
import ./example.bend as Example

def row_text(row: M.Row) -> String:
  match row:
    case M.Row{t, x, y, z}:
      Format.show(t) ++ "  " ++ Format.show(x) ++ "  " ++
      Format.show(y) ++ "  " ++ Format.show(z)

def print_matrix(matrix: M.Matrix) -> IO(Unit):
  match matrix:
    case M.Matrix{t, x, y, z}:
      do IO<Unit>:
        IO.print("       t    x    y    z")
        IO.print("t | " ++ row_text(t))
        IO.print("x | " ++ row_text(x))
        IO.print("y | " ++ row_text(y))
        IO.print("z | " ++ row_text(z))

def main() -> IO(Unit):
  do IO<Unit>:
    IO.print("Local Cartesian tensor: q=3/4, e_x=1/2, b_z=1/3.")
    IO.print("Other slip/twist contributions are zero.")
    print_matrix(M.assemble(Example.sample()))
    IO.print("\nUnloaded baseline:")
    print_matrix(M.assemble(M.vacuum()))
