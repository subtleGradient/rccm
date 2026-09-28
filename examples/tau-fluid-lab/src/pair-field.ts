import { add, dot, length, mul, rotate, sub, tensor, unrotate, type Vec3 } from './model';

export type CavityId = 'positive' | 'negative';
export type CavityPose = {
  id: CavityId;
  center: Vec3;
  velocity: Vec3;
  yaw: number;
  tilt: number;
  spin: number;
  angularVelocity: Vec3;
  winding: 1 | -1;
};
export type PairState = { positive: CavityPose; negative: CavityPose };
export type PairOptions = {
  intensity: number;
  startHalfSeparation: number;
  positiveWinding: 1 | -1;
  positiveYaw: number;
  positiveTilt: number;
  positiveYawRate: number;
  positiveTiltRate: number;
  negativeWinding: 1 | -1;
  negativeYaw: number;
  negativeTilt: number;
  negativeYawRate: number;
  negativeTiltRate: number;
};
export type Contribution = { slip: Vec3; chargeSlip: Vec3; poloidalSlip: Vec3; rotational: Vec3; omega: Vec3; entrained: Vec3 };
export type FieldReading = {
  inside: CavityId | null;
  positive: Contribution;
  negative: Contribution;
  slip: Vec3;
  chargeSlip: Vec3;
  rotational: Vec3;
  omega: Vec3;
  velocity: Vec3;
  dynamicPressure: number;
  staticPressure: number;
  q: number;
  interactionPressure: number;
};

export const PAIR_FIELD = {
  duration: 10,
  frameRate: 24,
  majorRadius: 0.68,
  tubeRadius: 0.22,
  pressureCapacity: 1,
  macroPressure: 0.06,
  density: 0.28,
  slipScale: 0.74,
  chargeSlipScale: 0.75,
  chargeSlipRange: 2.1,
  spinScale: 1.12,
  fieldRange: 1.6,
  entrainmentRange: 0.56,
  alpha: 0.55,
  plasticTime: 0.6,
  addedMassCoefficient: 2,
  rotationalInertiaCoefficient: 20,
} as const;

const ZERO: Vec3 = [0, 0, 0];
const EMPTY: Contribution = { slip: ZERO, chargeSlip: ZERO, poloidalSlip: ZERO, rotational: ZERO, omega: ZERO, entrained: ZERO };
const TAU = Math.PI * 2;
const radialGuard = 0.18;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpVec = (a: Vec3, b: Vec3, t: number): Vec3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

export function initialPairState(options: PairOptions): PairState {
  const base = (id: CavityId, x: number, winding: 1 | -1, yaw: number, tilt: number, yawRate: number, tiltRate: number): CavityPose => ({
    id, center: [x, 0, 0], velocity: ZERO, yaw, tilt, spin: 0, angularVelocity: [tiltRate, yawRate, 0], winding,
  });
  return {
    positive: base('positive', -options.startHalfSeparation, options.positiveWinding, options.positiveYaw, options.positiveTilt, options.positiveYawRate, options.positiveTiltRate),
    negative: base('negative', options.startHalfSeparation, options.negativeWinding, options.negativeYaw, options.negativeTilt, options.negativeYawRate, options.negativeTiltRate),
  };
}

export function torusSignedDistance(point: Vec3, pose: CavityPose): number {
  const p = unrotate(sub(point, pose.center), pose.yaw, pose.tilt);
  return Math.hypot(Math.hypot(p[0], p[1]) - PAIR_FIELD.majorRadius, p[2]) - PAIR_FIELD.tubeRadius;
}

