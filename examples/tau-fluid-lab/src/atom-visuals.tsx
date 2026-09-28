import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { add, length, mul, rotate, sub, type Vec3 } from './model';
import { PAIR_FIELD } from './pair-field';
import { VectorArrow } from './pair-visuals';
import { ATOM, cavityAt, chargeColor, sampleAtomField, sampleAtomPressure, type AtomBody } from './atom-field';
import { orderedTrace, stepAtomSimulation, type AtomSimulation } from './atom-simulation';

export type SimulationRef = RefObject<AtomSimulation>;
export type SliceKind = 'pressure' | 'electric' | 'twist';
export type SliceRange = { low: number; high: number };
export const SLICES = {
  pressure: { plane: 'XY', title: 'Remaining pressure', symbol: 'q = −S₀₀', low: '#d737eb', mid: '#6341af', high: '#13d5c0', axis: 'Z', note: 'Violet: less capacity. Teal: more. Rescaled within this slice.' },
  electric: { plane: 'XZ', title: 'Electric slip', symbol: 'A₀y', low: '#719dff', mid: '#69717e', high: '#f6cf58', axis: 'Y', note: 'Blue / yellow: negative / positive tensor component across this plane. Gray is zero.' },
  twist: { plane: 'YZ', title: 'Rotational twist', symbol: 'Ayz', low: '#54e6af', mid: '#666676', high: '#ff795f', axis: 'X', note: 'Mint / coral: opposite senses of twist through this plane. Gray is zero.' },
} as const;

export function AtomClock({ simulation, playing, speed, onUpdate }: {
  simulation: SimulationRef; playing: boolean; speed: number; onUpdate: () => void;
}) {
  const accumulator = useRef(0), publish = useRef(0);
  useFrame((_, delta) => {
    if (playing && !simulation.current.fault) {
      accumulator.current = Math.min(accumulator.current + Math.min(delta, 0.1) * speed, ATOM.step * 16);
      while (accumulator.current >= ATOM.step) {
        stepAtomSimulation(simulation.current);
        accumulator.current -= ATOM.step;
      }
    } else accumulator.current = 0;
    publish.current += delta;
    if (publish.current >= 0.16) { publish.current = 0; onUpdate(); }
  }, -10);
  return null;
}

const square: Vec3[] = [[-ATOM.halfSize, -ATOM.halfSize, 0], [ATOM.halfSize, -ATOM.halfSize, 0], [ATOM.halfSize, ATOM.halfSize, 0], [-ATOM.halfSize, ATOM.halfSize, 0], [-ATOM.halfSize, -ATOM.halfSize, 0]];

