import { CUBE_HALF, TORUS_MAJOR, TORUS_MINOR, add, dot, mul, sub, type Vec3 } from './model';

/** A constrained, normalized teaching fixture, not a solved RCCM fluid equation. */
export type ChargeCase = 'opposite' | 'like';
export type ChargeCore = 'left' | 'right';
export type ChargeState = {
  time: number;
  left: number;
  right: number;
  leftVelocity: number;
  rightVelocity: number;
  stopped: boolean;
};
export type ChargeReading = { inside: true; core: ChargeCore } | {
  inside: false;
  velocity: Vec3;
  leftFlow: Vec3;
  rightFlow: Vec3;
  slip: Vec3;
  pressure: number;
  q: number;
  leftDynamic: number;
  rightDynamic: number;
  interaction: number;
};

export const CHARGE_DURATION = 6;
export const CHARGE_DT = 1 / 60;
export const CHARGE_MIN_SEPARATION = 1.52;
export const CHARGE_MAX_SEPARATION = 2.8;
export const CHARGE_MASS = 0.4;
const AXIS_EPSILON = 0.03;
const SURFACE_BAND = 0.08;
const RHO = TORUS_MAJOR;
const A = TORUS_MINOR;

export function initialChargeState(separation = 1.88): ChargeState {
  return { time: 0, left: -separation / 2, right: separation / 2, leftVelocity: 0, rightVelocity: 0, stopped: false };
}

export function chargeDistance(point: Vec3, center: number): number {
  return Math.hypot(Math.hypot(point[0] - center, point[1]) - RHO, point[2]) - A;
}

export function chargeNormal(point: Vec3, center: number): Vec3 {
  const x = point[0] - center, y = point[1], z = point[2];
  const radius = Math.hypot(x, y) || 1e-8;
  const tubeX = radius - RHO;
  const tubeRadius = Math.hypot(tubeX, z) || 1e-8;
  return [(x / radius) * tubeX / tubeRadius, (y / radius) * tubeX / tubeRadius, z / tubeRadius];
}

function sourceFlow(point: Vec3, center: number, sign: 1 | -1): { flow: Vec3; gain: number } {
  const x = point[0] - center, y = point[1], z = point[2];
  const radius = Math.sqrt(x * x + y * y + AXIS_EPSILON * AXIS_EPSILON);
  const tubeX = radius - RHO;
  const tubeRadius = Math.hypot(tubeX, z) || 1e-8;
  const shell = Math.max(0, tubeRadius - A);
  const gain = 1 / (1 + (shell / 0.8) ** 2);
  // The signed ring motion is the transverse-slip proxy. The smaller tube
  // motion stays fixed while the ring winding changes for this aligned fixture.
  const flow: Vec3 = [
    gain * (-sign * y / radius - 0.2 * x / radius * z / tubeRadius),
    gain * (sign * x / radius - 0.2 * y / radius * z / tubeRadius),
    gain * 0.2 * tubeX / tubeRadius,
  ];
  return { flow, gain };
}

function chargeField(point: Vec3, state: ChargeState, scenario: ChargeCase, active: 'left' | 'both' = 'both') {
  const left = sourceFlow(point, state.left, 1);
  const right = active === 'both' ? sourceFlow(point, state.right, scenario === 'opposite' ? -1 : 1) : { flow: [0, 0, 0] as Vec3, gain: 0 };
  let leftFlow = left.flow, rightFlow = right.flow;
  for (const center of active === 'both' ? [state.left, state.right] : [state.left]) {
    const distance = chargeDistance(point, center);
    if (distance >= SURFACE_BAND || distance < -A * 0.5) continue;
    const ratio = Math.max(0, Math.min(1, distance / SURFACE_BAND));
    const fade = 1 - ratio * ratio * (3 - 2 * ratio);
    const normal = chargeNormal(point, center);
    leftFlow = sub(leftFlow, mul(normal, dot(leftFlow, normal) * fade));
    rightFlow = sub(rightFlow, mul(normal, dot(rightFlow, normal) * fade));
  }
  const slip = add(leftFlow, rightFlow);
  const leftDynamic = 0.1 * dot(leftFlow, leftFlow);
  const rightDynamic = 0.1 * dot(rightFlow, rightFlow);
  const interaction = 0.2 * dot(leftFlow, rightFlow);
  const pressure = 0.8 - leftDynamic - rightDynamic - interaction;
  return { leftFlow, rightFlow, slip, leftDynamic, rightDynamic, interaction, pressure, leftGain: left.gain, rightGain: right.gain };
}

