import Base
import ./natural-proof.bend as N
import ./rational-proof.bend as RP
import ./rational.bend as R

# Constructive polynomial certificates over Nat. Sorting only chooses a
# canonical order; its correctness needs no assumption about the comparator.
# Each certificate is checked by reduction, then transported through soundness.
type Ns is Data:
  End{}
  Link{head: Nat, rest: Ns}

type Poly is Data:
  PEnd{}
  Term{head: Ns, rest: Poly}

type Expr is Data:
  Var{index: Nat}
  Plus{left: Expr, right: Expr}
  Times{left: Expr, right: Expr}

def lookup(i: Nat, xs: Ns) -> Nat:
  match i xs:
    case 0n End{}:
      0n
    case 0n Link{h, t}:
      h
    case 1n+j End{}:
      0n
    case 1n+j Link{h, t}:
      lookup(j, t)

def value(e: Expr, +xs: Ns) -> Nat:
  match e:
    case Var{i}:
      lookup(i, xs)
    case Plus{a, b}:
      Nat.add(value(a, xs), value(b, xs))
    case Times{a, b}:
      Nat.mul(value(a, xs), value(b, xs))

def product(m: Ns, +xs: Ns) -> Nat:
  match m:
    case End{}:
      1n
    case Link{h, t}:
      Nat.mul(lookup(h, xs), product(t, xs))

def total(p: Poly, +xs: Ns) -> Nat:
  match p:
    case PEnd{}:
      0n
    case Term{h, t}:
      Nat.add(product(h, xs), total(t, xs))

def le(a: Nat, b: Nat) -> Bool:
  Nat.is_le(a, b)

def choose_b(b: Bool, yes: Bool, no: Bool) -> Bool:
  match b:
    case True{}:
      yes
    case False{}:
      no

def lex(a: Ns, b: Ns) -> Bool:
  match a b:
    case End{} End{}:
      True{}
    case End{} Link{h, t}:
      True{}
    case Link{h, t} End{}:
      False{}
    case Link{+h, t} Link{+k, u}:
      choose_b(le(h, k), choose_b(le(k, h), lex(t, u), True{}), False{})

def choose_n(b: Bool, yes: Ns, no: Ns) -> Ns:
  match b:
    case True{}:
      yes
    case False{}:
      no

def insert_n(+i: Nat, m: Ns) -> Ns:
  match m:
    case End{}:
      Link{i, End{}}
    case Link{+h, +t}:
      choose_n(le(i, h), Link{i, Link{h, t}}, Link{h, insert_n(i, t)})

def join_n(a: Ns, b: Ns) -> Ns:
  match a:
    case End{}:
      b
    case Link{h, t}:
      insert_n(h, join_n(t, b))

def choose_p(b: Bool, yes: Poly, no: Poly) -> Poly:
  match b:
    case True{}:
      yes
    case False{}:
      no

def insert_p(+m: Ns, p: Poly) -> Poly:
  match p:
    case PEnd{}:
      Term{m, PEnd{}}
    case Term{+h, +t}:
      choose_p(lex(m, h), Term{m, Term{h, t}}, Term{h, insert_p(m, t)})

def join_p(a: Poly, b: Poly) -> Poly:
  match a:
    case PEnd{}:
      b
    case Term{h, t}:
      insert_p(h, join_p(t, b))

def scale(+m: Ns, p: Poly) -> Poly:
  match p:
    case PEnd{}:
      PEnd{}
    case Term{h, t}:
      insert_p(join_n(m, h), scale(m, t))

def times(a: Poly, +b: Poly) -> Poly:
  match a:
    case PEnd{}:
      PEnd{}
    case Term{h, t}:
      join_p(scale(h, b), times(t, b))

def normal(e: Expr) -> Poly:
  match e:
    case Var{i}:
      Term{Link{i, End{}}, PEnd{}}
    case Plus{a, b}:
      join_p(normal(a), normal(b))
    case Times{a, b}:
      times(normal(a), normal(b))

