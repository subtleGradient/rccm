# LK-99 / Tau-Fluidics Adversarial Evidence Log

Tags state how each fact bears on the original prior. A reported claim is not
treated as an independently established observation.

## Paper and replication evidence

| Tag | Target | Raw fact | Consequence |
|---|---|---|---|
| `[FALSIFIES]` | “LK-99 fails” prior | The original preprint reports \(T_c\ge400\ \mathrm K\), \(10^{-10}\)–\(10^{-11}\ \Omega\cdot\mathrm{cm}\) thin-film resistivity, negative magnetization to 400 K, critical-current/field behavior, and Meissner behavior. | These are the strongest observations that would overturn the prior if independently reproduced. |
| `[SUPPORTS]` | Scope | Two LK-99 preprints were posted on 22 July 2023; the first is literally titled *The First Room-Temperature Ambient-Pressure Superconductor*. | “The viral Twitter paper” is reasonably identified as the LK-99 report. |
| `[SUPPORTS]` | “LK-99 fails” prior | Phase-pure \(Pb_9Cu(PO_4)_6O\) single crystals were highly insulating and optically transparent from 2–800 K, with no transition anomaly; the authors ruled out superconductivity in those crystals. | Removing impurity phases removes the supposed superconducting behavior. |
| `[SUPPORTS]` | “LK-99 fails” prior | LK-99-like samples that half-levitated showed coexisting soft ferromagnetism and diamagnetism but insulating transport and no Meissner or zero-resistance signal. | Partial levitation is not diagnostic of superconductivity. |
| `[SUPPORTS]` | “LK-99 fails” prior | Samples containing Cu₂S showed a sharp, hysteretic resistivity and susceptibility transition near 385–400 K without zero resistance; changing Cu₂S content changed the anomaly. | A first-order impurity transition explains the headline transition more directly than superconductivity. |
| `[SUPPORTS]` | “LK-99 fails” prior | A later replication reproduced the reported electrical and magnetic anomalies and attributed them to the Cu₂S structural transition rather than superconductivity. | The anomalies are reproducible while the superconducting interpretation is not. |
| `[SUPPORTS]` | “LK-99 fails” prior | An almost phase-pure polycrystalline replication remained highly resistive and showed no superconducting magnetic anomaly from 5–325 K. | The failed result is not confined to obviously dirty samples. |
| `[SUPPORTS]` | “LK-99 fails” prior | A combined synthesis/first-principles study found a multiphase non-superconducting sample and concluded the flat bands were more susceptible to magnetism than strong superfluidity. | The early flat-band excitement did not constitute experimental superconductivity. |

Primary sources:

