# Evidence log: the rendering model under test

RCCM supplies the physics. These observations test whether a proposed visual mark teaches that physics accurately. Source of the prior: [01-HYPOTHESIS.md](01-HYPOTHESIS.md).

| Raw observation | Prior result | Design consequence |
|---|---|---|
| [idea.md](../../examples/voxel-tank/idea.md) distinguishes the underlying world from the tank's native voxel resolution, and asks for interchangeable renderers over the same tensor state. | [SUPPORTS] Coordinated views with a common state are the right substrate. | Switching a renderer never edits the world. Resolution edits sampling, not particle size or physics. |
| The idea asks for both one defect per voxel and many defects, atoms, hands or planets per voxel. | [FALSIFIES] A local point tensor alone can serve every requested aggregation. | A coarse voxel needs volume moments, boundary information and explicit unresolved-content metadata. It cannot recover a count or knot from a mean matrix. |
| GfX §3.3, `eq:unified_matrix`, contains one scalar capacity, three slip components and three twist components in the comoving Cartesian representation. | [SUPPORTS] One colour loses independent channels. | Capacity, packing, slip and handed twist need separate marks; the 4 × 4 matrix provides their common legend. |
| GfX §3.1 assigns `U00 = −alpha_s²` and `Uii = 1/alpha_s²`; §4.1 explicitly uses `alpha_s² = P_static/P_c`. | [FALSIFIES] A single swelling bubble can mean pressure, capacity and spatial weight simultaneously. | Label `q = P_static/P_c = alpha_s²`. Use a capacity fill for q and grid packing for 1/q. Pressure traction gets its own face arrows. |
| GfX §3.3 has `Uxy = −alpha t_p Omega_z` and `Uyx = +alpha t_p Omega_z`. | [FALSIFIES] Two equal off-diagonal highlights adequately show the tensor. | The highlights must preserve the opposite signs and the visible loop's handedness. |
| GfX §4, `eq:field_equation`, defines `T = P_c(U − eta)`. At the unperturbed baseline U = eta, the deviation T is zero while baseline pressure P_c remains present. | [FALSIFIES] Empty fluid should vanish because its deviation tensor vanishes. | Show a quiet, fully pressurized background. Provide baseline/deviation as an explicit display choice. |
| GfX §5.3, `eq:tensor_buoyancy_acceleration` and `eq:archimedes_gravity_base`, gives `a = −grad P_static/rho_tau`, `F = −V_eff grad P_static`. | [SUPPORTS] A neighbour/face view is needed to explain motion. | A single scalar value cannot determine a force. Draw incoming pressure tractions on opposite faces and their resultant. |
| GfX §5.1, `eq:cauchy_momentum`, uses dynamic-envelope density and factors of 1/2; §5.3 uses the static, nonrelativistic test-coordinate limit with rho_tau. | [FALSIFIES] All arrows can be described as the same universal force operation. | Name the displayed operation: static pressure probe, deviatoric traction, or full dynamic evolution. Do not combine their prefactors by analogy. |
| GfX §8.1–8.2 identifies capacity collapse, cavitation and phase-locked Clebsch circulation. It supplies a defect mechanism but no complete Cartesian torus initial condition. | [FALSIFIES] A drawn torus is automatically the unique electron solution. | Use an authored toroidal fixture to teach sampling and circulation. Give its geometry and sampling rules explicitly. |
| GfX §9.6 isolates the transverse block `a I + b J`, with `a = 1/q` and `b = alpha t_p Omega`; J rotates a test vector through a quarter turn. | [SUPPORTS] An operation view can make the matrix bodily legible. | A little input spoke and output spoke teach the signed shear operation better than arbitrary surface texture. |
| GfX §10.6 preserves diagonal entries while reversing time-space entries under time reversal; spatial vorticity behaves axially under parity. | [FALSIFIES] Charge sign is simply the same switch as magnetic twist sign. | Keep charge/winding polarity, slip direction, twist axis and twist handedness separately labelled. |
| GfX §14 derives a single-boundary inverse-square force scale and a macroscopic aggregate scale. It does not provide a ready-to-sample two-electron equilibrium field. | [FALSIFIES] Opposite/same charge scenes can be generated from that section alone. | Define the pair fixture's inputs and pressure construction, and cite the additional phase-overlap source explicitly. |
| GfX §16.2's “Coulomb Attraction & Positronium Equilibrium” entry explicitly connects counter-rotating defects, aligned gap flow, increased dynamic pressure and reduced static capacity. | [SUPPORTS] The gap lesson has a primary mapping in the focused source itself. | Cite this entry for the mechanism; the Gaussian swirl below is the chosen frozen spatial fixture. |
| Condensed, `eq:attraction` and `eq:repulsion`, gives aligned transverse contributions → lower static pressure; opposed contributions → higher static pressure. | [SUPPORTS] Signed overlaid slip vectors can teach what happens between charges. | Expose both contribution arrows and their dot product. Show overlap pressure relative to the sum of isolated self-loads. |

## Exact matrix contract

Use `e = alpha v_perp/c`, `b = alpha t_p Omega`, and `q = alpha_s²`:

