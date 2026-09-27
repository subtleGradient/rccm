# Charge, rotation, and the missing core-to-field construction

This records a specific boundary in the current RCCM sources. It does not
change the TeX or supply a new particle model. The associated
[visual comparison](asymmetric-tensor-cheat-sheet.html#charge-rotation) keeps
the geometry example separate from a prescribed point-charge exterior.

## What the learner's rotation test detects

The earlier guide said that like charges have opposing flow on their facing
sides, illustrated by two planar loops. For a chosen pair of parallel loop
axes that can describe their facing velocities. It is not a proof for arbitrary
independent rotations of the bodies.

For a simple counterexample, take two loops centred on the x axis, with both
angular-velocity vectors along +z. At the facing points the displacement from
the left centre is +x and from the right centre is −x. In the rigid-swirl
fixture v = ω × r, the facing velocities are therefore +y and −y. Their dot
product is negative. Rotate the right loop by 180° about x: its axis becomes
−z, while its facing displacement remains −x. Its facing velocity becomes
+y and the dot product becomes positive. This is a proper spatial rotation,
not a mirror reflection or charge conjugation.

Thus the sign of this two-loop dot product cannot by itself label like versus
opposite electric charges independently of their pose. This counterexample
invalidates that generalization of the cartoon; it is not a solved two-defect
RCCM flow or a refutation of every possible fluid construction.

## What the sources define, and what remains to construct

- **GfX §§1–3:** internal Clebsch vorticity and transverse slip are separate
  fields. Scaled slip enters the electric time–space pairs; scaled vorticity
  enters the magnetic spatial pairs. Three components of an axis do not mean
  three independent internal circulations.
- **GfX §10.6:** charge polarity is identified with a boundary winding number.
  Spatial parity is proposed to map to charge conjugation for an isolated
  defect. The section does not specify a signed winding integral with a full
  core field and boundary data, nor a two-defect solution for independently
  rotated cores.
- **Condensed, “The Kinematic Origin of Charge”:** a toroidal boundary and
  conversion of internal rotation into external transverse strain are proposed.
- **Condensed, “Coulomb's Law”:** the interaction term is
  ρτ v₁·v₂. Opposite winding is assigned positive dot product and identical
  winding negative dot product. Magnitudes then use spherical 1/r² scaling.
  The angular vector fields required to make the sign assignment hold across
  independent core orientations are not constructed in that derivation.

The remaining work is to define the core's charge invariant, derive its
surrounding field (including its boundary or source conditions), solve or
control the two-body interaction, and show that the leading electric force
retains its sign under independent spatial rotations. Isotropic averaging or
rapid internal motion could be hypotheses to examine, but cannot be silently
inserted as a derivation. A chiral knot alone does not establish this result.

## Rotation, parity, and charge conjugation

An ordinary rotation has determinant +1 and preserves handedness. A mirror
reflection changes handedness. In conventional electromagnetism electric
charge is a scalar under spatial parity: E and the outward surface normal
both reverse, leaving their dot product and the integrated electric flux
unchanged. Charge conjugation reverses Q instead. GfX's proposed P-to-C
identification therefore needs an additional physical bridge; flipping the
signs of vector components is insufficient. The visual guide does not assign
positive and negative charge to its two mirror knots.

## Closed-surface curl: a second boundary condition to supply

Condensed also defines eτ by a closed-surface integral of
ετ curl(A⊥). For constant ετ and a smooth, globally defined A⊥ on that closed
surface, the flux of its curl is zero by Stokes's theorem. Excluding the core
does not alone remove this issue if A⊥ remains globally regular on the entire
enclosing surface. Nonzero flux requires an appropriate singularity, patching,
multivalued potential or another specified boundary construction. The guide
does not infer such data from the word “winding.”

## What the new visual actually computes

The torus coordinates are
`[(2 + 0.7 cos v) cos u, (2 + 0.7 cos v) sin u, 0.7 sin v]`.
The combined path uses u = 2s and v = ±3s: a trefoil and its mirror. These
counts demonstrate two independent torus cycles and a chiral closed curve;
they are not electron parameters or charge magnitudes. Changing s to −s
retraces the same knot, reversing both directed windings without changing
the underlying knot's handedness. Reflecting z reverses one winding and
produces the mirror knot. The spatial turn controls apply proper rotations.

In a fluid, helicity is an integral of v·curl(v), with conservation depending
on the equations and boundary conditions. Its transformation properties
illustrate the relevant distinction: it is rotation-invariant, reflection-odd,
and unchanged when the whole velocity field reverses. The visual computes a
curve, not a volumetric helicity field, and does not assume Q equals helicity.

The exterior pictures separately evaluate E = Q r/|r|³ in normalized units.
This is a supplied point-charge field. Their radial flux is rotationally
covariant, and Q sets its sign. They display the behaviour that an RCCM
construction needs to recover; they are not a result derived from the torus.
For extended sources, dipole and higher-order fields and other interactions
can additionally depend on orientation.

Sources: [GfX](../RCCM-GfX-2.tex), [Condensed](../RCCM-Condensed.tex),
[Rolfsen, *Knots and Links*, chapter 3C](https://webhomes.maths.ed.ac.uk/~v1ranick/papers/rolfsen.pdf),
[Bannikova et al., *Helicity of the toroidal vortex with swirl*](https://arxiv.org/abs/1604.00807),
and [OpenStax, Gauss's law](https://openstax.org/books/university-physics-volume-2/pages/6-2-explaining-gausss-law).
