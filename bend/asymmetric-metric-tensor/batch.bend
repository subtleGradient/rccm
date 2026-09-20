import Base
import ./rational.bend as R
import ./matrix.bend as M

# Shape is explicit; the caller chooses balanced equal-work trees.
type Tree<-A: Data> is Data:
  Leaf{value: A}
  Fork{left: Tree<A>, right: Tree<A>}

def map(~A: Data, ~B: Data, ~f: A -> B, tree: Tree<A>) -> Tree<B>:
  match tree:
    case Leaf{value}:
      Leaf{f(value)}
    case Fork{left,right}:
      a b = map(~A,~B,~f,left) map(~A,~B,~f,right)
      Fork{a,b}

def identity(value: R.Q) -> R.Q:
  value

def points() -> Tree<M.Row>:
  Fork{
    Fork{Leaf{M.Row{R.zero(),R.zero(),R.zero(),R.zero()}},
      Leaf{M.Row{R.zero(),R.one(),R.zero(),R.zero()}}},
    Fork{Leaf{M.Row{R.one(),R.one(),R.zero(),R.zero()}},
      Leaf{M.Row{R.one(),R.fraction(3n,0n),R.zero(),R.zero()}}}}