def mul_swap(+a: Nat, +b: Nat, +c: Nat) -> {Nat.mul(a, Nat.mul(b, c)) == Nat.mul(b, Nat.mul(a, c)) : Nat}:
  Equal.trans(Nat, Nat.mul(a, Nat.mul(b, c)), Nat.mul(Nat.mul(a, b), c), Nat.mul(b, Nat.mul(a, c)),
    N.sym(Nat.mul(Nat.mul(a, b), c), Nat.mul(a, Nat.mul(b, c)), N.mul_assoc(a, b, c)),
    Equal.trans(Nat, Nat.mul(Nat.mul(a, b), c), Nat.mul(Nat.mul(b, a), c), Nat.mul(b, Nat.mul(a, c)),
      Equal.cong(Nat, Nat, x => Nat.mul(x, c), Nat.mul(a, b), Nat.mul(b, a), N.mul_comm(a, b)),
      N.mul_assoc(b, a, c)))

def choose_n_sound(b: Bool, +yes: Ns, +no: Ns, +xs: Ns, +v: Nat,
    y: {product(yes, xs) == v : Nat}, n: {product(no, xs) == v : Nat}) -> {product(choose_n(b, yes, no), xs) == v : Nat}:
  match b:
    case True{}:
      y
    case False{}:
      n

def insert_n_sound(+i: Nat, m: Ns, +xs: Ns) -> {product(insert_n(i, m), xs) == Nat.mul(lookup(i, xs), product(m, xs)) : Nat}:
  match m:
    case End{}:
      {==}
    case Link{+h, +t}:
      choose_n_sound(le(i, h), Link{i, Link{h, t}}, Link{h, insert_n(i, t)}, xs,
        Nat.mul(lookup(i, xs), Nat.mul(lookup(h, xs), product(t, xs))), {==},
        Equal.trans(Nat, Nat.mul(lookup(h, xs), product(insert_n(i, t), xs)),
          Nat.mul(lookup(h, xs), Nat.mul(lookup(i, xs), product(t, xs))),
          Nat.mul(lookup(i, xs), Nat.mul(lookup(h, xs), product(t, xs))),
          Equal.cong(Nat, Nat, x => Nat.mul(lookup(h, xs), x),
            product(insert_n(i, t), xs), Nat.mul(lookup(i, xs), product(t, xs)), insert_n_sound(i, t, xs)),
          mul_swap(lookup(h, xs), lookup(i, xs), product(t, xs))))

def join_n_sound(a: Ns, +b: Ns, +xs: Ns) -> {product(join_n(a, b), xs) == Nat.mul(product(a, xs), product(b, xs)) : Nat}:
  match a:
    case End{}:
      N.sym(Nat.add(product(b, xs), 0n), product(b, xs), N.add_zero(product(b, xs)))
    case Link{+h, +t}:
      %N.sym(product(insert_n(h, join_n(t, b)), xs), Nat.mul(lookup(h, xs), product(join_n(t, b), xs)), insert_n_sound(h, join_n(t, b), xs)) : {_ == Nat.mul(product(Link{h, t}, xs), product(b, xs)) : Nat}
      %N.sym(product(join_n(t, b), xs), Nat.mul(product(t, xs), product(b, xs)), join_n_sound(t, b, xs)) : {Nat.mul(lookup(h, xs), _) == Nat.mul(product(Link{h, t}, xs), product(b, xs)) : Nat}
      N.sym(Nat.mul(Nat.mul(lookup(h, xs), product(t, xs)), product(b, xs)), Nat.mul(lookup(h, xs), Nat.mul(product(t, xs), product(b, xs))), N.mul_assoc(lookup(h, xs), product(t, xs), product(b, xs)))

def choose_p_sound(b: Bool, +yes: Poly, +no: Poly, +xs: Ns, +v: Nat,
    y: {total(yes, xs) == v : Nat}, n: {total(no, xs) == v : Nat}) -> {total(choose_p(b, yes, no), xs) == v : Nat}:
  match b:
    case True{}:
      y
    case False{}:
      n

