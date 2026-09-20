import Base
import ./fields.bend as F
import ./clebsch.bend as C
import ./tensor.bend as T
import ./matrix.bend as M
import ./rational.bend as R

law cross_contents:
  for +x: F.Expr
  for +y: F.Expr
  for +z: F.Expr
  for +u: F.Expr
  for +v: F.Expr
  for +w: F.Expr
  {C.cross(C.Vector{x,y,z}, C.Vector{u,v,w}) == C.Vector{
    F.sub(F.Mul{y,w}, F.Mul{z,v}), F.sub(F.Mul{z,u}, F.Mul{x,w}),
    F.sub(F.Mul{x,v}, F.Mul{y,u})} : C.Vector}
law curl_contents:
  for +x: F.Expr
  for +y: F.Expr
  for +z: F.Expr
  {C.curl(C.Vector{x,y,z}) == C.Vector{
    F.sub(F.diff(z,T.Y{}),F.diff(y,T.Z{})),
    F.sub(F.diff(x,T.Z{}),F.diff(z,T.X{})),
    F.sub(F.diff(y,T.X{}),F.diff(x,T.Y{}))} : C.Vector}
law gradient_contents:
  for +f: F.Expr
  {C.gradient(f) == C.Vector{F.diff(f,T.X{}),F.diff(f,T.Y{}),F.diff(f,T.Z{})} : C.Vector}
law curl_fixture_x:
  R.Same(M.row_at(T.X{}, C.eval(C.curl(C.rotational(C.lambda_fixture(), C.beta_fixture())),
    C.point_fixture())), R.one())
law curl_fixture_y:
  R.Same(M.row_at(T.Y{}, C.eval(C.curl(C.rotational(C.lambda_fixture(), C.beta_fixture())),
    C.point_fixture())), R.negate(R.one()))
law curl_fixture_z:
  R.Same(M.row_at(T.Z{}, C.eval(C.curl(C.rotational(C.lambda_fixture(), C.beta_fixture())),
    C.point_fixture())), R.negate(R.one()))
law two_routes_fixture:
  for +axis: T.Axis
  R.Same(M.row_at(axis, C.eval(C.omega(C.lambda_fixture(), C.beta_fixture()), C.point_fixture())),
    M.row_at(axis, C.eval(C.curl(C.rotational(C.lambda_fixture(), C.beta_fixture())), C.point_fixture())))
