import { assemble } from '../voxel-tank/math.mjs';

export function samplingFor(detail, depth) {
  const factor = [1, 2, 4, 8][detail];
  if (!factor || !['slice', 'full'].includes(depth)) throw new RangeError('Unknown sampling preset.');
  return { x: 3 * factor, y: 2 * factor, z: depth === 'full' ? factor : 1, cellSize: 4 / factor };
}

export function domainFor(resolution) {
  const counts = [resolution.x, resolution.y, resolution.z];
  const cellSize = resolution.cellSize ?? 1;
  if (!counts.every((value) => Number.isInteger(value) && value > 0) || !(cellSize > 0 && Number.isFinite(cellSize))) throw new RangeError('Positive integer counts and cube size required.');
  const size = counts.map((value) => value * cellSize);
  return { min: size.map((value) => -value / 2), size };
}

// Uniform spherical mass in the macroscopic Poisson limit, Phi(infinity)=0.
// gravityRadius=2GM/c² in scene length units. This is a frozen editor field.
export function sphereLoad(point, element) {
  const dx = point[0] - element.center[0], dy = point[1] - element.center[1], dz = point[2] - element.center[2];
  const r = Math.sqrt(dx * dx + dy * dy + dz * dz);
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
  const tankDomain = domainFor(resolution);
  const extent = tankDomain.size.map((value, axis) => value / dimensions[axis]);
  const cells = [];
  const texture = new Float32Array(dimensions.reduce((a, b) => a * b, 1) * 4);
  const enabled = elements.filter((element) => element.enabled);
  const point = [0, 0, 0];
  for (let z = 0; z < resolution.z; z++) for (let y = 0; y < resolution.y; y++) for (let x = 0; x < resolution.x; x++) {
    let q = 0, inverseQ = 0;
    for (let k = 0; k < 4; k++) for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) {
      point[0] = tankDomain.min[0] + (x + (i + .5) / 4) * extent[0];
      point[1] = tankDomain.min[1] + (y + (j + .5) / 4) * extent[1];
      point[2] = tankDomain.min[2] + (z + (k + .5) / 4) * extent[2];
      let capacity = 1;
      for (const element of enabled) capacity -= sphereLoad(point, element);
      if (!(capacity > 0 && capacity <= 1)) throw new RangeError('Capacity must remain in (0, 1].');
      q += capacity / 64;
      inverseQ += 1 / capacity / 64;
    }
    const matrix = [[-q, 0, 0, 0], [0, inverseQ, 0, 0], [0, 0, inverseQ, 0], [0, 0, 0, inverseQ]];
    const index = cells.length;
    cells.push({ q, inverseQ, matrix, e: [0, 0, 0], b: [0, 0, 0] });
    texture.set([q, inverseQ, 0, 0], index * 4);
  }
  return { cells, texture, extent, domain: tankDomain, resolution: { ...resolution } };
}
