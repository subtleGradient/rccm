# Hyperslice map: narrowing the renderers

The hyperblob contains every way to render a tau-fluid tank: fog, bubbles, deforming grids, rocks, kittens, arrows, shells, loops, slices and animated particles. The target is a shared visual grammar that lets a learner predict how tensor state, coarse observation and neighbouring pressure produce visible consequences.

The first eight cuts isolate the obvious representation axes. The next eight attack them from the mirror side. Colour, creature shape and surface material remain interchangeable skins after the underlying cuts survive.

| Razor | Half A / Half B | Placement and adversarial result |
|---|---|---|
| 1. What changes? | Physical world / Observation | The tank resolution belongs to observation. Counterexample: rebuilding a different torus at each resolution leaks into the physical half. |
| 2. What is sampled? | Point / Volume | A single matrix can be point-local; a voxel summarizing a hand belongs to volume. A torus with a quiet centre defeats point sampling. |
| 3. What is known? | Resolved structure / Unresolved moments | Both are needed. A coarse cell must keep activity even when opposite means cancel. |
| 4. Which dependency? | Local state / Neighbour operation | U is local state; pressure force needs spatial comparison. A nonzero q does not name a direction. |
| 5. Which orientation? | Scalar isotropy / Directional structure | Capacity/packing are scalar in the chosen comoving fixture; e and b carry direction. A stretched ellipsoid would falsely add diagonal anisotropy. |
| 6. Which sign? | Signed contribution / Unsigned load | Arrow and loop preserve sign; squares and RMS preserve activity. Neither half can replace the other. |
| 7. What moves? | Translational resultant / Rotational couple | Keep separate glyphs. Balanced face forces can still create a couple; uniform pressure can squeeze with zero resultant. |
| 8. Which channel? | Time-space slip / Space-space twist | Different matrix slots and source definitions. A single “swirl strength” slider cannot teach both. |
| 9. What is a boundary? | Physical cavity / Display cell | A torus crosses display cells freely. Voxel walls never act as container walls. |
| 10. What is baseline? | Ambient pressure / Stress deviation | Empty fluid has pressure although U − eta vanishes. Making the background transparent must not erase its force contribution. |
| 11. Which scalar? | Remaining capacity q / Spatial packing 1/q | Opposite monotonic directions. The same unlabelled bubble radius cannot serve both. |
| 12. Which averaging? | Average after nonlinear map / Nonlinear map after average | Mean(1/q) differs from 1/mean(q). The order is an experimental cut, not a stylistic preference. |
| 13. Whose rotation? | Observer frame / Object orientation | Camera motion changes presentation; physically rotating a defect can change the sampled interaction. |
| 14. What does a line show? | Instantaneous streamline / Time-history pathline | Only equivalent in a steady fixture. Decorative moving dots need a declared input and time scale. |
| 15. What does shape assert? | Topological metadata / Tensor moment | A donut silhouette marks supplied defect geometry. A mean matrix cannot reconstruct its hole or winding by itself. |
| 16. What is specified? | Source equation / Authored fixture | Matrix assembly and buoyancy laws come from the TeX. Torus kernel widths, smoothing radii and sampling gains are explicit experiment inputs. |

## The cardinal square

Cross the strongest two independent cuts: local versus neighbour information, resolved versus aggregate observation.

| | Resolved | Aggregate |
|---|---|---|
| **Local state** | A probe glyph with q fill, 1/q grid, e arrow and b loop; inspect exact matrix slots. | A cell summary with average matrix, scalar range, load/activity and count metadata. |
| **Neighbour operation** | Opposing face pressure samples, slip overlap arrows, stress traction and resultant. | Coarse boundary fluxes plus unresolved stress/activity; total load and net force tracked separately. |

The lower-right cell is the missing territory in “one pretty glyph renders everything.” It requires boundary information and subcell summaries. A mascot or bubble can remain the glyph's skin, but the shared record must carry these distinct readings.

## Three studies that occupy this space

1. **Inside one voxel.** Hold one local state; switch between a composite glyph, a deformation/operation view and the 4 × 4 matrix. Target prediction: reversing only b_z exchanges which two matrix signs and which turn direction? Sources: GfX §§3.1–3.3, §4.1, §9.6.
2. **One tornadonut, three resolutions.** Keep the fixture fixed; show 1, 8 and 64 sample volumes. Pair direct structure with averaged state and unresolved activity. Target prediction: can two opposing loops make the mean loop disappear while the load survives? Sources: GfX §§1, 8.1–8.2 plus the explicit sampling contract.
3. **The fluid between.** Put a probe between pressure sources or signed leakage fixtures. Reveal individual contributions, the resulting static pressure, face pushes and their sum. Target prediction: if every face pressure rises equally, which arrows grow and which resultant stays unchanged? Sources: GfX §5.3, §14 and §16.2's explicit Coulomb/positronium mechanism; Condensed's overlap equations provide the compact signed comparison.

## Rejected collapses and productive inversions

- **Fog is “bad” because it hides direction.** Invert the value: fog excels at showing where scalar capacity varies. Keep it as the scalar underlay and give direction independent marks.
- **A matrix is “bad” because it is abstract.** Invert it: the matrix is the precise ledger that prevents one visual from quietly changing meanings. Link each mark to its entries.
- **One voxel is “bad” because it loses the torus.** Invert it: that lost hole teaches what coarse observation removes. Keep enough metadata to show activity and loss of resolved topology.
- **An opaque object is “good” because it feels tangible.** Invert it: opacity can hide interstitial fluid. Use slice/cutaway controls and a visible background pressure channel.
- **Animation is “good” because it feels alive.** Invert it: it can fuse speed, phase and numerical gain. A frozen state with arrows and a controllable phase is often the cleaner probe.
- **A zero vector is “good” because it looks simple.** Invert it: cancellation can conceal violent internal activity. Pair a net arrow with an unsigned activity marker.

## Renderer shortlist

| Renderer family | Teaches best | Surviving boundary |
|---|---|---|
| Capacity fog + sparse grid | Continuity of the background and depletion/packing | Scalar fields only; no force direction from colour alone. |
| Composite voxel glyph | Simultaneous q, e and b at an inspectable place | Signed direction, handedness and raw values remain legible. |
| Torus cutaway with local circulation loops | Defect topology and spatial sampling | Geometry is supplied by the fixture; coarse cells are not miniature literal particles. |
| Face traction probe | Why pressure variation translates or rotates a boundary | Resultant and individual contributions are both retained. |
| Matrix + operation spoke | Exact signs and the action of each tensor block | The comoving frame and slot convention are named. |

Bubbles, foam and creature skins remain viable later if they preserve this contract. The initial studies establish the grammar first so future renderers can exchange skins without changing the reading.
