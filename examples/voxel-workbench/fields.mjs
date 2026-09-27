import { assemble } from '../voxel-tank/math.mjs';

export const tankDomain = { min: [-6, -3.38, -2], size: [12, 6.4, 4] };

// Uniform spherical mass in the macroscopic Poisson limit, Phi(infinity)=0.
// gravityRadius=2GM/c² in scene length units. This is a frozen editor field.
export function sphereLoad(point, element) {
  const r = Math.hypot(...point.map((value, axis) => value - element.center[axis]));
  const R = element.radius;
  return r >= R ? element.gravityRadius / r : element.gravityRadius / (2 * R) * (3 - (r / R) ** 2);
}

export function fieldAt(point, elements) {
  const load = elements.reduce((sum, element) => sum + (element.enabled ? sphereLoad(point, element) : 0), 0);
  const q = 1 - load;
  const e = [0, 0, 0], b = [0, 0, 0];
  const matrix = assemble({ q, e, b }).map((row) => row.map((value) => value === 0 ? 0 : value));
  return { q, inverseQ: 1 / q, e, b, matrix };
}

export function voxelIndex(address, resolution) {
  return address.x + resolution.x * (address.y + resolution.y * address.z);
}

// 4×4×4 midpoint volume quadrature. Average U itself: mean(1/q) is independent
// of 1/mean(q). Both the inspector and GPU texture consume this same raster.
export function rasterize(elements, resolution) {
  const dimensions = [resolution.x, resolution.y, resolution.z];
  if (!dimensions.every((value) => Number.isInteger(value) && value > 0)) throw new RangeError('Positive integer resolution required.');
  const extent = tankDomain.size.map((value, axis) => value / dimensions[axis]);
  const cells = [];
  const texture = new Float32Array(dimensions.reduce((a, b) => a * b, 1) * 4);
  for (let z = 0; z < resolution.z; z++) for (let y = 0; y < resolution.y; y++) for (let x = 0; x < resolution.x; x++) {
    const address = [x, y, z];
    let q = 0, inverseQ = 0;
    for (let k = 0; k < 4; k++) for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) {
      const offsets = [i, j, k];
      const point = extent.map((width, axis) => tankDomain.min[axis] + (address[axis] + (offsets[axis] + .5) / 4) * width);
      const state = fieldAt(point, elements);
      q += state.q / 64;
      inverseQ += state.inverseQ / 64;
    }
    const matrix = [[-q, 0, 0, 0], [0, inverseQ, 0, 0], [0, 0, inverseQ, 0], [0, 0, 0, inverseQ]];
    const index = cells.length;
    cells.push({ q, inverseQ, matrix, e: [0, 0, 0], b: [0, 0, 0] });
    texture.set([q, inverseQ, 0, 0], index * 4);
  }
  return { cells, texture, extent, resolution: { ...resolution } };
}
