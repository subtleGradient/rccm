import test from 'node:test';
import assert from 'node:assert/strict';
import { fieldAt, rasterize, sphereLoad, tankDomain } from './fields.mjs';

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

test('raster cells tile the tank without changing its extent or the vacuum state', () => {
  const resolution = { x: 3, y: 2, z: 1 };
  const raster = rasterize([], resolution);
  assert.equal(raster.cells.length, 6);
  assert.equal(raster.texture.length, 24);
  close(raster.extent[0] * resolution.x, tankDomain.size[0]);
  close(raster.extent[1] * resolution.y, tankDomain.size[1]);
  close(raster.extent[2], tankDomain.size[2]);
  for (const sample of raster.cells) { close(sample.q, 1); close(sample.inverseQ, 1); }
});
