import Base
import ./tensor.bend as T
import ./matrix.bend as M
import ./indices.bend as I
import ./probes.bend as P
import ./rational.bend as R
import ./capacity.bend as C

def row(+axis: T.Axis, a: M.Row, b: M.Row) -> R.Q:
  match a b:
    case M.Row{at,ax,ay,az} M.Row{bt,bx,by,bz}:
      P.sum4(R.mul(at,I.raise(T.Slot{axis,T.T{}},bt)),
        R.mul(ax,I.raise(T.Slot{axis,T.X{}},bx)),
        R.mul(ay,I.raise(T.Slot{axis,T.Y{}},by)),
        R.mul(az,I.raise(T.Slot{axis,T.Z{}},bz)))

def contract(a: M.Matrix, b: M.Matrix) -> R.Q:
  match a b:
    case M.Matrix{at,ax,ay,az} M.Matrix{bt,bx,by,bz}:
      t x = row(T.T{},at,bt) row(T.X{},ax,bx)
      y z = row(T.Y{},ay,by) row(T.Z{},az,bz)
      P.sum4(t,x,y,z)

# A mirrored symmetric/antisymmetric pair, after their common metric sign.
def cross_pair(+a: R.Q, +s: R.Q) -> R.Q:
  R.add(R.mul(a,s),R.mul(R.negate(a),s))

def fixture(ex: R.Q, bz: R.Q) -> M.Sample:
  M.Sample{C.Regular{0n,0n},ex,R.zero(),R.zero(),R.zero(),R.zero(),bz}
