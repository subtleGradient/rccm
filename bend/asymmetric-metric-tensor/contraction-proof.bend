import Base
import ./contraction-laws.bend as Laws
import ./rational.bend as R
import ./rational-laws.bend as RL
import ./rational-proof.bend as RP

def Laws.row_contents(axis,at,ax,ay,az,bt,bx,by,bz):
  {==}
def Laws.contraction_contents(at,ax,ay,az,bt,bx,by,bz):
  {==}
def Laws.cross_pair_contents(a,s):
  {==}
def Laws.cross_pair_zero(a,s):
  +term = R.mul(a,s)
  %Equal.sym(R.Q,R.mul(R.negate(a),s),R.negate(term),RL.mul_neg_left(a,s)) :
    R.IsZero(R.add(term,_))
  RL.sub_equal(term,term,{==})
def Laws.slip_fixture():
  {==}
def Laws.twist_fixture():
  {==}
def Laws.full_fixture():
  {==}
def Laws.orthogonal_fixture():
  {==}
def Laws.split_fixture():
  {==}