export function AtomSlice({ simulation, kind, offset, opacity, onProbe, ranges }: {
  simulation: SimulationRef; kind: SliceKind; offset: number; opacity: number;
  onProbe: (point: Vec3) => void; ranges: RefObject<Record<SliceKind, SliceRange>>;
}) {
  const resolution = kind === 'pressure' ? 96 : 64;
  const data = useMemo(() => new Uint8Array(resolution ** 2 * 4), [resolution]);
  const values = useMemo(() => new Float64Array(resolution ** 2), [resolution]);
  const texture = useMemo(() => {
    const result = new THREE.DataTexture(data, resolution, resolution, THREE.RGBAFormat);
    result.colorSpace = THREE.SRGBColorSpace;
    result.minFilter = result.magFilter = THREE.LinearFilter;
    return result;
  }, [data, resolution]);
  useEffect(() => () => texture.dispose(), [texture]);
  const palette = useMemo(() => [SLICES[kind].low, SLICES[kind].mid, SLICES[kind].high].map(hex => {
    const packed = parseInt(hex.slice(1), 16);
    return [packed >> 16, (packed >> 8) & 255, packed & 255];
  }), [kind]);
  const elapsed = useRef(1), last = useRef({ sim: null as AtomSimulation | null, revision: -1, offset: NaN });
  useFrame((_, delta) => {
    elapsed.current += delta;
    const sim = simulation.current;
    const changed = last.current.sim !== sim || last.current.offset !== offset;
    if (!changed && (elapsed.current < 0.125 || last.current.revision === sim.revision)) return;
    elapsed.current = 0;
    last.current = { sim, revision: sim.revision, offset };
    const origin = sim.bodies[0].pose.center;
    let low = Infinity, high = -Infinity;
    for (let y = 0; y < resolution; y++) for (let x = 0; x < resolution; x++) {
      const u = ((x + 0.5) / resolution * 2 - 1) * ATOM.halfSize;
      const v = ((y + 0.5) / resolution * 2 - 1) * ATOM.halfSize;
      const local: Vec3 = kind === 'pressure' ? [u, v, offset] : kind === 'electric' ? [u, offset, -v] : [offset, v, -u];
      const point = add(origin, local), index = x + y * resolution;
      if (cavityAt(point, sim.bodies)) { values[index] = NaN; continue; }
      let value: number;
      if (kind === 'pressure') value = sampleAtomPressure(point, sim.bodies, sim.intensity) / PAIR_FIELD.pressureCapacity;
      else {
        const field = sampleAtomField(point, sim.bodies, sim.intensity);
        value = kind === 'electric' ? -field.e[1] : -field.b[0];
      }
      values[index] = value;
      low = Math.min(low, value); high = Math.max(high, value);
    }
    if (!Number.isFinite(low)) { low = 0; high = 0; }
    if (kind !== 'pressure') { high = Math.max(Math.abs(low), Math.abs(high)); low = -high; }
    ranges.current[kind] = { low, high };
    for (let i = 0; i < values.length; i++) {
      const value = values[i], base = i * 4;
      if (!Number.isFinite(value)) { data.fill(0, base, base + 4); continue; }
      const t = high > low ? (value - low) / (high - low) : 0.5;
      const half = t < 0.5 ? 0 : 1, blend = half === 0 ? t * 2 : t * 2 - 1;
      for (let c = 0; c < 3; c++) data[base + c] = Math.round(palette[half][c] + (palette[half + 1][c] - palette[half][c]) * blend);
      data[base + 3] = kind === 'pressure' ? 195 : Math.round(38 + Math.abs(t - 0.5) * 400);
    }
    texture.needsUpdate = true;
  });
  const position: Vec3 = kind === 'pressure' ? [0, 0, offset] : kind === 'electric' ? [0, offset, 0] : [offset, 0, 0];
  const rotation: [number, number, number] = kind === 'pressure' ? [0, 0, 0] : kind === 'electric' ? [-Math.PI / 2, 0, 0] : [0, Math.PI / 2, 0];
  const select = (event: ThreeEvent<MouseEvent>) => { event.stopPropagation(); onProbe([event.point.x, event.point.y, event.point.z]); };
  return <group position={position} rotation={rotation}>
    <mesh onClick={select} renderOrder={-2}>
      <planeGeometry args={[ATOM.halfSize * 2, ATOM.halfSize * 2]} />
      <meshBasicMaterial map={texture} transparent opacity={opacity} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
    </mesh>
    <Line points={square} color={SLICES[kind].high} transparent opacity={0.32} lineWidth={1} depthWrite={false} />
    <Html position={[-ATOM.halfSize, ATOM.halfSize + 0.12, 0]} style={{ pointerEvents: 'none' }}><span className={`atom-plane-label ${kind}`}>{SLICES[kind].plane} / {SLICES[kind].symbol}</span></Html>
  </group>;
}

function spawnTracer(sim: AtomSimulation, sourceId?: string): Vec3 {
  const body = sim.bodies.find(body => body.id === sourceId);
  for (let attempt = 0; attempt < 20; attempt++) {
    let point: Vec3;
    if (body) {
      const u = Math.random() * 2 * Math.PI, v = Math.random() * 2 * Math.PI;
      const tube = PAIR_FIELD.tubeRadius + 0.025 + Math.random() ** 2 * 0.2;
      const radius = PAIR_FIELD.majorRadius + tube * Math.cos(v);
      point = add(body.pose.center, rotate([radius * Math.cos(u), radius * Math.sin(u), tube * Math.sin(v)], body.pose.yaw, body.pose.tilt));
    } else point = add(sim.bodies[0].pose.center, [(Math.random() * 2 - 1) * ATOM.halfSize, (Math.random() * 2 - 1) * ATOM.halfSize, (Math.random() * 2 - 1) * ATOM.halfSize]);
    if (!cavityAt(point, sim.bodies)) return point;
  }
  return add(sim.bodies[0].pose.center, [ATOM.halfSize, ATOM.halfSize, ATOM.halfSize]);
}

