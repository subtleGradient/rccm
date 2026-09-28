import { createRoot } from 'react-dom/client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { FluidStarfield } from './scene';
import './starfield.css';

createRoot(document.getElementById('root')!).render(
  <Canvas
    aria-label="Tau fluid starfield"
    camera={{ position: [0, 0, 8.5], fov: 52, near: 0.1, far: 80 }}
    dpr={[1, 1.75]}
    gl={{ antialias: true, alpha: false }}
  >
    <color attach="background" args={['#050a10']} />
    <FluidStarfield />
    <OrbitControls enablePan={false} enableDamping minDistance={5} maxDistance={14} />
  </Canvas>,
);
