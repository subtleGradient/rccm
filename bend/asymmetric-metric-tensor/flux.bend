import Base
import ./tensor.bend as T
import ./matrix.bend as M
import ./stress.bend as S
import ./units.bend as U
import ./differences.bend as D

# Only spatial components enter this flat-Cartesian teaching balance.
type Spatial is Data:
  X{}
  Y{}
  Z{}

type Faces is Data:
  Faces{left: U.Quantity<U.Pressure{}>, middle: U.Quantity<U.Pressure{}>, right: U.Quantity<U.Pressure{}>}

type Rates is Data:
  Rates{left: U.Quantity<U.ForceDensity{}>, right: U.Quantity<U.ForceDensity{}>}

def axis(direction: Spatial) -> T.Axis:
  match direction:
    case X{}:
      T.X{}
    case Y{}:
      T.Y{}
    case Z{}:
      T.Z{}

# Row is transport direction; column is the momentum component.
# For spatial indices only, raising with eta adds no minus sign.
def x_flux(scale: U.Positive<U.Pressure{}>, momentum: Spatial, matrix: M.Matrix) -> U.Quantity<U.Pressure{}>:
  S.component(scale, T.Slot{T.X{}, axis(momentum)}, matrix)

def from_samples(+scale: U.Positive<U.Pressure{}>, +momentum: Spatial, left: M.Matrix, middle: M.Matrix, right: M.Matrix) -> Faces:
  Faces{x_flux(scale, momentum, left), x_flux(scale, momentum, middle), x_flux(scale, momentum, right)}

# Conservative gain = -divergence = (left - right)/width.
# Swapped arguments deliberately reverse lesson 8's right-minus-left quotient.
def gain(width: U.Positive<U.Length{}>, left: U.Quantity<U.Pressure{}>, right: U.Quantity<U.Pressure{}>) -> U.Quantity<U.ForceDensity{}>:
  D.gradient(width, right, left)

def rates(+width: U.Positive<U.Length{}>, faces: Faces) -> Rates:
  match faces:
    case Faces{left, +middle, right}:
      a b = gain(width, left, middle) gain(width, middle, right)
      Rates{a, b}

def total(rates: Rates) -> U.Quantity<U.ForceDensity{}>:
  match rates:
    case Rates{left, right}:
      U.add(U.ForceDensity{}, left, right)

def boundary(width: U.Positive<U.Length{}>, faces: Faces) -> U.Quantity<U.ForceDensity{}>:
  match faces:
    case Faces{left, middle, right}:
      gain(width, left, right)