def insert_p_sound(+m: Ns, p: Poly, +xs: Ns) -> {total(insert_p(m, p), xs) == Nat.add(product(m, xs), total(p, xs)) : Nat}:
  match p:
    case PEnd{}:
      {==}
    case Term{+h, +t}:
      choose_p_sound(lex(m, h), Term{m, Term{h, t}}, Term{h, insert_p(m, t)}, xs,
        Nat.add(product(m, xs), Nat.add(product(h, xs), total(t, xs))), {==},
        Equal.trans(Nat, Nat.add(product(h, xs), total(insert_p(m, t), xs)),
          Nat.add(product(h, xs), Nat.add(product(m, xs), total(t, xs))),
          Nat.add(product(m, xs), Nat.add(product(h, xs), total(t, xs))),
          Equal.cong(Nat, Nat, x => Nat.add(product(h, xs), x),
            total(insert_p(m, t), xs), Nat.add(product(m, xs), total(t, xs)), insert_p_sound(m, t, xs)),
          N.add_swap(product(h, xs), product(m, xs), total(t, xs))))

def join_p_sound(a: Poly, +b: Poly, +xs: Ns) -> {total(join_p(a, b), xs) == Nat.add(total(a, xs), total(b, xs)) : Nat}:
  match a:
    case PEnd{}:
      {==}
    case Term{+h, +t}:
      %N.sym(total(insert_p(h, join_p(t, b)), xs), Nat.add(product(h, xs), total(join_p(t, b), xs)), insert_p_sound(h, join_p(t, b), xs)) : {_ == Nat.add(total(Term{h, t}, xs), total(b, xs)) : Nat}
      %N.sym(total(join_p(t, b), xs), Nat.add(total(t, xs), total(b, xs)), join_p_sound(t, b, xs)) : {Nat.add(product(h, xs), _) == Nat.add(total(Term{h, t}, xs), total(b, xs)) : Nat}
      N.sym(Nat.add(Nat.add(product(h, xs), total(t, xs)), total(b, xs)), Nat.add(product(h, xs), Nat.add(total(t, xs), total(b, xs))), N.add_assoc(product(h, xs), total(t, xs), total(b, xs)))

def scale_sound(+m: Ns, p: Poly, +xs: Ns) -> {total(scale(m, p), xs) == Nat.mul(product(m, xs), total(p, xs)) : Nat}:
  match p:
    case PEnd{}:
      N.sym(Nat.mul(product(m, xs), 0n), 0n, N.mul_zero(product(m, xs)))
    case Term{+h, +t}:
      %N.sym(total(insert_p(join_n(m, h), scale(m, t)), xs), Nat.add(product(join_n(m, h), xs), total(scale(m, t), xs)), insert_p_sound(join_n(m, h), scale(m, t), xs)) : {_ == Nat.mul(product(m, xs), total(Term{h, t}, xs)) : Nat}
      %N.sym(product(join_n(m, h), xs), Nat.mul(product(m, xs), product(h, xs)), join_n_sound(m, h, xs)) : {Nat.add(_, total(scale(m, t), xs)) == Nat.mul(product(m, xs), total(Term{h, t}, xs)) : Nat}
      %N.sym(total(scale(m, t), xs), Nat.mul(product(m, xs), total(t, xs)), scale_sound(m, t, xs)) : {Nat.add(Nat.mul(product(m, xs), product(h, xs)), _) == Nat.mul(product(m, xs), total(Term{h, t}, xs)) : Nat}
      N.sym(Nat.mul(product(m, xs), Nat.add(product(h, xs), total(t, xs))), Nat.add(Nat.mul(product(m, xs), product(h, xs)), Nat.mul(product(m, xs), total(t, xs))), N.mul_add(product(m, xs), product(h, xs), total(t, xs)))

