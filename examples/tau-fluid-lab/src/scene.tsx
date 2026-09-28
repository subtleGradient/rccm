import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { Line, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import {
  CUBE_HALF, DURATION, TORUS_MAJOR, TORUS_MINOR, add, corePoses, length, mul, normalize, parcelSeeds,
  sampleField, traceParcel, traceStreamline, type CoreId, type PairSettings, type Vec3,
} from './model';

export type Study = 'flow' | 'cavities' | 'tensor' | 'playground';
export type Layers = { volume: boolean; paths: boolean; streamlines: boolean; slice: boolean; twist: boolean };

const BACKGROUND = '#050a10';
const ELECTRON = '#8ebfff';
const POSITRON = '#ffd688';

const volumeVertex = `
varying vec3 vOrigin;
varying vec3 vDirection;
void main() {
  vOrigin = (inverse(modelMatrix) * vec4(cameraPosition, 1.0)).xyz;
  vDirection = position - vOrigin;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const volumeFragment = `
precision highp float;
precision highp sampler3D;
uniform sampler3D uData;
uniform float uOpacity;
uniform float uSlice;
uniform float uSliceOffset;
uniform float uSliceAxis;
uniform float uMode;
varying vec3 vOrigin;
varying vec3 vDirection;
vec2 hitCube(vec3 origin, vec3 dir) {
  vec3 nearPlane = (-vec3(2.2) - origin) / dir;
  vec3 farPlane = (vec3(2.2) - origin) / dir;
  vec3 low = min(nearPlane, farPlane);
  vec3 high = max(nearPlane, farPlane);
  return vec2(max(low.x, max(low.y, low.z)), min(high.x, min(high.y, high.z)));
}
void main() {
  vec3 dir = normalize(vDirection);
  vec2 bounds = hitCube(vOrigin, dir);
  float start = max(bounds.x, 0.0);
  if (bounds.y <= start) discard;
  float stepSize = (bounds.y - start) / 54.0;
  vec4 accumulation = vec4(0.0);
  float jitter = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  for (int i = 0; i < 54; i++) {
    vec3 p = vOrigin + dir * (start + (float(i) + jitter) * stepSize);
    vec4 reading = texture(uData, (p + 2.2) / 4.4);
    if (reading.g < 0.5) continue;
    float capacity = reading.r;
    float load = 1.0 - capacity;
    vec3 neutral = vec3(0.22, 0.43, 0.50);
    vec3 blue = vec3(0.39, 0.61, 1.0);
    vec3 gold = vec3(1.0, 0.71, 0.36);
    float colorWeight = min(abs(reading.a * 2.0 - 1.0) * 0.6, 0.55);
    vec3 color = mix(neutral, reading.a > 0.5 ? gold : blue, colorWeight);
    if (uMode > 0.5) color = mix(vec3(0.16, 0.34, 0.46), vec3(1.0, 0.72, 0.38), clamp((load - 0.04) * 2.8, 0.0, 1.0));
    float focus = 1.0;
    if (uSlice > 0.5) {
      float axisValue = uSliceAxis < 0.5 ? p.z : (uSliceAxis < 1.5 ? p.x : p.y);
      focus = mix(0.13, 1.0, 1.0 - smoothstep(0.08, 0.36, abs(axisValue - uSliceOffset)));
    }
    // Amplify modeled variation around the ambient load without changing q.
    float activeLoad = max(0.0, load - 0.055);
    float absorption = (0.09 + 2.4 * activeLoad) * uOpacity * focus;
    float alpha = 1.0 - exp(-absorption * stepSize);
    accumulation.rgb += (1.0 - accumulation.a) * color * alpha;
    accumulation.a += (1.0 - accumulation.a) * alpha;
    if (accumulation.a > 0.86) break;
  }
  gl_FragColor = vec4(accumulation.rgb / max(accumulation.a, 0.00001), accumulation.a);
}`;

function ClockDriver({ timeRef, playingRef, speedRef, report }: {
  timeRef: React.RefObject<number>; playingRef: React.RefObject<boolean>; speedRef: React.RefObject<number>; report: (time: number) => void;
}) {
  const lastReport = useRef(0);
  useFrame((_, delta) => {
    if (playingRef.current) timeRef.current = (timeRef.current + Math.min(delta, 0.05) * speedRef.current) % DURATION;
    if (performance.now() - lastReport.current > 95) {
      report(timeRef.current);
      lastReport.current = performance.now();
    }
  });
  return null;
}

export function CubeBoundary() {
  return <>
    <lineSegments renderOrder={8}>
      <edgesGeometry args={[new THREE.BoxGeometry(CUBE_HALF * 2, CUBE_HALF * 2, CUBE_HALF * 2)]} />
      <lineBasicMaterial color="#91aebf" transparent opacity={0.35} depthWrite={false} />
    </lineSegments>
    <gridHelper args={[8.8, 44, '#264754', '#264754']} position={[0, -CUBE_HALF - 0.12, 0]} />
  </>;
}

function makeVolumeData(settings: PairSettings, time: number, n: number) {
  const data = new Uint8Array(n ** 3 * 4);
  const poses = corePoses(settings, time);
  for (let z = 0; z < n; z++) for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const point: Vec3 = [x, y, z].map(i => -CUBE_HALF + (i + 0.5) * CUBE_HALF * 2 / n) as unknown as Vec3;
    const reading = sampleField(point, time, settings);
    const i = (x + n * (y + n * z)) * 4;
    data[i] = Math.round((reading.inside ? 1 : reading.q) * 255);
    data[i + 1] = reading.inside ? 0 : 255;
    data[i + 2] = reading.inside ? 0 : Math.round(Math.min(1, length(reading.twist)) * 255);
    const d0 = Math.hypot(...point.map((v, axis) => v - poses[0].center[axis]));
    const d1 = Math.hypot(...point.map((v, axis) => v - poses[1].center[axis]));
    data[i + 3] = Math.round(128 + 108 * (Math.exp(-d1 * d1 / 0.8) - Math.exp(-d0 * d0 / 0.8)));
  }
  const texture = new THREE.Data3DTexture(data, n, n, n);
  texture.format = THREE.RGBAFormat;
  texture.type = THREE.UnsignedByteType;
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.unpackAlignment = 1;
  texture.needsUpdate = true;
  return texture;
}

function TauVolume({ settings, time, opacity, layers, sliceAxis, sliceOffset, study, quality }: {
  settings: PairSettings; time: number; opacity: number; layers: Layers; sliceAxis: number; sliceOffset: number; study: Study; quality: 'low' | 'high';
}) {
  const texture = useMemo(() => makeVolumeData(settings, Math.floor(time * 4) / 4, quality === 'high' ? 23 : 16), [settings, Math.floor(time * 4), quality]);
  useEffect(() => () => texture.dispose(), [texture]);
  const uniforms = useMemo(() => ({
    uData: { value: texture }, uOpacity: { value: opacity }, uSlice: { value: 0 },
    uSliceOffset: { value: sliceOffset }, uSliceAxis: { value: sliceAxis }, uMode: { value: study === 'cavities' ? 1 : 0 },
  }), []);
  uniforms.uData.value = texture;
  uniforms.uOpacity.value = opacity;
  uniforms.uSlice.value = layers.slice ? 1 : 0;
  uniforms.uSliceOffset.value = sliceOffset;
  uniforms.uSliceAxis.value = sliceAxis;
  uniforms.uMode.value = study === 'cavities' ? 1 : 0;
  if (!layers.volume) return null;
  return <mesh renderOrder={1}>
    <boxGeometry args={[CUBE_HALF * 2, CUBE_HALF * 2, CUBE_HALF * 2]} />
    <shaderMaterial uniforms={uniforms} vertexShader={volumeVertex} fragmentShader={volumeFragment} side={THREE.BackSide} transparent depthWrite={false} />
  </mesh>;
}

function makeSliceData(settings: PairSettings, time: number, axis: number, offset: number, n: number) {
  const data = new Uint8Array(n * n * 4);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const u = -CUBE_HALF + (x + 0.5) * CUBE_HALF * 2 / n;
    const v = -CUBE_HALF + (y + 0.5) * CUBE_HALF * 2 / n;
    const point: Vec3 = axis === 0 ? [u, v, offset] : axis === 1 ? [offset, v, -u] : [u, offset, v];
    const reading = sampleField(point, time, settings);
    const i = (x + n * y) * 4;
    if (reading.inside) continue;
    const load = 1 - reading.q;
    const contour = Math.abs(load * 22 - Math.round(load * 22)) < 0.065;
    data[i] = contour ? 220 : Math.round(37 + load * 445);
    data[i + 1] = contour ? 235 : Math.round(86 + load * 267);
    data[i + 2] = contour ? 238 : Math.round(117 + load * 91);
    data[i + 3] = contour ? 230 : 170;
  }
  const texture = new THREE.DataTexture(data, n, n, THREE.RGBAFormat);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

function SlicePlane({ settings, time, axis, offset, quality }: { settings: PairSettings; time: number; axis: number; offset: number; quality: 'low' | 'high' }) {
  const texture = useMemo(() => makeSliceData(settings, Math.floor(time * 4) / 4, axis, offset, quality === 'high' ? 96 : 64), [settings, Math.floor(time * 4), axis, offset, quality]);
  useEffect(() => () => texture.dispose(), [texture]);
  const rotation: [number, number, number] = axis === 0 ? [0, 0, 0] : axis === 1 ? [0, Math.PI / 2, 0] : [Math.PI / 2, 0, 0];
  const position: Vec3 = axis === 0 ? [0, 0, offset] : axis === 1 ? [offset, 0, 0] : [0, offset, 0];
  return <mesh position={position} rotation={rotation} renderOrder={3}>
    <planeGeometry args={[CUBE_HALF * 2, CUBE_HALF * 2]} />
    <meshBasicMaterial map={texture} transparent side={THREE.DoubleSide} depthWrite={false} opacity={0.74} />
  </mesh>;
}

function Core({ id, settings, time, selected, onSelect, onPose, setDragging }: {
  id: CoreId; settings: PairSettings; time: number; selected: boolean;
  onSelect: (id: CoreId) => void; onPose: (id: CoreId, offset: Vec3) => void; setDragging: (value: boolean) => void;
}) {
  const { camera } = useThree();
  const pose = corePoses(settings, time).find(p => p.id === id)!;
  const drag = useRef<{ plane: THREE.Plane; delta: THREE.Vector3 } | null>(null);
  const color = id === 'electron' ? ELECTRON : POSITRON;
  const onPointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    (event.target as HTMLElement | null)?.setPointerCapture(event.pointerId);
    onSelect(id);
    setDragging(true);
    const origin = new THREE.Vector3(...pose.center);
    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(camera.getWorldDirection(new THREE.Vector3()), origin);
    const hit = event.ray.intersectPlane(plane, new THREE.Vector3()) ?? origin;
    drag.current = { plane, delta: origin.clone().sub(hit) };
  };
  const onPointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (!drag.current) return;
    event.stopPropagation();
    const hit = event.ray.intersectPlane(drag.current.plane, new THREE.Vector3());
    if (!hit) return;
    const moved = hit.add(drag.current.delta);
    const offset: Vec3 = [moved.x - (pose.center[0] - settings[id].offset[0]), moved.y - (pose.center[1] - settings[id].offset[1]), moved.z - (pose.center[2] - settings[id].offset[2])];
    onPose(id, offset);
  };
  const onPointerUp = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    drag.current = null;
    setDragging(false);
    (event.target as HTMLElement | null)?.releasePointerCapture(event.pointerId);
  };
  return <group position={pose.center} rotation={[pose.tilt, pose.yaw, 0, 'YXZ']}>
    <mesh onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}>
      <torusGeometry args={[TORUS_MAJOR, TORUS_MINOR, 16, 80]} />
      <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={selected ? 0.42 : 0.22} metalness={0.18} roughness={0.23} transparent opacity={0.43} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
    <mesh raycast={() => null} scale={1.013}>
      <torusGeometry args={[TORUS_MAJOR, TORUS_MINOR, 12, 48]} />
      <meshBasicMaterial color={color} transparent opacity={selected ? 0.36 : 0.19} wireframe depthWrite={false} />
    </mesh>
    <mesh raycast={() => null} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.05, 0.065, 48]} />
      <meshBasicMaterial color={color} transparent opacity={selected ? 0.55 : 0.26} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  </group>;
}

function TornadonutPair(props: {
  settings: PairSettings; time: number; selected: CoreId; onSelect: (id: CoreId) => void;
  onPose: (id: CoreId, offset: Vec3) => void; setDragging: (value: boolean) => void;
}) {
  return <>{(['electron', 'positron'] as const).map(id => <Core key={id} settings={props.settings} time={props.time} selected={props.selected === id} onSelect={props.onSelect} onPose={props.onPose} setDragging={props.setDragging} id={id} />)}</>;
}

function PathlineLayer({ settings, time, tagged, quality, dragging }: { settings: PairSettings; time: number; tagged: number; quality: 'low' | 'high'; dragging: boolean }) {
  const cache = useRef<Vec3[][] | null>(null);
  const paths = useMemo(() => {
    if (dragging && cache.current) return cache.current;
    const next = parcelSeeds(settings).filter((_, i) => i % 2 === 0).map(seed => traceParcel(seed, settings));
    cache.current = next;
    return next;
  }, [settings, dragging]);
  const visible = Math.floor(time * 36) + 1;
  return <>
    {paths.map((path, i) => path.length > 1 && (i === tagged || i % (quality === 'high' ? 6 : 12) === 0) && <Line key={i} points={path.slice(0, Math.max(2, Math.min(path.length, visible)))} color={i < paths.length / 2 ? ELECTRON : POSITRON} lineWidth={i === tagged ? 3.5 : 1.4} transparent opacity={i === tagged ? 1 : 0.4} />)}
    {paths[tagged] && <mesh position={paths[tagged][Math.min(paths[tagged].length - 1, Math.max(0, visible - 1))]} renderOrder={7}>
      <sphereGeometry args={[0.045, 10, 10]} />
      <meshBasicMaterial color="#f5fff2" />
    </mesh>}
  </>;
}

export function FluidStarfield({ settings, timeRef, playingRef, quality = 'high', opacity = 1 }: {
  settings?: PairSettings; timeRef?: React.RefObject<number>; playingRef?: React.RefObject<boolean>;
  quality?: 'low' | 'high'; opacity?: number;
}) {
  const count = settings ? (quality === 'high' ? 540 : 280) : (quality === 'high' ? 2400 : 1200);
  const initial = useMemo(() => {
    const data = new Float32Array(count * 3);
    let seed = 829141;
    const random = () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 4294967296; };
    for (let i = 0; i < count; i++) {
      let point: Vec3 = [0, 0, 0];
      for (let attempt = 0; attempt < 12; attempt++) {
        point = settings
          ? [(random() * 2 - 1) * 2.06, (random() * 2 - 1) * 1.55, (random() * 2 - 1) * 1.2]
          : [(random() * 2 - 1) * 3.6, (random() * 2 - 1) * 2.4, (random() * 2 - 1) * 2.8];
        if (!settings || !sampleField(point, 0, settings).inside) break;
      }
      data.set(point, i * 3);
    }
    return data;
  }, [count, settings]);
  const geometry = useMemo(() => {
    const result = new THREE.BufferGeometry();
    result.setAttribute('position', new THREE.BufferAttribute(initial.slice(), 3));
    return result;
  }, [initial]);
  const trails = useMemo(() => {
    if (!settings) return null;
    const result = new THREE.BufferGeometry();
    const segments = new Float32Array(count * 6);
    for (let i = 0; i < count; i++) {
      segments.set(initial.subarray(i * 3, i * 3 + 3), i * 6);
      segments.set(initial.subarray(i * 3, i * 3 + 3), i * 6 + 3);
    }
    result.setAttribute('position', new THREE.BufferAttribute(segments, 3));
    return result;
  }, [initial, count, settings]);
  const trailOrigins = useRef<Float32Array>(initial.slice());
  const frames = useRef(0);
  useEffect(() => { trailOrigins.current = initial.slice(); frames.current = 0; }, [initial]);
  useEffect(() => () => { geometry.dispose(); trails?.dispose(); }, [geometry, trails]);
  useFrame((_, delta) => {
    if (!settings || !timeRef || !playingRef?.current || !trails) return;
    const points = geometry.getAttribute('position') as THREE.BufferAttribute;
    const pointData = points.array as Float32Array;
    const lines = trails.getAttribute('position') as THREE.BufferAttribute;
    const lineData = lines.array as Float32Array;
    const dt = Math.min(delta, 0.033);
    const refresh = ++frames.current % 7 === 0;
    for (let i = 0; i < count; i++) {
      const p: Vec3 = [pointData[i * 3], pointData[i * 3 + 1], pointData[i * 3 + 2]];
      const sample = sampleField(p, timeRef.current, settings);
      if (sample.inside) {
        pointData.set(initial.subarray(i * 3, i * 3 + 3), i * 3);
        trailOrigins.current.set(initial.subarray(i * 3, i * 3 + 3), i * 3);
      } else {
        const next = add(p, mul(sample.velocity, dt));
        if (next.some(axis => Math.abs(axis) >= CUBE_HALF - 0.06) || sampleField(next, timeRef.current, settings).inside) {
          pointData.set(initial.subarray(i * 3, i * 3 + 3), i * 3);
          trailOrigins.current.set(initial.subarray(i * 3, i * 3 + 3), i * 3);
        } else pointData.set(next, i * 3);
      }
      if (refresh) trailOrigins.current.set(pointData.subarray(i * 3, i * 3 + 3), i * 3);
      lineData.set(trailOrigins.current.subarray(i * 3, i * 3 + 3), i * 6);
      lineData.set(pointData.subarray(i * 3, i * 3 + 3), i * 6 + 3);
    }
    points.needsUpdate = true;
    lines.needsUpdate = true;
  });
  return <>
    {trails && <lineSegments geometry={trails} renderOrder={4}><lineBasicMaterial color="#bbf5df" transparent opacity={Math.min(0.7, opacity * 0.38)} depthWrite={false} /></lineSegments>}
    <points geometry={geometry} renderOrder={5}><pointsMaterial color="#e5fff1" size={settings ? 0.037 : 0.034} transparent opacity={settings ? Math.min(0.94, opacity * 0.7) : opacity} depthWrite={false} /></points>
  </>;
}

export function FlowRibbon({ points, color = '#f0fff5', width = 2.8, opacity = 0.86, arrowCount = 2, onTop = false }: {
  points: Vec3[]; color?: string; width?: number; opacity?: number; arrowCount?: number; onTop?: boolean;
}) {
  if (points.length < 3) return null;
  return <>
    <Line points={points} color={color} lineWidth={width} transparent opacity={opacity} depthWrite={false} depthTest={!onTop} renderOrder={onTop ? 8 : 0} />
    {Array.from({ length: arrowCount }, (_, i) => {
      const index = Math.min(points.length - 2, Math.max(1, Math.floor(points.length * (i + 1) / (arrowCount + 1))));
      const a = new THREE.Vector3(...points[index - 1]);
      const b = new THREE.Vector3(...points[index + 1]);
      const direction = b.sub(a).normalize();
      const tip = new THREE.Vector3(...points[index]);
      const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
      return <mesh key={i} position={tip} quaternion={quaternion} renderOrder={8}>
        <coneGeometry args={[0.065, 0.16, 8]} />
        <meshBasicMaterial color={color} depthTest={false} transparent opacity={opacity} />
      </mesh>;
    })}
  </>;
}

function StreamlineLayer({ settings, time, quality }: { settings: PairSettings; time: number; quality: 'low' | 'high' }) {
  const traces = useMemo(() => {
    const gapSeeds: Vec3[] = [];
    for (const y of [-0.75, -0.42, 0, 0.42, 0.75]) for (const z of [-0.38, 0.2]) gapSeeds.push([0, y, z]);
    return [...parcelSeeds(settings).filter((_, i) => i % (quality === 'high' ? 8 : 12) === 1), ...gapSeeds]
      .map(seed => traceStreamline(seed, Math.floor(time * 2) / 2, settings, 140));
  }, [settings, Math.floor(time * 2), quality]);
  return <>{traces.map((points, i) => <FlowRibbon key={i} points={points} color={i >= traces.length - 10 ? '#d9fff0' : '#c3e6fa'} width={i >= traces.length - 10 ? 3 : 2.4} opacity={0.85} />)}</>;
}

function TwistGlyphLayer({ settings, time }: { settings: PairSettings; time: number }) {
  const arrows = useMemo(() => {
    const poses = corePoses(settings, time);
    return poses.flatMap(pose => Array.from({ length: 6 }, (_, i) => {
      const angle = i * Math.PI / 3;
      const point: Vec3 = [pose.center[0] + Math.cos(angle) * 0.82, pose.center[1] + Math.sin(angle) * 0.82, pose.center[2] + 0.13];
      const sample = sampleField(point, time, settings);
      if (sample.inside || length(sample.b) < 0.015) return null;
      return { point, vector: sample.b, id: pose.id };
    }).filter(a => a !== null));
  }, [settings, Math.floor(time * 4)]);
  return <>{arrows.map((arrow, i) => {
    const direction = normalize(arrow.vector);
    const color = arrow.id === 'electron' ? ELECTRON : POSITRON;
    const from = arrow.point;
    const extent = Math.max(0.24, Math.min(0.52, length(arrow.vector) * 2));
    const to = add(from, mul(direction, extent));
    const ringCenter = new THREE.Vector3(...from);
    const ringRotation = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(...direction));
    const tip = add(from, mul(direction, extent + 0.06));
    const tipRotation = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(...direction));
    return <group key={i}>
      <mesh position={ringCenter} quaternion={ringRotation} renderOrder={7}>
        <ringGeometry args={[0.155, 0.175, 32]} />
        <meshBasicMaterial color={color} side={THREE.DoubleSide} transparent opacity={0.85} depthTest={false} />
      </mesh>
      <Line points={[from, to]} color={color} lineWidth={3.5} transparent opacity={0.92} depthTest={false} />
      <mesh position={tip} quaternion={tipRotation} renderOrder={8}>
        <coneGeometry args={[0.067, 0.15, 8]} />
        <meshBasicMaterial color={color} depthTest={false} />
      </mesh>
    </group>;
  })}</>;
}

function ProbeMark({ point, inside }: { point: Vec3; inside: boolean }) {
  return <mesh position={point} renderOrder={9}>
    <sphereGeometry args={[0.065, 12, 12]} />
    <meshBasicMaterial color={inside ? '#ee9a9a' : '#e8fff6'} transparent opacity={0.9} depthTest={false} />
  </mesh>;
}

export function FluidViewport(props: {
  study: Study; settings: PairSettings; time: number; timeRef: React.RefObject<number>; playingRef: React.RefObject<boolean>;
  speedRef: React.RefObject<number>; report: (time: number) => void; layers: Layers; opacity: number;
  sliceAxis: number; sliceOffset: number; probe: Vec3; selected: CoreId; tagged: number; quality: 'low' | 'high';
  onSelect: (id: CoreId) => void; onPose: (id: CoreId, offset: Vec3) => void;
}) {
  const { study, settings, time, timeRef, playingRef, speedRef, report, layers, opacity, sliceAxis, sliceOffset, probe, selected, tagged, quality, onSelect, onPose } = props;
  const [dragging, setDragging] = useState(false);
  const reading = sampleField(probe, time, settings);
  return <Canvas dpr={quality === 'high' ? [1, 1.35] : 1} camera={{ position: [3.5, 2.9, 6.6], fov: 39, near: 0.1, far: 80 }} gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }} onCreated={({ gl }) => { gl.setClearColor(BACKGROUND); }}>
    <ClockDriver timeRef={timeRef} playingRef={playingRef} speedRef={speedRef} report={report} />
    <color attach="background" args={[BACKGROUND]} />
    <ambientLight intensity={0.9} />
    <directionalLight position={[4, 6, 5]} intensity={2.4} color="#b8dcff" />
    <pointLight position={[-2, -1, 2]} intensity={14} color="#86bcff" distance={9} />
    <pointLight position={[2, 0, -2]} intensity={10} color="#ffc582" distance={8} />
    <OrbitControls enabled={!dragging} enablePan={false} enableDamping dampingFactor={0.07} minDistance={4.6} maxDistance={12.5} />
    <CubeBoundary />
    <TauVolume settings={settings} time={time} opacity={opacity} layers={layers} sliceAxis={sliceAxis} sliceOffset={sliceOffset} study={study} quality={quality} />
    {layers.volume && <FluidStarfield settings={settings} timeRef={timeRef} playingRef={playingRef} quality={quality} opacity={opacity} />}
    {layers.slice && <SlicePlane settings={settings} time={time} axis={sliceAxis} offset={sliceOffset} quality={quality} />}
    {layers.paths && <PathlineLayer settings={settings} time={time} tagged={tagged} quality={quality} dragging={dragging} />}
    {layers.streamlines && <StreamlineLayer settings={settings} time={time} quality={quality} />}
    {layers.twist && <TwistGlyphLayer settings={settings} time={time} />}
    <TornadonutPair settings={settings} time={time} selected={selected} onSelect={onSelect} onPose={onPose} setDragging={setDragging} />
    <ProbeMark point={probe} inside={reading.inside} />
  </Canvas>;
}
