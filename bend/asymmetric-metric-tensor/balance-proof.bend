import Base
import ./rational.bend as R
import ./rational-proof.bend as RP
import ./natural-proof.bend as N
import ./balance-laws.bend as Laws
import ./balance-helpers.bend as H

def Laws.mul_zero_value(k, z, e):
  match k z:
    case R.Fraction{p, n, d} R.Fraction{r, s, t}:
      %e : {Nat.add(Nat.mul(p, r), Nat.mul(n, _)) == Nat.add(Nat.mul(p, _), Nat.mul(n, r)) : Nat}
      {==}

def Laws.sub_swap(a, b):
  match a b:
    case R.Fraction{p, n, d} R.Fraction{r, s, e}:
      RP.record_equal(
        Nat.add(Nat.mul(p, 1n+e), Nat.mul(s, 1n+d)),
        Nat.add(Nat.mul(n, 1n+e), Nat.mul(r, 1n+d)), R.denominator_product(d, e),
        Nat.add(Nat.mul(s, 1n+d), Nat.mul(p, 1n+e)),
        Nat.add(Nat.mul(r, 1n+d), Nat.mul(n, 1n+e)), R.denominator_product(e, d),
        N.add_comm(Nat.mul(p, 1n+e), Nat.mul(s, 1n+d)),
        N.add_comm(Nat.mul(n, 1n+e), Nat.mul(r, 1n+d)), RP.denominator_comm(d, e))

# Formula construction has the same tree as the actual output additions.
# The helper proves interpretation commutes with each rational operation.
def flux(k: H.Formula, l: H.Formula, r: H.Formula) -> H.Formula:
  H.fmul(k, H.fsub(l, r))

def flux_realizes(+fk: H.Formula, +fl: H.Formula, +fr: H.Formula, +xs: H.Ns,
    +k: R.Q, +l: R.Q, +r: R.Q,
    ek: {H.read(fk, xs) == H.observe(k) : H.View},
    el: {H.read(fl, xs) == H.observe(l) : H.View},
    er: {H.read(fr, xs) == H.observe(r) : H.View})
    -> {H.read(flux(fk, fl, fr), xs) == H.observe(R.mul(k, R.sub(l, r))) : H.View}:
  H.realizes_mul(fk, H.fsub(fl, fr), xs, k, R.sub(l, r), ek,
    H.realizes_sub(fl, fr, xs, l, r, el, er))

def Laws.telescoping_scaled(k, l, m, r):
  match k l m r:
    case R.Fraction{kp, kn, kd} R.Fraction{lp, ln, ld} R.Fraction{mp, mn, md} R.Fraction{rp, rn, rd}:
      +xs = {H.Link{kp, H.Link{kn, H.Link{1n+kd, H.Link{lp, H.Link{ln, H.Link{1n+ld, H.Link{mp, H.Link{mn, H.Link{1n+md, H.Link{rp, H.Link{rn, H.Link{1n+rd, H.End{}}}}}}}}}}}}} : H.Ns}
      +k = {R.Fraction{kp, kn, kd} : R.Q}
      +l = {R.Fraction{lp, ln, ld} : R.Q}
      +m = {R.Fraction{mp, mn, md} : R.Q}
      +r = {R.Fraction{rp, rn, rd} : R.Q}
      +fk = H.atom(0n)
      +fl = H.atom(3n)
      +fm = H.atom(6n)
      +fr = H.atom(9n)
      H.checked(H.fadd(flux(fk, fl, fm), flux(fk, fm, fr)), flux(fk, fl, fr), xs,
        R.add(R.mul(k, R.sub(l, m)), R.mul(k, R.sub(m, r))), R.mul(k, R.sub(l, r)),
        H.realizes_add(flux(fk, fl, fm), flux(fk, fm, fr), xs,
          R.mul(k, R.sub(l, m)), R.mul(k, R.sub(m, r)),
          flux_realizes(fk, fl, fm, xs, k, l, m, {==}, {==}, {==}),
          flux_realizes(fk, fm, fr, xs, k, m, r, {==}, {==}, {==})),
        flux_realizes(fk, fl, fr, xs, k, l, r, {==}, {==}, {==}), {==})