def times_sound(a: Poly, +b: Poly, +xs: Ns) -> {total(times(a, b), xs) == Nat.mul(total(a, xs), total(b, xs)) : Nat}:
  match a:
    case PEnd{}:
      {==}
    case Term{+h, +t}:
      %N.sym(total(join_p(scale(h, b), times(t, b)), xs), Nat.add(total(scale(h, b), xs), total(times(t, b), xs)), join_p_sound(scale(h, b), times(t, b), xs)) : {_ == Nat.mul(total(Term{h, t}, xs), total(b, xs)) : Nat}
      %N.sym(total(scale(h, b), xs), Nat.mul(product(h, xs), total(b, xs)), scale_sound(h, b, xs)) : {Nat.add(_, total(times(t, b), xs)) == Nat.mul(total(Term{h, t}, xs), total(b, xs)) : Nat}
      %N.sym(total(times(t, b), xs), Nat.mul(total(t, xs), total(b, xs)), times_sound(t, b, xs)) : {Nat.add(Nat.mul(product(h, xs), total(b, xs)), _) == Nat.mul(total(Term{h, t}, xs), total(b, xs)) : Nat}
      N.sym(Nat.mul(Nat.add(product(h, xs), total(t, xs)), total(b, xs)), Nat.add(Nat.mul(product(h, xs), total(b, xs)), Nat.mul(total(t, xs), total(b, xs))), N.add_mul(product(h, xs), total(t, xs), total(b, xs)))

def sound(e: Expr, +xs: Ns) -> {total(normal(e), xs) == value(e, xs) : Nat}:
  match e:
    case Var{i}:
      RP.numerator_one(lookup(i, xs))
    case Plus{+a, +b}:
      Equal.trans(Nat, total(join_p(normal(a), normal(b)), xs), Nat.add(total(normal(a), xs), total(normal(b), xs)), Nat.add(value(a, xs), value(b, xs)),
        join_p_sound(normal(a), normal(b), xs),
        RP.add_cong(total(normal(a), xs), value(a, xs), total(normal(b), xs), value(b, xs), sound(a, xs), sound(b, xs)))
    case Times{+a, +b}:
      %N.sym(total(times(normal(a), normal(b)), xs), Nat.mul(total(normal(a), xs), total(normal(b), xs)), times_sound(normal(a), normal(b), xs)) : {_ == Nat.mul(value(a, xs), value(b, xs)) : Nat}
      %sound(a, xs) : {Nat.mul(total(normal(a), xs), total(normal(b), xs)) == Nat.mul(_, value(b, xs)) : Nat}
      %sound(b, xs) : {Nat.mul(total(normal(a), xs), total(normal(b), xs)) == Nat.mul(total(normal(a), xs), _) : Nat}
      {==}

def certify(+a: Expr, +b: Expr, +xs: Ns, e: {normal(a) == normal(b) : Poly}) -> {value(a, xs) == value(b, xs) : Nat}:
  Equal.trans(Nat, value(a, xs), total(normal(a), xs), value(b, xs),
    N.sym(total(normal(a), xs), value(a, xs), sound(a, xs)),
    Equal.trans(Nat, total(normal(a), xs), total(normal(b), xs), value(b, xs),
      Equal.cong(Poly, Nat, p => total(p, xs), normal(a), normal(b), e),
      sound(b, xs)))

# A three-field view uses the TRUE denominator, avoiding an exponential
# expansion of predecessor products when checking the balance certificates.
type View is Data:
  V{p: Nat, n: Nat, d: Nat}

type Formula is Data:
  F{p: Expr, n: Expr, d: Expr}

def observe(a: R.Q) -> View:
  match a:
    case R.Fraction{p, n, d}:
      V{p, n, 1n+d}

def read(f: Formula, +xs: Ns) -> View:
  match f:
    case F{p, n, d}:
      V{value(p, xs), value(n, xs), value(d, xs)}

def atom(+i: Nat) -> Formula:
  F{Var{i}, Var{1n+i}, Var{2n+i}}

def fadd(a: Formula, b: Formula) -> Formula:
  match a b:
    case F{p, n, +d} F{r, s, +e}:
      F{Plus{Times{p, e}, Times{r, d}}, Plus{Times{n, e}, Times{s, d}}, Times{d, e}}

