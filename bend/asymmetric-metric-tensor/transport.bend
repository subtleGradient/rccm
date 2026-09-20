import Base
import ./fields.bend as F
import ./clebsch.bend as C
import ./tensor.bend as T

def dot(a: C.Vector, b: C.Vector) -> F.Expr:
  match a b:
    case C.Vector{x,y,z} C.Vector{u,v,w}:
      F.Add{F.Add{F.Mul{x,u}, F.Mul{y,v}}, F.Mul{z,w}}

def divergence(vector: C.Vector) -> F.Expr:
  match vector:
    case C.Vector{x,y,z}:
      F.Add{F.Add{F.diff(x,T.X{}), F.diff(y,T.Y{})}, F.diff(z,T.Z{})}

def material(+field: F.Expr, velocity: C.Vector) -> F.Expr:
  F.Add{F.diff(field,T.T{}), dot(velocity, C.gradient(field))}

def continuity(+density: F.Expr, velocity: C.Vector) -> F.Expr:
  F.Add{F.diff(density,T.T{}), divergence(C.scale(density,velocity))}

# One spatial direction, before using continuity to cancel anything.
def momentum1d(+density: F.Expr, +velocity: F.Expr) -> F.Expr:
  F.Add{F.diff(F.Mul{density,velocity},T.T{}),
    F.diff(F.Mul{density,F.square(velocity)},T.X{})}
