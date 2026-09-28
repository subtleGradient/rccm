import { useEffect, useMemo } from 'react';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { add, length, mul, normalize, sub, type Vec3 } from './model';
import { boundaryPush, integrateBoundary, pairStateAt, samplePairField, type CavityId, type PairHistory, type PairState } from './pair-field';

const FORCE_MAGNIFICATION = 5;
const BOUNDARY_MAGNIFICATION = 0.45;

export function VectorArrow({ at, vector, color, scale = 1, width = 2, opacity = 1 }: {
  at: Vec3; vector: Vec3; color: string; scale?: number; width?: number; opacity?: number;
}) {
  const magnitude = length(vector) * scale;
  if (magnitude < 0.012) return null;
  const direction = normalize(vector);
  const end = add(at, mul(direction, Math.min(1.25, magnitude)));
  const tip = new THREE.Vector3(...end);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(...direction));
  return <>
    <Line points={[at, end]} color={color} lineWidth={width} transparent opacity={opacity} depthWrite={false} renderOrder={8} />
    <mesh position={tip} quaternion={quaternion} renderOrder={9}>
      <coneGeometry args={[Math.min(0.055, 0.022 + magnitude * 0.045), Math.min(0.12, 0.05 + magnitude * 0.08), 7]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} />
    </mesh>
  </>;
}

function makePressureTexture(state: PairState, intensity: number) {
  const nx = 144, ny = 96;
  const data = new Uint8Array(nx * ny * 4);
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const point: Vec3 = [-3.45 + (i + 0.5) * 6.9 / nx, -2.3 + (j + 0.5) * 4.6 / ny, 0];
    const sample = samplePairField(point, state, intensity);
    const index = (i + j * nx) * 4;
    if (sample.inside) { data.set([0, 0, 0, 0], index); continue; }
    const deficit = Math.max(0, Math.min(1, (0.94 - sample.staticPressure) * 2.1));
    // Static pressure only: turquoise is ambient, violet is lower pressure.
    data[index] = Math.round(26 + deficit * 149);
    data[index + 1] = Math.round(100 - deficit * 53);
    data[index + 2] = Math.round(112 + deficit * 80);
    data[index + 3] = 210;
  }
  const texture = new THREE.DataTexture(data, nx, ny, THREE.RGBAFormat);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

export function PressureSlice({ history, intensity, time, visible }: { history: PairHistory; intensity: number; time: number; visible: boolean }) {
  const quantized = Math.floor(time * 10) / 10;
  const texture = useMemo(() => makePressureTexture(pairStateAt(history, quantized), intensity), [history, quantized, intensity]);
  useEffect(() => () => texture.dispose(), [texture]);
  if (!visible) return null;
  return <mesh position={[0, 0, -0.025]} renderOrder={0}>
    <planeGeometry args={[6.9, 4.6]} />
    <meshBasicMaterial map={texture} side={THREE.DoubleSide} transparent opacity={0.72} depthWrite={false} />
  </mesh>;
}

export function TauCube() {
  return <lineSegments renderOrder={0}>
    <edgesGeometry args={[new THREE.BoxGeometry(7.2, 4.8, 5.1)]} />
    <lineBasicMaterial color="#5d8791" transparent opacity={0.2} depthWrite={false} />
  </lineSegments>;
}

export function GapProbe({ point, state, intensity, visible }: { point: Vec3; state: PairState; intensity: number; visible: boolean }) {
  if (!visible) return null;
  const field = samplePairField(point, state, intensity);
  return <group>
    <mesh position={point} renderOrder={10}><sphereGeometry args={[0.052, 12, 12]} /><meshBasicMaterial color="#f2fffa" depthTest={false} /></mesh>
    {!field.inside && <>
      <VectorArrow at={point} vector={field.positive.slip} color="#f9d96c" scale={0.48} width={2.8} />
      <VectorArrow at={point} vector={field.negative.slip} color={state.negative.winding === -1 ? '#bcd9ff' : '#f9d96c'} scale={0.48} width={2.8} />
      <VectorArrow at={point} vector={field.slip} color="#effff8" scale={0.55} width={3.4} />
    </>}
  </group>;
}