def fneg(a: Formula) -> Formula:
  match a:
    case F{p, n, d}:
      F{n, p, d}

def fsub(a: Formula, b: Formula) -> Formula:
  fadd(a, fneg(b))

def fmul(a: Formula, b: Formula) -> Formula:
  match a b:
    case F{+p, +n, d} F{+r, +s, e}:
      F{Plus{Times{p, r}, Times{n, s}}, Plus{Times{p, s}, Times{n, r}}, Times{d, e}}

def vadd(a: View, b: View) -> View:
  match a b:
    case V{p, n, +d} V{r, s, +e}:
      V{Nat.add(Nat.mul(p, e), Nat.mul(r, d)), Nat.add(Nat.mul(n, e), Nat.mul(s, d)), Nat.mul(d, e)}

def vmul(a: View, b: View) -> View:
  match a b:
    case V{+p, +n, d} V{+r, +s, e}:
      V{Nat.add(Nat.mul(p, r), Nat.mul(n, s)), Nat.add(Nat.mul(p, s), Nat.mul(n, r)), Nat.mul(d, e)}

def vneg(a: View) -> View:
  match a:
    case V{p, n, d}:
      V{n, p, d}

def observed_add(+a: R.Q, +b: R.Q) -> {vadd(observe(a), observe(b)) == observe(R.add(a, b)) : View}:
  match a b:
    case R.Fraction{p, n, d} R.Fraction{r, s, e}:
      %N.sym(1n+R.denominator_product(d, e), Nat.mul(1n+d, 1n+e), RP.denominator_value(d, e)) : {vadd(observe(R.Fraction{p, n, d}), observe(R.Fraction{r, s, e})) == V{Nat.add(Nat.mul(p, 1n+e), Nat.mul(r, 1n+d)), Nat.add(Nat.mul(n, 1n+e), Nat.mul(s, 1n+d)), _} : View}
      {==}

def observed_mul(+a: R.Q, +b: R.Q) -> {vmul(observe(a), observe(b)) == observe(R.mul(a, b)) : View}:
  match a b:
    case R.Fraction{p, n, d} R.Fraction{r, s, e}:
      %N.sym(1n+R.denominator_product(d, e), Nat.mul(1n+d, 1n+e), RP.denominator_value(d, e)) : {vmul(observe(R.Fraction{p, n, d}), observe(R.Fraction{r, s, e})) == V{Nat.add(Nat.mul(p, r), Nat.mul(n, s)), Nat.add(Nat.mul(p, s), Nat.mul(n, r)), _} : View}
      {==}

def read_add(+f: Formula, +g: Formula, +xs: Ns) -> {read(fadd(f, g), xs) == vadd(read(f, xs), read(g, xs)) : View}:
  match f g:
    case F{p, n, d} F{r, s, e}:
      {==}

def read_mul(+f: Formula, +g: Formula, +xs: Ns) -> {read(fmul(f, g), xs) == vmul(read(f, xs), read(g, xs)) : View}:
  match f g:
    case F{p, n, d} F{r, s, e}:
      {==}

def NView_sym(-a: View, -b: View, e: {a == b : View}) -> {b == a : View}:
  Equal.sym(View, a, b, e)

def realizes_add(+f: Formula, +g: Formula, +xs: Ns, +a: R.Q, +b: R.Q,
    ea: {read(f, xs) == observe(a) : View}, eb: {read(g, xs) == observe(b) : View}) -> {read(fadd(f, g), xs) == observe(R.add(a, b)) : View}:
  %NView_sym(read(fadd(f, g), xs), vadd(read(f, xs), read(g, xs)), read_add(f, g, xs)) : {_ == observe(R.add(a, b)) : View}
  %NView_sym(read(f, xs), observe(a), ea) : {vadd(_, read(g, xs)) == observe(R.add(a, b)) : View}
  %NView_sym(read(g, xs), observe(b), eb) : {vadd(observe(a), _) == observe(R.add(a, b)) : View}
  observed_add(a, b)

