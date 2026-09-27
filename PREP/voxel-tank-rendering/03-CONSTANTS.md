# Constants: the shared visual contract

These constraints remain fixed while renderers, resolution and fixture parameters change.

- [ ] RCCM is the physics of this project; adversarial work targets visual mappings and numerical operations.
- [ ] The tank is a display lattice. Its cells are sample volumes, never fundamental particles.
- [ ] 1, 8 and 64 cells per defect mean 1³, 2³ and 4³ cells over the same physical bounding box.
- [ ] The 1/8/64 volume-resolution comparison observes the same frozen fixture and uses the same volume-weighted data. A separate centre-point probe must name that sampling policy. Camera changes preserve the physical state.
- [ ] q, e and b use one common world frame before averaging. Rotating the camera does not rotate the source.
- [ ] `q = P_static/P_c = alpha_s²`; time entry is −q, spatial diagonal entries are 1/q.
- [ ] A q fill reads capacity directly. An actual resting proper-clock rate reads sqrt(q) relative to coordinate time; its animation must use that distinct legend.
- [ ] e is the dimensionless slip vector `alpha v_perp/c`. It is neither charge magnitude nor acceleration.
- [ ] b is the dimensionless vorticity vector `alpha t_p Omega`. It is neither a pathline nor a force vector.
- [ ] The matrix is assembled with the exact signs in GfX §3.3. Its spatial skew operator is b × n.
- [ ] Capacity, packing, baseline pressure, structural stress and pressure gradient have distinguishable legends.
- [ ] Every signed quantity uses direction, handedness or an explicit sign in addition to colour.
- [ ] Positive/negative charge use the user's yellow/blue cues. Pressure uses a separate sequential scale; yellow/blue must not also mean high/low pressure.
- [ ] Empty space still has fluid state and pressure. At q = 1, e = b = 0, U = eta and deviation T = 0.
- [ ] Constant pressure gives equal opposing face pushes and zero translational resultant.
- [ ] Pressure force is computed from neighbouring face samples; a local q value alone supplies no direction.
- [ ] A finite probe with outward face normals uses `F_p = −sum_f(P_f n_f A_f)`. For smooth P this tends to `−V grad P`.
- [ ] A face-average pressure makes that finite-volume sum exact for the pressure integral; using a face-centre sample is the declared quadrature approximation.
- [ ] The static defect force in GfX §5.3 uses effective thermodynamic displacement V_eff; it is not automatically the cavity's geometric volume.
- [ ] A full motion step must also specify mass/inertia, velocity, boundaries and stresses. These pages can show an instantaneous resultant without inventing an equilibrium trajectory.
- [ ] Uniform twist can supply a local couple while its net translational force vanishes. Translation and rotation have separate marks.
- [ ] Surface pressure traction is different from the positive structural deviation `Tii = P_c(1/q − 1)`.
- [ ] Near q = 0, display saturation is a renderer limit. Preserve the raw value and show the saturated mark; never silently replace the physics with a clamped value.
- [ ] Defect count, cavity fraction and unresolved twist activity survive coarsening as separate summaries. A mean tensor is not a lossless encoding of topology.
- [ ] Mean packing is averaged directly. It is not calculated as the reciprocal of mean capacity.
- [ ] State reconstruction, scalar averaging and linear tensor averaging are named operations, not interchangeable shortcuts.
- [ ] The torus radius, tube radius, kernel width, display gain and quadrature resolution are fixture/rendering parameters. They are not electron constants.

## Minimal shared record

```ts
type Vec3 = readonly [number, number, number];
type LocalState = {
  q: number;                      // remaining static pressure / P_c
  e: Vec3;                        // alpha * v_perp / c
  b: Vec3;                        // alpha * t_p * Omega
};
type CellSummary = {
  volume: number;
  meanQ: number;
  meanPacking: number;            // mean(1 / q)
  meanE: Vec3;
  meanB: Vec3;
  meanESquared: number;
  meanBSquared: number;
  minQ: number;
  maxQ: number;
  cavityFraction: number;         // from declared cavity indicator
  defectCount: number;            // from fixture topology metadata
};
```

The average comoving matrix uses `−meanQ`, `meanPacking`, `meanE`, and `meanB`. The unresolved twist marker uses `sqrt(meanBSquared − |meanB|²)`; nonnegative roundoff handling belongs only to that subtraction. The count and cavity fraction are additional known summaries, not numbers inferred from b.

## Renderer gain

Use dimensionless normalized marks and expose their gains. If a loop is magnified for visibility, label the factor. For a bounded visual size, one possible mapping is `size = log(1 + gain × magnitude)`; retain the original number beside it. Equal logarithmic steps then describe multiplicative change, not linear size.