export function BoundaryForces({ state, intensity, visible, selected }: { state: PairState; intensity: number; visible: boolean; selected: CavityId | null }) {
  if (!visible) return null;
  return <>
    {(['positive', 'negative'] as const).map(id => {
      const pose = state[id];
      const integrated = integrateBoundary(pose, state, intensity, 18, 12);
      const chosen = selected === null || selected === id;
      return <group key={id}>
        {chosen && Array.from({ length: 12 }, (_, i) => {
          const u = i * Math.PI * 2 / 12, v = i % 2 === 0 ? 0.25 : Math.PI;
          const push = boundaryPush(pose, state, intensity, u, v);
          return <group key={i}>
            <VectorArrow at={push.position} vector={push.normalForce} color="#d592e8" scale={BOUNDARY_MAGNIFICATION} width={1.5} opacity={0.8} />
            <VectorArrow at={push.position} vector={push.tangentialForce} color="#73c8ad" scale={BOUNDARY_MAGNIFICATION} width={1.3} opacity={0.78} />
          </group>;
        })}
        <VectorArrow at={pose.center} vector={integrated.force} color={pose.winding === 1 ? '#f9d96c' : '#bcd9ff'} scale={FORCE_MAGNIFICATION} width={3.5} />
      </group>;
    })}
  </>;
}

export function FieldVectors({ state, intensity, mode }: { state: PairState; intensity: number; mode: 'none' | 'slip' | 'vorticity' }) {
  if (mode === 'none') return null;
  const vectors: { point: Vec3; value: Vec3 }[] = [];
  for (let x = -2.7; x <= 2.71; x += 0.54) for (let y = -1.45; y <= 1.46; y += 0.58) {
    const point: Vec3 = [x, y, 0.24];
    const sample = samplePairField(point, state, intensity);
    if (sample.inside) continue;
    const value = mode === 'slip' ? sample.slip : sample.omega;
    if (length(value) > 0.08) vectors.push({ point, value });
  }
  return <>
    {vectors.map(({ point, value }, i) => mode === 'slip'
      ? <VectorArrow key={i} at={point} vector={value} color="#96eed0" scale={0.27} width={1.8} opacity={0.8} />
      : <OrientedLoop key={i} point={point} vector={value} />)}
  </>;
}

function OrientedLoop({ point, vector }: { point: Vec3; vector: Vec3 }) {
  const direction = normalize(vector);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(...direction));
  const radius = Math.min(0.16, 0.075 + length(vector) * 0.018);
  const points = Array.from({ length: 17 }, (_, i) => [radius * Math.cos(i * Math.PI * 2 / 16), radius * Math.sin(i * Math.PI * 2 / 16), 0] as Vec3);
  return <group position={point} quaternion={quaternion}>
    <Line points={points} color="#e8a6d8" lineWidth={2.2} transparent opacity={0.8} depthWrite={false} />
    <mesh position={[0, radius, 0]} rotation={[0, 0, Math.PI / 2]}><coneGeometry args={[0.025, 0.06, 6]} /><meshBasicMaterial color="#e8a6d8" /></mesh>
  </group>;
}

export function PressureLegend() {
  return <div className="pressure-legend"><span>STATIC PRESSURE</span><div className="pressure-ramp" /><div className="legend-ends"><span>LOW · VIOLET</span><span>AMBIENT · TEAL</span></div></div>;
}

export function forceAt(state: PairState, id: CavityId, intensity: number) { return integrateBoundary(state[id], state, intensity); }
export function gapPoint(state: PairState, offset: Vec3): Vec3 { return add(mul(add(state.positive.center, state.negative.center), 0.5), offset); }
export function separation(state: PairState) { return length(sub(state.positive.center, state.negative.center)); }
