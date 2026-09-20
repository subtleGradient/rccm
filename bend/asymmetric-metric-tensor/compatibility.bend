import Base
import ./fields.bend as F
import ./tensor.bend as T
import ./rational.bend as R

# Symmetric planar strain: xy and yx share the same field.
type Strain is Data:
  Strain{xx: F.Expr, xy: F.Expr, yy: F.Expr}

def from_displacement(+ux: F.Expr, +uy: F.Expr) -> Strain:
  Strain{F.diff(ux,T.X{}),
    F.Mul{F.Const{R.fraction(1n,1n)},F.Add{F.diff(ux,T.Y{}),F.diff(uy,T.X{})}},
    F.diff(uy,T.Y{})}

# The xyxy component of the source's four-index operator.
def inc(strain: Strain) -> F.Expr:
  match strain:
    case Strain{xx,+xy,yy}:
      F.sub(F.Add{F.second(xx,T.Y{}),F.second(yy,T.X{})},
        F.Add{F.diff(F.diff(xy,T.X{}),T.Y{}),F.diff(F.diff(xy,T.Y{}),T.X{})})

def compatible() -> Strain:
  from_displacement(F.Mul{F.Coord{T.X{}},F.square(F.Coord{T.Y{}})},F.Const{R.zero()})

def incompatible() -> Strain:
  +f = {F.Add{F.square(F.Coord{T.X{}}),F.square(F.Coord{T.Y{}})} : F.Expr}
  Strain{f,F.Const{R.zero()},f}
