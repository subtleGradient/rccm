import Base
import ./contraction.bend as C
import ./indices.bend as I
import ./tensor.bend as T
import ./matrix.bend as M
import ./probes.bend as P
import ./rational.bend as R

law row_contents:
  for +axis: T.Axis
  for at: R.Q
  for ax: R.Q
  for ay: R.Q
  for az: R.Q
  for bt: R.Q
  for bx: R.Q
  for by: R.Q
  for bz: R.Q
  {C.row(axis,M.Row{at,ax,ay,az},M.Row{bt,bx,by,bz}) == P.sum4(
    R.mul(at,I.raise(T.Slot{axis,T.T{}},bt)),R.mul(ax,I.raise(T.Slot{axis,T.X{}},bx)),
    R.mul(ay,I.raise(T.Slot{axis,T.Y{}},by)),R.mul(az,I.raise(T.Slot{axis,T.Z{}},bz))) : R.Q}
law contraction_contents:
  for at: M.Row
  for ax: M.Row
  for ay: M.Row
  for az: M.Row
  for bt: M.Row
  for bx: M.Row
  for by: M.Row
  for bz: M.Row
  {C.contract(M.Matrix{at,ax,ay,az},M.Matrix{bt,bx,by,bz}) == P.sum4(
    C.row(T.T{},at,bt),C.row(T.X{},ax,bx),C.row(T.Y{},ay,by),C.row(T.Z{},az,bz)) : R.Q}
law cross_pair_contents:
  for +a: R.Q
  for +s: R.Q
  {C.cross_pair(a,s) == R.add(R.mul(a,s),R.mul(R.negate(a),s)) : R.Q}
law cross_pair_zero:
  for +a: R.Q
  for +s: R.Q
  R.IsZero(C.cross_pair(a,s))
law slip_fixture:
  R.Same(C.contract(M.antisymmetric(C.fixture(R.one(),R.zero())),
    M.antisymmetric(C.fixture(R.one(),R.zero()))),R.negate(R.fraction(2n,0n)))
law twist_fixture:
  R.Same(C.contract(M.antisymmetric(C.fixture(R.zero(),R.one())),
    M.antisymmetric(C.fixture(R.zero(),R.one()))),R.fraction(2n,0n))
law full_fixture:
  R.Same(C.contract(M.assemble(C.fixture(R.fraction(2n,0n),R.fraction(3n,0n))),
    M.assemble(C.fixture(R.fraction(2n,0n),R.fraction(3n,0n)))),R.fraction(14n,0n))
law orthogonal_fixture:
  R.IsZero(C.contract(M.symmetric(C.fixture(R.fraction(2n,0n),R.fraction(3n,0n))),
    M.antisymmetric(C.fixture(R.fraction(2n,0n),R.fraction(3n,0n)))))
law split_fixture:
  R.Same(C.contract(M.assemble(C.fixture(R.fraction(2n,0n),R.fraction(3n,0n))),
    M.assemble(C.fixture(R.fraction(2n,0n),R.fraction(3n,0n)))),
    R.add(C.contract(M.symmetric(C.fixture(R.fraction(2n,0n),R.fraction(3n,0n))),
      M.symmetric(C.fixture(R.fraction(2n,0n),R.fraction(3n,0n)))),
      C.contract(M.antisymmetric(C.fixture(R.fraction(2n,0n),R.fraction(3n,0n))),
      M.antisymmetric(C.fixture(R.fraction(2n,0n),R.fraction(3n,0n))))))
