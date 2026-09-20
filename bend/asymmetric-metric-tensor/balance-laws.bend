import Base
import ./rational.bend as R

# Exact bookkeeping for supplied faces; no PDE or physical identification.
# Same compares cross-products, so signed and unreduced inputs are included.
law mul_zero_value:
  for +k: R.Q
  for +z: R.Q
  for e: R.IsZero(z)
  R.IsZero(R.mul(k, z))

law sub_swap:
  for +a: R.Q
  for +b: R.Q
  {R.sub(a, b) == R.negate(R.sub(b, a)) : R.Q}

law telescoping_scaled:
  for +k: R.Q
  for +l: R.Q
  for +m: R.Q
  for +r: R.Q
  R.Same(R.add(R.mul(k, R.sub(l, m)), R.mul(k, R.sub(m, r))),
    R.mul(k, R.sub(l, r)))

law step_balance:
  for +p: R.Q
  for +q: R.Q
  for +k: R.Q
  for +l: R.Q
  for +m: R.Q
  for +r: R.Q
  R.Same(R.add(R.add(p, R.mul(k, R.sub(l, m))), R.add(q, R.mul(k, R.sub(m, r)))),
    R.add(R.add(p, q), R.mul(k, R.sub(l, r))))
