import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, TORUS_MAJOR, TORUS_MINOR, add, admissible, corePoses, dot, normalize, parcelSeeds, rotate, sampleField, sub, tensor, torusDistance, traceParcel, type Vec3 } from '../src/model';

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

  it('moves fluid tangentially to each moving cavity surface', () => {
    for (const pose of corePoses(DEFAULT_SETTINGS, 3)) for (const angle of [0, 0.6, 1.9, 3.2]) {
      const local: Vec3 = [(TORUS_MAJOR + TORUS_MINOR + 1e-6) * Math.cos(angle), (TORUS_MAJOR + TORUS_MINOR + 1e-6) * Math.sin(angle), 0];
      const point = add(rotate(local, pose.yaw, pose.tilt), pose.center);
      const reading = sampleField(point, 3, DEFAULT_SETTINGS);
      expect(reading.inside).toBe(false);
      if (reading.inside) continue;
      const normal = normalize(rotate([Math.cos(angle), Math.sin(angle), 0], pose.yaw, pose.tilt));
      expect(Math.abs(dot(sub(reading.velocity, pose.velocity), normal))).toBeLessThan(1e-4);
    }
  });

  it('rejects overlapping or out-of-window pairs', () => {
    expect(admissible(DEFAULT_SETTINGS)).toBe(true);
    expect(admissible({ ...DEFAULT_SETTINGS, positron: { ...DEFAULT_SETTINGS.positron, offset: [-0.8, 0, 0] } })).toBe(false);
    expect(admissible({ ...DEFAULT_SETTINGS, electron: { ...DEFAULT_SETTINGS.electron, offset: [-2, 0, 0] } })).toBe(false);
  });

  it('keeps the authored budget valid at the strongest supported controls', () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      electron: { ...DEFAULT_SETTINGS.electron, offset: [-0.79, 0, 0] as Vec3, circulation: 1.2 },
      positron: { ...DEFAULT_SETTINGS.positron, offset: [0.79, 0, 0] as Vec3, circulation: -1.2 },
      intensity: 1.4,
      travel: 1.2,
    };
    expect(admissible(settings)).toBe(true);
    for (const time of [0, 4, 9, 15]) for (let x = -1.8; x <= 1.8; x += 0.12) for (let y = -1.1; y <= 1.1; y += 0.16) {
      const reading = sampleField([x, y, 0.16], time, settings);
      if (!reading.inside) expect(reading.q).toBeGreaterThan(0);
    }
  });
});
