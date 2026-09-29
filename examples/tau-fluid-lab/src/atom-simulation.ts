import { add, length, mul, normalize, sub, type Vec3 } from './model';
import { ATOM, ZERO, type AtomBody, type BodyLoad } from './atom-field';
import { orbitalGradient, sampleOrbital, type Orbital } from './atom-orbitals';

export type VisitTrace = { points: Vec3[]; head: number; count: number };
export type Observation = {
  cells: Float64Array; radial: Float64Array; traces: Record<string, VisitTrace>;
  time: number; insideTime: number; outsideTime: number; occupied: number; revision: number; lastTrace: number;
};
export type AtomSimulation = {
  time: number; bodies: AtomBody[]; loads: Record<string, BodyLoad>; intensity: number;
  motionRate: number; avoidance: number; interpretation: number; nextId: number;
  revision: number; observation: Observation; fault: string | null;
};
const randomDirection = (): Vec3 => {
  const z = Math.random() * 2 - 1, phi = Math.random() * Math.PI * 2, r = Math.sqrt(1 - z * z);
  return [r * Math.cos(phi), r * Math.sin(phi), z];
};
const gaussian = () => Math.sqrt(-2 * Math.log(Math.max(1e-10, Math.random()))) * Math.cos(Math.random() * Math.PI * 2);
const limited = (v: Vec3, max: number) => mul(v, Math.min(1, max / Math.max(length(v), 1e-8)));
const newObservation = (): Observation => ({
  cells: new Float64Array(ATOM.gridSize ** 3), radial: new Float64Array(ATOM.radialBins),
  traces: {}, time: 0, insideTime: 0, outsideTime: 0, occupied: 0, revision: 0, lastTrace: 0,
});
function makeBody(kind: AtomBody['kind'], serial: number, center: Vec3, orbital: Orbital = '1s'): AtomBody {
  const ratio = kind === 'proton' ? ATOM.protonMassRatio : 1;
  return {
    id: kind === 'proton' ? 'proton' : `electron-${serial}`,
    name: kind === 'proton' ? 'Proton · trefoil cavity' : `Electron ${serial}`, kind, orbital,
    mass: ATOM.electronMass * ratio, inertia: ATOM.electronInertia * ratio,
    pose: { id: kind === 'proton' ? 'positive' : 'negative', winding: kind === 'proton' ? 1 : -1,
      center, velocity: kind === 'proton' ? ZERO : mul(randomDirection(), 0.7),
      yaw: (Math.random() * 2 - 1) * Math.PI, tilt: Math.asin(Math.random() * 2 - 1), spin: Math.random() * 2 * Math.PI,
      angularVelocity: mul(randomDirection(), 0.08 + Math.random() * 0.16) },
  };
}
function initialPosition(orbital: Orbital, sim: AtomSimulation): Vec3 {
  let point: Vec3 = [3, 0, 0];
  for (let attempt = 0; attempt < 300; attempt++) {
    point = sampleOrbital(orbital);
    if (length(point) < 1.7 || point.some(v => Math.abs(v) > ATOM.halfSize * 0.88)) continue;
    if (sim.bodies.slice(1).every(body => length(sub(add(point, sim.bodies[0].pose.center), body.pose.center)) > 1.5)) break;
  }
  return add(point, sim.bodies[0].pose.center);
}
export function createAtomSimulation(electrons = 2, motionRate = 1, intensity = 1): AtomSimulation {
  const sim: AtomSimulation = { time: 0, bodies: [makeBody('proton', 0, ZERO)], loads: { proton: { force: ZERO, torque: ZERO } },
    intensity, motionRate, avoidance: 0.8, interpretation: 0.65, nextId: 1, revision: 0, observation: newObservation(), fault: null };
  for (let i = 0; i < electrons; i++) addElectron(sim);
  return sim;
}
export function clearObservation(sim: AtomSimulation) {
  sim.observation = newObservation(); sim.observation.lastTrace = sim.time; sim.revision++;
}
export function addElectron(sim: AtomSimulation, orbital: Orbital = '1s'): string | null {
  if (sim.bodies.length > ATOM.maxElectrons) return null;
  const body = makeBody('electron', sim.nextId++, initialPosition(orbital, sim), orbital);
  sim.bodies.push(body); sim.loads[body.id] = { force: ZERO, torque: ZERO };
  clearObservation(sim); return body.id;
}
export function removeElectron(sim: AtomSimulation, id?: string) {
  const target = id ?? sim.bodies.at(-1)?.id;
  if (!target || target === 'proton') return;
  sim.bodies = sim.bodies.filter(body => body.id !== target); delete sim.loads[target]; clearObservation(sim);
}
export function setOrbital(sim: AtomSimulation, id: string, orbital: Orbital) {
  const body = sim.bodies.find(item => item.id === id);
  if (!body || body.kind !== 'electron') return;
  body.orbital = orbital; body.pose.center = initialPosition(orbital, sim); body.pose.velocity = mul(randomDirection(), 0.7);
  clearObservation(sim);
}

