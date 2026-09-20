import Base
import ./waves.bend as W
import ./batch.bend as B
import ./fields.bend as F
import ./operators.bend as O
import ./tensor.bend as T
import ./matrix.bend as M
import ./rational.bend as R
import ./units.bend as U

law box_contents:
  for +f: F.Expr
  for +n: Nat
  for +d: Nat
  {W.box(f,U.Positive{n,d}) == F.sub(O.laplacian(f),F.Mul{
    F.Const{R.mul(R.fraction(1n+d,n),R.fraction(1n+d,n))},F.second(f,T.T{})}) : F.Expr}
law traveling_fixture:
  R.IsZero(W.residual(M.Row{R.one(),R.fraction(3n,0n),R.zero(),R.zero()}))
law speed_mismatch_fixture:
  R.Same(F.eval(W.box(W.profile(R.fraction(2n,0n)),U.Positive{0n,0n}),F.origin()),
    R.negate(R.fraction(6n,0n)))
law superposition_fixture:
  R.Same(F.eval(W.box(F.Add{O.mixed(),F.square(F.Coord{T.T{}})},U.Positive{0n,0n}),
    M.Row{R.zero(),R.one(),R.one(),R.zero()}),R.fraction(2n,0n))
law split_fixture:
  R.Same(F.eval(W.box(F.Add{O.mixed(),F.square(F.Coord{T.T{}})},U.Positive{0n,0n}),
    M.Row{R.zero(),R.one(),R.one(),R.zero()}),
    R.add(F.eval(W.box(O.mixed(),U.Positive{0n,0n}),M.Row{R.zero(),R.one(),R.one(),R.zero()}),
      F.eval(W.box(F.square(F.Coord{T.T{}}),U.Positive{0n,0n}),M.Row{R.zero(),R.one(),R.one(),R.zero()})))
law map_identity:
  for +tree: B.Tree<R.Q>
  {B.map(~R.Q,~R.Q,~B.identity,tree) == tree : B.Tree<R.Q>}
law map_reading_leaf:
  for point: M.Row
  {B.map(~M.Row,~R.Q,~W.reading,B.Leaf{point}) == B.Leaf{W.reading(point)} : B.Tree<R.Q>}
law map_reading_fork:
  for left: B.Tree<M.Row>
  for right: B.Tree<M.Row>
  {B.map(~M.Row,~R.Q,~W.reading,B.Fork{left,right}) == B.Fork{
    B.map(~M.Row,~R.Q,~W.reading,left),B.map(~M.Row,~R.Q,~W.reading,right)} : B.Tree<R.Q>}
