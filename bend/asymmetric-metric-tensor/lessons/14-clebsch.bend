import Base
import ../clebsch.bend as C
import ../fields.bend as F
import ../rational.bend as R
import ../matrix.bend as M
import ../format.bend as Format

def show(label: String, row: M.Row) -> IO(Unit):
  match row:
    case M.Row{t,x,y,z}:
      IO.print(label ++ "=(" ++ Format.show(x) ++ "," ++ Format.show(y) ++ "," ++ Format.show(z) ++ ")")

def main() -> IO(Unit):
  do IO<Unit>:
    IO.print("lambda=x+y; beta=x*z; point (x,y,z)=(1,0,1)")
    show("grad lambda cross grad beta", C.eval(C.omega(C.lambda_fixture(), C.beta_fixture()), C.point_fixture()))
    show("curl rotational", C.eval(C.curl(C.rotational(C.lambda_fixture(), C.beta_fixture())), C.point_fixture()))
    show("curl total with transverse=(0,2x,0)", C.eval(C.curl(C.velocity(F.Const{R.zero()},
      C.transverse_fixture(), C.lambda_fixture(), C.beta_fixture())), C.point_fixture()))
