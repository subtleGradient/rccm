export type Vec3 = readonly [number, number, number];
export type CoreId = 'electron' | 'positron';
export type CoreSettings = { offset: Vec3; yaw: number; tilt: number; circulation: number };
export type PairSettings = {
  electron: CoreSettings;
  positron: CoreSettings;
  travel: number;
  intensity: number;
};
export type CorePose = { id: CoreId; center: Vec3; velocity: Vec3; yaw: number; tilt: number; circulation: number };
export type FieldSample = {
  inside: false;
  velocity: Vec3;
  slip: Vec3;
  twist: Vec3;
  q: number;
  macro: number;
  dynamic: number;
  shear: number;
  e: Vec3;
  b: Vec3;
  U: number[][];
} | { inside: true; core: CoreId };

export const CUBE_HALF = 2.2;
export const TORUS_MAJOR = 0.49;
export const TORUS_MINOR = 0.18;
export const DURATION = 18;
export const ALPHA = 0.55;
export const TP = 0.6;
export const DEFAULT_SETTINGS: PairSettings = {
  electron: { offset: [-0.94, 0, 0], yaw: -0.28, tilt: 0.28, circulation: 1 },
  positron: { offset: [0.94, 0, 0], yaw: 0.28, tilt: -0.28, circulation: -1 },
  travel: 0.65,
  intensity: 1,
};

export const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const mul = (a: Vec3, k: number): Vec3 => [a[0] * k, a[1] * k, a[2] * k];
export const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const length = (a: Vec3) => Math.sqrt(dot(a, a));
export const normalize = (a: Vec3): Vec3 => mul(a, 1 / (length(a) || 1));

export function rotate(local: Vec3, yaw: number, tilt: number): Vec3 {
  const cx = Math.cos(tilt), sx = Math.sin(tilt), cy = Math.cos(yaw), sy = Math.sin(yaw);
  const x = local[0], y = local[1] * cx - local[2] * sx, z = local[1] * sx + local[2] * cx;
  return [x * cy + z * sy, y, -x * sy + z * cy];
}

export function unrotate(world: Vec3, yaw: number, tilt: number): Vec3 {
  const cy = Math.cos(yaw), sy = Math.sin(yaw), cx = Math.cos(tilt), sx = Math.sin(tilt);
  const x = world[0] * cy - world[2] * sy, z = world[0] * sy + world[2] * cy;
  return [x, world[1] * cx + z * sx, -world[1] * sx + z * cx];
}

export function corePoses(settings: PairSettings, t: number): [CorePose, CorePose] {
  const phase = t * 0.55;
  const drift: Vec3 = [0, settings.travel * 0.20 * Math.sin(phase), settings.travel * 0.13 * (Math.cos(phase) - 1)];
  const velocity: Vec3 = [0, settings.travel * 0.11 * Math.cos(phase), -settings.travel * 0.0715 * Math.sin(phase)];
  return (['electron', 'positron'] as const).map(id => ({
    id, center: add(settings[id].offset, drift), velocity,
    yaw: settings[id].yaw, tilt: settings[id].tilt, circulation: settings[id].circulation,
  })) as [CorePose, CorePose];
}

export function torusDistance(point: Vec3, pose: CorePose): number {
  const p = unrotate(sub(point, pose.center), pose.yaw, pose.tilt);
  return Math.hypot(Math.hypot(p[0], p[1]) - TORUS_MAJOR, p[2]) - TORUS_MINOR;
}

export function tensor(q: number, e: Vec3, b: Vec3): number[][] {
  if (!(q > 0 && q <= 1)) throw new RangeError('Capacity q must be in (0, 1].');
  return [
    [-q, -e[0], -e[1], -e[2]],
    [e[0], 1 / q, -b[2], b[1]],
    [e[1], b[2], 1 / q, -b[0]],
    [e[2], -b[1], b[0], 1 / q],
  ];
}

