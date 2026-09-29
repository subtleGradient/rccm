import { length, mul, type Vec3 } from './model';

export type Orbital = '1s' | '2s' | '2px' | '2py' | '2pz';
export const ORBITALS: Record<Orbital, { label: string; description: string }> = {
  '1s': { label: '1s · spherical', description: 'A spherical probability cloud with no node. Two electrons may share this spatial region.' },
  '2s': { label: '2s · nested shells', description: 'An inner region and a larger outer region, separated by a spherical probability node at 2a.' },
  '2px': { label: '2pₓ · two lobes', description: 'Two lobes along X, with a probability node in the YZ plane.' },
  '2py': { label: '2pᵧ · two lobes', description: 'Two lobes along Y, with a probability node in the XZ plane.' },
  '2pz': { label: '2p𝓏 · two lobes', description: 'Two lobes along Z, with a probability node in the XY plane.' },
};
export const ORBITAL_SCALE = 1.35;
const axis = (orbital: Orbital) => orbital === '2px' ? 0 : orbital === '2py' ? 1 : 2;

// Normalized hydrogenic |ψ|², Z=1. The scene uses an enlarged length unit a.
// MIT OCW, Fundamentals of Photonics §4.5, Tables 4.1/4.3:
// https://ocw.mit.edu/courses/6-974-fundamentals-of-photonics-quantum-electronics-spring-2006/8a3eb732190cc7fc2520fa122bed8dcd_hydrogen_atom.pdf
export function orbitalDensity(point: Vec3, orbital: Orbital): number {
  const r = length(point) / ORBITAL_SCALE, normalization = Math.PI * ORBITAL_SCALE ** 3;
  if (orbital === '1s') return Math.exp(-2 * r) / normalization;
  const factor = orbital === '2s' ? 2 - r : point[axis(orbital)] / ORBITAL_SCALE;
  return factor * factor * Math.exp(-r) / (32 * normalization);
}

// A regularized log-density gradient supplies an art-directed confinement
// force. Added stirring, core clearance and mutual avoidance alter residence;
// this is NOT a quantum trajectory or a numerical solution of the RCCM PDE.
export function orbitalGradient(point: Vec3, orbital: Orbital): Vec3 {
  const r = Math.max(length(point), 0.001), a = ORBITAL_SCALE;
  if (orbital === '1s') return mul(point, -2 / (a * r));
  const gradient = mul(point, -1 / (a * r));
  if (orbital === '2s') {
    const d = r - 2 * a;
    return mul(point, (-1 / a + 2 * d / (d * d + 0.045)) / r);
  }
  const i = axis(orbital), d = point[i];
  gradient[i] += 2 * d / (d * d + 0.045);
  return gradient;
}

// A proposed visual interpretation of avoided regions, deliberately kept
// separate from both |ψ|² and q. A blue node is a design hypothesis, not data.
export function orbitalNode(point: Vec3, orbital: Orbital): number {
  const r = length(point) / ORBITAL_SCALE;
  if (orbital === '1s') return 0;
  if (orbital === '2s') return Math.exp(-(((r - 2) / 0.28) ** 2));
  const d = point[axis(orbital)] / ORBITAL_SCALE;
  return Math.exp(-((d / 0.5) ** 2)) * Math.min(1, r * r / 4) * Math.exp(-r / 7);
}

const radialCDF = new Map<Orbital, Float64Array>();
function cdfFor(orbital: Orbital) {
  let cdf = radialCDF.get(orbital);
  if (cdf) return cdf;
  cdf = new Float64Array(2049);
  for (let i = 1; i < cdf.length; i++) {
    const r = (i - 0.5) / 2048 * 28;
    const weight = orbital === '1s' ? r * r * Math.exp(-2 * r)
      : orbital === '2s' ? r * r * (2 - r) ** 2 * Math.exp(-r) : r ** 4 * Math.exp(-r);
    cdf[i] = cdf[i - 1] + weight;
  }
  const total = cdf[2048];
  for (let i = 0; i < cdf.length; i++) cdf[i] /= total;
  radialCDF.set(orbital, cdf);
  return cdf;
}

export function sampleOrbital(orbital: Orbital, random = Math.random): Vec3 {
  const cdf = cdfFor(orbital), u = random();
  let lo = 0, hi = 2048;
  while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (cdf[mid] < u) lo = mid; else hi = mid; }
  const fraction = (u - cdf[lo]) / Math.max(1e-12, cdf[hi] - cdf[lo]);
  const radius = (lo + fraction) / 2048 * 28 * ORBITAL_SCALE;
  const cosine = orbital.startsWith('2p') ? Math.cbrt(random() * 2 - 1) : random() * 2 - 1;
  const phi = random() * 2 * Math.PI, s = Math.sqrt(1 - cosine * cosine);
  const p: Vec3 = [radius * s * Math.cos(phi), radius * s * Math.sin(phi), radius * cosine];
  if (orbital === '2px') return [p[2], p[0], p[1]];
  if (orbital === '2py') return [p[1], p[2], p[0]];
  return p;
}
