# Stress tests: try to break the teaching

The following are falsifiers for the visual design. An attractive picture fails when a learner can make a wrong prediction from its legend.

| Manipulation | Required visible result | Failure exposed |
|---|---|---|
| Set q = 1, e = b = 0. | Quiet, fully pressurized fluid; U = diag(−1,1,1,1); zero deviation stress. | Treating unperturbed space as no fluid. |
| Halve q while holding the inspection fixture's e and b fixed. | Capacity halves; packing doubles; slip and twist marks keep their signed values. | One appearance channel secretly encoding several quantities. |
| Reverse only e_x. | U0x and Ux0 exchange signs; time/spatial diagonals and b stay fixed. | Conflating charge-related slip with mass or magnetic handedness. |
| Reverse only b_z. | Uxy and Uyx exchange signs; a local operation spoke reverses its deflection. | A colour change with no readable handedness. |
| Rotate the camera by 180°. | World arrows keep their world directions; displayed axis labels explain the new view. | Camera motion presented as a physical sign reversal. |
| Feed a test spoke n = +x into a state with b = +z. | The skew contribution points +y. | Wrong matrix sign or cross-product order. |
| Put q = 0.2 and q = 0.8 in two equal subvolumes. | Coarse mean q = 0.5; mean packing = 3.125; 1/mean q = 2 is shown only as a contrasting reconstruction. | Jensen/averaging error hidden by aggregation. |
| Combine equal +z and −z twists inside one cell. | Mean loop disappears; unresolved twist/activity mark remains. | Cancellation masquerading as empty fluid. |
| Put a torus's hole at the cell centre. | Volume sampling still sees the circulation and occupied shell. | Centre sampling aliases a whole defect out of existence. |
| Increase resolution 1 → 8 → 64 cells. | The same defect and total summaries persist; spatial detail splits across cells. | A prettier image secretly changes the fixture. |
| Move the torus by half a cell with its physical shape fixed. | Weighted summaries vary continuously; total load stays within declared quadrature error. | Hard occupancy bins produce flickering existence. |
| Hide the torus's near half. | The cutaway reveals inner circulation and its direction. | Surface opacity hides the very relation being taught. |
| Raise pressure uniformly on every face. | Each incoming arrow grows; the vector sum stays zero. | Squeeze confused with translation. |
| Add a linear pressure slope `P = P0 + g x`. | The +x face pushes harder, and net pressure force points −x. | Reversed pressure-force sign. |
| Put an equal pair of sources around the central probe. | The midpoint may retain depleted capacity while net translational force cancels. | Zero resultant mislabelled as zero state. |
| Reverse one charge polarity at fixed geometry. | Both individual slip arrows remain visible; overlap dot product reverses; overlap pressure changes sign relative to isolated loads. | A bare red/blue icon substitutes for fluid mechanics. |
| Widen the gap while keeping source parameters fixed. | Field values follow physical separation; the number of displayed cells is independently controllable. | Render resolution confused with physical distance. |
| Use a constant antisymmetric spatial stress on every face. | Opposite tractions cancel in translation; tangential traction can still make a couple. | A rotating glyph falsely implies net acceleration. |
| Approach q = 0. | Raw q remains visible; packing uses an explicit saturation mark; page remains finite. | Infinity/NaN contaminates geometry or a silent clamp teaches a false bound. |
| Aggregate a planet's worth of internal opposing slip directions. | Net charge/slip can cancel while scalar load, packing and internal activity remain. | “Neutral” incorrectly drawn as unstrained or massless. |

## Concrete fixture constructions

These are explicit inputs for renderer experiments. They let us hold the world fixed while asking what each display reveals.

### Local tensor fixture

Choose q > 0, e and b independently as an inspection fixture. Assemble the exact matrix in [02-EVIDENCE-LOG.md](02-EVIDENCE-LOG.md). An independent slider is a component probe: it is not a time integration of the full fluid equations. Displaying e does not imply that its value alone closes the thermodynamic ledger.

For the transverse z-axis block, let a = 1/q, b = b_z. Then `M(x,y) = (a x − b y, b x + a y)`. A unit input spoke produces a vector with scale `sqrt(a²+b²)` and signed rotation `atan2(b,a)`. This directly instantiates GfX §9.6.

### Toroidal resolution fixture

For a torus around the z-axis, let `r = sqrt(x²+y²)`, `d² = (r−R)²+z²`, and `w = exp(−d²/sigma²)`. Pick an authored depletion field `q = 1 − D w`, with 0 < D < 1. The centre hole remains at higher q than the circulating tube. A cavity indicator is separately declared by a level set such as `d² < a²`; the visible level set is geometry metadata.

A simple toroidal vorticity orientation is `b = B w (−y/r, x/r, 0)` with a regularized axial limit. It is tangent around the major ring. This is not the same direction as the fluid rolling around the tube: the local roll lies in the plane normal to b. A renderer can draw a small poloidal loop in that plane, preserving the right-hand orientation.

