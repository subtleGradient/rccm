import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { add, type Vec3 } from './model';
import { ATOM, cavityAt } from './atom-field';
import { sampleOrbital, type Orbital } from './atom-orbitals';
import type { SimulationRef } from './atom-visuals';

export function OrbitalReference({ simulation, orbitals, opacity }: { simulation: SimulationRef; orbitals: Orbital[]; opacity: number }) {
  const key = [...new Set(orbitals)].sort().join(',');
  const cloud = useMemo(() => {
    let seed = 73419;
    const random = () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 4294967296; };
    const samples: Vec3[] = [];
    for (const orbital of key.split(',').filter(Boolean) as Orbital[]) {
      for (let i = 0; i < 6500; i++) {
        const p = sampleOrbital(orbital, random);
        if (p.every(v => Math.abs(v) < ATOM.halfSize)) samples.push(p);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(samples.length * 3), 3));
    geometry.setDrawRange(0, 0);
    return { samples, geometry };
  }, [key]);
  useEffect(() => () => cloud.geometry.dispose(), [cloud]);
  const elapsed = useRef(1), lastCloud = useRef<typeof cloud | null>(null);
  useFrame((_, delta) => {
    elapsed.current += delta;
    if (elapsed.current < 0.1 && lastCloud.current === cloud) return;
    elapsed.current = 0; lastCloud.current = cloud;
    const sim = simulation.current, origin = sim.bodies[0].pose.center;
    const positions = cloud.geometry.getAttribute('position') as THREE.BufferAttribute;
    let shown = 0;
    for (const point of cloud.samples) {
      // Display masks preserve readable voids in the deliberately enlarged
      // geometry; they do not change the analytic reference density itself.
      if (!cavityAt(add(origin, point), sim.bodies)) positions.setXYZ(shown++, ...point);
    }
    cloud.geometry.setDrawRange(0, shown); positions.needsUpdate = true;
  });
  return <points geometry={cloud.geometry} renderOrder={0} frustumCulled={false}><pointsMaterial color="#cbb9e6" size={0.034} transparent opacity={opacity} depthWrite={false} /></points>;
}
