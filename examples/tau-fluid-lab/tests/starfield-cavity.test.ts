import { describe, expect, it } from 'vitest';
import { CAVITY, advanceSceneTime, cavityCenter, cavityDistance, cavityProjection, entrainedProjection, makeCavityShellSeeds } from '../src/starfield-cavity';

describe('single-cavity visual study', () => {
  it('wraps playback to the start and retains the elapsed fraction', () => {
    expect(advanceSceneTime(CAVITY.duration - 0.1, 0.25)).toBeCloseTo(0.15);
    expect(advanceSceneTime(CAVITY.duration, 0.25)).toBeCloseTo(0.25);
  });

  it('leaves the toroidal interior empty at every playhead position', () => {
    expect(cavityCenter(9)[0]).toBeCloseTo(CAVITY.center[0] + CAVITY.travel / 2);
    for (const time of [0, 4, 9, 18]) {
      const center = cavityCenter(time);
      const interior: [number, number, number] = [center[0] + CAVITY.majorRadius, center[1], 0];
      expect(cavityDistance(interior, time)).toBeLessThan(0);
      expect(cavityProjection(interior, time)).toBeNull();
    }
  });

  it('moves exterior markers deterministically without moving them into the cavity', () => {
    const seeds = makeCavityShellSeeds(1200);
    expect(seeds.length).toBe(3600);
    for (let i = 0; i < seeds.length; i += 39) {
      const point = [seeds[i], seeds[i + 1], seeds[i + 2]] as const;
      expect(cavityDistance(point)).toBeGreaterThan(0);
      const moved = entrainedProjection(point, 7);
      expect(moved).toEqual(entrainedProjection(point, 7));
      expect(moved).not.toBeNull();
      if (moved) expect(cavityDistance(moved, 7)).toBeGreaterThan(0);
    }
    const first = [seeds[0], seeds[1], seeds[2]] as const;
    expect(entrainedProjection(first, 0)).not.toEqual(entrainedProjection(first, 7));
  });
});
