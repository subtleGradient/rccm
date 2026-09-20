import Base
import ./capacity.bend as Capacity
import ./rational.bend as R

law exhausted_rejected:
  for used: Nat
  {Capacity.inspect(0n, used) == None{} : Maybe<Capacity.Regular>}

law positive_accepted:
  for p: Nat
  for used: Nat
  {Capacity.inspect(1n+p, used) == Some{Capacity.Regular{p, used}} : Maybe<Capacity.Regular>}

law capacity_value:
  for p: Nat
  for used: Nat
  {Capacity.q(Capacity.Regular{p, used}) == R.fraction(1n+p, Nat.add(p, used)) : R.Q}

law used_value:
  for p: Nat
  for used: Nat
  {Capacity.used_fraction(Capacity.Regular{p, used}) == R.fraction(used, Nat.add(p, used)) : R.Q}

law inverse_value:
  for p: Nat
  for used: Nat
  {Capacity.inverse(Capacity.Regular{p, used}) == R.fraction(1n+Nat.add(p, used), p) : R.Q}

law numerator_bounded:
  for p: Nat
  for used: Nat
  {Nat.is_le(1n+p, 1n+Nat.add(p, used)) == True{} : Bool}

law budget:
  for state: Capacity.Regular
  R.Same(R.add(Capacity.q(state), Capacity.used_fraction(state)), R.one())

law reciprocal:
  for state: Capacity.Regular
  R.Same(R.mul(Capacity.q(state), Capacity.inverse(state)), R.one())
