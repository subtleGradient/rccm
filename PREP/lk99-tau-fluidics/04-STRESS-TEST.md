# LK-99 / Tau-Fluidics Stress Tests

## Candidate no-go attacks

| Attack | Tempting conclusion | Adversarial break |
|---|---|---|
| Set \(E=k_BT\) in \(De=\alpha E/(m_ec^2)\). | At 300 K, \(De\approx3.69\times10^{-10}\) and \(\tan\delta\approx2.71\times10^9\), so the response is viscous-dominated and cannot be superconducting. | Cooling makes \(De\) still smaller and the loss/storage **ratio** still larger—the opposite of the desired phase story. More decisively, both \(G'\sim\mu_sDe^2\) and \(G''\sim\mu_sDe\) approach zero as \(De\to0\); a divergent ratio is not divergent absolute dissipation. The identification \(E=k_BT\) is also not derived. |
| Require \(De\ge1\) for an elastic/lossless state. | The implied threshold is \(E\approx70.0\ \mathrm{MeV}\), or \(T\approx8.13\times10^{11}\ \mathrm K\), so room-temperature superconductivity is impossible. | This is RCCM’s proposed vacuum/hadronization scale, not a material \(T_c\). It would also fail to describe known low-temperature superconductors. |
| Use \(Z_{\tau(\perp)}=h/q^2>0\). | The tau medium has irreducible electrical resistance, so \(R=0\) is impossible. | \(h/e^2\) is a quantum/topological impedance scale, not a derivation of a sample’s longitudinal bulk \(R_{xx}\). Quantum Hall systems themselves separate transverse and longitudinal response. |
| Use \(\mu=\rho_\tau\hbar/(2m)>0\). | Every current must dissipate energy. | The stated force is proportional to \(\nu\nabla^2\mathbf v\). Uniform flow has \(\nabla^2\mathbf v=0\); positive constitutive coefficients do not guarantee an active loss channel. |
| Treat room-temperature phonons as tau turbulence. | Thermal lattice motion must decohere any collective current. | RCCM gives no coupling functional from lattice displacement/phonons to a candidate condensate phase and no derived decoherence rate. |
| Treat superconductivity as fluid solidification. | Only \(De\to\infty\) can be lossless, so ordinary materials cannot superconduct. | RCCM also uses topological confinement, phase lock, and vanishing admittance to protect persistent circulation. The corpus does not choose one material mapping. |
| Treat Meissner expulsion as pressure-driven tau exclusion. | A tau pressure law can decide whether LK-99 is superconducting. | No boundary-value problem maps sample composition and temperature to penetration depth or expelled flux. |

## Variable injections

1. **Uniform ring current:** make the tau velocity spatially uniform along a
   closed path. The Laplacian loss term vanishes locally.
2. **Phase-locked vortex bundle:** couple many carrier-like vortices so only the
   collective phase moves. RCCM has vocabulary that could host this state but
   no formation/decay law.
3. **Pinned vortices:** allow magnetic flux tubes but prevent their motion.
   Zero longitudinal resistance can coexist with nontrivial internal magnetic
   structure.
4. **Normal-fluid shunt:** mix a lossless channel with a dissipative channel.
   A nonzero \(G''\) for the total medium does not determine the DC resistance
   of the protected channel.
5. **Anisotropic tensor:** let the loss eigenvalue be nonzero transversely but
   zero along a crystal direction. A scalar no-go misses the allowed
   eigenchannel.
6. **Interface-only state:** confine coherence to a thin interface while the
   bulk is insulating. Bulk tau parameters do not decide the interface
   transport without matching conditions.
7. **Different pairing mechanism:** replace phonon mediation with an electronic
   or topological collective mode. A phonon-specific thermal argument no longer
   spans the hypothesis space.
8. **Metastable phase:** let synthesis trap a phase absent from equilibrium
   calculations. The experiment still needs to find it, but equilibrium theory
   cannot rule it out by itself.
9. **Granular percolation:** allow isolated superconducting grains without a
   bulk zero-resistance path. Magnetic and transport observables split.
10. **False zero:** let contact geometry, instrument floor, or a metallic
    impurity produce apparent low resistance. This attacks the measurement,
    not the physical possibility.

## Result

Every tau-fluidic no-go route breaks before reaching a material-independent
contradiction. The result triggers the Hyperslice map in
[`07-HYPERSLICE-MAP.md`](07-HYPERSLICE-MAP.md).
