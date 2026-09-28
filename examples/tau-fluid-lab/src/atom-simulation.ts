import { add, dot, length, mul, normalize, rotate, sub, unrotate, type Vec3 } from './model';
import { boundaryPoint, PAIR_FIELD, torusSignedDistance } from './pair-field';
import { ATOM, cross, integrateAtomLoads, ZERO, type AtomBody, type BodyLoad } from './atom-field';

export type VisitTrace = { points: Vec3[]; head: number; count: number };
export type Observation = {
  cells: Float64Array;
  radial: Float64Array;
  traces: Record<string, VisitTrace>;
  time: number;
  insideTime: number;
  outsideTime: number;
  occupied: number;
  revision: number;
  lastTrace: number;
};
export type AtomSimulation = {
  time: number;
  bodies: AtomBody[];
  loads: Record<string, BodyLoad>;
  intensity: number;
  initialMotion: number;
  elasticContacts: boolean;
  contacts: number;
  nextId: number;
  revision: number;
  observation: Observation;
  fault: string | null;
};

const randomDirection = (): Vec3 => {
  const z = Math.random() * 2 - 1, azimuth = Math.random() * Math.PI * 2, r = Math.sqrt(1 - z * z);
  return [r * Math.cos(azimuth), r * Math.sin(azimuth), z];
};
const newObservation = (): Observation => ({
  cells: new Float64Array(ATOM.gridSize ** 3), radial: new Float64Array(ATOM.radialBins),
  traces: {}, time: 0, insideTime: 0, outsideTime: 0, occupied: 0, revision: 0, lastTrace: 0,
});

function makeBody(kind: AtomBody['kind'], serial: number, center: Vec3): AtomBody {
  const massRatio = kind === 'proton' ? ATOM.protonMassRatio : 1;
  return {
    id: kind === 'proton' ? 'proton' : `electron-${serial}`,
    name: kind === 'proton' ? 'Proton proxy' : `Electron ${serial}`,
    kind, mass: ATOM.electronMass * massRatio, inertia: ATOM.electronInertia * massRatio,
    pose: {
      id: kind === 'proton' ? 'positive' : 'negative', winding: kind === 'proton' ? 1 : -1,
      center, velocity: ZERO, yaw: (Math.random() * 2 - 1) * Math.PI,
      tilt: Math.asin(Math.random() * 2 - 1), spin: Math.random() * 2 * Math.PI,
      angularVelocity: mul(randomDirection(), 0.045 + Math.random() * 0.04),
    },
  };
}

export function createAtomSimulation(electrons = 1, initialMotion = 1, intensity = 1): AtomSimulation {
  const sim: AtomSimulation = {
    time: 0, bodies: [makeBody('proton', 0, ZERO)], loads: {}, intensity,
    initialMotion, elasticContacts: true, contacts: 0, nextId: 1, revision: 0,
    observation: newObservation(), fault: null,
  };
  for (let i = 0; i < electrons; i++) addElectron(sim);
  sim.loads = integrateAtomLoads(sim.bodies, sim.intensity);
  return sim;
}

export function clearObservation(sim: AtomSimulation) {
  sim.observation = newObservation();
  sim.observation.lastTrace = sim.time;
  sim.revision++;
}

export function addElectron(sim: AtomSimulation): string | null {
  if (sim.bodies.length > ATOM.maxElectrons) return null;
  const proton = sim.bodies[0];
  let position: Vec3 = ZERO;
  let placed = false;
  for (let attempt = 0; attempt < 160; attempt++) {
    const radius = 2.25 + Math.random() * (attempt < 100 ? 0.75 : 1.7);
    position = add(proton.pose.center, mul(randomDirection(), radius));
    if (sim.bodies.every(body => length(sub(position, body.pose.center)) > 1.9)) { placed = true; break; }
  }
  if (!placed) return null;
  const body = makeBody('electron', sim.nextId++, position);
  const radial = normalize(sub(position, proton.pose.center));
  const pairForce = integrateAtomLoads([proton, body], sim.intensity)[body.id].force;
  const acceleration = Math.max(0, -dot(pairForce, radial) / body.mass);
  // A randomized tangential starting kick, chosen from the current inward
  // pressure acceleration. This is an initial condition, not an orbit track.
  let tangent = cross(radial, randomDirection());
  if (length(tangent) < 0.01) tangent = cross(radial, Math.abs(radial[0]) < 0.8 ? [1, 0, 0] : [0, 1, 0]);
  const speed = Math.sqrt(acceleration * length(sub(position, proton.pose.center)))
    * sim.initialMotion * (0.85 + Math.random() * 0.3);
  body.pose.velocity = add(proton.pose.velocity, mul(normalize(tangent), speed));
  // The laboratory insertion supplies a paired impulse; the proton is free.
  proton.pose.velocity = sub(proton.pose.velocity, mul(sub(body.pose.velocity, proton.pose.velocity), body.mass / proton.mass));
  sim.bodies.push(body);
  sim.loads = integrateAtomLoads(sim.bodies, sim.intensity);
  clearObservation(sim);
  return body.id;
}

export function removeElectron(sim: AtomSimulation, id?: string) {
  const target = id ?? sim.bodies.at(-1)?.id;
  if (!target || target === 'proton') return;
  sim.bodies = sim.bodies.filter(body => body.id !== target);
  sim.loads = integrateAtomLoads(sim.bodies, sim.intensity);
  clearObservation(sim);
}

