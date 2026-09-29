import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { add, mul, sub, type Vec3 } from './model';
import { ATOM, cavityAt, sampleAtomField, slipAppearance, type AtomBody } from './atom-field';
import { cavitySurface } from './atom-geometry';
import type { AtomSimulation } from './atom-simulation';
import type { SimulationRef } from './atom-visuals';

const gray = new THREE.Color('#92959f'), blue = new THREE.Color('#327bff'), yellow = new THREE.Color('#ffd347');
function fluidColor(point: Vec3, sim: AtomSimulation, result: THREE.Color) {
  const balance = slipAppearance(point, sim.bodies, sim.intensity, sim.interpretation).balance;
  return result.copy(gray).lerp(balance < 0 ? blue : yellow, Math.min(1, Math.abs(balance) ** 0.65));
}
function makeGeometry(count: number) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  geometry.setDrawRange(0, 0);
  return geometry;
}
function FluidMarks({ points, trails, size, opacity }: { points: THREE.BufferGeometry; trails: THREE.BufferGeometry; size: number; opacity: number }) {
  const material = useMemo(() => new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, vertexColors: true,
    uniforms: { opacity: { value: opacity }, size: { value: size } },
    vertexShader: `uniform float size; varying vec3 tint;
      void main() { tint = color; vec4 p = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * p; gl_PointSize = clamp(size * 780.0 / -p.z, 1.1, 6.0); }`,
    fragmentShader: `uniform float opacity; varying vec3 tint;
      void main() { float r = length(gl_PointCoord - 0.5); if(r > 0.5) discard;
        gl_FragColor = vec4(tint, opacity * (1.0 - smoothstep(0.12, 0.5, r)));
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  }), []);
  material.uniforms.opacity.value = opacity; material.uniforms.size.value = size;
  useEffect(() => () => material.dispose(), [material]);
  return <>
    <lineSegments geometry={trails} frustumCulled={false} renderOrder={2}><lineBasicMaterial vertexColors transparent opacity={opacity * 0.34} depthWrite={false} /></lineSegments>
    <points geometry={points} material={material} frustumCulled={false} renderOrder={3} />
  </>;
}

export function FluidVolume({ simulation, count = 10000, opacity = 0.45 }: { simulation: SimulationRef; count?: number; opacity?: number }) {
  const points = useMemo(() => makeGeometry(count), [count]), trails = useMemo(() => makeGeometry(count * 2), [count]);
  const state = useRef<{ sim: AtomSimulation | null; time: number; points: Vec3[] }>({ sim: null, time: 0, points: [] });
  const color = useMemo(() => new THREE.Color(), []);
  useEffect(() => () => { points.dispose(); trails.dispose(); }, [points, trails]);
  useFrame(() => {
    const sim = simulation.current, origin = sim.bodies[0].pose.center, extent = ATOM.halfSize;
    if (state.current.sim !== sim || state.current.points.length !== count) {
      const side = Math.ceil(Math.cbrt(count));
      state.current = { sim, time: sim.time, points: Array.from({ length: count }, (_, i) => {
        // Stratified throughout the entire volume, with no empty outer shell.
        const p: Vec3 = [(i % side + Math.random()) / side, (Math.floor(i / side) % side + Math.random()) / side, (Math.floor(i / (side * side)) + Math.random()) / Math.ceil(count / (side * side))];
        return add(origin, p.map(v => (v * 2 - 1) * extent) as Vec3);
      }) };
    }
    const dt = Math.min(0.08, Math.max(0, sim.time - state.current.time)); state.current.time = sim.time;
    const positions = points.getAttribute('position') as THREE.BufferAttribute, colors = points.getAttribute('color') as THREE.BufferAttribute;
    const linePositions = trails.getAttribute('position') as THREE.BufferAttribute, lineColors = trails.getAttribute('color') as THREE.BufferAttribute;
    let shown = 0;
    for (let i = 0; i < count; i++) {
      let point = state.current.points[i];
      const field = sampleAtomField(point, sim.bodies, sim.intensity);
      let velocity = field.velocity;
      // A small ambient drift keeps neutral fluid legible as a medium.
      velocity = add(velocity, [0.024 * Math.sin(point[1] * 0.35 + sim.time * 0.1), 0.018 * Math.cos(point[2] * 0.3), 0.022 * Math.sin(point[0] * 0.3)]);
      point = add(point, mul(velocity, dt));
      if (field.inside || cavityAt(point, sim.bodies)) {
        point = add(origin, [Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1].map(v => v * extent) as Vec3);
      }
      // Tracer replenishment at the viewing boundary is not a fluid wall.
      const local = sub(point, origin);
      for (let axis = 0; axis < 3; axis++) local[axis] = ((local[axis] + extent) % (2 * extent) + 2 * extent) % (2 * extent) - extent;
      point = state.current.points[i] = add(origin, local);
      if (cavityAt(point, sim.bodies)) continue;
      fluidColor(point, sim, color);
      positions.setXYZ(shown, ...local); colors.setXYZ(shown, color.r, color.g, color.b);
      const tail = sub(local, mul(velocity, 0.35));
      linePositions.setXYZ(shown * 2, ...tail); linePositions.setXYZ(shown * 2 + 1, ...local);
      lineColors.setXYZ(shown * 2, color.r, color.g, color.b); lineColors.setXYZ(shown * 2 + 1, color.r, color.g, color.b);
      shown++;
    }
    points.setDrawRange(0, shown); trails.setDrawRange(0, shown * 2);
    positions.needsUpdate = colors.needsUpdate = linePositions.needsUpdate = lineColors.needsUpdate = true;
  });
  return <FluidMarks points={points} trails={trails} size={0.052} opacity={opacity} />;
}

export function CavityFlow({ simulation, body }: { simulation: SimulationRef; body: AtomBody }) {
  const count = body.kind === 'proton' ? 1100 : 440;
  const points = useMemo(() => makeGeometry(count), [count]), trails = useMemo(() => makeGeometry(count * 2), [count]);
  const seeds = useMemo(() => Array.from({ length: count }, (_, i) => ({ u: i / count * Math.PI * 2, v: Math.random() * Math.PI * 2, padding: 0.022 + Math.random() ** 2 * 0.14 })), [count]);
  const color = useMemo(() => new THREE.Color(), []);
  useEffect(() => () => { points.dispose(); trails.dispose(); }, [points, trails]);
  useFrame(() => {
    const sim = simulation.current, live = sim.bodies.find(item => item.id === body.id);
    if (!live) return;
    const origin = sim.bodies[0].pose.center, t = sim.time * sim.intensity;
    const positions = points.getAttribute('position') as THREE.BufferAttribute, colors = points.getAttribute('color') as THREE.BufferAttribute;
    const linePositions = trails.getAttribute('position') as THREE.BufferAttribute, lineColors = trails.getAttribute('color') as THREE.BufferAttribute;
    let shown = 0;
    for (const seed of seeds) {
      const u = seed.u + t * 0.38, v = seed.v + t * 1.8 * live.pose.winding;
      const point = cavitySurface(live, u, v, seed.padding).point;
      const tail = cavitySurface(live, u - 0.035, v - 0.2 * live.pose.winding, seed.padding).point;
      // Marks wrap outside the void. Their motion reveals its knot/ring.
      if (sim.bodies.some(other => other.id !== live.id && cavityAt(point, [other]))) continue;
      fluidColor(point, sim, color);
      positions.setXYZ(shown, ...sub(point, origin)); colors.setXYZ(shown, color.r, color.g, color.b);
      linePositions.setXYZ(shown * 2, ...sub(tail, origin)); linePositions.setXYZ(shown * 2 + 1, ...sub(point, origin));
      lineColors.setXYZ(shown * 2, color.r, color.g, color.b); lineColors.setXYZ(shown * 2 + 1, color.r, color.g, color.b);
      shown++;
    }
    points.setDrawRange(0, shown); trails.setDrawRange(0, shown * 2);
    positions.needsUpdate = colors.needsUpdate = linePositions.needsUpdate = lineColors.needsUpdate = true;
  });
  return <FluidMarks points={points} trails={trails} size={0.06} opacity={0.9} />;
}
