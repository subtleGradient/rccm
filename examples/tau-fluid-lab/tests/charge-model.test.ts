import { describe, expect, it } from 'vitest';
import { chargeSample, chargeSurfaceForces, chargeTimeline, initialChargeState, type ChargeCase } from '../src/charge-model';

describe('aligned charge teaching fixture', () => {
  it('turns reinforcing gap flow into a lower static pressure', () => {
    const opposite = initialChargeState(1.88);
    const like = chargeSample([0, 0, 0], opposite, 'like');
    const unlike = chargeSample([0, 0, 0], opposite, 'opposite');
    expect(like.inside).toBe(false);
    expect(unlike.inside).toBe(false);
    if (like.inside || unlike.inside) return;
    expect(unlike.pressure).toBeLessThan(like.pressure);
    expect(unlike.interaction).toBeGreaterThan(0);
    expect(like.interaction).toBeLessThan(0);
  });

  it('gets attraction or repulsion from pressure over the full surfaces', () => {
    for (const spacing of [1.52, 1.88, 2.4, 2.8]) {
      for (const scenario of ['opposite', 'like'] as ChargeCase[]) {
        const [left, right] = chargeSurfaceForces(initialChargeState(spacing), scenario);
        expect(left[0] * (scenario === 'opposite' ? 1 : -1)).toBeGreaterThan(0.005);
        expect(right[0]).toBeCloseTo(-left[0], 5);
        expect(Math.abs(left[1]) + Math.abs(left[2])).toBeLessThan(1e-5);
      }
    }
  });

  it('uses the same force to move both cavities from rest and stops before contact or cube exit', () => {
    for (const scenario of ['opposite', 'like'] as ChargeCase[]) {
      const frames = chargeTimeline(1.88, scenario);
      expect(frames).toEqual(chargeTimeline(1.88, scenario));
      expect(frames[0].leftVelocity).toBe(0);
      expect(frames[0].rightVelocity).toBe(0);
      const first = frames[30];
      expect((first.right - first.left - 1.88) * (scenario === 'opposite' ? -1 : 1)).toBeGreaterThan(0);
      for (const frame of frames) {
        expect(frame.right - frame.left).toBeGreaterThanOrEqual(1.52 - 1e-6);
        expect(frame.right - frame.left).toBeLessThanOrEqual(2.8 + 1e-6);
      }
    }
  });

  it('does not put medium readings inside a toroidal cavity', () => {
    const state = initialChargeState(1.88);
    expect(chargeSample([state.left + 0.49, 0, 0], state, 'opposite')).toEqual({ inside: true, core: 'left' });
    for (let x = -2; x <= 2; x += 0.3) for (let y = -1.5; y <= 1.5; y += 0.3) {
      const reading = chargeSample([x, y, 0.2], state, 'opposite');
      if (reading.inside) continue;
      expect(reading.pressure).toBeGreaterThan(0);
      expect(reading.pressure).toBeLessThanOrEqual(1);
    }
  });
});
