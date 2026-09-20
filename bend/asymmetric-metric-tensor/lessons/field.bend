import Base
import ../capacity.bend as C
import ../matrix.bend as M
import ../rational.bend as R
import ../units.bend as U
import ../flux.bend as F

# Algebraic face fixture, not a velocity/pressure closure.
def twist() -> M.Matrix:
  M.assemble(M.Sample{C.Regular{0n, 0n},
    R.zero(), R.zero(), R.zero(), R.zero(), R.zero(), R.one()})

# T_xy = -P_c*b_z: faces 0, -2, 0 Pa for y-momentum transported along x.
def closed_faces() -> F.Faces:
  F.from_samples(U.Positive{1n, 0n}, F.Y{},
    M.assemble(M.vacuum()), twist(), M.assemble(M.vacuum()))

def open_faces() -> F.Faces:
  F.Faces{U.Measure{R.fraction(3n, 0n)}, U.Measure{R.one()}, U.Measure{R.zero()}}