def realizes_mul(+f: Formula, +g: Formula, +xs: Ns, +a: R.Q, +b: R.Q,
    ea: {read(f, xs) == observe(a) : View}, eb: {read(g, xs) == observe(b) : View}) -> {read(fmul(f, g), xs) == observe(R.mul(a, b)) : View}:
  %NView_sym(read(fmul(f, g), xs), vmul(read(f, xs), read(g, xs)), read_mul(f, g, xs)) : {_ == observe(R.mul(a, b)) : View}
  %NView_sym(read(f, xs), observe(a), ea) : {vmul(_, read(g, xs)) == observe(R.mul(a, b)) : View}
  %NView_sym(read(g, xs), observe(b), eb) : {vmul(observe(a), _) == observe(R.mul(a, b)) : View}
  observed_mul(a, b)

def realizes_neg(+f: Formula, +xs: Ns, +a: R.Q, e: {read(f, xs) == observe(a) : View}) -> {read(fneg(f), xs) == observe(R.negate(a)) : View}:
  match f a:
    case F{p, n, d} R.Fraction{r, s, t}:
      Equal.cong(View, View, x => vneg(x), V{value(p, xs), value(n, xs), value(d, xs)}, V{r, s, 1n+t}, e)

def realizes_sub(+f: Formula, +g: Formula, +xs: Ns, +a: R.Q, +b: R.Q,
    ea: {read(f, xs) == observe(a) : View}, eb: {read(g, xs) == observe(b) : View}) -> {read(fsub(f, g), xs) == observe(R.sub(a, b)) : View}:
  realizes_add(f, fneg(g), xs, a, R.negate(b), ea, realizes_neg(g, xs, b, eb))

def cross_left(a: Formula, b: Formula) -> Expr:
  match a b:
    case F{p, n, d} F{r, s, e}:
      Plus{Times{p, e}, Times{s, d}}

def cross_right(a: Formula, b: Formula) -> Expr:
  match a b:
    case F{p, n, d} F{r, s, e}:
      Plus{Times{n, e}, Times{r, d}}

def SameV(a: View, b: View) -> Type:
  match a b:
    case V{p, n, d} V{r, s, e}:
      {Nat.add(Nat.mul(p, e), Nat.mul(s, d)) == Nat.add(Nat.mul(n, e), Nat.mul(r, d)) : Nat}

def checked_view(+f: Formula, +g: Formula, +xs: Ns,
    e: {normal(cross_left(f, g)) == normal(cross_right(f, g)) : Poly}) -> SameV(read(f, xs), read(g, xs)):
  match f g:
    case F{p, n, d} F{r, s, t}:
      certify(cross_left(F{p, n, d}, F{r, s, t}), cross_right(F{p, n, d}, F{r, s, t}), xs, e)

def from_view(+a: R.Q, +b: R.Q, e: SameV(observe(a), observe(b))) -> R.Same(a, b):
  match a b:
    case R.Fraction{p, n, d} R.Fraction{r, s, t}:
      e

def checked_transport(+f: Formula, +g: Formula, +xs: Ns, +a: R.Q, +b: R.Q,
    ea: {read(f, xs) == observe(a) : View}, eb: {read(g, xs) == observe(b) : View},
    e: SameV(read(f, xs), read(g, xs))) -> SameV(observe(a), observe(b)):
  %ea : SameV(_, observe(b))
  %eb : SameV(read(f, xs), _)
  e

def checked(+f: Formula, +g: Formula, +xs: Ns, +a: R.Q, +b: R.Q,
    ea: {read(f, xs) == observe(a) : View}, eb: {read(g, xs) == observe(b) : View},
    e: {normal(cross_left(f, g)) == normal(cross_right(f, g)) : Poly}) -> R.Same(a, b):
  from_view(a, b, checked_transport(f, g, xs, a, b, ea, eb, checked_view(f, g, xs, e)))
