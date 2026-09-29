import { add, dot, length, mul, normalize, rotate, sub, unrotate, type Vec3 } from './model';
import type { AtomBody } from './atom-field';

const TAU = 2 * Math.PI;
export const ELECTRON_RADIUS = 0.48;
export const ELECTRON_TUBE = 0.15;
export const PROTON_TUBE = 0.16;
const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

// A (2,3) torus knot. GfX-2 does not specify this proton topology; this is
// an explicit visual proxy. No surface mesh is used to render the cavity.
function knot(t: number): Vec3 {
  const r = 0.77 + 0.31 * Math.cos(3 * t);
  return [r * Math.cos(2 * t), r * Math.sin(2 * t), 0.42 * Math.sin(3 * t)];
}
const segments = Array.from({ length: 96 }, (_, i) => {
  const p = knot(i / 96 * TAU), v = sub(knot((i + 1) / 96 * TAU), p);
  return { p, v, v2: dot(v, v) };
});

export function cavityFrame(point: Vec3, body: AtomBody) {
  const p = unrotate(sub(point, body.pose.center), body.pose.yaw, body.pose.tilt);
  let center: Vec3, tangent: Vec3;
  if (body.kind === 'electron') {
    const angle = Math.atan2(p[1], p[0]);
    center = [ELECTRON_RADIUS * Math.cos(angle), ELECTRON_RADIUS * Math.sin(angle), 0];
    tangent = [-Math.sin(angle), Math.cos(angle), 0];
  } else {
    let best = Infinity;
    center = segments[0].p; tangent = segments[0].v;
    for (const segment of segments) {
      const t = Math.max(0, Math.min(1, dot(sub(p, segment.p), segment.v) / segment.v2));
      const c = add(segment.p, mul(segment.v, t)), d = sub(p, c), d2 = dot(d, d);
      if (d2 < best) { best = d2; center = c; tangent = normalize(segment.v); }
    }
  }
  const radial = sub(p, center), distance = length(radial);
  return {
    distance: distance - (body.kind === 'proton' ? PROTON_TUBE : ELECTRON_TUBE),
    normal: rotate(normalize(radial), body.pose.yaw, body.pose.tilt),
    tangent: rotate(tangent, body.pose.yaw, body.pose.tilt),
  };
}

export function cavityDistance(point: Vec3, body: AtomBody): number {
  const r = length(sub(point, body.pose.center));
  const bound = body.kind === 'proton' ? 1.35 : 0.64;
  if (r > bound + 0.2) return r - bound;
  return cavityFrame(point, body).distance;
}

export function cavitySurface(body: AtomBody, u: number, v: number, padding = 0): { point: Vec3; normal: Vec3 } {
  const isProton = body.kind === 'proton';
  const center: Vec3 = isProton ? knot(u) : [ELECTRON_RADIUS * Math.cos(u), ELECTRON_RADIUS * Math.sin(u), 0];
  const tangent = isProton ? normalize(sub(knot(u + 0.001), knot(u - 0.001))) : [-Math.sin(u), Math.cos(u), 0] as Vec3;
  const first = normalize(cross(tangent, Math.abs(tangent[2]) < 0.9 ? [0, 0, 1] : [0, 1, 0]));
  const second = cross(tangent, first);
  const normal = add(mul(first, Math.cos(v)), mul(second, Math.sin(v)));
  const local = add(center, mul(normal, (isProton ? PROTON_TUBE : ELECTRON_TUBE) + padding));
  return { point: add(body.pose.center, rotate(local, body.pose.yaw, body.pose.tilt)), normal: rotate(normal, body.pose.yaw, body.pose.tilt) };
}
