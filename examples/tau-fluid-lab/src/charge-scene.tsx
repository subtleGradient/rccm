import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { CUBE_HALF, TORUS_MAJOR, TORUS_MINOR, add, dot, mul, normalize, type Vec3 } from './model';
import { CubeBoundary, FlowRibbon } from './scene';
import { chargeSample, chargeStreamline, chargeSurfaceForces, type ChargeCase, type ChargeState } from './charge-model';

type ChargeSceneProps = {
  state: ChargeState;
  startSeparation: number;
  scenario: ChargeCase;
  step: number;
  visualTime: number;
  playing: boolean;
  quality: 'high' | 'low';
  showPressure: boolean;
};

const BLUE = '#9ac9ff';
const GOLD = '#ffdb8d';
const MINT = '#baf5d0';
const PRESSURE_LOW = [103, 89, 202];
const PRESSURE_HIGH = [173, 244, 199];

function blend(a: number[], b: number[], t: number) {
  return a.map((v, i) => Math.round(v * (1 - t) + b[i] * t));
}

function makePressureTexture(state: ChargeState, scenario: ChargeCase, resolution: number) {
  const pixels = new Uint8Array(resolution * resolution * 4);
  for (let row = 0; row < resolution; row++) for (let col = 0; col < resolution; col++) {
    const point: Vec3 = [((col + 0.5) / resolution - 0.5) * CUBE_HALF * 2,
      ((row + 0.5) / resolution - 0.5) * CUBE_HALF * 2, -0.36];
    const reading = chargeSample(point, state, scenario);
    const index = (row * resolution + col) * 4;
    if (reading.inside) continue;
    const normalized = Math.max(0, Math.min(1, (reading.pressure - 0.42) / 0.40));
    const color = normalized < 0.5
      ? blend(PRESSURE_LOW, [53, 79, 98], normalized * 2)
      : blend([53, 79, 98], PRESSURE_HIGH, (normalized - 0.5) * 2);
    const speed = Math.sqrt(dot(reading.slip, reading.slip));
    pixels[index] = color[0];
    pixels[index + 1] = color[1];
    pixels[index + 2] = color[2];
    pixels[index + 3] = Math.round(80 + 140 * Math.min(1, speed / 0.6));
  }
  const texture = new THREE.DataTexture(pixels, resolution, resolution, THREE.RGBAFormat);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

function PressureSlice({ state, scenario, fieldKey, quality }: {
  state: ChargeState; scenario: ChargeCase; fieldKey: string; quality: 'high' | 'low';
}) {
  const texture = useMemo(() => makePressureTexture(state, scenario, quality === 'high' ? 144 : 88),
    [scenario, fieldKey, quality]);
  useEffect(() => () => texture.dispose(), [texture]);
  return <mesh position={[0, 0, -0.36]} renderOrder={0}>
    <planeGeometry args={[CUBE_HALF * 2, CUBE_HALF * 2]} />
    <meshBasicMaterial map={texture} transparent opacity={0.86} depthWrite={false} side={THREE.DoubleSide} />
  </mesh>;
}

function VectorArrow({ from, vector, color, width = 3.4, head = 0.1, opacity = 1 }: {
  from: Vec3; vector: Vec3; color: string; width?: number; head?: number; opacity?: number;
}) {
  const magnitude = Math.sqrt(dot(vector, vector));
  if (magnitude < 1e-4) return null;
  const tip = add(from, vector);
  const rotation = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(...normalize(vector)));
  return <>
    <FlowRibbon points={[from, add(from, mul(vector, 0.5)), tip]} color={color} width={width} opacity={opacity} arrowCount={0} />
    <mesh position={tip} quaternion={rotation} renderOrder={8}>
      <coneGeometry args={[head * 0.38, head, 10]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} depthTest={false} />
    </mesh>
  </>;
}