export function LiveFluidTracers({ simulation, sourceId, count = 260, color = '#9abebf' }: {
  simulation: SimulationRef; sourceId?: string; count?: number; color?: string;
}) {
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    return g;
  }, [count]);
  const trails = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 6), 3));
    return g;
  }, [count]);
  const particles = useRef<{ point: Vec3; tail: Vec3; age: number; life: number; tailAge: number }[]>([]);
  const last = useRef({ sim: null as AtomSimulation | null, time: 0 });
  useEffect(() => () => { geometry.dispose(); trails.dispose(); }, [geometry, trails]);
  useFrame(() => {
    const sim = simulation.current, origin = sim.bodies[0].pose.center;
    if (last.current.sim !== sim || particles.current.length !== count) {
      particles.current = Array.from({ length: count }, () => {
        const point = spawnTracer(sim, sourceId);
        return { point, tail: point, age: Math.random() * 3, life: 2 + Math.random() * 5, tailAge: 0 };
      });
      last.current = { sim, time: sim.time };
    }
    const dt = Math.min(0.08, Math.max(0, sim.time - last.current.time));
    last.current.time = sim.time;
    const positions = geometry.getAttribute('position') as THREE.BufferAttribute;
    const lines = trails.getAttribute('position') as THREE.BufferAttribute;
    let shown = 0;
    for (const particle of particles.current) {
      if (dt > 0) {
        particle.age += dt; particle.tailAge += dt;
        if (particle.tailAge > 0.24) { particle.tail = particle.point; particle.tailAge = 0; }
        const field = sampleAtomField(particle.point, sim.bodies, sim.intensity);
        particle.point = add(particle.point, mul(field.velocity, dt));
        if (particle.age > particle.life || field.inside || cavityAt(particle.point, sim.bodies) || sub(particle.point, origin).some(axis => Math.abs(axis) > ATOM.halfSize)) {
          particle.point = spawnTracer(sim, sourceId); particle.tail = particle.point; particle.age = 0; particle.tailAge = 0;
        }
      }
      if (cavityAt(particle.point, sim.bodies)) continue;
      const p = sub(particle.point, origin), tail = sub(particle.tail, origin);
      positions.setXYZ(shown, ...p); lines.setXYZ(shown * 2, ...tail); lines.setXYZ(shown * 2 + 1, ...p);
      shown++;
    }
    geometry.setDrawRange(0, shown); trails.setDrawRange(0, shown * 2);
    positions.needsUpdate = lines.needsUpdate = true;
  });
  return <>
    <lineSegments geometry={trails} renderOrder={2}><lineBasicMaterial color={color} transparent opacity={sourceId ? 0.46 : 0.14} depthWrite={false} /></lineSegments>
    <points geometry={geometry} renderOrder={3}><pointsMaterial color={color} size={sourceId ? 0.055 : 0.026} transparent opacity={sourceId ? 0.95 : 0.42} depthWrite={false} /></points>
  </>;
}

