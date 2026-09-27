import test from 'node:test';
import assert from 'node:assert/strict';
import { fieldAt, rasterize, sphereLoad, domainFor, samplingFor } from './fields.mjs';

const sphere = { center: [0, 0, 0], radius: 2, gravityRadius: .16, enabled: true };
const close = (actual, expected, tolerance = 1e-10) => assert.ok(Math.abs(actual - expected) < tolerance, `${actual} ≠ ${expected}`);

test('the spherical source joins its interior to the exterior 1/r field', () => {
  close(sphereLoad([0, 0, 0], sphere), .12);
  close(sphereLoad([2, 0, 0], sphere), .08);
  close(sphereLoad([4, 0, 0], sphere), .04);
  close(sphereLoad([2 - 1e-6, 0, 0], sphere), sphereLoad([2 + 1e-6, 0, 0], sphere), 1e-7);
});

test('scalar loads combine before tensor assembly and disabled sources vanish', () => {
  const one = fieldAt([0, 0, 0], [sphere]);
  const two = fieldAt([0, 0, 0], [sphere, sphere]);
  close(one.q, .88);
  close(two.q, .76);
  close(two.matrix[1][1], 1 / .76);
  assert.deepEqual(fieldAt([0, 0, 0], [{ ...sphere, enabled: false }]).matrix, [[-1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]);
  assert.throws(() => fieldAt([0, 0, 0], [{ ...sphere, gravityRadius: 2 }]), RangeError);
});

test('a source outside the tank still contributes and moving it changes fixed samples', () => {
  const point = [5, 0, 0];
  const outside = { ...sphere, center: [9, 0, 0] };
  const farther = { ...sphere, center: [19, 0, 0] };
  assert.ok(fieldAt(point, [outside]).q < 1);
  assert.ok(fieldAt(point, [outside]).q < fieldAt(point, [farther]).q);
  close(fieldAt(point, [outside]).q, fieldAt([0, 0, 0], [{ ...outside, center: [4, 0, 0] }]).q);
});

test('voxels average the tensor, preserving mean reciprocal independently of mean q', () => {
  const raster = rasterize([sphere], { x: 1, y: 1, z: 1 });
  const sample = raster.cells[0];
  assert.ok(sample.inverseQ > 1 / sample.q);
  close(sample.matrix[0][0], -sample.q);
  close(sample.matrix[1][1], sample.inverseQ);
  close(raster.texture[0], sample.q, 1e-6);
  close(raster.texture[1], sample.inverseQ, 1e-6);
});

test('raster cells tile the tank without gaps or changing the vacuum state', () => {
  const resolution = { x: 3, y: 2, z: 1 };
  const raster = rasterize([], resolution);
  const tankDomain = raster.domain;
  assert.equal(raster.cells.length, 6);
  assert.equal(raster.texture.length, 24);
  close(raster.extent[0] * resolution.x, tankDomain.size[0]);
  close(raster.extent[1] * resolution.y, tankDomain.size[1]);
  close(raster.extent[2], tankDomain.size[2]);
  for (const sample of raster.cells) { close(sample.q, 1); close(sample.inverseQ, 1); }
});

test('every XYZ count produces equal cube edges, including one-deep tanks', () => {
  for (const resolution of [{ x: 12, y: 8, z: 1 }, { x: 3, y: 5, z: 4 }, { x: 1, y: 1, z: 1 }]) {
    const domain = domainFor(resolution);
    const edges = domain.size.map((value, axis) => value / [resolution.x, resolution.y, resolution.z][axis]);
    close(edges[0], edges[1]);
    close(edges[1], edges[2]);
    domain.min.forEach((value, axis) => close(value + domain.size[axis] / 2, 0));
    const raster = rasterize([], resolution);
    assert.deepEqual(raster.extent, [1, 1, 1]);
  }
});

test('front/behind positions have symmetric scalar influence and mass/radius edits change state', () => {
  const front = { ...sphere, center: [0, 0, 4] };
  const behind = { ...sphere, center: [0, 0, -4] };
  close(fieldAt([0, 0, 0], [front]).q, fieldAt([0, 0, 0], [behind]).q);
  assert.ok(fieldAt([0, 0, 0], [sphere]).q < fieldAt([0, 0, 0], [front]).q);
  assert.ok(fieldAt([0, 0, 0], [{ ...sphere, gravityRadius: .24 }]).q < fieldAt([0, 0, 0], [sphere]).q);
  assert.ok(fieldAt([0, 0, 0], [{ ...sphere, radius: 3 }]).q > fieldAt([0, 0, 0], [sphere]).q);
  close(fieldAt([5, 0, 0], [{ ...sphere, radius: 3 }]).q, fieldAt([5, 0, 0], [sphere]).q);
});

test('coarse-to-fine presets keep the full tank fixed and slice depth exactly one cube', () => {
  for (let detail = 0; detail <= 3; detail++) {
    const full = samplingFor(detail, 'full'), slice = samplingFor(detail, 'slice');
    assert.deepEqual(domainFor(full).size, [12, 8, 4]);
    assert.deepEqual(domainFor(slice).size, [12, 8, slice.cellSize]);
    close(full.cellSize, slice.cellSize);
    assert.equal(slice.z, 1);
    const raster = rasterize([], slice);
    assert.deepEqual(raster.extent, [slice.cellSize, slice.cellSize, slice.cellSize]);
    assert.ok(raster.cells.every((cell) => cell.q === 1 && cell.inverseQ === 1));
  }
});