function CoreShape({ x, side, scenario, step }: { x: number; side: 'left' | 'right'; scenario: ChargeCase; step: number }) {
  const negative = side === 'left' || scenario === 'like';
  const color = negative ? BLUE : GOLD;
  return <group position={[x, 0, 0]}>
    <mesh renderOrder={6}>
      <torusGeometry args={[TORUS_MAJOR, TORUS_MINOR, 24, 96]} />
      <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={0.6} roughness={0.23}
        metalness={0.17} transparent opacity={0.83} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
    <mesh scale={1.008} renderOrder={7}>
      <torusGeometry args={[TORUS_MAJOR, TORUS_MINOR, 12, 72]} />
      <meshBasicMaterial color={color} transparent opacity={0.32} wireframe depthWrite={false} />
    </mesh>
    <CoreMarker side={side} negative={negative} />
    {step < 5 && <mesh position={[0, -1.12, -0.22]}>
      <boxGeometry args={[1.28, 0.017, 0.017]} />
      <meshBasicMaterial color="#609195" transparent opacity={0.6} />
    </mesh>}
  </group>;
}

function CoreMarker({ side, negative }: { side: 'left' | 'right'; negative: boolean }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 80;
    const context = canvas.getContext('2d')!;
    context.fillStyle = '#071820';
    context.fillRect(1, 1, 158, 78);
    context.strokeStyle = negative ? '#9ac9ff' : '#ffdb8d';
    context.lineWidth = 4;
    context.strokeRect(3, 3, 154, 74);
    context.fillStyle = negative ? '#c4e1ff' : '#ffe5ad';
    context.font = 'bold 48px ui-monospace, monospace';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(`${side === 'left' ? 'A' : 'B'} ${negative ? '−' : '+'}`, 80, 42);
    const result = new THREE.CanvasTexture(canvas);
    result.colorSpace = THREE.SRGBColorSpace;
    return result;
  }, [side, negative]);
  useEffect(() => () => texture.dispose(), [texture]);
  return <sprite position={[0, -0.99, 0.3]} scale={[0.62, 0.31, 1]} renderOrder={10}>
    <spriteMaterial map={texture} transparent depthTest={false} depthWrite={false} />
  </sprite>;
}

function ringPath(center: number, direction: number): Vec3[] {
  const path: Vec3[] = [];
  for (let i = 0; i <= 96; i++) {
    const angle = direction * i * Math.PI * 2 / 96;
    path.push([center + 0.84 * Math.cos(angle), 0.84 * Math.sin(angle), 0.31]);
  }
  return path;
}

function tubePath(center: number): Vec3[] {
  const path: Vec3[] = [];
  for (let i = 0; i <= 64; i++) {
    const angle = i * Math.PI * 2 / 64;
    path.push([center + TORUS_MAJOR + 0.29 * Math.cos(angle), 0, 0.29 * Math.sin(angle)]);
  }
  return path;
}

function CirculationGuides({ state, scenario, step }: { state: ChargeState; scenario: ChargeCase; step: number }) {
  if (step > 2) return null;
  const cores = step === 1 ? [state.left] : [state.left, state.right];
  return <>{cores.map((x, i) => <group key={i}>
    <FlowRibbon points={ringPath(x, i === 0 || scenario === 'like' ? 1 : -1)} color={i === 0 ? '#e4f5ff' : '#ffe5a9'} width={4.5} opacity={0.96} arrowCount={4} onTop />
    <FlowRibbon points={tubePath(x)} color="#a6ffd0" width={5.5} opacity={1} arrowCount={3} onTop />
  </group>)}</>;
}

function seededLines(state: ChargeState, scenario: ChargeCase, step: number, quality: 'high' | 'low') {
  const seeds: { point: Vec3; kind: 'gap' | 'outer' | 'core' }[] = [];
  for (const [index, x] of [state.left, state.right].entries()) {
    if (step === 1 && index === 1) break;
    for (let i = 0; i < (quality === 'high' ? 8 : 5); i++) {
      const angle = Math.PI * 2 * i / (quality === 'high' ? 8 : 5);
      seeds.push({ point: [x + 0.76 * Math.cos(angle), 0.76 * Math.sin(angle), 0.11], kind: 'core' });
    }
  }
  if (step > 1) {
    seeds.push({ point: [0, -0.45, 0.12], kind: 'gap' });
    for (const x of [-1.65, 1.65]) for (const y of [-0.65, 0, 0.65])
      seeds.push({ point: [x, y, 0.18], kind: 'outer' });
  }
  return seeds.map(seed => ({ ...seed, path: chargeStreamline(seed.point, state, scenario, seed.kind === 'gap' ? 30 : 120, step === 1 ? 'left' : 'both') }));
}