- Lee, Kim, and Kwon,
  [*The First Room-Temperature Ambient-Pressure Superconductor*](https://arxiv.org/abs/2307.12008)
  (preprint, 2023).
- Lee et al.,
  [*Superconductor \(Pb_{10-x}Cu_x(PO_4)_6O\) showing levitation…*](https://arxiv.org/abs/2307.12037)
  (preprint, 2023).
- Puphal et al.,
  [*Single crystal synthesis, structure, and magnetism…*](https://doi.org/10.1063/5.0172755),
  *APL Materials* 11, 101128 (2023).
- Wang et al.,
  [*Ferromagnetic and insulating behavior in both half magnetic levitation and non-levitation LK-99 like samples*](https://doi.org/10.1007/s44214-023-00035-z),
  *Quantum Frontiers* 2, 10 (2023).
- Zhu et al.,
  [*First-order transition in LK-99 containing Cu₂S*](https://doi.org/10.1016/j.matt.2023.11.001),
  *Matter* 6 (2023).
- Habamahoro et al.,
  [*Replication and study of anomalies in LK-99*](https://doi.org/10.1088/1361-6668/ad2b78),
  *Superconductor Science and Technology* 37, 035006 (2024).
- Kumar et al.,
  [*Absence of Superconductivity in LK-99 at Ambient Conditions*](https://doi.org/10.1021/acsomega.3c06096),
  *ACS Omega* 8 (2023).
- Jiang et al.,
  [*Phonon bands, localized flat-band magnetism, models, and chemical analysis*](https://doi.org/10.1103/PhysRevB.108.235127),
  *Physical Review B* 108, 235127 (2023).

## Evidence against a universal impossibility claim

| Tag | Raw fact | Consequence |
|---|---|---|
| `[SUPPORTS]` | \(H_3S\) showed zero resistance, magnetic-field suppression of \(T_c\), magnetic susceptibility, and an isotope shift at \(203\ \mathrm K\) under high pressure. | Thermal disorder does not impose a known low universal ceiling on superconductivity. |
| `[SUPPORTS]` | \(LaH_{10}\) showed superconductivity around \(250\ \mathrm K\) at about 170 GPa. | Confirmed superconductivity already lies within roughly 50 K of ordinary room temperature, though not at ambient pressure. |
| `[SUPPORTS]` | Pressure-quenched \(HgBa_2Ca_2Cu_3O_{8+\delta}\) reached a reported ambient-pressure record \(T_c=151\ \mathrm K\) in 2026. | Ambient-pressure \(T_c\) is an empirical materials frontier, not a fixed ceiling supplied by RCCM. |
| `[SUPPORTS]` | The hydride papers state that the relevant conventional theories allow room-temperature superconductivity for favorable material parameters. | A universal no-go requires a stronger, independently tested bound than RCCM currently gives. |

Primary sources:

- Drozdov et al.,
  [*Conventional superconductivity at 203 kelvin at high pressures in the sulfur hydride system*](https://doi.org/10.1038/nature14964),
  *Nature* 525, 73–76 (2015).
- Drozdov et al.,
  [*Superconductivity at 250 K in lanthanum hydride under high pressures*](https://doi.org/10.1038/s41586-019-1201-8),
  *Nature* 569, 528–531 (2019).
- Deng et al.,
  [*Ambient-pressure 151-K superconductivity in \(HgBa_2Ca_2Cu_3O_{8+\delta}\) via pressure quench*](https://doi.org/10.1073/pnas.2536178123),
  *PNAS* 123, e2536178123 (2026).

## RCCM corpus evidence

| Tag | Raw fact | Source | Consequence |
|---|---|---|---|
| `[SUPPORTS]` | The complex modulus has \(G''>0\) at finite \(De>0\) and \(\tan\delta=1/De\). | [`RCCM-Condensed.tex`, lines 1659–1671](../../RCCM-Condensed.tex#L1659-L1671) | This is the strongest candidate tau-fluidic dissipation premise. |
| `[SUPPORTS]` | RCCM defines a nonzero dynamic viscosity \(\mu=\rho_\tau\hbar/(2m)\). | [`RCCM-Condensed.tex`, lines 2089–2108](../../RCCM-Condensed.tex#L2089-L2108) | This is a second candidate premise for unavoidable resistance. |
| `[FALSIFIES]` | The actual viscous contribution is \(\alpha_{\circlearrowleft}\nu\nabla^2\mathbf v\). | [`RCCM-Condensed.tex`, lines 2338–2364](../../RCCM-Condensed.tex#L2338-L2364) | Positive viscosity alone does not prove nonzero loss; the operator can vanish. |
| `[FALSIFIES]` | RCCM explicitly claims an internal circulation can encounter “zero kinematic resistance.” | [`RCCM-Condensed.tex`, lines 1851–1861](../../RCCM-Condensed.tex#L1851-L1861) | The ontology itself admits at least one lossless-flow limit. |
| `[SUPPORTS]` | RCCM maps \(h/q^2\) to the transverse quantum resistance \(R_K\). | [`RCCM-Condensed.tex`, lines 1880–1889](../../RCCM-Condensed.tex#L1880-L1889) | A tempting no-go would equate this with unavoidable sample resistance. |
| `[FALSIFIES]` | The same section labels \(R_K\) a transverse/topological impedance, while material effective mass and refraction are separate projections. | [`RCCM-Condensed.tex`, lines 1880–1957](../../RCCM-Condensed.tex#L1880-L1957) | Equating \(R_K\) with longitudinal four-probe resistance is not derived. |
| `[FALSIFIES]` | RCCM’s current map from current density to tau fields is Maxwell-shaped but supplies no Ohm law, carrier collision term, condensate field, energy gap, penetration depth, coherence length, or \(T_c\). | [`RCCM-Condensed.tex`, lines 3135–3216](../../RCCM-Condensed.tex#L3135-L3216) | The theory cannot yet calculate a material’s superconducting transition. |
| `[FALSIFIES]` | The root atlas already identifies the missing constitutive link among density, moduli, relaxation time, and temperature. | [`README.md`, lines 936–943](../../README.md#L936-L943) | The missing temperature/response bridge is a known structural gap, not a detail. |
