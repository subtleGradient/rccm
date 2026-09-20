import Base
import ./waves-laws.bend as Laws
import ./batch.bend as B
import ./rational.bend as R

def Laws.box_contents(f,n,d):
  {==}
def Laws.traveling_fixture():
  {==}
def Laws.speed_mismatch_fixture():
  {==}
def Laws.superposition_fixture():
  {==}
def Laws.split_fixture():
  {==}
def Laws.map_identity(tree):
  match tree:
    case B.Leaf{value}:
      {==}
    case B.Fork{left,right}:
      %Equal.sym(B.Tree<R.Q>,B.map(~R.Q,~R.Q,~B.identity,left),left,Laws.map_identity(left)) :
        {B.Fork{_,B.map(~R.Q,~R.Q,~B.identity,right)}
        == B.Fork{left,right} : B.Tree<R.Q>}
      %Equal.sym(B.Tree<R.Q>,B.map(~R.Q,~R.Q,~B.identity,right),right,Laws.map_identity(right)) :
        {B.Fork{left,_} == B.Fork{left,right} : B.Tree<R.Q>}
      {==}
def Laws.map_reading_leaf(point):
  {==}
def Laws.map_reading_fork(left,right):
  {==}