To obtain a finite toroidal b without a division at r = 0, use `b = B w (−y, x, 0)/R`. This authored b is divergence-free for axisymmetric w and vanishes on the axis. If smooth derivatives through the axis are needed, calculate w with the declared regularized radius `r_epsilon = sqrt(x²+y²+epsilon²)`. If an actual Clebsch velocity/curl pair is required, derive b from the chosen rotational velocity field rather than borrowing an unrelated curl arrow.

Sample a fixed fine lattice or quadrature rule first, then aggregate the same samples into nested 1³, 2³ and 4³ cells. A 32³ source sample lattice is divisible by every requested display resolution. Track sample volume weights. The torus's total descriptor is independent of which of those three partitions is selected.

### Charge-overlap fixture

The implemented page selects smooth divergence-free Gaussian swirls centred at `c_i = (±1.5,0,0)`. Define `dx = x−c_ix`, `g = exp(−(dx²+y²+z²)/(2 sigma²))`, `k = s_i a g`, and `u_i = k(−y,dx,0)`, with sigma = 1.25 and `a = 0.38/(sigma exp(−1/2))`. Its curl is:

```text
curl u_i = k (dx z / sigma², y z / sigma², 2 − (dx²+y²)/sigma²)
```

The selected display channels are `e = u_1 + u_2`, `b = 0.2 curl(e)` and `q = 1 − |e|²`. This is an authored coupling of channels for the frozen overlap experiment; it is not an identity equating every transverse slip field to GfX's independently defined Clebsch rotational phase. The pressure projection activates the kinetic load and sets other ledger contributions aside. Fixed source positions identify a snapshot; they do not posit hidden pins or static equilibrium.

GfX §16.2's “Coulomb Attraction & Positronium Equilibrium” entry provides the direct source mapping: opposing circulation aligns flow between cores, increases dynamic pressure and lowers static capacity. The implementation exposes `self = |u_1|²+|u_2|²` and `cross = 2 u_1·u_2`, so `q = 1 − self − cross` is inspectable. A same-sign pair reverses the gap overlap while preserving unsigned self-load.

An alternative radial leakage fixture, useful for the §14 scaling lesson, is retained below; it is not the implemented Gaussian fixture:

Outside source cores, use labelled radial leakage contributions `v_i(x) = s_i K (x−c_i)/|x−c_i|³`, with s_i = ±1. This is an explicit geometric fixture implementing the `1/r²` flux scaling of GfX §14. Declare excluded cores or a smoothing radius; do not silently evaluate a singular source centre.

The Bernoulli algebra is exact for either vector fixture:

```text
|v1 + v2|² = |v1|² + |v2|² + 2 v1·v2
P_static(combined) − P_static(isolated-load sum) = −rho_tau v1·v2
```

At the midpoint, opposite source polarities give aligned leakage directions; same polarities give opposed directions. The signed overlap pressure follows Condensed `eq:attraction` / `eq:repulsion`. Show it as an interaction contribution, alongside the self-load and full static-pressure fields. “Higher pressure” here means higher relative to that isolated-load reference, not automatically above P_c.

The full pressure surface around a defect, not the midpoint scalar alone, supplies its net force. A finite probe can integrate face samples from the authored field; label whether the probe samples total pressure or only the interaction contribution. The implemented `pressureFaces` uses two equal-area face-centre samples at x ± 0.32. It is a finite-difference face probe, not an exact area integral of the transversely varying Gaussian pressure. Do not draw an automatic particle trajectory from a midpoint colour.

### Static pressure/traction fixture

For a cube of side h in `P = P0 + g x`, the two x faces give `F_x = P(−h/2)h² − P(+h/2)h² = −g h³`. The y and z face contributions cancel. This fixture makes `F = −V grad P` exact at every displayed resolution.

For twist inspection, use `A_spatial n = b × n` as the signed matrix operation. If presenting it as dimensional deviatoric traction, multiply by the declared P_c and name the convention. Keep that channel separate from the compressive pressure traction `−P n`.

## Convergence gate

The three pages survive when switching renderer preserves values, changing resolution preserves the defined aggregate ledger, matrix signs match arrows, and the uniform/linear pressure fixtures pass. User prediction probes then decide which representation remains clearest. No claim of learner mastery follows from a visually successful render alone.

## Final implemented resolution specimen

The actual resolution page uses a smooth polynomial torus distance, not the simpler radial-distance candidate above. With R=.5 and w=.24, set `g=exp(-[((x²+y²−R²)²/(4R²))+z²]/w²)` and `f=g+.22 exp(-(x²+y²+z²)/4)`. For sign s=±1, the two separately parameterized velocity fields are `e=s*.5*g*(-y,x,0)` and `vRot=s*.25*f*(-y,x,0)`, with alpha=c=tp=1 in specimen units. The prescribed background load is L=.65g; P_shear=0. Then `q=1-L-|e|²-|vRot|²` and `b=curl(vRot)`. These choices close the snapshot pressure budget and keep slip and rotational provenance explicit.

The two boxes are independently sampled reference defects; their fields are not superposed in this resolution study. The interaction study performs superposition in its own authored fixture. Final aggregate q≈.952718542, mean(1/q)≈1.086163903, signed single-defect mean b_z≈.072939427 and RMS≈.180721363 are invariant across the implemented partitions. Browser interactions verified paired sign cancellation and the retained RMS readout.