// The local vortex turns with the cavity. A separately hypothesized polar
// charge-slip halo carries winding sign without using the cavity's axis as
// the charge direction. This is an orientation-invariant visual closure, not
// a derived solution of the charged-defect boundary problem.
export function contribution(point: Vec3, pose: CavityPose, intensity: number): Contribution {
  const offset = sub(point, pose.center);
  const chargeRadius = Math.hypot(length(offset), 0.4);
  const chargeGain = pose.winding * intensity * PAIR_FIELD.chargeSlipScale
    / (chargeRadius * (1 + (chargeRadius / PAIR_FIELD.chargeSlipRange) ** 2));
  const chargeSlip = mul(offset, chargeGain);
  const p = unrotate(sub(point, pose.center), pose.yaw, pose.tilt);
  const r = Math.hypot(p[0], p[1]);
  if (r < 1e-6) return { ...EMPTY, slip: chargeSlip, chargeSlip };
  const s = Math.hypot(r - PAIR_FIELD.majorRadius, p[2]);
  const d = s - PAIR_FIELD.tubeRadius;
  const ell = PAIR_FIELD.fieldRange;
  const envelope = Math.exp(-d * d / (ell * ell));
  const ringCutoff = r * r / (r * r + radialGuard * radialGuard);
  const ringCutoffPrime = 2 * r * radialGuard * radialGuard / Math.pow(r * r + radialGuard * radialGuard, 2);
  // Monotone streamfunction: exterior slip fades without reversing direction
  // far from the cavity, so the gap-flow story remains spatially readable.
  const transition = Math.tanh(d / ell);
  const streamDerivative = 1 - transition * transition;
  const dsdr = s > 1e-7 ? (r - PAIR_FIELD.majorRadius) / s : 0;
  const dsdz = s > 1e-7 ? p[2] / s : 0;
  const stream = ell * transition;
  const gain = pose.winding * intensity * PAIR_FIELD.slipScale;
  const vr = -gain * ringCutoff * streamDerivative * dsdz / r;
  const vz = gain * (ringCutoffPrime * stream + ringCutoff * streamDerivative * dsdr) / r;
  const slipLocal: Vec3 = [vr * p[0] / r, vr * p[1] / r, vz];

  const toroidalCutoff = r / Math.hypot(r, radialGuard);
  const toroidalCutoffPrime = radialGuard * radialGuard / Math.pow(r * r + radialGuard * radialGuard, 1.5);
  const amplitude = intensity * PAIR_FIELD.spinScale;
  const vphi = amplitude * envelope * toroidalCutoff;
  const rotationalLocal: Vec3 = [-vphi * p[1] / r, vphi * p[0] / r, 0];
  const envelopeR = envelope * -2 * d / (ell * ell) * dsdr;
  const envelopeZ = envelope * -2 * d / (ell * ell) * dsdz;
  const curlR = -amplitude * toroidalCutoff * envelopeZ;
  const curlZ = amplitude * (envelope * (toroidalCutoffPrime + toroidalCutoff / r) + toroidalCutoff * envelopeR);
  const omegaLocal: Vec3 = [curlR * p[0] / r, curlR * p[1] / r, curlZ];

  const outside = Math.max(0, d);
  const entrainment = Math.exp(-outside * outside / (PAIR_FIELD.entrainmentRange ** 2));
  const poloidalSlip = rotate(slipLocal, pose.yaw, pose.tilt);
  return {
    slip: add(chargeSlip, poloidalSlip),
    chargeSlip,
    poloidalSlip,
    rotational: rotate(rotationalLocal, pose.yaw, pose.tilt),
    omega: rotate(omegaLocal, pose.yaw, pose.tilt),
    entrained: mul(pose.velocity, entrainment),
  };
}

export function samplePairField(point: Vec3, state: PairState, intensity: number): FieldReading {
  const inside = torusSignedDistance(point, state.positive) < 0 ? 'positive'
    : torusSignedDistance(point, state.negative) < 0 ? 'negative' : null;
  const positive = contribution(point, state.positive, intensity);
  const negative = contribution(point, state.negative, intensity);
  const slip = add(positive.slip, negative.slip);
  const chargeSlip = add(positive.chargeSlip, negative.chargeSlip);
  const rotational = add(positive.rotational, negative.rotational);
  const omega = add(positive.omega, negative.omega);
  const entrained = add(positive.entrained, negative.entrained);
  const velocity = add(add(slip, rotational), entrained);
  // This teaching closure isolates charge-linked transverse slip in the
  // pressure ledger, so rotating a cavity cannot change charge-force sign.
  // Local poloidal, toroidal, and entrained motions remain visible separately.
  const dynamicPressure = 0.5 * PAIR_FIELD.density * dot(chargeSlip, chargeSlip);
  const staticPressure = Math.max(0.08, PAIR_FIELD.pressureCapacity - PAIR_FIELD.macroPressure - dynamicPressure);
  return {
    inside, positive, negative, slip, chargeSlip, rotational, omega, velocity, dynamicPressure, staticPressure,
    q: staticPressure / PAIR_FIELD.pressureCapacity,
    interactionPressure: -PAIR_FIELD.density * dot(positive.chargeSlip, negative.chargeSlip),
  };
}

