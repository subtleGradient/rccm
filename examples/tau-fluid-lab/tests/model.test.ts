import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, admissible, corePoses, parcelSeeds, sampleField, tensor, torusDistance, traceParcel, type Vec3 } from '../src/model';

describe('shared authored field', () => {
  it('assembles all 16 matrix entries from the seven readings with the GfX signs', () => {
    const U = tensor(0.8, [0.1, 0.2, 0.3], [0.4, 0.5, 0.6]);
    expect(U).toEqual([[-0.8, -0.1, -0.2, -0.3], [0.1, 1.25, -0.6, 0.5], [0.2, 0.6, 1.25, -0.4], [0.3, -0.5, 0.4, 1.25]]);
  });

  it('keeps the pressure budget finite around both moving cavities', () => {
    for (const time of [0, 4, 9, 18]) for (let x = -2; x <= 2; x += 0.4) for (let y = -2; y <= 2; y += 0.4) {
      const s = sampleField([x, y, 0.28], time, DEFAULT_SETTINGS);
      if (s.inside) continue;
      expect(s.q).toBeGreaterThan(0);
      expect(s.q + s.macro + s.dynamic + s.shear).toBeCloseTo(1, 10);
    }
  });

  it('does not assign a fluid tensor inside a cavity', () => {
    const pose = corePoses(DEFAULT_SETTINGS, 0)[0];
    const point: Vec3 = [pose.center[0] + 0.49, pose.center[1], pose.center[2]];
    expect(torusDistance(point, pose)).toBeLessThan(0);
    expect(sampleField(point, 0, DEFAULT_SETTINGS)).toEqual({ inside: true, core: 'electron' });
  });

  it('replays the same material path and keeps it in the displayed medium', () => {
    const seed = parcelSeeds(DEFAULT_SETTINGS)[0];
    const a = traceParcel(seed, DEFAULT_SETTINGS, 3);
    expect(a).toEqual(traceParcel(seed, DEFAULT_SETTINGS, 3));
    expect(a.length).toBeGreaterThan(8);
    a.forEach((p, i) => expect(sampleField(p, i / 36, DEFAULT_SETTINGS).inside).toBe(false));
  });

  it('rejects overlapping or out-of-window pairs', () => {
    expect(admissible(DEFAULT_SETTINGS)).toBe(true);
    expect(admissible({ ...DEFAULT_SETTINGS, positron: { ...DEFAULT_SETTINGS.positron, offset: [-0.8, 0, 0] } })).toBe(false);
    expect(admissible({ ...DEFAULT_SETTINGS, electron: { ...DEFAULT_SETTINGS.electron, offset: [-2, 0, 0] } })).toBe(false);
  });
});
