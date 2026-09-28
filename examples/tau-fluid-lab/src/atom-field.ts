import { add, dot, length, mul, sub, tensor, type Vec3 } from './model';
import { addedMass, boundaryPoint, contribution, PAIR_FIELD, rotationalInertia, torusSignedDistance, type CavityPose } from './pair-field';

// Reuse the pair playground's field primitives without changing that experiment.
// The heavy +1 torus is a proton proxy, not a solved proton boundary topology.
export type AtomBody = {
  id: string;
  name: string;
  kind: 'proton' | 'electron';
  pose: CavityPose;
  mass: number;
  inertia: number;
};
export type BodyLoad = { force: Vec3; torque: Vec3 };
export type AtomField = {
  inside: string | null;
  pressure: number;
  q: number;
  chargeSlip: Vec3;
  slip: Vec3;
  omega: Vec3;
  velocity: Vec3;
  e: Vec3;
  b: Vec3;
};

export const ATOM = {
  halfSize: 4.4,
  step: 1 / 120,
  maxElectrons: 8,
  protonMassRatio: 32,
  gridSize: 36,
  radialBins: 36,
  traceLength: 600,
  traceStep: 1 / 30,
  electronMass: addedMass,
  electronInertia: rotationalInertia,
} as const;
export const ZERO: Vec3 = [0, 0, 0];
export const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const chargeColor = (body: AtomBody) => body.kind === 'proton' ? '#f8d96d' : '#b9d8ff';

export function cavityAt(point: Vec3, bodies: AtomBody[]): string | null {
  return bodies.find(body => torusSignedDistance(point, body.pose) < 0)?.id ?? null;
}

// Same signed radial trial halo as pair-field.ts. Kept here to permit a cheap
// N-source pressure sampler without altering the existing pair page.
export function chargeSlipAt(point: Vec3, body: AtomBody, intensity: number): Vec3 {
  const offset = sub(point, body.pose.center);
  const radius = Math.hypot(length(offset), 0.4);
  return mul(offset, body.pose.winding * intensity * PAIR_FIELD.chargeSlipScale
    / (radius * (1 + (radius / PAIR_FIELD.chargeSlipRange) ** 2)));
}

export function pressureFromSlip(slip: Vec3): number {
  return Math.max(0.08, PAIR_FIELD.pressureCapacity - PAIR_FIELD.macroPressure
    - 0.5 * PAIR_FIELD.density * dot(slip, slip));
}

export function sampleAtomPressure(point: Vec3, bodies: AtomBody[], intensity: number): number {
  let slip: Vec3 = ZERO;
  for (const body of bodies) slip = add(slip, chargeSlipAt(point, body, intensity));
  return pressureFromSlip(slip);
}

export function sampleAtomField(point: Vec3, bodies: AtomBody[], intensity: number): AtomField {
  let chargeSlip: Vec3 = ZERO, slip: Vec3 = ZERO, omega: Vec3 = ZERO, velocity: Vec3 = ZERO;
  for (const body of bodies) {
    const part = contribution(point, body.pose, intensity);
    chargeSlip = add(chargeSlip, part.chargeSlip);
    slip = add(slip, part.slip);
    omega = add(omega, part.omega);
    velocity = add(velocity, add(add(part.slip, part.rotational), part.entrained));
  }
  const pressure = pressureFromSlip(chargeSlip);
  return {
    inside: cavityAt(point, bodies), pressure, q: pressure / PAIR_FIELD.pressureCapacity,
    chargeSlip, slip, omega, velocity,
    e: mul(slip, PAIR_FIELD.alpha),
    b: mul(omega, PAIR_FIELD.alpha * PAIR_FIELD.plasticTime),
  };
}

export function atomTensor(field: AtomField): number[][] | null {
  return field.inside ? null : tensor(field.q, field.e, field.b);
}

export function integrateAtomLoads(bodies: AtomBody[], intensity: number): Record<string, BodyLoad> {
  const loads: Record<string, BodyLoad> = {};
  const nu = 16, nv = 8, cellArea = 4 * Math.PI * Math.PI / (nu * nv);
  for (const body of bodies) {
    let force: Vec3 = ZERO, torque: Vec3 = ZERO;
    for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
      const surface = boundaryPoint(body.pose, (i + 0.5) * 2 * Math.PI / nu, (j + 0.5) * 2 * Math.PI / nv, 0.013);
      const ownPressure = pressureFromSlip(chargeSlipAt(surface.point, body, intensity));
      const pressure = sampleAtomPressure(surface.point, bodies, intensity);
      const push = mul(surface.normal, (ownPressure - pressure) * surface.areaWeight * cellArea);
      force = add(force, push);
      torque = add(torque, cross(sub(surface.point, body.pose.center), push));
    }
    // This experiment advances pressure traction only. Displayed twist is a
    // field reading; no guessed helicity/orbital-confinement force is inserted.
    loads[body.id] = { force, torque };
  }
  return loads;
}
