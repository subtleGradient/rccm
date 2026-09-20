import Base
import ./tensor.bend as Tensor
import ./capacity.bend as Capacity
import ./matrix.bend as M
import ./matrix-laws.bend as Laws
import ./rational.bend as R
import ./rational-proof.bend as RP
import ./rational-laws.bend as RL

def Laws.component_table(sample, slot):
  match sample:
    case M.Sample{capacity, ex, ey, ez, bx, by, bz}:
      match slot:
        case Tensor.Slot{Tensor.T{}, Tensor.T{}}:
          {==}
        case Tensor.Slot{Tensor.T{}, Tensor.X{}}:
          {==}
        case Tensor.Slot{Tensor.T{}, Tensor.Y{}}:
          {==}
        case Tensor.Slot{Tensor.T{}, Tensor.Z{}}:
          {==}
        case Tensor.Slot{Tensor.X{}, Tensor.T{}}:
          {==}
        case Tensor.Slot{Tensor.X{}, Tensor.X{}}:
          {==}
        case Tensor.Slot{Tensor.X{}, Tensor.Y{}}:
          {==}
        case Tensor.Slot{Tensor.X{}, Tensor.Z{}}:
          {==}
        case Tensor.Slot{Tensor.Y{}, Tensor.T{}}:
          {==}
        case Tensor.Slot{Tensor.Y{}, Tensor.X{}}:
          {==}
        case Tensor.Slot{Tensor.Y{}, Tensor.Y{}}:
          {==}
        case Tensor.Slot{Tensor.Y{}, Tensor.Z{}}:
          {==}
        case Tensor.Slot{Tensor.Z{}, Tensor.T{}}:
          {==}
        case Tensor.Slot{Tensor.Z{}, Tensor.X{}}:
          {==}
        case Tensor.Slot{Tensor.Z{}, Tensor.Y{}}:
          {==}
        case Tensor.Slot{Tensor.Z{}, Tensor.Z{}}:
          {==}

def Laws.transpose_at(matrix, slot):
  match matrix:
    case M.Matrix{M.Row{tt, tx, ty, tz}, M.Row{xt, xx, xy, xz}, M.Row{yt, yx, yy, yz}, M.Row{zt, zx, zy, zz}}:
      match slot:
        case Tensor.Slot{Tensor.T{}, Tensor.T{}}:
          {==}
        case Tensor.Slot{Tensor.T{}, Tensor.X{}}:
          {==}
        case Tensor.Slot{Tensor.T{}, Tensor.Y{}}:
          {==}
        case Tensor.Slot{Tensor.T{}, Tensor.Z{}}:
          {==}
        case Tensor.Slot{Tensor.X{}, Tensor.T{}}:
          {==}
        case Tensor.Slot{Tensor.X{}, Tensor.X{}}:
          {==}
        case Tensor.Slot{Tensor.X{}, Tensor.Y{}}:
          {==}
        case Tensor.Slot{Tensor.X{}, Tensor.Z{}}:
          {==}
        case Tensor.Slot{Tensor.Y{}, Tensor.T{}}:
          {==}
        case Tensor.Slot{Tensor.Y{}, Tensor.X{}}:
          {==}
        case Tensor.Slot{Tensor.Y{}, Tensor.Y{}}:
          {==}
        case Tensor.Slot{Tensor.Y{}, Tensor.Z{}}:
          {==}
        case Tensor.Slot{Tensor.Z{}, Tensor.T{}}:
          {==}
        case Tensor.Slot{Tensor.Z{}, Tensor.X{}}:
          {==}
        case Tensor.Slot{Tensor.Z{}, Tensor.Y{}}:
          {==}
        case Tensor.Slot{Tensor.Z{}, Tensor.Z{}}:
          {==}

def Laws.symmetric_transpose(sample):
  match sample:
    case M.Sample{capacity, ex, ey, ez, bx, by, bz}:
      {==}

def Laws.antisymmetric_transpose(sample):
  match sample:
    case M.Sample{capacity, R.Fraction{ep, en, ed}, R.Fraction{fp, fn, fd}, R.Fraction{gp, gn, gd}, R.Fraction{bp, bn, bd}, R.Fraction{cp, cn, cd}, R.Fraction{dp, dn, dd}}:
      {==}

def Laws.assembled_sum(sample, slot):
  match sample:
    case M.Sample{capacity, ex, ey, ez, bx, by, bz}:
      match slot:
        case Tensor.Slot{Tensor.T{}, Tensor.T{}}:
          RL.add_zero_right(R.negate(Capacity.q(capacity)))
        case Tensor.Slot{Tensor.T{}, Tensor.X{}}:
          RL.add_zero_left(R.negate(ex))
        case Tensor.Slot{Tensor.T{}, Tensor.Y{}}:
          RL.add_zero_left(R.negate(ey))
        case Tensor.Slot{Tensor.T{}, Tensor.Z{}}:
          RL.add_zero_left(R.negate(ez))
        case Tensor.Slot{Tensor.X{}, Tensor.T{}}:
          RL.add_zero_left(ex)
        case Tensor.Slot{Tensor.X{}, Tensor.X{}}:
          RL.add_zero_right(Capacity.inverse(capacity))
        case Tensor.Slot{Tensor.X{}, Tensor.Y{}}:
          RL.add_zero_left(R.negate(bz))
        case Tensor.Slot{Tensor.X{}, Tensor.Z{}}:
          RL.add_zero_left(by)
        case Tensor.Slot{Tensor.Y{}, Tensor.T{}}:
          RL.add_zero_left(ey)
        case Tensor.Slot{Tensor.Y{}, Tensor.X{}}:
          RL.add_zero_left(bz)
        case Tensor.Slot{Tensor.Y{}, Tensor.Y{}}:
          RL.add_zero_right(Capacity.inverse(capacity))
        case Tensor.Slot{Tensor.Y{}, Tensor.Z{}}:
          RL.add_zero_left(R.negate(bx))
        case Tensor.Slot{Tensor.Z{}, Tensor.T{}}:
          RL.add_zero_left(ez)
        case Tensor.Slot{Tensor.Z{}, Tensor.X{}}:
          RL.add_zero_left(R.negate(by))
        case Tensor.Slot{Tensor.Z{}, Tensor.Y{}}:
          RL.add_zero_left(bx)
        case Tensor.Slot{Tensor.Z{}, Tensor.Z{}}:
          RL.add_zero_right(Capacity.inverse(capacity))

def Laws.unloaded():
  {==}