function coreContribution(point: Vec3, pose: CorePose, intensity: number) {
  const p = unrotate(sub(point, pose.center), pose.yaw, pose.tilt);
  const radial = Math.hypot(p[0], p[1]) || 1e-9;
  const tubeRadial = radial - TORUS_MAJOR;
  const tubeDistance = Math.hypot(tubeRadial, p[2]);
  const shell = Math.max(0, tubeDistance - TORUS_MINOR);
  const gain = Math.exp(-Math.pow(shell / 0.37, 2));
  const toroidal: Vec3 = [-p[1] / radial, p[0] / radial, 0];
  const poloidal: Vec3 = [
    -(p[0] / radial) * p[2] / (tubeDistance || 1),
    -(p[1] / radial) * p[2] / (tubeDistance || 1),
    tubeRadial / (tubeDistance || 1),
  ];
  const flow = add(mul(toroidal, intensity * 0.68 * gain), mul(poloidal, intensity * 0.49 * gain * pose.circulation));
  const twist = mul(rotate([0, 0, 1], pose.yaw, pose.tilt), intensity * 0.52 * gain * pose.circulation);
  return { flow: rotate(flow, pose.yaw, pose.tilt), twist, motion: mul(pose.velocity, gain), gain };
}

export function sampleField(point: Vec3, t: number, settings: PairSettings): FieldSample {
  const poses = corePoses(settings, t);
  for (const pose of poses) if (torusDistance(point, pose) < 0) return { inside: true, core: pose.id };

  let slip: Vec3 = [0, 0, 0], velocity: Vec3 = [0, 0, 0], twist: Vec3 = [0, 0, 0];
  for (const pose of poses) {
    const part = coreContribution(point, pose, settings.intensity);
    slip = add(slip, part.flow);
    velocity = add(velocity, add(part.flow, part.motion));
    twist = add(twist, part.twist);
  }
  // Authored normalized budget. No force equation is inferred from this allocation.
  const macro = 0.055;
  const dynamic = 0.085 * dot(velocity, velocity);
  const shear = 0.07 * length(twist);
  const q = 1 - macro - dynamic - shear;
  if (!(q > 0 && q <= 1)) throw new RangeError('Authored field exhausted the pressure budget.');
  const e = mul(slip, ALPHA);
  const b = mul(twist, ALPHA * TP);
  return { inside: false, velocity, slip, twist, q, macro, dynamic, shear, e, b, U: tensor(q, e, b) };
}

export function admissible(settings: PairSettings): boolean {
  const poses = corePoses(settings, 0);
  for (const pose of poses) if (length(pose.center) + TORUS_MAJOR + TORUS_MINOR + 0.12 > CUBE_HALF) return false;
  return length(sub(poses[0].center, poses[1].center)) > 2 * (TORUS_MAJOR + TORUS_MINOR) + 0.20;
}

export function traceParcel(seed: Vec3, settings: PairSettings, endTime = DURATION, dt = 1 / 36): Vec3[] {
  const path: Vec3[] = [seed];
  let point = seed;
  for (let time = 0; time < endTime - 1e-9; time += dt) {
    const h = Math.min(dt, endTime - time);
    const a = sampleField(point, time, settings);
    if (a.inside) break;
    const midpoint = add(point, mul(a.velocity, h / 2));
    const b = sampleField(midpoint, time + h / 2, settings);
    if (b.inside) break;
    const next = add(point, mul(b.velocity, h));
    if (next.some(axis => Math.abs(axis) >= CUBE_HALF) || sampleField(next, time + h, settings).inside) break;
    path.push(next);
    point = next;
  }
  return path;
}

export function traceStreamline(seed: Vec3, t: number, settings: PairSettings, steps = 100): Vec3[] {
  const path: Vec3[] = [seed];
  let point = seed;
  for (let i = 0; i < steps; i++) {
    const a = sampleField(point, t, settings);
    if (a.inside || length(a.velocity) < 0.003) break;
    const next = add(point, mul(normalize(a.velocity), 0.032));
    if (next.some(axis => Math.abs(axis) >= CUBE_HALF) || sampleField(next, t, settings).inside) break;
    path.push(next);
    point = next;
  }
  return path;
}

export function parcelSeeds(settings: PairSettings): Vec3[] {
  const poses = corePoses(settings, 0);
  const out: Vec3[] = [];
  for (const pose of poses) for (let ring = 0; ring < 3; ring++) for (let i = 0; i < 12; i++) {
    const u = 2 * Math.PI * i / 12;
    const v = 2 * Math.PI * ring / 3;
    const local: Vec3 = [
      (TORUS_MAJOR + (TORUS_MINOR + 0.08) * Math.cos(v)) * Math.cos(u),
      (TORUS_MAJOR + (TORUS_MINOR + 0.08) * Math.cos(v)) * Math.sin(u),
      (TORUS_MINOR + 0.08) * Math.sin(v),
    ];
    out.push(add(pose.center, rotate(local, pose.yaw, pose.tilt)));
  }
  return out;
}
