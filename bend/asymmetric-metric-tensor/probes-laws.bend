import Base
import ./tensor.bend as Tensor
import ./matrix.bend as M
import ./probes.bend as P
import ./rational.bend as R

law basis_t:
  {P.basis(Tensor.T{}) == P.Vector4{R.one(), R.zero(), R.zero(), R.zero()} : P.Vector4}

law basis_x:
  {P.basis(Tensor.X{}) == P.Vector4{R.zero(), R.one(), R.zero(), R.zero()} : P.Vector4}

law basis_y:
  {P.basis(Tensor.Y{}) == P.Vector4{R.zero(), R.zero(), R.one(), R.zero()} : P.Vector4}

law basis_z:
  {P.basis(Tensor.Z{}) == P.Vector4{R.zero(), R.zero(), R.zero(), R.one()} : P.Vector4}

law symmetric_rule:
  for slot: Tensor.Slot
  for matrix: M.Matrix
  {P.symmetric_entry(slot, matrix) == R.half(R.add(M.at(slot, matrix), M.at(Tensor.swap(slot), matrix))) : R.Q}

law antisymmetric_rule:
  for slot: Tensor.Slot
  for matrix: M.Matrix
  {P.antisymmetric_entry(slot, matrix) == R.half(R.sub(M.at(slot, matrix), M.at(Tensor.swap(slot), matrix))) : R.Q}

law recover_s:
  for +sample: M.Sample
  for slot: Tensor.Slot
  R.Same(P.symmetric_entry(slot, M.assemble(sample)), M.at(slot, M.symmetric(sample)))

law recover_a:
  for +sample: M.Sample
  for slot: Tensor.Slot
  R.Same(P.antisymmetric_entry(slot, M.assemble(sample)), M.at(slot, M.antisymmetric(sample)))

law sum4_contents:
  for a: R.Q
  for b: R.Q
  for c: R.Q
  for d: R.Q
  {P.sum4(a, b, c, d) == R.add(R.add(a, b), R.add(c, d)) : R.Q}

law sum6_contents:
  for a: R.Q
  for b: R.Q
  for c: R.Q
  for d: R.Q
  for e: R.Q
  for f: R.Q
  {P.sum6(a, b, c, d, e, f) == R.add(P.sum4(a, b, c, d), R.add(e, f)) : R.Q}

law paired_contents:
  for a: R.Q
  for b: R.Q
  for xi: R.Q
  for xj: R.Q
  for yi: R.Q
  for yj: R.Q
  {P.paired(a, b, xi, xj, yi, yj) == R.add(R.mul(a, R.mul(xi, yj)), R.mul(b, R.mul(xj, yi))) : R.Q}

# Independent all-entry expansion, with grouping functions pinned above.
def specified_bilinear(x: P.Vector4, matrix: M.Matrix, y: P.Vector4) -> R.Q:
  match x matrix y:
    case P.Vector4{+xt, +xx, +xy, +xz} M.Matrix{M.Row{tt, tx, ty, tz}, M.Row{it, ix, iy, iz}, M.Row{jt, jx, jy, jz}, M.Row{kt, kx, ky, kz}} P.Vector4{+yt, +yx, +yy, +yz}:
      R.add(
        P.sum4(
          R.mul(tt, R.mul(xt, yt)), R.mul(ix, R.mul(xx, yx)),
          R.mul(jy, R.mul(xy, yy)), R.mul(kz, R.mul(xz, yz))
        ),
        P.sum6(
          R.add(R.mul(tx, R.mul(xt, yx)), R.mul(it, R.mul(xx, yt))),
          R.add(R.mul(ty, R.mul(xt, yy)), R.mul(jt, R.mul(xy, yt))),
          R.add(R.mul(tz, R.mul(xt, yz)), R.mul(kt, R.mul(xz, yt))),
          R.add(R.mul(iy, R.mul(xx, yy)), R.mul(jx, R.mul(xy, yx))),
          R.add(R.mul(iz, R.mul(xx, yz)), R.mul(kx, R.mul(xz, yx))),
          R.add(R.mul(jz, R.mul(xy, yz)), R.mul(ky, R.mul(xz, yy)))
        )
      )

law bilinear_contents:
  for x: P.Vector4
  for matrix: M.Matrix
  for y: P.Vector4
  {P.bilinear(x, matrix, y) == specified_bilinear(x, matrix, y) : R.Q}

law antisymmetric_quadratic:
  for +sample: M.Sample
  for +x: P.Vector4
  R.IsZero(P.bilinear(x, M.antisymmetric(sample), x))
