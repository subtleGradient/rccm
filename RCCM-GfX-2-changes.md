**The September 21 revision substantially changes the machinery around the tensor, while keeping the central \(4\times4\) matrix intact.** I compared commit `9cb777b` with the previous July 30 version, `fe6553b`. The document grows from 15 to 16 sections, with 1,163 lines added and 573 removed.

Below, “derives” and “explains” describe the manuscript’s arguments, not independently established physics.

**1. Motion now has two distinct regimes.**

Picture the continuous medium flowing, then a persistent cavity or vortex embedded within it. The revision gives those two objects different inertia rules:

- **Continuous medium:** revised §5.1 uses dynamic flow density, \(\rho_{dyn}=P_{dyn}/c^2\), and introduces factors of \(1/2\) in the pressure and shear terms.
- **Mass defect:** new §5.2 uses an inertial density of \(\rho_\tau+P/c^2\). Increasing pressure makes a fixed mechanical force produce less acceleration.

This replaces the previous approach of using \(\rho_\tau/\alpha_a\) and multiplying the mechanical acceleration terms by \(\alpha_a\). The new section also introduces an **added-mass model**: the defect’s mass includes the medium it effectively carries along. It explicitly leaves derivation of that effective volume from the tensor to future work. [Motion equations](<RCCM-GfX-2.tex:418>)

**2. The bridge to general relativity changes.**

Previously, §4.3 set the antisymmetric part \(A\) to zero and identified curvature through the algebraic scaling \(G=\Lambda(S-\eta)\).

Now it introduces a **differential incompatibility operator**: curvature measures how the strained medium fails to fit together. It also averages randomly oriented microscopic twists rather than removing them. Coherent rotation can therefore survive at galactic scales.

That is a substantial conceptual change. However, §6.1 still uses the older algebraic curvature relationship, now with an appeal to Lovelock’s theorem. The relationship between those two routes remains something to check. [Rewritten GR bridge](<RCCM-GfX-2.tex:312>)

**3. The galaxy explanation is rebuilt.**

The old §11 focused on a rotating core, a slipping outer region, and excess lensing from the tensor’s off-diagonal terms.

The replacement first calculates a baryonic-plus-cosmological baseline and explicitly isolates the difference from observed rotation speeds. It then proposes **a rotating disk straining the surrounding medium into an effectively two-dimensional tension field**.

The mathematical chain is:

\[
\text{logarithmic pressure well}
\;\longrightarrow\;
\text{inward acceleration proportional to }1/r
\;\longrightarrow\;
\text{constant orbital speed}.
\]

It adds three spatial zones, a proposed derivation of \(v_{\rm flat}^4=GM_{\rm bar}a_0\), and predictions about redshift dependence, galaxy inclination, and an outer lensing boundary.

There is an unresolved transition within the text: §11.5 calls the generation mechanism an open problem; §11.6 immediately supplies a “Proposed Resolution.” Its “Universal No-Go Theorem” is also a new manuscript claim, not an established exclusion of competing models. [Galaxy rewrite](<RCCM-GfX-2.tex:1464>)

**4. Several changes alter actual signs or numerical factors.**

| Item | Previous version | Revised version |
|---|---|---|
| Weak-field spatial coefficient | \(1+2\Phi/c^2\) | \(1-2\Phi/c^2\) |
| Corresponding spatial stress | \(+\rho_\tau\Phi\) | \(-\rho_\tau\Phi\) |
| Full-cycle action constant | \(\kappa=\hbar\) | \(\kappa=h\) |
| Proposed elementary force scale | \(\hbar c/(2\pi r^2)\) | \(\hbar c/r^2\) |
| Aggregate mass normalization | \(\sqrt{\hbar c/(2\pi G)}\) | \(\sqrt{\hbar c/G)}\) |

The force derivation now computes work using an integral to infinity. Its final Newtonian aggregate force remains \(GM_1M_2/r^2\), because the force and mass normalizations change together. [Stress sign](<RCCM-GfX-2.tex:285>), [force normalization](<RCCM-GfX-2.tex:1873>)

**5. Cosmological optics becomes a full section.**

The capacity-ratio explanation of redshift already existed. New §15 extends it through refractive index, accumulated optical distance, and apparent brightness:

\[
n=\frac{1}{\alpha_s^2},
\qquad
r_{\rm opt}=\int n\,dr,
\qquad
\Delta\mu=5\log_{10}(r_{\rm opt}/r_{\rm true}).
\]

Crucially, it now says the exponential pressure profile comes from **inverting Pantheon+ observations**, with the boundary derivation still open.

This also needs reconciliation with the condensed document’s \(D_L=(1+z)r_{\rm true}\): the revised focused document uses \(r_{\rm opt}\) in its observed magnitude calculation. [New optics section](<RCCM-GfX-2.tex:2034>), [condensed distance formula](<RCCM-Condensed.tex:1039>)

Other additions include a nonlinear stress correction near saturation, differential-form notation for Clebsch fields, gauge-invariant “dressed” variables, expanded parity/charge discussion, and a proposed deterministic measurement mechanism.

**One useful definition was lost:** §2 deletes the explicit nested-pressure equations defining \(\alpha_a\) and \(\alpha_s^2=P_{static}/P_c=\alpha_g^2\alpha_a^2\), although later sections still rely on them.

The best next slice is the new motion split: imagine pushing a flowing parcel and then pushing a persistent cavity carrying surrounding fluid. What should determine how much medium each shove must accelerate?