function boundaryNormal(point: Vec3, body: AtomBody): Vec3 {
  const local = unrotate(sub(point, body.pose.center), body.pose.yaw, body.pose.tilt);
  const radius = Math.hypot(local[0], local[1]) || 1e-8;
  return normalize(rotate([
    local[0] / radius * (radius - PAIR_FIELD.majorRadius),
    local[1] / radius * (radius - PAIR_FIELD.majorRadius), local[2],
  ], body.pose.yaw, body.pose.tilt));
}

function resolveContacts(sim: AtomSimulation) {
  // Explicit elastic contact rule for this prototype, not electron scattering
  // or the TeX's proposed helicity mechanism. There are no outer box walls.
  for (let i = 0; i < sim.bodies.length; i++) for (let j = i + 1; j < sim.bodies.length; j++) {
    const a = sim.bodies[i], b = sim.bodies[j];
    if (length(sub(a.pose.center, b.pose.center)) > 1.84) continue;
    let penetration = 0, normal: Vec3 = ZERO;
    for (const [source, target, sign] of [[a, b, 1], [b, a, -1]] as const) {
      for (let u = 0; u < 16; u++) for (let v = 0; v < 8; v++) {
        const point = boundaryPoint(source.pose, u * Math.PI / 8, v * Math.PI / 4).point;
        const depth = 0.012 - torusSignedDistance(point, target.pose);
        if (depth > penetration) { penetration = depth; normal = mul(boundaryNormal(point, target), sign); }
      }
    }
    if (penetration <= 0) continue;
    const inverseA = 1 / a.mass, inverseB = 1 / b.mass, inverseSum = inverseA + inverseB;
    a.pose.center = add(a.pose.center, mul(normal, penetration * inverseA / inverseSum));
    b.pose.center = sub(b.pose.center, mul(normal, penetration * inverseB / inverseSum));
    const approaching = dot(sub(a.pose.velocity, b.pose.velocity), normal);
    if (approaching < 0) {
      const impulse = -2 * approaching / inverseSum;
      a.pose.velocity = add(a.pose.velocity, mul(normal, impulse * inverseA));
      b.pose.velocity = sub(b.pose.velocity, mul(normal, impulse * inverseB));
      sim.contacts++;
    }
  }
}

function observe(sim: AtomSimulation, dt: number) {
  const observation = sim.observation, n = ATOM.gridSize, extent = ATOM.halfSize;
  const origin = sim.bodies[0].pose.center;
  const traceNow = sim.time - observation.lastTrace >= ATOM.traceStep - 1e-9;
  observation.time += dt;
  for (const body of sim.bodies.slice(1)) {
    const point = sub(body.pose.center, origin);
    if (point.every(axis => Math.abs(axis) < extent)) {
      const cell = point.map(axis => Math.floor((axis + extent) / (2 * extent) * n));
      const index = cell[0] + n * (cell[1] + n * cell[2]);
      if (observation.cells[index] === 0) observation.occupied++;
      observation.cells[index] += dt;
      observation.insideTime += dt;
    } else observation.outsideTime += dt;
    const bin = Math.floor(length(point) / extent * ATOM.radialBins);
    if (bin < ATOM.radialBins) observation.radial[bin] += dt;
    if (traceNow) {
      const trace = observation.traces[body.id] ??= { points: [], head: 0, count: 0 };
      trace.points[trace.head] = point;
      trace.head = (trace.head + 1) % ATOM.traceLength;
      trace.count = Math.min(ATOM.traceLength, trace.count + 1);
    }
  }
  if (traceNow) observation.lastTrace += ATOM.traceStep;
  observation.revision++;
}

export function stepAtomSimulation(sim: AtomSimulation, dt = ATOM.step) {
  if (sim.fault) return;
  const previous = sim.bodies.map(body => ({ ...body, pose: { ...body.pose } }));
  // Kick–drift–kick keeps free motion and pressure impulses separate. All
  // loads come from the shared instantaneous field, with no shell presets.
  for (const body of sim.bodies) {
    const load = sim.loads[body.id];
    body.pose.velocity = add(body.pose.velocity, mul(load.force, dt / (2 * body.mass)));
    body.pose.angularVelocity = add(body.pose.angularVelocity, mul(load.torque, dt / (2 * body.inertia)));
    body.pose.center = add(body.pose.center, mul(body.pose.velocity, dt));
    body.pose.tilt += body.pose.angularVelocity[0] * dt;
    body.pose.yaw += body.pose.angularVelocity[1] * dt;
    body.pose.spin += body.pose.angularVelocity[2] * dt;
  }
  if (sim.elasticContacts) resolveContacts(sim);
  const loads = integrateAtomLoads(sim.bodies, sim.intensity);
  for (const body of sim.bodies) {
    body.pose.velocity = add(body.pose.velocity, mul(loads[body.id].force, dt / (2 * body.mass)));
    body.pose.angularVelocity = add(body.pose.angularVelocity, mul(loads[body.id].torque, dt / (2 * body.inertia)));
  }
  if (sim.bodies.some(body => [...body.pose.center, ...body.pose.velocity, ...body.pose.angularVelocity, body.pose.yaw, body.pose.tilt].some(value => !Number.isFinite(value)))) {
    sim.bodies = previous;
    sim.fault = 'The numerical state became non-finite. Start a new run to continue.';
    return;
  }
  sim.loads = loads;
  sim.time += dt;
  sim.revision++;
  observe(sim, dt);
}

export function orderedTrace(trace: VisitTrace): Vec3[] {
  const first = (trace.head - trace.count + ATOM.traceLength) % ATOM.traceLength;
  return Array.from({ length: trace.count }, (_, i) => trace.points[(first + i) % ATOM.traceLength]);
}
