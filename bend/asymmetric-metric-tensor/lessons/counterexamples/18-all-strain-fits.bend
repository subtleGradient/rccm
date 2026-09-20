import Base
import ../../compatibility.bend as C
import ../../fields.bend as F
import ../../rational.bend as R

def every_strain_is_compatible() -> R.IsZero(F.eval(C.inc(C.incompatible()),F.origin())):
  {==}
