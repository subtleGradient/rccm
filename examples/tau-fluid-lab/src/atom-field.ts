import { add, dot, length, mul, sub, tensor, type Vec3 } from './model';
import { addedMass, PAIR_FIELD, rotationalInertia, type CavityPose } from './pair-field';
import { cavityDistance, cavityFrame } from './atom-geometry';
import { orbitalDensity, orbitalNode, ORBITAL_SCALE, type Orbital } from './atom-orbitals';

export type AtomBody = {
  id: string; name: string; kind: 'proton' | 'electron'; pose: CavityPose;
  mass: number; inertia: number; orbital: Orbital;
};
export type BodyLoad = { force: Vec3; torque: Vec3 };
export type AtomField = {
  inside: string | null; pressure: number; q: number; chargeSlip: Vec3;
  slip: Vec3; omega: Vec3; velocity: Vec3; e: Vec3; b: Vec3;
};
export const ATOM = {
  halfSize: 12, step: 1 / 120, maxElectrons: 8, protonMassRatio: 32,
  gridSize: 48, radialBins: 36, traceLength: 900, traceStep: 1 / 30,
  electronMass: addedMass, electronInertia: rotationalInertia,
} as const;
export const ZERO: Vec3 = [0, 0, 0];
export const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const chargeColor = (body: AtomBody) => body.kind === 'proton' ? '#f4d35f' : '#83b6ff';
export const cavityAt = (point: Vec3, bodies: AtomBody[]) => bodies.find(body => cavityDistance(point, body) < 0)?.id ?? null;

// The pair's orientation-independent signed trial halo is retained. This
// assumes a source/charge association; it is not a solved solenoidal field.
export function chargeSlipAt(point: Vec3, body: AtomBody, intensity: number): Vec3 {
  const offset = sub(point, body.pose.center), radius = Math.hypot(length(offset), 0.4);
  return mul(offset, body.pose.winding * intensity * PAIR_FIELD.chargeSlipScale
    / (radius * (1 + (radius / 2.8) ** 2)));
}
export function pressureFromSlip(slip: Vec3): number {
  return Math.max(0.08, PAIR_FIELD.pressureCapacity - PAIR_FIELD.macroPressure - 0.5 * PAIR_FIELD.density * dot(slip, slip));
}
export function sampleAtomPressure(point: Vec3, bodies: AtomBody[], intensity: number): number {
  let slip: Vec3 = ZERO;
  for (const body of bodies) slip = add(slip, chargeSlipAt(point, body, intensity));
  return pressureFromSlip(slip);
}

export function sampleAtomField(point: Vec3, bodies: AtomBody[], intensity: number): AtomField {
  let chargeSlip: Vec3 = ZERO, localSlip: Vec3 = ZERO, omega: Vec3 = ZERO, velocity: Vec3 = ZERO;
  let inside: string | null = null;
  for (const body of bodies) {
    chargeSlip = add(chargeSlip, chargeSlipAt(point, body, intensity));
    const offset = sub(point, body.pose.center), radius = length(offset);
    if (radius > (body.kind === 'proton' ? 2.1 : 1.6)) continue;
    const frame = cavityFrame(point, body);
    if (frame.distance < 0) inside = body.id;
    const gain = Math.exp(-(Math.max(0, frame.distance) ** 2) / 0.48) * intensity;
    const circulation = mul(cross(frame.tangent, frame.normal), gain * body.pose.winding * 0.85);
    const along = mul(frame.tangent, gain * 0.55);
    localSlip = add(localSlip, circulation);
    omega = add(omega, mul(frame.tangent, gain * body.pose.winding * 2.8));
    velocity = add(velocity, add(add(circulation, along), mul(body.pose.velocity, gain)));
  }
  const slip = add(chargeSlip, localSlip), pressure = pressureFromSlip(chargeSlip);
  return { inside, pressure, q: pressure / PAIR_FIELD.pressureCapacity, chargeSlip, slip, omega,
    velocity: add(velocity, mul(chargeSlip, 0.32)), e: mul(slip, PAIR_FIELD.alpha),
    b: mul(omega, PAIR_FIELD.alpha * PAIR_FIELD.plasticTime) };
}
export const atomTensor = (field: AtomField) => field.inside ? null : tensor(field.q, field.e, field.b);

export function referenceDensity(point: Vec3, bodies: AtomBody[]): number {
  const relative = sub(point, bodies[0].pose.center);
  return bodies.slice(1).reduce((sum, body) => sum + orbitalDensity(relative, body.orbital), 0);
}

// Source-weighted hue is deliberately separate from q and signed Cartesian
// tensor components. Opposite source weights mix gray, like-charge overlap
// intensifies blue. Optional node tint implements the user's design hypothesis.
export function slipAppearance(point: Vec3, bodies: AtomBody[], intensity: number, interpretation: number) {
  let positive = 0, negative = 0, squareNegative = 0, node = 0, preferred = 0;
  const relative = sub(point, bodies[0].pose.center);
  for (const body of bodies) {
    const radius = length(sub(point, body.pose.center));
    const weight = intensity / (1 + (radius / 2.2) ** 2) ** 1.65;
    if (body.kind === 'proton') positive += weight;
    else {
      negative += weight; squareNegative += weight * weight;
      node = Math.max(node, orbitalNode(relative, body.orbital));
      const peak = body.orbital === '1s' ? 1 : body.orbital === '2s' ? 1 / 8 : Math.exp(-2) / 8;
      preferred = Math.max(preferred, Math.min(1, Math.pow(orbitalDensity(relative, body.orbital) * Math.PI * ORBITAL_SCALE ** 3 / peak, 0.3)));
    }
  }
  const crowding = Math.sqrt(Math.max(0, negative * negative - squareNegative));
  const raw = Math.tanh(2.6 * (positive - negative - 0.5 * crowding));
  const nearCore = bodies.some(body => length(sub(point, body.pose.center)) < (body.kind === 'proton' ? 1.5 : 0.9));
  const balance = nearCore ? raw : raw * (1 - interpretation * 0.8 * preferred) - interpretation * 0.88 * node;
  return { balance: Math.max(-1, Math.min(1, balance)), crowding, node, preferred };
}
