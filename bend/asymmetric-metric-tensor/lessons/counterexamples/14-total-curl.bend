import Base
import ../../clebsch.bend as C
import ../../fields.bend as F
import ../../rational.bend as R
import ../../matrix.bend as M
import ../../tensor.bend as T

def total_is_internal() -> R.Same(M.row_at(T.Z{}, C.eval(C.curl(C.velocity(F.Const{R.zero()},
    C.transverse_fixture(), C.lambda_fixture(), C.beta_fixture())), C.point_fixture())), R.negate(R.one())):
  {==}
