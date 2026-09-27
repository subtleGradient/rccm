# From RCCM state to visible marks

## Data path

`continuous specimen -> sampling operator -> descriptor -> renderer -> tank`

The tank has a display resolution and a camera. The underlying specimen has spatial coordinates, states and boundary conditions. A renderer receives a descriptor and never supplies the physics back into the field.

```ts
type Vec3 = readonly [number, number, number];
type LocalState = {
  q: number; // P_static/P_c = alpha_s²; 0 < q <= 1
  e: Vec3;   // alpha * v_perp/c
  b: Vec3;   // alpha * t_p * Omega
};
type SampledVolume = {
  bounds: { min: Vec3; max: Vec3 };
  meanQ: number;
  meanInverseQ: number;
  meanE: Vec3;
  meanB: Vec3;
  meanBSquared: number; // retained second moment for activity
  // Particle/aggregate identity, topology, material and face fluxes are
  // independently supplied metadata or fields, not recovered from one mean.
};
```

This is the proposed extension contract; the three small native-JS studies use focused subsets rather than a framework or solver. JavaScript is used because the requested deliverable is web-native HTML with Three.js. The existing Bend formalization remains the longer-term engine route.

## Matrix operation

With axis order t,x,y,z:

```text
U = [ -q   -ex   -ey   -ez ]
    [  ex  1/q   -bz    by ]
    [  ey   bz   1/q   -bx ]
    [  ez  -by    bx   1/q ]
```

The symmetric diagonal uses q and its reciprocal. The antisymmetric sector uses signed pairs. Section 4's linear stress-deviation readout is `T/Pc=U−eta`; the physical static-pressure face probe separately uses compressive traction `−Pstatic n`.

## Rendering transfers

| Mark | Input and transfer | Reading |
|---|---|---|
| Fixed cube | Sampling bounds | Where this reading is taken |
| Amber lattice in study 01 | Quantized line count increasing with 1/q | Spatial weight |
| Bubble in study 01 | Radius proportional to cube root of q | Volume proportional to capacity |
| Amber bead in study 02 | Radius proportional to cube root of 1−mean(q) | Volume proportional to depletion; caption names this polarity |
| Cyan arrow | e or mean(e), direction preserved | Transverse slip |
| Rose loop/axis | b or mean(b), explicit handedness or axis | Oriented spatial pair |
| Rose activity halo | RMS b | Hidden variation after mean cancellation |
| Pressure cell in study 03 | Fixed colour scale q=.4 to1, low amber/high cream | Static pressure fraction |
| Boundary arrows | Differences between sampled opposing pressure faces | Instantaneous pressure contribution to force |

Display amplification and bounded glyph sizes support legibility. Numeric readouts carry exact fixture values. A pale reference torus is a spatial guide; the generic voxel glyph does not claim that every sample contains a toroidal particle.

## Sampling and units

Study 02 partitions the same 32³ midpoint samples per defect into 1³,2³,4³ groups. Volume averages preserve both reciprocal and quadratic moments. It treats the two specimens independently. Study 03 instead uses point samples for display cells and face-centre quadrature for its force probe; it explicitly labels that distinction.

q, e, b and U are dimensionless. Pc has pressure units. `Pc*A` is force and `Pc*A*(q_left−q_right)` is a sampled pressure force. `−V_eff grad(Pstatic)` has force units too: m³·Pa/m=N. Section 5.3 uses effective added-mass volume for a defect; the pictured two-face probe is a local operation demonstrator, not an identification of geometric core volume with V_eff.

## Temporal contract

The studies are frozen field specimens. Camera movement changes viewpoint; renderer and resolution controls change representation. Scene controls author a new snapshot. No animation implies time integration, equilibrium solving, or a new trajectory. This keeps the teaching work on spatial state and operators.

## Extension order

1. Use the composite and slice as the basic vocabulary.
2. Add a probe tied to the existing Bend scalar/matrix outputs.
3. Supply recorded fields with physical units and conserved face ledgers.
4. Add streamlines and continuous volume rendering to the same state contract.
5. Add topology- and material-aware identity overlays at aggregate scales.
