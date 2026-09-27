import test from 'node:test';
import assert from 'node:assert/strict';
import { specimen, sampleDefect, summarize } from './resolution.js';

const near = (actual, expected, tolerance = 1e-11) => assert.ok(Math.abs(actual - expected) < tolerance, `${actual} differs from ${expected}`);

test('coarsening preserves the volume ledger for both signed specimens', () => {
  for (const hand of [-1, 1]) {
    const coarse = summarize(sampleDefect(1, hand));
    for (const divisions of [2, 4]) {
      const cells = sampleDefect(divisions, hand);
      const fine = summarize(cells);
      for (const key of ['q', 'invQ', 'bz', 'rms']) near(fine[key], coarse[key]);
      assert.equal(fine.count, 32 ** 3);
      assert.ok(cells.every(c => c.count >= 4 ** 3));
    }
  }
});

test('opposite signed mean cancels while RMS activity and scalar load remain', () => {
  for (const divisions of [1, 2, 4]) {
    const positive = sampleDefect(divisions, 1);
    const negative = sampleDefect(divisions, -1);
    const opposed = summarize([...positive, ...negative]);
    const aligned = summarize([...positive, ...positive]);
    near(opposed.bz, 0);
    assert.ok(aligned.bz > 0.01);
    assert.ok(opposed.rms > 0.1);
    for (const key of ['q', 'invQ', 'rms']) near(opposed[key], aligned[key]);
  }
});

test('unresolved slip cancels but local circulation is present', () => {
  const [coarse] = sampleDefect(1);
  near(Math.hypot(...coarse.e), 0);
  assert.ok(sampleDefect(4).some(cell => Math.hypot(...cell.e) > 0.05));
  assert.ok(coarse.invQ > 1 / coarse.q + 0.02, 'reciprocal weighting must retain the low-capacity pockets');
});

test('capacity stays positive and handedness preserves scalar and squared channels', () => {
  for (const p of [[0, 0, 0], [0.5, 0, 0], [0.2, -0.4, 0.1], [1, 1, 1]]) {
    const a = specimen(p, 1), b = specimen(p, -1);
    assert.ok(a.q > 0 && a.q <= 1);
    near(a.q, b.q);
    for (const key of ['e', 'b']) for (let i = 0; i < 3; i++) near(a[key][i], -b[key][i]);
  }
});

test('the background and both kinetic channels close the capacity ledger', () => {
  for (const p of [[0.5, 0, 0], [0.2, -0.4, 0.1], [1, 1, 1]]) {
    const state = specimen(p);
    const slipLoad = state.e.reduce((total, v) => total + v * v, 0);
    const rotationLoad = state.vRot.reduce((total, v) => total + v * v, 0);
    near(state.q + state.baselineLoad + slipLoad + rotationLoad, 1);
    assert.ok(rotationLoad > 0);
    assert.ok(state.q < 1 - state.baselineLoad, 'kinetic channels spend additional capacity');
  }
});

test('the sampled twist remains a divergence-free curl at generic positions', () => {
  const step = 1e-5;
  for (const p of [[0.5, 0.2, 0.1], [0.2, 0.4, -0.3], [-0.4, 0.25, 0.05]]) {
    const divergence = [0, 1, 2].reduce((total, axis) => {
      const low = [...p], high = [...p];
      low[axis] -= step; high[axis] += step;
      return total + (specimen(high).b[axis] - specimen(low).b[axis]) / (2 * step);
    }, 0);
    near(divergence, 0, 1e-5);
  }
});
