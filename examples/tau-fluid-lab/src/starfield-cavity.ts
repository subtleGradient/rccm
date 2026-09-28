import { add, rotate, sub, unrotate, type Vec3 } from './model';

// Display geometry and motion for this visual study, not a solved fluid field.
export const CAVITY = {
  center: [-0.7, 0, 0] as Vec3,
  majorRadius: 0.94,
  tubeRadius: 0.27,
  yaw: -0.18,
  tilt: 0.36,
  duration: 18,
};

export function cavityDistance(point: Vec3): number {
  const local = unrotate(sub(point, CAVITY.center), CAVITY.yaw, CAVITY.tilt);
  return Math.hypot(Math.hypot(local[0], local[1]) - CAVITY.majorRadius, local[2]) - CAVITY.tubeRadius;
}

export function cavityProjection(point: Vec3, time: number): Vec3 | null {
  if (cavityDistance(point) < 0) return null;
  const local = unrotate(sub(point, CAVITY.center), CAVITY.yaw, CAVITY.tilt);
  const radial = Math.hypot(local[0], local[1]);
  const tubeX = radial - CAVITY.majorRadius;
  const tubeRadius = Math.hypot(tubeX, local[2]);
  const shellGap = Math.max(0, tubeRadius - CAVITY.tubeRadius);
  const influence = Math.exp(-Math.pow(shellGap / 0.54, 2));
  const aroundRing = Math.atan2(local[1], local[0]) + time * 0.39 * influence;
  const aroundTube = Math.atan2(local[2], tubeX) + time * 0.74 * influence;
  const movedRadial = CAVITY.majorRadius + tubeRadius * Math.cos(aroundTube);
  return add(CAVITY.center, rotate([
    movedRadial * Math.cos(aroundRing),
    movedRadial * Math.sin(aroundRing),
    tubeRadius * Math.sin(aroundTube),
  ], CAVITY.yaw, CAVITY.tilt));
}

export function makeCavityShellSeeds(count: number): Float32Array {
  const positions = new Float32Array(count * 3);
  let seed = 431897;
  const random = () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 4294967296; };
  for (let i = 0; i < count; i++) {
    const aroundRing = random() * Math.PI * 2;
    const aroundTube = random() * Math.PI * 2;
    const tubeRadius = CAVITY.tubeRadius + 0.065 + random() ** 2 * 0.33;
    const radial = CAVITY.majorRadius + tubeRadius * Math.cos(aroundTube);
    const point = add(CAVITY.center, rotate([
      radial * Math.cos(aroundRing),
      radial * Math.sin(aroundRing),
      tubeRadius * Math.sin(aroundTube),
    ], CAVITY.yaw, CAVITY.tilt));
    positions.set(point, i * 3);
  }
  return positions;
}