export function tensorAt(point: Vec3, state: PairState, intensity: number): number[][] | null {
  const sample = samplePairField(point, state, intensity);
  if (sample.inside) return null;
  return tensor(sample.q, mul(sample.slip, PAIR_FIELD.alpha), mul(sample.omega, PAIR_FIELD.alpha * PAIR_FIELD.plasticTime));
}

export type BoundaryPush = { position: Vec3; normal: Vec3; normalForce: Vec3; tangentialForce: Vec3; total: Vec3 };

export function boundaryPoint(pose: CavityPose, u: number, v: number, padding = 0): { point: Vec3; normal: Vec3; areaWeight: number } {
  const radius = PAIR_FIELD.tubeRadius + padding;
  const ring = PAIR_FIELD.majorRadius + radius * Math.cos(v);
  const local: Vec3 = [ring * Math.cos(u), ring * Math.sin(u), radius * Math.sin(v)];
  const normal = rotate([Math.cos(u) * Math.cos(v), Math.sin(u) * Math.cos(v), Math.sin(v)], pose.yaw, pose.tilt);
  return { point: add(pose.center, rotate(local, pose.yaw, pose.tilt)), normal, areaWeight: (PAIR_FIELD.majorRadius + PAIR_FIELD.tubeRadius * Math.cos(v)) * PAIR_FIELD.tubeRadius };
}

export function boundaryPush(pose: CavityPose, state: PairState, intensity: number, u: number, v: number): BoundaryPush {
  const { point, normal } = boundaryPoint(pose, u, v, 0.013);
  const reading = samplePairField(point, state, intensity);
  const own = pose.id === 'positive' ? reading.positive : reading.negative;
  const other = pose.id === 'positive' ? reading.negative : reading.positive;
  const ownDynamicPressure = 0.5 * PAIR_FIELD.density * dot(own.chargeSlip, own.chargeSlip);
  const ownStaticPressure = Math.max(0.08, PAIR_FIELD.pressureCapacity - PAIR_FIELD.macroPressure - ownDynamicPressure);
  // The cavity cannot propel itself. Remove its isolated pressure and twist;
  // only the neighbouring cavity's change in surface load moves the pair.
  const normalForce = mul(normal, ownStaticPressure - reading.staticPressure);
  const b = mul(other.omega, PAIR_FIELD.alpha * PAIR_FIELD.plasticTime * PAIR_FIELD.pressureCapacity);
  const tangentialForce = cross(b, normal);
  return { position: point, normal, normalForce, tangentialForce, total: add(normalForce, tangentialForce) };
}

export function integrateBoundary(pose: CavityPose, state: PairState, intensity: number, nu = 18, nv = 12): { force: Vec3; torque: Vec3 } {
  let force: Vec3 = ZERO;
  let torque: Vec3 = ZERO;
  const cellArea = TAU * TAU / (nu * nv);
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
    const u = (i + 0.5) * TAU / nu, v = (j + 0.5) * TAU / nv;
    const surface = boundaryPoint(pose, u, v);
    const push = boundaryPush(pose, state, intensity, u, v);
    const differential = mul(push.total, surface.areaWeight * cellArea);
    force = add(force, mul(push.normalForce, surface.areaWeight * cellArea));
    torque = add(torque, cross(sub(surface.point, pose.center), differential));
  }
  return { force, torque };
}

export const displacedVolume = 2 * Math.PI * Math.PI * PAIR_FIELD.majorRadius * PAIR_FIELD.tubeRadius ** 2;
export const addedMass = PAIR_FIELD.addedMassCoefficient * PAIR_FIELD.density * displacedVolume;
export const rotationalInertia = PAIR_FIELD.rotationalInertiaCoefficient * addedMass * (PAIR_FIELD.majorRadius ** 2 + PAIR_FIELD.tubeRadius ** 2);