export function stepAtomSimulation(sim: AtomSimulation, dt = ATOM.step) {
  if (sim.fault) return;
  const previous = sim.bodies.map(body => ({ ...body, pose: { ...body.pose } }));
  const proton = sim.bodies[0], electrons = sim.bodies.slice(1), h = dt * sim.motionRate;
  const relative = electrons.map(body => sub(body.pose.center, proton.pose.center));
  const velocities = electrons.map(body => sub(body.pose.velocity, proton.pose.velocity));
  const forces = relative.map((point, i) => {
    let force = mul(orbitalGradient(point, electrons[i].orbital), 0.9);
    const r = Math.max(length(point), 0.01);
    // Clearance around the deliberately enlarged knot; a visual constraint.
    if (r < 1.65) force = add(force, mul(point, (1.65 - r) * 24 / r));
    for (let j = 0; j < relative.length; j++) if (i !== j) {
      const difference = sub(point, relative[j]), distance = Math.max(0.08, length(difference));
      force = add(force, mul(difference, sim.avoidance * 2.2 * Math.exp(-distance * distance / 5) / (distance * distance + 0.18)));
      if (distance < 1.3) force = add(force, mul(difference, (1.3 - distance) * 14 / distance));
    }
    return limited(force, 10);
  });
  // Langevin-style, orbitally guided wandering. Its friction/noise are an
  // animation mechanism, not thermal electron collisions. No prescribed ring.
  const damping = Math.exp(-1.05 * h), noise = Math.sqrt(0.9 * (1 - damping * damping));
  for (let i = 0; i < electrons.length; i++) {
    const velocity = add(mul(add(velocities[i], mul(forces[i], h)), damping), [gaussian() * noise, gaussian() * noise, gaussian() * noise]);
    velocities[i] = limited(velocity, 3.8);
    relative[i] = add(relative[i], mul(velocities[i], h));
    sim.loads[electrons[i].id] = { force: mul(forces[i], electrons[i].mass), torque: ZERO };
  }
  // Draw both species around their common center of mass. The enlarged 32:1
  // ratio makes recoil visible; it is not the measured proton/electron ratio.
  const mass = sim.bodies.reduce((sum, body) => sum + body.mass, 0);
  let moment: Vec3 = ZERO, meanVelocity: Vec3 = ZERO;
  for (let i = 0; i < electrons.length; i++) {
    moment = add(moment, mul(relative[i], electrons[i].mass));
    meanVelocity = add(meanVelocity, mul(velocities[i], electrons[i].mass));
  }
  proton.pose.center = mul(moment, -1 / mass); proton.pose.velocity = mul(meanVelocity, -1 / mass);
  let reaction: Vec3 = ZERO;
  for (let i = 0; i < electrons.length; i++) {
    electrons[i].pose.center = add(proton.pose.center, relative[i]);
    electrons[i].pose.velocity = add(proton.pose.velocity, velocities[i]);
    reaction = sub(reaction, sim.loads[electrons[i].id].force);
  }
  sim.loads.proton = { force: reaction, torque: ZERO };
  for (const body of sim.bodies) {
    body.pose.tilt += body.pose.angularVelocity[0] * h;
    body.pose.yaw += body.pose.angularVelocity[1] * h;
    body.pose.spin += body.pose.angularVelocity[2] * h;
  }
  if (sim.bodies.some(body => [...body.pose.center, ...body.pose.velocity].some(value => !Number.isFinite(value)))) {
    sim.bodies = previous; sim.fault = 'The animation state stopped. Start a new run to continue.'; return;
  }
  sim.time += dt; sim.revision++; observe(sim, dt);
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


export function orderedTrace(trace: VisitTrace): Vec3[] {
  const first = (trace.head - trace.count + ATOM.traceLength) % ATOM.traceLength;
  return Array.from({ length: trace.count }, (_, i) => trace.points[(first + i) % ATOM.traceLength]);
}
