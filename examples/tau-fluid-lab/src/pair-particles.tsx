import { useEffect, useLayoutEffect, useMemo } from 'react';
import * as THREE from 'three';
import { add, length, mul, rotate, type Vec3 } from './model';
import { PAIR_FIELD, pairStateAt, samplePairField, type CavityId, type PairHistory } from './pair-field';

type SeedGroup = 'medium' | CavityId;
const BOX: Vec3 = [3.65, 2.45, 2.55];
const createRandom = (start: number) => {
  let state = start;
  return () => { state = (1664525 * state + 1013904223) >>> 0; return state / 4294967296; };
};

function makeSeeds(group: SeedGroup, history: PairHistory, count: number): Vec3[] {
  const random = createRandom(group === 'positive' ? 38127 : group === 'negative' ? 60143 : 12883);
  const start = history.frames[0];
  const seeds: Vec3[] = [];
  for (let i = 0; i < count; i++) {
    if (group === 'medium') {
      let seed: Vec3 = [0, 0, 0];
      for (let attempt = 0; attempt < 20; attempt++) {
        seed = [(random() * 2 - 1) * BOX[0], (random() * 2 - 1) * BOX[1], (random() * 2 - 1) * BOX[2]];
        if (!samplePairField(seed, start, 1).inside) break;
      }
      seeds.push(seed);
      continue;
    }
    const pose = start[group];
    const u = random() * Math.PI * 2;
    const v = random() * Math.PI * 2;
    const tube = PAIR_FIELD.tubeRadius + 0.04 + Math.pow(random(), 1.55) * 0.43;
    const ring = PAIR_FIELD.majorRadius + tube * Math.cos(v);
    seeds.push(add(pose.center, rotate([ring * Math.cos(u), ring * Math.sin(u), tube * Math.sin(v)], pose.yaw, pose.tilt)));
  }
  return seeds;
}

type ParticleHistory = { frames: Float32Array[]; count: number };

function traceParticles(history: PairHistory, intensity: number, group: SeedGroup, count: number): ParticleHistory {
  const seeds = makeSeeds(group, history, count);
  const frames: Float32Array[] = [];
  const first = new Float32Array(count * 3);
  seeds.forEach((seed, i) => first.set(seed, i * 3));
  frames.push(first);
  for (let frame = 1; frame < history.frames.length; frame++) {
    const previous = frames[frame - 1];
    const next = new Float32Array(count * 3);
    const state = history.frames[frame - 1];
    const future = history.frames[frame];
    const midState = pairStateAt({ ...history, frames: [state, future] }, history.frameStep / 2);
    for (let i = 0; i < count; i++) {
      const p: Vec3 = [previous[i * 3], previous[i * 3 + 1], previous[i * 3 + 2]];
      if (!Number.isFinite(p[0])) { next.set([NaN, NaN, NaN], i * 3); continue; }
      const field = samplePairField(p, state, intensity);
      if (field.inside) { next.set([NaN, NaN, NaN], i * 3); continue; }
      const midpoint = add(p, mul(field.velocity, history.frameStep / 2));
      const middle = samplePairField(midpoint, midState, intensity);
      const destination = add(p, mul(middle.velocity, history.frameStep));
      if (destination.some((axis, index) => Math.abs(axis) > BOX[index]) || samplePairField(destination, future, intensity).inside) {
        next.set([NaN, NaN, NaN], i * 3);
      } else next.set(destination, i * 3);
    }
    frames.push(next);
  }
  return { frames, count };
}

function particleAt(history: ParticleHistory, index: number, frame: number): Vec3 | null {
  const clamped = Math.max(0, Math.min(frame, history.frames.length - 1));
  const i = Math.floor(clamped), a = history.frames[i], b = history.frames[Math.min(i + 1, history.frames.length - 1)];
  const k = clamped - i, base = index * 3;
  if (!Number.isFinite(a[base]) || !Number.isFinite(b[base])) return null;
  return [a[base] + (b[base] - a[base]) * k, a[base + 1] + (b[base + 1] - a[base + 1]) * k, a[base + 2] + (b[base + 2] - a[base + 2]) * k];
}

export function ParticleFlow({ history, intensity, time, group, count, color, visible }: {
  history: PairHistory; intensity: number; time: number; group: SeedGroup; count: number; color: string; visible: boolean;
}) {
  const paths = useMemo(() => traceParticles(history, intensity, group, count), [history, intensity, group, count]);
  const pointGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    return geometry;
  }, [count]);
  const trailGeometries = useMemo(() => [0, 1, 2, 3].map(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 6), 3));
    return geometry;
  }), [count]);
  useEffect(() => () => { pointGeometry.dispose(); trailGeometries.forEach(geometry => geometry.dispose()); }, [pointGeometry, trailGeometries]);
  useLayoutEffect(() => {
    if (!visible) return;
    const frame = Math.min(time / history.frameStep, paths.frames.length - 1);
    const points = pointGeometry.getAttribute('position') as THREE.BufferAttribute;
    const data = points.array as Float32Array;
    let shown = 0;
    for (let i = 0; i < count; i++) {
      const p = particleAt(paths, i, frame);
      if (!p) continue;
      data.set(p, shown++ * 3);
    }
    pointGeometry.setDrawRange(0, shown);
    points.needsUpdate = true;
    [2, 5, 9, 14].forEach((lag, layer) => {
      const geometry = trailGeometries[layer];
      const attribute = geometry.getAttribute('position') as THREE.BufferAttribute;
      const lineData = attribute.array as Float32Array;
      let segment = 0;
      for (let i = 0; i < count; i++) {
        const head = particleAt(paths, i, frame);
        const tail = particleAt(paths, i, Math.max(0, frame - lag));
        if (!head || !tail || length([head[0] - tail[0], head[1] - tail[1], head[2] - tail[2]]) < 0.014) continue;
        lineData.set(tail, segment * 6);
        lineData.set(head, segment * 6 + 3);
        segment++;
      }
      geometry.setDrawRange(0, segment * 2);
      attribute.needsUpdate = true;
    });
  }, [history, paths, time, count, visible, pointGeometry, trailGeometries]);
  if (!visible) return null;
  return <>
    {trailGeometries.map((geometry, index) => <lineSegments key={index} geometry={geometry} renderOrder={2}>
      <lineBasicMaterial color={color} transparent opacity={[0.55, 0.25, 0.11, 0.045][index]} depthWrite={false} />
    </lineSegments>)}
    <points geometry={pointGeometry} renderOrder={3}><pointsMaterial color={color} size={group === 'medium' ? 0.044 : 0.056} transparent opacity={0.94} depthWrite={false} /></points>
  </>;
}