function FlowLines({ state, scenario, step, quality, fieldKey }: {
  state: ChargeState; scenario: ChargeCase; step: number; quality: 'high' | 'low'; fieldKey: string;
}) {
  const lines = useMemo(() => seededLines(state, scenario, step, quality), [scenario, step, quality, fieldKey]);
  return <>{lines.map((line, i) => <FlowRibbon key={i} points={line.path}
    color={line.kind === 'gap' ? '#effff6' : line.kind === 'outer' ? '#b7efe0' : '#b2dafa'}
    width={line.kind === 'gap' ? 3.3 : 2.4} opacity={line.kind === 'gap' ? 0.98 : 0.75} arrowCount={1} />)}</>;
}

function FluidTracers({ state, startSeparation, scenario, step, playing, quality }: ChargeSceneProps) {
  const count = quality === 'high' ? 800 : 420;
  const base = useMemo(() => {
    const values = new Float32Array(count * 3);
    let seed = 724129;
    const random = () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 4294967296; };
    for (let i = 0; i < count; i++) {
      let point: Vec3 = [0, 0, 0];
      for (let attempt = 0; attempt < 12; attempt++) {
        point = [(random() * 2 - 1) * 1.95, (random() * 2 - 1) * 1.3, (random() * 2 - 1) * 0.5];
        if (!chargeSample(point, state, scenario, step === 1 ? 'left' : 'both').inside) break;
      }
      values.set(point, i * 3);
    }
    return values;
  }, [count, step, scenario, startSeparation]);
  const geometry = useMemo(() => {
    const result = new THREE.BufferGeometry();
    result.setAttribute('position', new THREE.BufferAttribute(base.slice(), 3));
    return result;
  }, [base]);
  const trailGeometry = useMemo(() => {
    const result = new THREE.BufferGeometry();
    const segments = new Float32Array(count * 6);
    for (let i = 0; i < count; i++) {
      segments.set(base.subarray(i * 3, i * 3 + 3), i * 6);
      segments.set(base.subarray(i * 3, i * 3 + 3), i * 6 + 3);
    }
    result.setAttribute('position', new THREE.BufferAttribute(segments, 3));
    return result;
  }, [base, count]);
  const trailOrigins = useRef<Float32Array>(base.slice());
  const trailFrame = useRef(0);
  useEffect(() => { trailOrigins.current = base.slice(); trailFrame.current = 0; }, [base]);
  useEffect(() => () => { geometry.dispose(); trailGeometry.dispose(); }, [geometry, trailGeometry]);
  useFrame((_, delta) => {
    if (!playing) return;
    const positions = geometry.getAttribute('position') as THREE.BufferAttribute;
    const data = positions.array as Float32Array;
    const trails = trailGeometry.getAttribute('position') as THREE.BufferAttribute;
    const segments = trails.array as Float32Array;
    const dt = Math.min(delta, 0.034);
    const refreshTrail = ++trailFrame.current % 7 === 0;
    for (let i = 0; i < count; i++) {
      const p: Vec3 = [data[i * 3], data[i * 3 + 1], data[i * 3 + 2]];
      const sample = chargeSample(p, state, scenario, step === 1 ? 'left' : 'both');
      if (sample.inside) {
        data.set(base.subarray(i * 3, i * 3 + 3), i * 3);
        trailOrigins.current.set(base.subarray(i * 3, i * 3 + 3), i * 3);
        segments.set(base.subarray(i * 3, i * 3 + 3), i * 6);
        segments.set(base.subarray(i * 3, i * 3 + 3), i * 6 + 3);
        continue;
      }
      const next = add(p, mul(sample.velocity, dt));
      if (Math.abs(next[0]) > 2.05 || Math.abs(next[1]) > 1.4 || Math.abs(next[2]) > 0.65 ||
        chargeSample(next, state, scenario, step === 1 ? 'left' : 'both').inside) {
        data.set(base.subarray(i * 3, i * 3 + 3), i * 3);
        trailOrigins.current.set(base.subarray(i * 3, i * 3 + 3), i * 3);
      } else data.set(next, i * 3);
      if (refreshTrail) trailOrigins.current.set(data.subarray(i * 3, i * 3 + 3), i * 3);
      segments.set(trailOrigins.current.subarray(i * 3, i * 3 + 3), i * 6);
      segments.set(data.subarray(i * 3, i * 3 + 3), i * 6 + 3);
    }
    positions.needsUpdate = true;
    trails.needsUpdate = true;
  });
  return <>
    <lineSegments geometry={trailGeometry} renderOrder={3}><lineBasicMaterial color="#bdf8d7" transparent opacity={0.58} depthWrite={false} /></lineSegments>
    <points geometry={geometry} renderOrder={4}>
      <pointsMaterial color="#dffff0" size={0.037} sizeAttenuation transparent opacity={0.9} depthWrite={false} />
    </points>
  </>;
}

