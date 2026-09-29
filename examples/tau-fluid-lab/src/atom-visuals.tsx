import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { add, sub, type Vec3 } from './model';
import { PAIR_FIELD } from './pair-field';
import { VectorArrow } from './pair-visuals';
import { ATOM, cavityAt, chargeColor, referenceDensity, sampleAtomField, sampleAtomPressure, slipAppearance, type AtomBody } from './atom-field';
import { orderedTrace, stepAtomSimulation, type AtomSimulation } from './atom-simulation';

export type SimulationRef = RefObject<AtomSimulation>;
export type SliceKind = 'pressure' | 'electric' | 'twist';
export type SliceMetric = 'capacity' | 'slip' | 'twist' | 'orbital';
export type SliceRange = { low: number; high: number };
export const SLICES = {
  pressure: { plane: 'XY', axis: 'Z' }, electric: { plane: 'XZ', axis: 'Y' }, twist: { plane: 'YZ', axis: 'X' },
} as const;
export const METRICS = {
  capacity: { title: 'Remaining capacity', symbol: 'q = −S₀₀', low: '#c33cec', mid: '#47589b', high: '#16d1ae', note: 'Violet is spent capacity; teal is available. Ambient capacity fades clear.' },
  slip: { title: 'Charge-linked slip', symbol: '− / 0 / +', low: '#327bff', mid: '#92959f', high: '#ffd347', note: 'Blue / gray / yellow: negative influence, balance, positive influence. The same color language as the fluid.' },
  twist: { title: 'Rotational twist', symbol: 'Ayz', low: '#55dfb0', mid: '#69717e', high: '#fc825e', note: 'Mint and coral show opposite signs of the local Ayz tensor component. Near-zero twist fades clear.' },
  orbital: { title: 'Orbital reference', symbol: '|ψ|²', low: '#182235', mid: '#836ac2', high: '#e4c7ff', note: 'The supplied hydrogenic probability density. Nodes are empty; this is separate from fluid color.' },
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

export function AtomSlice({ simulation, kind, metric, offset, opacity, ambient, onProbe, ranges }: {
  simulation: SimulationRef; kind: SliceKind; metric: SliceMetric; offset: number; opacity: number; ambient: number;
  onProbe: (point: Vec3) => void; ranges: RefObject<Record<SliceKind, SliceRange>>;
}) {
  const resolution = 112, design = METRICS[metric];
  const data = useMemo(() => new Uint8Array(resolution ** 2 * 4), []);
  const values = useMemo(() => new Float64Array(resolution ** 2), []);
  const texture = useMemo(() => {
    const t = new THREE.DataTexture(data, resolution, resolution, THREE.RGBAFormat);
    t.colorSpace = THREE.SRGBColorSpace; t.minFilter = t.magFilter = THREE.LinearFilter; return t;
  }, [data]);
  useEffect(() => () => texture.dispose(), [texture]);
  const palette = useMemo(() => [design.low, design.mid, design.high].map(hex => {
    const packed = parseInt(hex.slice(1), 16); return [packed >> 16, (packed >> 8) & 255, packed & 255];
  }), [metric]);
  const elapsed = useRef(1), last = useRef({ sim: null as AtomSimulation | null, revision: -1, settings: '' });
  useFrame((_, delta) => {
    elapsed.current += delta;
    const sim = simulation.current, settings = `${metric}:${offset}:${ambient}:${sim.intensity}:${sim.interpretation}`;
    const changed = last.current.sim !== sim || last.current.settings !== settings;
    if (!changed && (elapsed.current < 0.16 || last.current.revision === sim.revision)) return;
    elapsed.current = 0; last.current = { sim, revision: sim.revision, settings };
    const origin = sim.bodies[0].pose.center;
    let low = Infinity, high = -Infinity;
    for (let y = 0; y < resolution; y++) for (let x = 0; x < resolution; x++) {
      const u = ((x + 0.5) / resolution * 2 - 1) * ATOM.halfSize, v = ((y + 0.5) / resolution * 2 - 1) * ATOM.halfSize;
      const local: Vec3 = kind === 'pressure' ? [u, v, offset] : kind === 'electric' ? [u, offset, -v] : [offset, v, -u];
      const point = add(origin, local), index = x + y * resolution;
      if (cavityAt(point, sim.bodies)) { values[index] = NaN; continue; }
      const value = metric === 'capacity' ? sampleAtomPressure(point, sim.bodies, sim.intensity) / PAIR_FIELD.pressureCapacity
        : metric === 'slip' ? slipAppearance(point, sim.bodies, sim.intensity, sim.interpretation).balance
        : metric === 'orbital' ? referenceDensity(point, sim.bodies) : -sampleAtomField(point, sim.bodies, sim.intensity).b[0];
      values[index] = value; low = Math.min(low, value); high = Math.max(high, value);
    }
    if (!Number.isFinite(low)) { low = 0; high = 0; }
    if (metric === 'slip' || metric === 'twist') { high = Math.max(Math.abs(low), Math.abs(high)); low = -high; }
    ranges.current[kind] = { low, high };
    const baseline = 1 - PAIR_FIELD.macroPressure / PAIR_FIELD.pressureCapacity;
    for (let i = 0; i < values.length; i++) {
      const value = values[i], base = i * 4;
      if (!Number.isFinite(value)) { data.fill(0, base, base + 4); continue; }
      let t = high > low ? (value - low) / (high - low) : 0.5;
      if (metric === 'orbital') t = Math.sqrt(Math.max(0, value) / Math.max(high, 1e-12));
      const half = t < 0.5 ? 0 : 1, blend = half === 0 ? t * 2 : t * 2 - 1;
      for (let c = 0; c < 3; c++) data[base + c] = Math.round(palette[half][c] + (palette[half + 1][c] - palette[half][c]) * blend);
      const activity = Math.min(1, metric === 'capacity' ? Math.max(0, baseline - value) / Math.max(0.025, baseline - low)
        : metric === 'orbital' ? t : Math.abs(value) / Math.max(metric === 'slip' ? 0.5 : 0.18, high));
      data[base + 3] = Math.round(255 * (ambient + (1 - ambient) * Math.pow(activity, 0.65)));
    }
    texture.needsUpdate = true;
  });
  const position: Vec3 = kind === 'pressure' ? [0, 0, offset] : kind === 'electric' ? [0, offset, 0] : [offset, 0, 0];
  const rotation: [number, number, number] = kind === 'pressure' ? [0, 0, 0] : kind === 'electric' ? [-Math.PI / 2, 0, 0] : [0, Math.PI / 2, 0];
  const select = (event: ThreeEvent<MouseEvent>) => { event.stopPropagation(); onProbe([event.point.x, event.point.y, event.point.z]); };
  return <group position={position} rotation={rotation}>
    <mesh onClick={select} renderOrder={-2}><planeGeometry args={[ATOM.halfSize * 2, ATOM.halfSize * 2]} /><meshBasicMaterial map={texture} transparent opacity={opacity} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} /></mesh>
    <Line points={square} color={design.high} transparent opacity={0.17} lineWidth={1} depthWrite={false} />
    <Html position={[-ATOM.halfSize, ATOM.halfSize + 0.15, 0]} style={{ pointerEvents: 'none' }}><span className={`atom-plane-label ${kind}`}>{SLICES[kind].plane} / {design.symbol}</span></Html>
  </group>;
}

export function OccupancyCloud({ simulation, opacity }: { simulation: SimulationRef; opacity: number }) {
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(ATOM.gridSize ** 3 * 3), 3));
    g.setAttribute('strength', new THREE.BufferAttribute(new Float32Array(ATOM.gridSize ** 3), 1));
    g.setDrawRange(0, 0);
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
  return <points geometry={geometry} material={material} renderOrder={1} frustumCulled={false} />;
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
  return <lineSegments geometry={geometry} renderOrder={4} frustumCulled={false}><lineBasicMaterial vertexColors transparent opacity={0.68} depthWrite={false} /></lineSegments>;
}

export function BodyIndicator({ simulation, body, selected, showForce, onSelect }: {
  simulation: SimulationRef; body: AtomBody; selected: boolean; showForce: boolean; onSelect: () => void;
}) {
  const group = useRef<THREE.Group>(null);
  const force: Vec3 = simulation.current.loads[body.id]?.force ?? [0, 0, 0];
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
