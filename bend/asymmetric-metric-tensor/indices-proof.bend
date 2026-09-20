import Base
import ./indices-laws.bend as Laws
import ./tensor.bend as T
import ./rational.bend as R
import ./rational-laws.bend as RL
import ./rational-proof.bend as RP

def Laws.time_sign(a):
  {==}
def Laws.x_sign(a):
  {==}
def Laws.y_sign(a):
  {==}
def Laws.z_sign(a):
  {==}
def Laws.raise_contents(row,column,a):
  {==}
def Laws.upper_contents(slot,matrix):
  {==}
def Laws.raise_twice(slot,a):
  match slot:
    case T.Slot{T.T{},T.T{}}:
      Equal.trans(R.Q,R.negate(R.negate(R.negate(R.negate(a)))),R.negate(R.negate(a)),a,
        RL.negate_twice(R.negate(R.negate(a))),RL.negate_twice(a))
    case T.Slot{T.T{},T.X{}}:
      RL.negate_twice(a)
    case T.Slot{T.T{},T.Y{}}:
      RL.negate_twice(a)
    case T.Slot{T.T{},T.Z{}}:
      RL.negate_twice(a)
    case T.Slot{T.X{},T.T{}}:
      RL.negate_twice(a)
    case T.Slot{T.X{},T.X{}}:
      {==}
    case T.Slot{T.X{},T.Y{}}:
      {==}
    case T.Slot{T.X{},T.Z{}}:
      {==}
    case T.Slot{T.Y{},T.T{}}:
      RL.negate_twice(a)
    case T.Slot{T.Y{},T.X{}}:
      {==}
    case T.Slot{T.Y{},T.Y{}}:
      {==}
    case T.Slot{T.Y{},T.Z{}}:
      {==}
    case T.Slot{T.Z{},T.T{}}:
      RL.negate_twice(a)
    case T.Slot{T.Z{},T.X{}}:
      {==}
    case T.Slot{T.Z{},T.Y{}}:
      {==}
    case T.Slot{T.Z{},T.Z{}}:
      {==}
