import Base
import ./rational.bend as R
import ./capacity.bend as C
import ./ledger.bend as L

law capacity_contents:
  for p: Nat
  for local: Nat
  for macro: Nat
  {L.capacity(L.Budget{p, local, macro}) == C.Regular{p, Nat.add(local, macro)} : C.Regular}
law ambient_contents:
  for +p: Nat
  for +local: Nat
  for macro: Nat
  {L.ambient(L.Budget{p, local, macro})
    == R.fraction(1n+Nat.add(p, local), Nat.add(p, Nat.add(local, macro))) : R.Q}
law local_contents:
  for +p: Nat
  for local: Nat
  for macro: Nat
  {L.local_fraction(L.Budget{p, local, macro}) == R.fraction(1n+p, Nat.add(p, local)) : R.Q}
law capacity_witness:
  for +budget: L.Budget
  exs state: C.Regular
  {C.q(state) == L.total(budget) : R.Q}

# Closed fixture: static=3, local=1, macro=2, Pc=6.
law nested_fixture:
  R.Same(R.mul(L.ambient(L.Budget{2n, 1n, 2n}), L.local_fraction(L.Budget{2n, 1n, 2n})),
    L.total(L.Budget{2n, 1n, 2n}))