function GapVectors({ state, scenario }: { state: ChargeState; scenario: ChargeCase }) {
  const sample = chargeSample([0, 0, 0.08], state, scenario);
  if (sample.inside) return null;
  return <group>
    <VectorArrow from={[-0.23, -0.24, 0.48]} vector={mul(sample.leftFlow, 0.48)} color="#9ac9ff" width={4} head={0.15} />
    <VectorArrow from={[0.23, -0.24, 0.48]} vector={mul(sample.rightFlow, 0.48)} color="#ffdb8d" width={4} head={0.15} />
    <VectorArrow from={[0, 0.12, 0.48]} vector={mul(sample.slip, 0.52)} color="#f2fff5" width={5} head={0.18} />
    <mesh position={[0, 0.12, 0.47]}><sphereGeometry args={[0.04, 10, 10]} /><meshBasicMaterial color="#f7fff1" /></mesh>
  </group>;
}

function PressureArrows({ state, scenario }: { state: ChargeState; scenario: ChargeCase }) {
  const pressures = useMemo(() => {
    const arrows: { point: Vec3; normal: Vec3; pressure: number }[] = [];
    for (const x of [state.left, state.right]) for (let i = 0; i < 12; i++) {
      const angle = 2 * Math.PI * i / 12;
      for (const v of [-0.35, 0.35]) {
        const point: Vec3 = [x + (TORUS_MAJOR + TORUS_MINOR * Math.cos(v)) * Math.cos(angle),
          (TORUS_MAJOR + TORUS_MINOR * Math.cos(v)) * Math.sin(angle), TORUS_MINOR * Math.sin(v)];
        const normal: Vec3 = [Math.cos(angle) * Math.cos(v), Math.sin(angle) * Math.cos(v), Math.sin(v)];
        const reading = chargeSample(add(point, mul(normal, 0.003)), state, scenario);
        if (!reading.inside) arrows.push({ point, normal, pressure: reading.pressure });
      }
    }
    return arrows;
  }, [scenario, state.left, state.right]);
  return <>{pressures.map((arrow, i) => {
    const distance = 0.14 + Math.max(0, arrow.pressure - 0.42) * 0.62;
    return <VectorArrow key={i} from={add(arrow.point, mul(arrow.normal, distance + 0.03))}
      vector={mul(arrow.normal, -distance)} color={MINT} width={2.6} head={0.09} opacity={0.87} />;
  })}</>;
}