```text
         time       x        y        z
time     −q        −ex      −ey      −ez
x         ex        1/q     −bz       by
y         ey        bz       1/q     −bx
z         ez       −by       bx       1/q
```

This is GfX's comoving matrix (`eq:unified_matrix`), not a declaration that a tensor is diagonal in every observer frame. Its spatial skew part acts as `b × n` on a spatial test vector n. A ring around +z must therefore map +x toward +y.

## Source boundaries retained in the studies

1. **Capacity notation.** Condensed's glossary loosely describes alpha_s as a pressure ratio, while its `eq:admittance_pressure_ratio` and GfX §3/§8 explicitly give the ratio as alpha_s². The studies use the equations: `q = alpha_s² = P_static/P_c`.
2. **Pressure ledger.** GfX §2 and §4.1 distinguish macro depletion, dynamic load and structural shear. The comprehensive budget is `q = 1 − (Delta P_macro + P_dyn + P_shear)/P_c`. A fixture using `q = 1 − v²/c²` is the explicitly chosen reduced ledger.
3. **Pair interaction.** GfX supplies tensor slots, single-boundary mechanics and the explicit counter-rotating-pair mechanism in §16.2. Condensed's Coulomb/Bernoulli panel supplies the compact signed overlap equations. The Gaussian spatial profile is an authored fixture, not a quoted spatial solution from either file.
4. **Scale constants.** GfX §4.2 gives `rho_tau = c^5/(2 pi hbar G²)`; Condensed's continuum-constants panel gives `rho_tau = 9 rho_Pl/(4 pi)`. These numerical normalizations differ. The HTML studies use labelled dimensionless controls, so no physical density is imported across this boundary.
5. **Stress convention.** `Tii/P_c = 1/q − 1` is the tensor's positive structural deviation. Compressive pressure traction on a probe's outward normal is `t_p = −P_static n`. They are two different displayed quantities; their arrows cannot share a legend.

## Aggregation counterexample

Two equally weighted cells with q = 0.2 and 0.8 give mean q = 0.5, but mean packing is `(5 + 1.25)/2 = 3.125`, whereas rebuilding packing from mean q gives 2. The mean matrix is not generally a matrix reconstructed from mean primitives.

Two equally weighted cells with b = +z and b = −z give mean b = 0 and RMS twist = 1. Zero mean twist is not a quiet volume. A donut sampled only at its central hole can return the background despite a strong surrounding circulation. These are decisive rendering tests.

## Read-only review of the implemented mathematical fixture

Reviewed `examples/voxel-tank/math.mjs` and `math.test.mjs` during construction. The exact matrix signs match GfX §3.3. For the chosen Gaussian swirl, its analytic curl matches a centred finite-difference curl at (0.7, 0.4, 0.3) within 2.4 × 10⁻¹¹, and the numerical divergence is −2.8 × 10⁻¹². Each constituent's maximum speed is 0.38, so the combined field has speed at most 0.76 and q is bounded below by 0.4224 globally; the mass fixture gives q ≥ 0.44.

At the left specimen centre, sampled pressure resultants `F_x/(P_c A)` are +0.072861 for opposite circulation, −0.041252 for either same-sign mode, +0.019890 for the mass mode, and 0 for uniform pressure. Right-centre resultants oppose them. These are instantaneous face-sample results; the fixture has no time-evolution or support forces.

The implemented relation `b = 0.2 curl(e)` is an explicit fixture coupling. GfX §1 independently defines the Clebsch rotational phase, so that relation does not become a general identity of every slip field. Likewise `q = 1 − |e|²` is the selected kinetic pressure projection, not the full nested ledger with every load activated.

Reviewed `01-glyphs.html` / `glyphs.js`: the signed loop follows b × n, the bubble radius scales as cube-root(q), and the matrix uses the shared exact assembler. Its chosen rigid-rotation sample at r = 2ct_p makes `v_rotation/c = t_p Omega`; the kinetic-only budget must keep that fixture's zero additional structural-shear load explicit.

Reviewed `02-resolution.html` / `resolution.js`: one defect's mean q = 0.952435739119, mean packing = 1.086458979713, signed mean b_z = 0.072939427449 and RMS b = 0.180721363011 remain identical across 1³, 2³ and 4³ display partitions within floating-point summation error. A finite-difference check of the separate rotational velocity at (0.45, 0.17, 0.19) matches its analytic curl within 4.6 × 10⁻¹⁰. The displayed pair consists of independently sampled specimen boxes; it does not superpose their fields into an interaction solution. Its amber bead tracks depletion, whereas Study 01's bubble tracks remaining capacity: the opposing mappings require the explicit legends already provided.

Reviewed `03-between.html` / `between.js`: scene polarity, matrix signs, pressure graph, equal-face differences and same-sign charge reversal preserve their stated invariants. Its gap cells evaluate `gapState` at each centre, unlike Study 02's volume averages; the labels must name them as point probes. The `b = 0.2 curl(e)` choice and the face-centre quadrature need their explicit fixture labels retained in the page. Source positions are a frozen snapshot, and the code does not invent a trajectory or pinning mechanism.
