// Normalized quasistatic induction. This module has no rendering or wall-clock dependencies.
export const DT = 1 / 120;
export const add = (a, b) => a.map((v, i) => v + b[i]);
export const scale = (a, k) => a.map((v) => v * k);
export const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
export const cross = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const length = (a) => Math.hypot(...a),
  sub = (a, b) => add(a, scale(b, -1));
export function multiply(a, b) {
  return [
    ...add(
      add(scale(b.slice(0, 3), a[3]), scale(a.slice(0, 3), b[3])),
      cross(a, b),
    ),
    a[3] * b[3] - dot(a.slice(0, 3), b.slice(0, 3)),
  ];
}
export function rotate(v, q) {
  const t = scale(cross(q, v), 2);
  return add(v, add(scale(t, q[3]), cross(q, t)));
}
export function axisAngle(axis, time) {
  const speed = length(axis),
    a = (speed * time) / 2;
  return speed > 1e-12
    ? [...scale(axis, Math.sin(a) / speed), Math.cos(a)]
    : [0, 0, 0, 1];
}
const conjugate = (q) => [-q[0], -q[1], -q[2], q[3]];
export function angularVelocity(a, b, dt) {
  let q = multiply(b, conjugate(a));
  if (q[3] < 0) q = scale(q, -1);
  const n = length(q.slice(0, 3));
  return n > 1e-10
    ? scale(q.slice(0, 3), (2 * Math.atan2(n, q[3])) / n / dt)
    : [0, 0, 0];
}
export function approachQuaternion(a, b, maxAngle) {
  let q = b;
  if (dot(a, b) < 0) q = scale(b, -1);
  const angle = 2 * Math.acos(Math.min(1, Math.max(-1, dot(a, q)))),
    t = angle > maxAngle ? maxAngle / angle : 1;
  const out = a.map((v, i) => v * (1 - t) + q[i] * t);
  return scale(out, 1 / length(out));
}
export const COIL = {
  radius: 0.72,
  turns: 5,
  core: 0.045,
  coupling: 0.024,
  segments: 96,
};
export const MAGNET = { core: 0.19, coupling: 0.1, size: [0.36, 0.12, 0.14] };
export const BULB = {
  position: [1.05, -1.14, 0],
  radius: 0.29,
  heatCapacity: 0.055,
  cooling: 0.07,
};
export const LEADS = [
  [
    [0, -0.72, -0.06],
    [0.48, -1.52, -0.06],
    [1.01, -1.52, -0.06],
    [1.01, -1.24, 0],
  ],
  [
    [0, -0.72, 0.06],
    [0.48, -1.52, 0.06],
    [1.09, -1.52, 0.06],
    [1.09, -1.24, 0],
  ],
];
const circleCache = new Map();
export function circle(segments = COIL.segments) {
  if (!circleCache.has(segments)) {
    const dt = (2 * Math.PI) / segments;
    circleCache.set(
      segments,
      Array.from({ length: segments }, (_, i) => {
        const t = (i + 0.5) * dt;
        return {
          p: [0, COIL.radius * Math.cos(t), COIL.radius * Math.sin(t)],
          dl: [
            0,
            -COIL.radius * Math.sin(t) * dt,
            COIL.radius * Math.cos(t) * dt,
          ],
        };
      }),
    );
  }
  return circleCache.get(segments);
}
export function magnetField(
  p,
  pose,
  velocity = [0, 0, 0],
  angular = [0, 0, 0],
) {
  const q = pose.quaternion,
    k = pose.polarity,
    mx = (1 - 2 * (q[1] * q[1] + q[2] * q[2])) * k,
    my = 2 * (q[0] * q[1] + q[3] * q[2]) * k,
    mz = 2 * (q[0] * q[2] - q[3] * q[1]) * k;
  const x = p[0] - pose.position[0],
    y = p[1] - pose.position[1],
    z = p[2] - pose.position[2],
    r2 = x * x + y * y + z * z,
    s = r2 + MAGNET.core ** 2,
    f = MAGNET.coupling / (s * Math.sqrt(s)),
    g = f / s,
    mr = mx * x + my * y + mz * z;
  const cx = my * z - mz * y,
    cy = mz * x - mx * z,
    cz = mx * y - my * x,
    dmx = angular[1] * mz - angular[2] * my,
    dmy = angular[2] * mx - angular[0] * mz,
    dmz = angular[0] * my - angular[1] * mx,
    rv = (3 * (x * velocity[0] + y * velocity[1] + z * velocity[2])) / s,
    bg = (2 * MAGNET.core ** 2 - r2) * g;
  return {
    A: [cx * f, cy * f, cz * f],
    B: [
      mx * bg + 3 * x * mr * g,
      my * bg + 3 * y * mr * g,
      mz * bg + 3 * z * mr * g,
    ],
    E: [
      -f * (dmy * z - dmz * y - my * velocity[2] + mz * velocity[1] + cx * rv),
      -f * (dmz * x - dmx * z - mz * velocity[0] + mx * velocity[2] + cy * rv),
      -f * (dmx * y - dmy * x - mx * velocity[1] + my * velocity[0] + cz * rv),
    ],
  };
}
export function coilBasis(p, segments = COIL.segments) {
  let ax = 0,
    ay = 0,
    az = 0,
    bx = 0,
    by = 0,
    bz = 0;
  const k = COIL.coupling * COIL.turns;
  for (const q of circle(segments)) {
    const x = p[0],
      y = p[1] - q.p[1],
      z = p[2] - q.p[2],
      r = x * x + y * y + z * z + COIL.core ** 2,
      f = k / Math.sqrt(r),
      g = f / r;
    ay += q.dl[1] * f;
    az += q.dl[2] * f;
    bx += (q.dl[1] * z - q.dl[2] * y) * g;
    by += q.dl[2] * x * g;
    bz -= q.dl[1] * x * g;
  }
  return { A: [ax, ay, az], B: [bx, by, bz] };
}
COIL.inductance = circle().reduce(
  (l, q) => l + COIL.turns * dot(coilBasis(q.p).A, q.dl),
  0,
);
COIL.resistance = COIL.inductance * 3;
COIL.bulbResistance = COIL.resistance * 0.85;
export function linkage(pose, segments = COIL.segments) {
  return circle(segments).reduce(
    (s, q) => s + COIL.turns * dot(magnetField(q.p, pose).A, q.dl),
    0,
  );
}
export function inducedEMF(
  pose,
  velocity,
  angular = [0, 0, 0],
  segments = COIL.segments,
) {
  return circle(segments).reduce(
    (s, q) =>
      s + COIL.turns * dot(magnetField(q.p, pose, velocity, angular).E, q.dl),
    0,
  );
}
export function createExperiment(
  pose = { position: [-1.25, 0, 0], quaternion: [0, 0, 0, 1], polarity: 1 },
  closed = true,
) {
  return {
    time: 0,
    pose: structuredClone(pose),
    velocity: [0, 0, 0],
    angular: [0, 0, 0],
    linkage: linkage(pose),
    emf: 0,
    current: 0,
    currentDerivative: 0,
    temperature: 0,
    work: 0,
    heat: 0,
    bulbHeat: 0,
    magneticEnergy: 0,
    closed,
  };
}
export function stepExperiment(previous, pose, dt = DT) {
  const velocity = scale(sub(pose.position, previous.pose.position), 1 / dt),
    angular = angularVelocity(previous.pose.quaternion, pose.quaternion, dt),
    flux = linkage(pose),
    drive = -(flux - previous.linkage) / dt;
  const { inductance: L, resistance: R, bulbResistance: Rb } = COIL;
  // Midpoint integration gives an exact discrete work = magnetic storage + Joule heat ledger.
  const current = previous.closed
    ? ((L - (R * dt) / 2) * previous.current + drive * dt) / (L + (R * dt) / 2)
    : 0;
  const mid = (current + previous.current) / 2,
    heat = R * mid * mid * dt,
    bulbHeat = Rb * mid * mid * dt,
    emf = inducedEMF(pose, velocity, angular);
  const decay = Math.exp((-BULB.cooling / BULB.heatCapacity) * dt),
    temperature =
      previous.temperature * decay +
      (bulbHeat / dt / BULB.cooling) * (1 - decay);
  return {
    time: previous.time + dt,
    pose: structuredClone(pose),
    velocity,
    angular,
    linkage: flux,
    emf,
    current,
    currentDerivative: previous.closed ? (emf - R * current) / L : 0,
    temperature,
    work: previous.work + drive * mid * dt,
    heat: previous.heat + heat,
    bulbHeat: previous.bulbHeat + bulbHeat,
    magneticEnergy: 0.5 * L * current * current,
    closed: previous.closed,
  };
}
export function fieldAt(p, s, basis = coilBasis(p)) {
  const m = magnetField(p, s.pose, s.velocity, s.angular),
    i = s.current,
    d = -s.currentDerivative,
    coilB = [basis.B[0] * i, basis.B[1] * i, basis.B[2] * i];
  return {
    B: [m.B[0] + coilB[0], m.B[1] + coilB[1], m.B[2] + coilB[2]],
    E: [
      m.E[0] + basis.A[0] * d,
      m.E[1] + basis.A[1] * d,
      m.E[2] + basis.A[2] * d,
    ],
    magnetB: m.B,
    coilB,
    magnetE: m.E,
  };
}
export function reaction(s) {
  const h = 1e-4;
  const force = [0, 1, 2].map((i) => {
    const a = structuredClone(s.pose),
      b = structuredClone(s.pose);
    a.position[i] += h;
    b.position[i] -= h;
    return (s.current * (linkage(a) - linkage(b))) / (2 * h);
  });
  const torque = [0, 1, 2].map((i) => {
    const axis = [0, 0, 0];
    axis[i] = 1;
    return (
      (s.current *
        (linkage({
          ...s.pose,
          quaternion: multiply(axisAngle(axis, h), s.pose.quaternion),
        }) -
          linkage({
            ...s.pose,
            quaternion: multiply(axisAngle(axis, -h), s.pose.quaternion),
          }))) /
      (2 * h)
    );
  });
  return { force, torque };
}
function boxDistance(x, y, z, a, b, c) {
  x = Math.abs(x) - a;
  y = Math.abs(y) - b;
  z = Math.abs(z) - c;
  return (
    Math.hypot(Math.max(x, 0), Math.max(y, 0), Math.max(z, 0)) +
    Math.min(Math.max(x, y, z), 0)
  );
}
function segmentDistance(p, a, b) {
  const x = b[0] - a[0],
    y = b[1] - a[1],
    z = b[2] - a[2],
    px = p[0] - a[0],
    py = p[1] - a[1],
    pz = p[2] - a[2],
    t = Math.max(
      0,
      Math.min(1, (px * x + py * y + pz * z) / (x * x + y * y + z * z)),
    );
  return Math.hypot(px - t * x, py - t * y, pz - t * z);
}
export function apparatusDistance(p) {
  const x = p[0],
    y = p[1],
    z = p[2];
  let d =
    Math.hypot(
      Math.max(Math.abs(x) - 0.12, 0),
      Math.hypot(y, z) - COIL.radius,
    ) - 0.055;
  d = Math.min(
    d,
    Math.hypot(x - BULB.position[0], y - BULB.position[1], z) - BULB.radius,
    boxDistance(x, y + 1.83, z, 1.48, 0.065, 0.24),
    boxDistance(x, y + 1.28, z, 0.055, 0.5, 0.055),
  );
  for (const path of LEADS)
    for (let i = 1; i < path.length; i++)
      d = Math.min(d, segmentDistance(p, path[i - 1], path[i]) - 0.025);
  return d;
}
export function magnetDistance(p, pose) {
  const x = p[0] - pose.position[0],
    y = p[1] - pose.position[1],
    z = p[2] - pose.position[2],
    q = pose.quaternion,
    qx = -q[0],
    qy = -q[1],
    qz = -q[2],
    w = q[3],
    tx = 2 * (qy * z - qz * y),
    ty = 2 * (qz * x - qx * z),
    tz = 2 * (qx * y - qy * x);
  return boxDistance(
    x + w * tx + qy * tz - qz * ty,
    y + w * ty + qz * tx - qx * tz,
    z + w * tz + qx * ty - qy * tx,
    ...MAGNET.size,
  );
}
export function poseAllowed(pose) {
  // A sampled conservative capsule encloses the box; small fixed steps prevent tunnelling.
  for (let j = 0; j <= 16; j++) {
    const p = add(
      pose.position,
      rotate([-0.36 + j * 0.045, 0, 0], pose.quaternion),
    );
    if (p.some((v) => Math.abs(v) > 0.1 + 1.7) || apparatusDistance(p) < 0.187)
      return false;
  }
  return true;
}
// Recorder thresholds concern visible activity only; they never clamp the model.
const RECORDING_QUIET_SECONDS = 2;
function hasRecordableActivity(s) {
  return (
    length(s.velocity) > 1e-4 ||
    length(s.angular) > 1e-4 ||
    Math.abs(s.emf) > 1e-4 ||
    Math.abs(s.current) > 1e-4 ||
    Math.abs(s.currentDerivative) > 1e-4 ||
    s.temperature > 0.002
  );
}
export class ExperimentClock {
  constructor() {
    this.reset();
  }
  reset(closed = true, pose) {
    this.current = createExperiment(pose, closed);
    this.target = structuredClone(this.current.pose);
    this.history = [this.current];
    this.recording = false;
    this.quietFor = 0;
    this.recordedSteps = 0;
    this.heldSnapshot = null;
    this.paused = false;
    this.playback = false;
    this.cursor = 0;
    this.speed = 1;
    this.accumulator = 0;
    this.demo = false;
    this.free = false;
    this.blocked = false;
  }
  get snapshot() {
    if (this.paused && !this.playback && this.heldSnapshot)
      return this.heldSnapshot;
    return this.paused || this.playback
      ? this.history[
          Math.max(
            0,
            Math.min(this.history.length - 1, Math.round(this.cursor)),
          )
        ]
      : this.current;
  }
  get recordedTime() {
    return this.recordedSteps * DT;
  }
  get historyStartTime() {
    return (this.recordedSteps - this.history.length + 1) * DT;
  }
  live() {
    this.paused = false;
    this.playback = false;
    this.heldSnapshot = null;
    this.cursor = this.history.length - 1;
    this.accumulator = 0;
    this.target = structuredClone(this.current.pose);
  }
  hold() {
    this.demo = false;
    this.target = structuredClone(this.current.pose);
  }
  pause() {
    this.heldSnapshot = this.current;
    this.cursor = this.history.length - 1;
    this.paused = true;
    this.playback = false;
  }
  scrub(index) {
    this.heldSnapshot = null;
    this.paused = true;
    this.playback = false;
    this.cursor = Math.max(0, Math.min(this.history.length - 1, index));
  }
  setTarget(pose) {
    if (this.paused || this.playback) return false;
    this.demo = false;
    this.target = structuredClone(pose);
    return true;
  }
  appendSnapshot(snapshot) {
    this.history.push(snapshot);
    this.recordedSteps++;
    if (this.history.length > 3601) this.history.shift();
    this.cursor = this.history.length - 1;
  }
  record(previous) {
    const active = hasRecordableActivity(this.current);
    if (active) {
      this.quietFor = 0;
      if (!this.recording) {
        // Preserve a baseline before each event while skipping the wall-time gap.
        if (this.recordedSteps === 0) this.history[0] = previous;
        else this.appendSnapshot(previous);
        this.recording = true;
      }
    } else {
      this.quietFor += DT;
    }
    if (this.recording) {
      this.appendSnapshot(this.current);
      if (this.quietFor >= RECORDING_QUIET_SECONDS) this.recording = false;
    }
  }
  advance(elapsed) {
    if (this.playback) {
      this.cursor += (elapsed * this.speed) / DT;
      if (this.cursor >= this.history.length - 1) {
        this.cursor = this.history.length - 1;
        this.playback = false;
        this.paused = true;
      }
      return;
    }
    if (this.paused) return;
    this.accumulator += Math.min(elapsed, 0.1);
    while (this.accumulator >= DT) {
      this.accumulator -= DT;
      if (this.demo) {
        this.target.position = [
          1.25 *
            Math.sin((this.current.time - this.demoStart) * 1.25 - Math.PI / 2),
          0,
          0,
        ];
        this.target.quaternion = [0, 0, 0, 1];
      }
      const delta = sub(this.target.position, this.current.pose.position),
        d = length(delta),
        step = Math.min(d, 2.2 * DT, d * 0.13),
        position = add(
          this.current.pose.position,
          scale(delta, d > 1e-10 ? step / d : 0),
        );
      const quaternion = approachQuaternion(
          this.current.pose.quaternion,
          this.target.quaternion,
          2.5 * DT,
        ),
        candidate = { ...this.target, position, quaternion };
      this.blocked = !poseAllowed(candidate);
      const previous = this.current;
      this.current = stepExperiment(
        this.current,
        this.blocked ? this.current.pose : candidate,
        DT,
      );
      this.record(previous);
    }
  }
}