function NetForceArrows({ state, scenario, step }: { state: ChargeState; scenario: ChargeCase; step: number }) {
  const forces = useMemo(() => chargeSurfaceForces(state, scenario), [state.left, state.right, scenario]);
  return <>{[state.left, state.right].map((x, i) => <group key={i}>
    <VectorArrow from={[x, 0, 0.7]} vector={mul(forces[i], 19)} color="#ffffff" width={6} head={0.24} />
    {step === 5 && <VectorArrow from={[x, -0.53, 0.7]}
      vector={[i === 0 ? state.leftVelocity * 3.2 : state.rightVelocity * 3.2, 0, 0]}
      color="#d6b9ff" width={2.6} head={0.13} opacity={0.9} />}
  </group>)}</>;
}

function SpinProbe({ state, scenario, time }: { state: ChargeState; scenario: ChargeCase; time: number }) {
  const point: Vec3 = [state.left + 1.01, 0.06, 0.38];
  const h = 0.018;
  const p1 = chargeSample([point[0] + h, point[1], point[2]], state, scenario, 'left');
  const p2 = chargeSample([point[0] - h, point[1], point[2]], state, scenario, 'left');
  const p3 = chargeSample([point[0], point[1] + h, point[2]], state, scenario, 'left');
  const p4 = chargeSample([point[0], point[1] - h, point[2]], state, scenario, 'left');
  if (p1.inside || p2.inside || p3.inside || p4.inside) return null;
  const spin = ((p1.velocity[1] - p2.velocity[1]) - (p3.velocity[0] - p4.velocity[0])) / (4 * h);
  const angle = spin * time;
  const spoke: Vec3 = [point[0] + 0.20 * Math.cos(angle), point[1] + 0.20 * Math.sin(angle), point[2] + 0.02];
  return <group>
    <mesh position={point}>
      <ringGeometry args={[0.22, 0.245, 48]} />
      <meshBasicMaterial color="#f1fff1" side={THREE.DoubleSide} transparent opacity={0.92} />
    </mesh>
    <FlowRibbon points={[point, add(point, mul([Math.cos(angle), Math.sin(angle), 0], 0.10)), spoke]}
      color="#f1fff1" width={4} arrowCount={0} />
    <mesh position={spoke}><sphereGeometry args={[0.044, 12, 12]} /><meshBasicMaterial color="#f1fff1" /></mesh>
  </group>;
}

export function ChargeScene({ state, startSeparation, scenario, step, visualTime, playing, quality, showPressure }: ChargeSceneProps) {
  const fieldKey = `${startSeparation}-${step === 5 ? Math.floor(visualTime * 8) : 0}`;
  return <Canvas dpr={quality === 'high' ? [1, 1.5] : 1} camera={{ position: [0, 3.8, 6.8], fov: 42, near: 0.1, far: 40 }}
    gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}>
    <color attach="background" args={['#061017']} />
    <ambientLight intensity={1.25} />
    <directionalLight color="#d7f0ff" intensity={2.6} position={[2, 4, 6]} />
    <pointLight color="#82bdff" intensity={13} distance={8} position={[-2, 0.5, 2]} />
    <pointLight color="#ffcf80" intensity={11} distance={8} position={[2, 0.5, 2]} />
    <OrbitControls enablePan={false} enableDamping minDistance={4.4} maxDistance={11} />
    <CubeBoundary />
    {showPressure && step >= 3 && <PressureSlice state={state} scenario={scenario} fieldKey={fieldKey} quality={quality} />}
    <FluidTracers state={state} startSeparation={startSeparation} scenario={scenario} step={step} visualTime={visualTime} playing={playing} quality={quality} showPressure={showPressure} />
    <FlowLines state={state} scenario={scenario} step={step} quality={quality} fieldKey={fieldKey} />
    <CirculationGuides state={state} scenario={scenario} step={step} />
    <CoreShape x={state.left} side="left" scenario={scenario} step={step} />
    {step > 1 && <CoreShape x={state.right} side="right" scenario={scenario} step={step} />}
    {step === 1 && <SpinProbe state={state} scenario={scenario} time={visualTime} />}
    {step >= 2 && <GapVectors state={state} scenario={scenario} />}
    {step >= 4 && <PressureArrows state={state} scenario={scenario} />}
    {step >= 4 && <NetForceArrows state={state} scenario={scenario} step={step} />}
  </Canvas>;
}
