import { describe, expect, it } from 'vitest';
import { chargeNormal, chargeSample, chargeSurfaceForces, chargeTimeline, initialChargeState, integrateTorusPressure, type ChargeCase } from '../src/charge-model';
import { TORUS_MAJOR, TORUS_MINOR, add, dot, mul, sub, type Vec3 } from '../src/model';

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

  it('balances uniform squeeze and moves fluid tangentially to each moving surface', () => {
    for (const center of [-0.94, 0.94]) {
      const force = integrateTorusPressure(center, () => 0.7);
      expect(Math.hypot(...force)).toBeLessThan(1e-12);
    }
    const moving = chargeTimeline(1.88, 'opposite')[30];
    for (const center of [moving.left, moving.right]) for (const angle of [0, 0.8, 2.3, 3.7]) {
      const surface: Vec3 = [center + (TORUS_MAJOR + TORUS_MINOR) * Math.cos(angle),
        (TORUS_MAJOR + TORUS_MINOR) * Math.sin(angle), 0];
      const normal = chargeNormal(surface, center);
      const point = add(surface, mul(normal, 1e-6));
      const reading = chargeSample(point, moving, 'opposite');
      expect(reading.inside).toBe(false);
      if (reading.inside) continue;
      const bodyVelocity: Vec3 = [center === moving.left ? moving.leftVelocity : moving.rightVelocity, 0, 0];
      expect(Math.abs(dot(sub(reading.velocity, bodyVelocity), normal))).toBeLessThan(2e-4);
    }
  });
});
