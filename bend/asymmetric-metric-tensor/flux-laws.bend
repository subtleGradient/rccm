import Base
import ./rational.bend as R
import ./units.bend as U
import ./tensor.bend as T
import ./matrix.bend as M
import ./stress.bend as S
import ./flux.bend as F

law axis_x:
  {F.axis(F.X{}) == T.X{} : T.Axis}
law axis_y:
  {F.axis(F.Y{}) == T.Y{} : T.Axis}
law axis_z:
  {F.axis(F.Z{}) == T.Z{} : T.Axis}

law transport_row:
  for scale: U.Positive<U.Pressure{}>
  for momentum: F.Spatial
  for matrix: M.Matrix
  {F.x_flux(scale, momentum, matrix)
    == S.component(scale, T.Slot{T.X{}, F.axis(momentum)}, matrix) : U.Quantity<U.Pressure{}>}

law sampled_faces:
  for +scale: U.Positive<U.Pressure{}>
  for +momentum: F.Spatial
  for left: M.Matrix
  for middle: M.Matrix
  for right: M.Matrix
  {F.from_samples(scale, momentum, left, middle, right) == F.Faces{
    F.x_flux(scale, momentum, left), F.x_flux(scale, momentum, middle), F.x_flux(scale, momentum, right)} : F.Faces}

law gain_contents:
  for n: Nat
  for d: Nat
  for left: R.Q
  for right: R.Q
  {U.value(U.ForceDensity{}, F.gain(U.Positive{n, d}, U.Measure{left}, U.Measure{right}))
    == R.mul(R.fraction(1n+d, n), R.sub(left, right)) : R.Q}

law both_cells:
  for +width: U.Positive<U.Length{}>
  for left: U.Quantity<U.Pressure{}>
  for +middle: U.Quantity<U.Pressure{}>
  for right: U.Quantity<U.Pressure{}>
  {F.rates(width, F.Faces{left, middle, right})
    == F.Rates{F.gain(width, left, middle), F.gain(width, middle, right)} : F.Rates}

law total_contents:
  for left: R.Q
  for right: R.Q
  {U.value(U.ForceDensity{}, F.total(F.Rates{U.Measure{left}, U.Measure{right}}))
    == R.add(left, right) : R.Q}

law boundary_contents:
  for width: U.Positive<U.Length{}>
  for left: U.Quantity<U.Pressure{}>
  for middle: U.Quantity<U.Pressure{}>
  for right: U.Quantity<U.Pressure{}>
  {F.boundary(width, F.Faces{left, middle, right})
    == F.gain(width, left, right) : U.Quantity<U.ForceDensity{}>}

# Quantifies over arbitrary signed face values, not just closed boundaries.
law shared_face_cancels:
  for +width: U.Positive<U.Length{}>
  for +faces: F.Faces
  R.Same(U.value(U.ForceDensity{}, F.total(F.rates(width, faces))),
    U.value(U.ForceDensity{}, F.boundary(width, faces)))
