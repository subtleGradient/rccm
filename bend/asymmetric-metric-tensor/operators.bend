import Base
import ./fields.bend as F
import ./tensor.bend as T
import ./rational.bend as R

def laplacian(+field: F.Expr) -> F.Expr:
  x y = F.second(field,T.X{}) F.second(field,T.Y{})
  F.Add{F.Add{x,y},F.second(field,T.Z{})}

def biharmonic(field: F.Expr) -> F.Expr:
  laplacian(laplacian(field))

# radius is the constant dimensionless ratio rc/L0, not a varying field.
def poisson(+field: F.Expr, +radius: R.Q) -> F.Expr:
  F.sub(laplacian(field),F.Mul{F.Const{R.mul(radius,radius)},biharmonic(field)})

def quartic() -> F.Expr:
  F.square(F.square(F.Coord{T.X{}}))

def mixed() -> F.Expr:
  F.Mul{F.square(F.Coord{T.X{}}),F.square(F.Coord{T.Y{}})}
