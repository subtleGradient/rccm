import Base
import ./fields.bend as F
import ./rational.bend as R
import ./tensor.bend as T
import ./matrix.bend as M

type Vector is Data:
  Vector{x: F.Expr, y: F.Expr, z: F.Expr}

def gradient(+field: F.Expr) -> Vector:
  x y = F.diff(field, T.X{}) F.diff(field, T.Y{})
  Vector{x, y, F.diff(field, T.Z{})}

def scale(+factor: F.Expr, vector: Vector) -> Vector:
  match vector:
    case Vector{x, y, z}:
      Vector{F.Mul{factor, x}, F.Mul{factor, y}, F.Mul{factor, z}}

def add(a: Vector, b: Vector) -> Vector:
  match a b:
    case Vector{x, y, z} Vector{u, v, w}:
      Vector{F.Add{x, u}, F.Add{y, v}, F.Add{z, w}}

def cross(a: Vector, b: Vector) -> Vector:
  match a b:
    case Vector{+x, +y, +z} Vector{+u, +v, +w}:
      Vector{F.sub(F.Mul{y, w}, F.Mul{z, v}),
        F.sub(F.Mul{z, u}, F.Mul{x, w}), F.sub(F.Mul{x, v}, F.Mul{y, u})}

def curl(vector: Vector) -> Vector:
  match vector:
    case Vector{+x, +y, +z}:
      Vector{F.sub(F.diff(z, T.Y{}), F.diff(y, T.Z{})),
        F.sub(F.diff(x, T.Z{}), F.diff(z, T.X{})),
        F.sub(F.diff(y, T.X{}), F.diff(x, T.Y{}))}

def eval(vector: Vector, +point: M.Row) -> M.Row:
  match vector:
    case Vector{x, y, z}:
      M.Row{R.zero(), F.eval(x, point), F.eval(y, point), F.eval(z, point)}

def rotational(lambda: F.Expr, beta: F.Expr) -> Vector:
  scale(lambda, gradient(beta))

def omega(lambda: F.Expr, beta: F.Expr) -> Vector:
  cross(gradient(lambda), gradient(beta))

def velocity(h: F.Expr, transverse: Vector, lambda: F.Expr, beta: F.Expr) -> Vector:
  add(add(gradient(h), transverse), rotational(lambda, beta))

def lambda_fixture() -> F.Expr:
  F.Add{F.Coord{T.X{}}, F.Coord{T.Y{}}}

def beta_fixture() -> F.Expr:
  F.Mul{F.Coord{T.X{}}, F.Coord{T.Z{}}}

def point_fixture() -> M.Row:
  M.Row{R.zero(), R.one(), R.zero(), R.one()}

def transverse_fixture() -> Vector:
  Vector{F.Const{R.zero()}, F.Mul{F.Const{R.fraction(2n, 0n)}, F.Coord{T.X{}}}, F.Const{R.zero()}}