function advancePose(pose: CavityPose, force: Vec3, torque: Vec3, dt: number): CavityPose {
  const velocity = add(pose.velocity, mul(force, dt / addedMass));
  const angularVelocity = add(pose.angularVelocity, mul(torque, dt / rotationalInertia));
  return {
    ...pose, center: add(pose.center, mul(velocity, dt)), velocity,
    tilt: pose.tilt + angularVelocity[0] * dt,
    yaw: pose.yaw + angularVelocity[1] * dt,
    spin: pose.spin + angularVelocity[2] * dt,
    angularVelocity,
  };
}

function surfacesTouch(state: PairState): boolean {
  for (const pose of [state.positive, state.negative]) {
    const other = pose.id === 'positive' ? state.negative : state.positive;
    for (let i = 0; i < 32; i++) for (let j = 0; j < 8; j++) {
      if (torusSignedDistance(boundaryPoint(pose, i * TAU / 32, j * TAU / 8).point, other) <= 0.012) return true;
    }
  }
  return false;
}

export type PairHistory = { frames: PairState[]; contactTime: number | null; frameStep: number; duration: number };

export function solvePairHistory(options: PairOptions): PairHistory {
  const step = 1 / PAIR_FIELD.frameRate;
  const frames: PairState[] = [initialPairState(options)];
  let contactTime: number | null = null;
  for (let i = 1; i <= PAIR_FIELD.duration * PAIR_FIELD.frameRate; i++) {
    const previous = frames[i - 1];
    const a = integrateBoundary(previous.positive, previous, options.intensity);
    const b = integrateBoundary(previous.negative, previous, options.intensity);
    const next = {
      positive: advancePose(previous.positive, a.force, a.torque, step),
      negative: advancePose(previous.negative, b.force, b.torque, step),
    };
    frames.push(next);
    if (surfacesTouch(next)) { contactTime = i * step; break; }
  }
  return { frames, contactTime, frameStep: step, duration: PAIR_FIELD.duration };
}

function interpolatePose(a: CavityPose, b: CavityPose, t: number): CavityPose {
  return {
    ...a, center: lerpVec(a.center, b.center, t), velocity: lerpVec(a.velocity, b.velocity, t),
    yaw: lerp(a.yaw, b.yaw, t), tilt: lerp(a.tilt, b.tilt, t), spin: lerp(a.spin, b.spin, t),
    angularVelocity: lerpVec(a.angularVelocity, b.angularVelocity, t),
  };
}

export function pairStateAt(history: PairHistory, time: number): PairState {
  const frame = clamp(time / history.frameStep, 0, history.frames.length - 1);
  const i = Math.floor(frame);
  const a = history.frames[i], b = history.frames[Math.min(i + 1, history.frames.length - 1)];
  const fraction = frame - i;
  return { positive: interpolatePose(a.positive, b.positive, fraction), negative: interpolatePose(a.negative, b.negative, fraction) };
}

export function localResiduals(pose: CavityPose, state: PairState, intensity: number): { boundaryFlux: number; divergence: number } {
  let boundaryFlux = 0;
  for (let i = 0; i < 16; i++) for (let j = 0; j < 8; j++) {
    const sample = boundaryPoint(pose, i * TAU / 16, j * TAU / 8, 0.008);
    const relative = sub(samplePairField(sample.point, state, intensity).velocity, pose.velocity);
    boundaryFlux = Math.max(boundaryFlux, Math.abs(dot(relative, sample.normal)));
  }
  let divergence = 0;
  const h = 0.015;
  for (const p of [add(pose.center, [PAIR_FIELD.majorRadius + 0.36, 0, 0]), [0, 0, 0] as Vec3]) {
    let div = 0;
    for (let axis = 0; axis < 3; axis++) {
      const direction: Vec3 = axis === 0 ? [h, 0, 0] : axis === 1 ? [0, h, 0] : [0, 0, h];
      const plus = samplePairField(add(p, direction), state, intensity).velocity[axis];
      const minus = samplePairField(sub(p, direction), state, intensity).velocity[axis];
      div += (plus - minus) / (2 * h);
    }
    divergence = Math.max(divergence, Math.abs(div));
  }
  return { boundaryFlux, divergence };
}

export function arrowScale(force: Vec3): number { return clamp(length(force), 0, 1.2); }