def Laws.step_balance(p, q, k, l, m, r):
  match p q k l m r:
    case R.Fraction{pp, pn, pd} R.Fraction{qp, qn, qd} R.Fraction{kp, kn, kd} R.Fraction{lp, ln, ld} R.Fraction{mp, mn, md} R.Fraction{rp, rn, rd}:
      +xs = {H.Link{pp, H.Link{pn, H.Link{1n+pd, H.Link{qp, H.Link{qn, H.Link{1n+qd, H.Link{kp, H.Link{kn, H.Link{1n+kd, H.Link{lp, H.Link{ln, H.Link{1n+ld, H.Link{mp, H.Link{mn, H.Link{1n+md, H.Link{rp, H.Link{rn, H.Link{1n+rd, H.End{}}}}}}}}}}}}}}}}}}} : H.Ns}
      +p = {R.Fraction{pp, pn, pd} : R.Q}
      +q = {R.Fraction{qp, qn, qd} : R.Q}
      +k = {R.Fraction{kp, kn, kd} : R.Q}
      +l = {R.Fraction{lp, ln, ld} : R.Q}
      +m = {R.Fraction{mp, mn, md} : R.Q}
      +r = {R.Fraction{rp, rn, rd} : R.Q}
      +fp = H.atom(0n)
      +fq = H.atom(3n)
      +fk = H.atom(6n)
      +fl = H.atom(9n)
      +fm = H.atom(12n)
      +fr = H.atom(15n)
      H.checked(
        H.fadd(H.fadd(fp, flux(fk, fl, fm)), H.fadd(fq, flux(fk, fm, fr))),
        H.fadd(H.fadd(fp, fq), flux(fk, fl, fr)), xs,
        R.add(R.add(p, R.mul(k, R.sub(l, m))), R.add(q, R.mul(k, R.sub(m, r)))),
        R.add(R.add(p, q), R.mul(k, R.sub(l, r))),
        H.realizes_add(H.fadd(fp, flux(fk, fl, fm)), H.fadd(fq, flux(fk, fm, fr)), xs,
          R.add(p, R.mul(k, R.sub(l, m))), R.add(q, R.mul(k, R.sub(m, r))),
          H.realizes_add(fp, flux(fk, fl, fm), xs, p, R.mul(k, R.sub(l, m)), {==},
            flux_realizes(fk, fl, fm, xs, k, l, m, {==}, {==}, {==})),
          H.realizes_add(fq, flux(fk, fm, fr), xs, q, R.mul(k, R.sub(m, r)), {==},
            flux_realizes(fk, fm, fr, xs, k, m, r, {==}, {==}, {==}))),
        H.realizes_add(H.fadd(fp, fq), flux(fk, fl, fr), xs, R.add(p, q), R.mul(k, R.sub(l, r)),
          H.realizes_add(fp, fq, xs, p, q, {==}, {==}),
          flux_realizes(fk, fl, fr, xs, k, l, r, {==}, {==}, {==})), {==})

# Native regressions inspect actual output arithmetic, independently of proof
# erasure. Expected totals are hand-computed, not cached initial totals.
def same_value(a: R.Q, b: R.Q) -> Bool:
  match a b:
    case R.Fraction{p, n, +d} R.Fraction{r, s, +e}:
      Nat.is_eq(Nat.add(Nat.mul(p, 1n+e), Nat.mul(s, 1n+d)),
        Nat.add(Nat.mul(n, 1n+e), Nat.mul(r, 1n+d)))

def example(+p: R.Q, +q: R.Q, +k: R.Q, +l: R.Q, +m: R.Q, +r: R.Q, expected: R.Q) -> Bool:
  +actual = R.add(R.add(p, R.mul(k, R.sub(l, m))), R.add(q, R.mul(k, R.sub(m, r))))
  Bool.and(same_value(actual, expected),
    Bool.and(same_value(actual, R.add(R.add(p, q), R.mul(k, R.sub(l, r)))),
      same_value(R.add(R.mul(k, R.sub(l, m)), R.mul(k, R.sub(m, r))), R.mul(k, R.sub(l, r)))))

def main() -> Bool:
  # (p,q,k,l,m,r) = (1,-1,1,1,-1,0); output total = 1.
  a b = example(R.Fraction{3n, 1n, 1n}, R.Fraction{1n, 3n, 1n},
          R.Fraction{2n, 0n, 1n}, R.Fraction{3n, 1n, 1n},
          R.Fraction{0n, 2n, 1n}, R.Fraction{1n, 1n, 1n}, R.one())
        example(R.Fraction{0n, 2n, 1n}, R.Fraction{4n, 0n, 1n},
          R.Fraction{1n, 2n, 1n}, R.Fraction{0n, 1n, 0n},
          R.Fraction{2n, 0n, 1n}, R.Fraction{3n, 1n, 1n}, R.fraction(2n, 0n))
  # Second case uses negative k: (-1,2,-1/2,-1,1,1); total = 2.
  # Equal-valued but differently represented exterior faces: total = 0.
  c d = example(R.Fraction{1n, 0n, 1n}, R.Fraction{0n, 1n, 1n},
          R.Fraction{1n, 0n, 1n}, R.Fraction{1n, 1n, 0n},
          R.Fraction{2n, 0n, 1n}, R.Fraction{2n, 2n, 1n}, R.zero())
        same_value(R.mul(R.Fraction{1n, 3n, 1n}, R.Fraction{2n, 2n, 2n}), R.zero())
  Bool.and(Bool.and(a, b), Bool.and(c, d))