export function chargeSample(point: Vec3, state: ChargeState, scenario: ChargeCase, active: 'left' | 'both' = 'both'): ChargeReading {
  if (chargeDistance(point, state.left) < 0) return { inside: true, core: 'left' };
  if (active === 'both' && chargeDistance(point, state.right) < 0) return { inside: true, core: 'right' };
  const field = chargeField(point, state, scenario, active);
  let velocity = add(field.slip, [state.leftVelocity * field.leftGain + state.rightVelocity * field.rightGain, 0, 0]);
  for (const [center, bodyVelocity] of active === 'both' ? [[state.left, state.leftVelocity], [state.right, state.rightVelocity]] : [[state.left, state.leftVelocity]]) {
    const distance = chargeDistance(point, center);
    if (distance >= SURFACE_BAND) continue;
    const ratio = Math.max(0, Math.min(1, distance / SURFACE_BAND));
    const fade = 1 - ratio * ratio * (3 - 2 * ratio);
    const normal = chargeNormal(point, center);
    velocity = sub(velocity, mul(normal, dot(sub(velocity, [bodyVelocity, 0, 0]), normal) * fade));
  }
  return { inside: false, velocity, leftFlow: field.leftFlow, rightFlow: field.rightFlow,
    slip: field.slip, pressure: field.pressure, q: field.pressure,
    leftDynamic: field.leftDynamic, rightDynamic: field.rightDynamic, interaction: field.interaction };
}

const SURFACE_POINTS = (() => {
  const points: { local: Vec3; normal: Vec3; area: number }[] = [];
  const around = 32, across = 16;
  for (let i = 0; i < around; i++) for (let j = 0; j < across; j++) {
    const u = 2 * Math.PI * (i + 0.5) / around;
    const v = 2 * Math.PI * (j + 0.5) / across;
    const cu = Math.cos(u), su = Math.sin(u), cv = Math.cos(v), sv = Math.sin(v);
    points.push({
      local: [(RHO + A * cv) * cu, (RHO + A * cv) * su, A * sv],
      normal: [cu * cv, su * cv, sv],
      area: A * (RHO + A * cv) * 4 * Math.PI ** 2 / (around * across),
    });
  }
  return points;
})();

export function integrateTorusPressure(center: number, pressureAt: (point: Vec3) => number): Vec3 {
  let fx = 0, fy = 0, fz = 0;
  for (const patch of SURFACE_POINTS) {
    const point: Vec3 = [center + patch.local[0], patch.local[1], patch.local[2]];
    const pressure = pressureAt(point);
    fx -= pressure * patch.normal[0] * patch.area;
    fy -= pressure * patch.normal[1] * patch.area;
    fz -= pressure * patch.normal[2] * patch.area;
  }
  return [fx, fy, fz];
}

export function chargeSurfaceForces(state: ChargeState, scenario: ChargeCase): [Vec3, Vec3] {
  return [state.left, state.right].map(center =>
    integrateTorusPressure(center, point => chargeField(point, state, scenario).pressure)
  ) as [Vec3, Vec3];
}

export function chargeTimeline(separation: number, scenario: ChargeCase): ChargeState[] {
  const frames = [initialChargeState(separation)];
  for (let i = 0; i < CHARGE_DURATION / CHARGE_DT; i++) {
    const previous = frames[i];
    if (previous.stopped) { frames.push({ ...previous, time: (i + 1) * CHARGE_DT }); continue; }
    const [leftForce, rightForce] = chargeSurfaceForces(previous, scenario);
    const leftVelocity = previous.leftVelocity + leftForce[0] / CHARGE_MASS * CHARGE_DT;
    const rightVelocity = previous.rightVelocity + rightForce[0] / CHARGE_MASS * CHARGE_DT;
    let left = previous.left + leftVelocity * CHARGE_DT;
    let right = previous.right + rightVelocity * CHARGE_DT;
    const spacing = right - left;
    const stopped = spacing <= CHARGE_MIN_SEPARATION || spacing >= CHARGE_MAX_SEPARATION;
    if (stopped) {
      const bound = spacing <= CHARGE_MIN_SEPARATION ? CHARGE_MIN_SEPARATION : CHARGE_MAX_SEPARATION;
      const midpoint = (left + right) / 2;
      left = midpoint - bound / 2;
      right = midpoint + bound / 2;
    }
    frames.push({ time: (i + 1) * CHARGE_DT, left, right,
      leftVelocity: stopped ? 0 : leftVelocity, rightVelocity: stopped ? 0 : rightVelocity, stopped });
  }
  return frames;
}

export function stateAt(frames: ChargeState[], time: number): ChargeState {
  return frames[Math.min(frames.length - 1, Math.max(0, Math.round(time / CHARGE_DT)))];
}

export function chargeStreamline(seed: Vec3, state: ChargeState, scenario: ChargeCase, steps = 135, active: 'left' | 'both' = 'both'): Vec3[] {
  const points: Vec3[] = [seed];
  let point = seed;
  for (let i = 0; i < steps; i++) {
    const sample = chargeSample(point, state, scenario, active);
    if (sample.inside) break;
    const speed = Math.sqrt(dot(sample.velocity, sample.velocity));
    if (speed < 0.004) break;
    const midpoint = add(point, mul(sample.velocity, 0.018 / speed));
    const nextReading = chargeSample(midpoint, state, scenario, active);
    if (nextReading.inside) break;
    const midSpeed = Math.sqrt(dot(nextReading.velocity, nextReading.velocity)) || 1;
    const next = add(point, mul(nextReading.velocity, 0.036 / midSpeed));
    if (next.some(v => Math.abs(v) >= CUBE_HALF) || chargeSample(next, state, scenario, active).inside) break;
    points.push(next);
    point = next;
  }
  return points;
}