export function OccupancyCloud({ simulation, opacity }: { simulation: SimulationRef; opacity: number }) {
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(ATOM.gridSize ** 3 * 3), 3));
    g.setAttribute('strength', new THREE.BufferAttribute(new Float32Array(ATOM.gridSize ** 3), 1));
    return g;
  }, []);
  const material = useMemo(() => new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { opacity: { value: opacity } },
    vertexShader: `attribute float strength; varying float weight;
      void main() { weight = strength; vec4 p = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * p; gl_PointSize = clamp(110.0 / -p.z, 2.0, 20.0); }`,
    fragmentShader: `uniform float opacity; varying float weight;
      void main() { float r = length(gl_PointCoord - 0.5); if (r > 0.5) discard;
        float glow = exp(-14.0 * r * r);
        gl_FragColor = vec4(mix(vec3(0.18, 0.35, 0.58), vec3(0.82, 0.94, 1.0), weight), opacity * glow * (0.12 + weight * 0.88));
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  }), []);
  material.uniforms.opacity.value = opacity;
  const elapsed = useRef(1);
  useEffect(() => () => { geometry.dispose(); material.dispose(); }, [geometry, material]);
  useFrame((_, delta) => {
    elapsed.current += delta;
    if (elapsed.current < 0.2) return;
    elapsed.current = 0;
    const cells = simulation.current.observation.cells;
    let peak = 0;
    for (const value of cells) peak = Math.max(peak, value);
    const positions = geometry.getAttribute('position') as THREE.BufferAttribute;
    const weights = geometry.getAttribute('strength') as THREE.BufferAttribute;
    const n = ATOM.gridSize, width = ATOM.halfSize * 2 / n;
    let count = 0;
    for (let i = 0; i < cells.length; i++) {
      if (cells[i] <= 0) continue;
      positions.setXYZ(count, (i % n + 0.5) * width - ATOM.halfSize, (Math.floor(i / n) % n + 0.5) * width - ATOM.halfSize, (Math.floor(i / (n * n)) + 0.5) * width - ATOM.halfSize);
      weights.setX(count, Math.log1p(cells[i] * 120) / Math.log1p(peak * 120));
      count++;
    }
    geometry.setDrawRange(0, count); positions.needsUpdate = weights.needsUpdate = true;
  });
  return <points geometry={geometry} material={material} renderOrder={1} />;
}

export function ElectronTrails({ simulation }: { simulation: SimulationRef }) {
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(ATOM.maxElectrons * ATOM.traceLength * 6), 3));
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(ATOM.maxElectrons * ATOM.traceLength * 6), 3));
    return g;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame(() => {
    const positions = geometry.getAttribute('position') as THREE.BufferAttribute;
    const colors = geometry.getAttribute('color') as THREE.BufferAttribute;
    let index = 0;
    for (const trace of Object.values(simulation.current.observation.traces)) {
      const points = orderedTrace(trace);
      for (let i = 1; i < points.length; i++) {
        const fade = 0.1 + 0.65 * i / points.length;
        positions.setXYZ(index, ...points[i - 1]); colors.setXYZ(index++, fade * 0.63, fade * 0.83, fade);
        positions.setXYZ(index, ...points[i]); colors.setXYZ(index++, fade * 0.63, fade * 0.83, fade);
      }
    }
    geometry.setDrawRange(0, index); positions.needsUpdate = colors.needsUpdate = true;
  });
  return <lineSegments geometry={geometry} renderOrder={4}><lineBasicMaterial vertexColors transparent opacity={0.68} depthWrite={false} /></lineSegments>;
}

export function BodyIndicator({ simulation, body, selected, showForce, onSelect }: {
  simulation: SimulationRef; body: AtomBody; selected: boolean; showForce: boolean; onSelect: () => void;
}) {
  const group = useRef<THREE.Group>(null);
  const force = simulation.current.loads[body.id]?.force ?? [0, 0, 0];
  useFrame(() => {
    const live = simulation.current.bodies.find(item => item.id === body.id);
    if (live && group.current) group.current.position.set(...sub(live.pose.center, simulation.current.bodies[0].pose.center));
  });
  return <group ref={group}>
    {showForce && <VectorArrow at={[0, 0, 0]} vector={force} color={chargeColor(body)} scale={7} width={selected ? 3 : 1.8} opacity={selected ? 1 : 0.65} />}
    <Html position={[0, 1.02, 0]} center zIndexRange={[20, 0]}><button type="button" className={`atom-body-label${selected ? ' selected' : ''}`} style={{ color: chargeColor(body) }} onClick={onSelect}>{body.kind === 'proton' ? 'p⁺' : `e⁻ ${body.id.split('-')[1]}`}</button></Html>
  </group>;
}

export function ObservationBox() {
  const geometry = useMemo(() => {
    const cube = new THREE.BoxGeometry(ATOM.halfSize * 2, ATOM.halfSize * 2, ATOM.halfSize * 2);
    const edges = new THREE.EdgesGeometry(cube); cube.dispose(); return edges;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <lineSegments geometry={geometry}><lineBasicMaterial color="#75a7b0" transparent opacity={0.16} depthWrite={false} /></lineSegments>;
}
