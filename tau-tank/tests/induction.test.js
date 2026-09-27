import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createExperiment,
  stepExperiment,
  magnetField,
  coilBasis,
  linkage,
  inducedEMF,
  fieldAt,
  COIL,
  DT,
  dot,
  add,
  scale,
  rotate,
  axisAngle,
  poseAllowed,
  ExperimentClock,
} from "../src/induction.js";
const close = (a, b, tol = 1e-6) =>
  assert.ok(Math.abs(a - b) < tol, `${a} != ${b}`);
const pose = (x = -1) => ({
  position: [x, 0, 0],
  quaternion: [0, 0, 0, 1],
  polarity: 1,
});
test("one potential gives curl A = B, and curl E = -dB/dt", () => {
  const p = [0.2, 0.8, 0.3],
    s = pose(-0.6),
    v = [0.4, 0.1, -0.2],
    w = [0.1, 0.3, 0.2],
    h = 1e-5;
  const curl = (key) => {
    const d = Array.from({ length: 3 }, (_, i) => {
      const a = p.slice(),
        b = p.slice();
      a[i] += h;
      b[i] -= h;
      return magnetField(a, s, v, w)[key].map(
        (x, j) => (x - magnetField(b, s, v, w)[key][j]) / (2 * h),
      );
    });
    return [d[1][2] - d[2][1], d[2][0] - d[0][2], d[0][1] - d[1][0]];
  };
  curl("A").forEach((x, i) => close(x, magnetField(p, s, v, w).B[i]));
  const next = {
    ...s,
    position: add(s.position, scale(v, h)),
    quaternion: axisAngle(w, h),
  };
  const prev = {
    ...s,
    position: add(s.position, scale(v, -h)),
    quaternion: axisAngle(w, -h),
  };
  curl("E").forEach((x, i) =>
    close(
      x,
      -(magnetField(p, next).B[i] - magnetField(p, prev).B[i]) / (2 * h),
    ),
  );
});
test("Faraday circulation matches flux derivative, speed and both reversal signs", () => {
  const p = pose(-0.6),
    v = [0.8, 0, 0],
    h = 1e-5,
    e = inducedEMF(p, v);
  close(
    e,
    -(linkage(pose(-0.6 + 0.8 * h)) - linkage(pose(-0.6 - 0.8 * h))) / (2 * h),
  );
  close(inducedEMF(p, scale(v, 2)), 2 * e);
  close(inducedEMF(p, scale(v, -1)), -e);
  close(inducedEMF({ ...p, polarity: -1 }, v), -e);
  close(inducedEMF(p, [0, 0, 0]), 0);
  close(inducedEMF(p, [0, 1, 0]), 0);
  close(linkage(p, 48), linkage(p, 192), 1e-8);
});
test("flux surface agrees with contour integral", () => {
  const p = pose(-0.6),
    nr = 240,
    nt = 180;
  let flux = 0;
  for (let i = 0; i < nr; i++) {
    const r = ((i + 0.5) * COIL.radius) / nr;
    for (let j = 0; j < nt; j++) {
      const a = ((j + 0.5) * Math.PI * 2) / nt;
      flux +=
        ((((magnetField([0, r * Math.cos(a), r * Math.sin(a)], p).B[0] *
          r *
          COIL.radius) /
          nr) *
          Math.PI *
          2) /
          nt) *
        COIL.turns;
    }
  }
  close(flux, linkage(p), 2e-5);
});
test("closed circuit opposes change, heats both ways, and conserves work", () => {
  let s = createExperiment();
  for (let i = 1; i <= 240; i++)
    s = stepExperiment(s, pose(-1.25 + i / 240), DT);
  assert.ok(s.current < 0);
  assert.ok(s.temperature > 0);
  close(s.work, s.magneticEnergy + s.heat, 1e-10);
  const reverse = stepExperiment(
    createExperiment({ ...pose(-1.25), polarity: -1 }),
    { ...pose(-1.24), polarity: -1 },
    DT,
  );
  const forward = stepExperiment(
    createExperiment(pose(-1.25)),
    pose(-1.24),
    DT,
  );
  close(reverse.current, -forward.current);
  close(reverse.temperature, forward.temperature);
  for (let i = 0; i < 1800; i++) s = stepExperiment(s, s.pose, DT);
  assert.ok(Math.abs(s.current) < 1e-12);
  assert.ok(s.temperature < 1e-5);
  close(s.emf, 0);
  assert.ok(Math.hypot(...fieldAt([0.2, 0.7, 0.2], s).B) > 0);
});
test("open circuit retains induced E without current or heat", () => {
  let s = createExperiment(pose(-1), false);
  s = stepExperiment(s, pose(-0.99), DT);
  assert.ok(Math.abs(s.emf) > 0);
  assert.ok(Math.hypot(...fieldAt([0, 0.7, 0], s).E) > 0);
  close(s.current, 0);
  close(s.temperature, 0);
});
test("self-field circulation and circuit derivative agree", () => {
  let s = stepExperiment(createExperiment(pose(-1)), pose(-0.99), DT);
  let circulation = 0;
  for (let j = 0; j < 96; j++) {
    const t = ((j + 0.5) * 2 * Math.PI) / 96,
      p = [0, COIL.radius * Math.cos(t), COIL.radius * Math.sin(t)],
      dl = [0, -COIL.radius * Math.sin(t), COIL.radius * Math.cos(t)];
    circulation += (dot(fieldAt(p, s).E, dl) * COIL.turns * 2 * Math.PI) / 96;
  }
  close(circulation, COIL.resistance * s.current, 1e-7);
});
test("circuit trajectory converges under step refinement", () => {
  const run = (dt) => {
    let s = createExperiment();
    for (let i = 1; i <= Math.round(2 / dt); i++)
      s = stepExperiment(s, pose(-1.25 + 0.9 * Math.sin(i * dt)), dt);
    return s;
  };
  const a = run(1 / 60),
    b = run(1 / 120),
    c = run(1 / 240);
  assert.ok(Math.abs(b.current - c.current) < Math.abs(a.current - c.current));
  close(b.temperature, c.temperature, 2e-4);
});
test("collision bounds include rotated magnet and apparatus", () => {
  assert.ok(poseAllowed(pose(0)));
  assert.ok(!poseAllowed({ ...pose(0), position: [0, 0.7, 0] }));
  assert.ok(!poseAllowed(pose(1.9)));
  assert.ok(
    poseAllowed({ ...pose(0), quaternion: axisAngle([0, 0, 1], Math.PI / 2) }),
  );
});
test("pause and playback preserve snapshots while hold evolves the circuit", () => {
  const c = new ExperimentClock();
  c.target.position = [-0.25, 0, 0];
  c.advance(0.4);
  const s = structuredClone(c.snapshot);
  c.paused = true;
  c.advance(1);
  assert.deepEqual(c.snapshot, s);
  c.scrub(0);
  const first = structuredClone(c.snapshot);
  c.playback = true;
  c.speed = 0.25;
  c.advance(0.04);
  assert.ok(c.snapshot.time >= first.time);
  assert.ok(c.snapshot.time < s.time);
  c.live();
  c.hold();
  const x = c.snapshot.pose.position.slice();
  c.advance(1);
  assert.deepEqual(c.snapshot.pose.position, x);
  assert.equal(c.snapshot.emf, 0);
});

test("induction tensor adapter and display controls preserve the model", async () => {
  const { sample, defaults } = await import("../src/fields.js");
  const s = stepExperiment(createExperiment(pose(-1)), pose(-0.98), DT),
    p = [0.1, 0.4, 0.3],
    state = { ...defaults(), preset: "induction", induction: s };
  const r = sample(p, state);
  assert.deepEqual(r.e, r.E);
  assert.deepEqual(r.b, scale(r.B, -1));
  close(r.U[0][1], -r.E[0]);
  close(r.U[1][2], r.B[2]);
  close(r.q, 0.88);
  assert.deepEqual(
    r,
    sample(p, {
      ...state,
      resolution: 24,
      opacity: 1,
      grain: 0,
      readout: false,
      orbit: true,
      alpha: 0,
    }),
  );
});
test("30-second history is bounded and replay speed never rewrites a snapshot", () => {
  const c = new ExperimentClock();
  c.demo = true;
  c.demoStart = 0;
  for (let i = 0; i < 320; i++) c.advance(0.1);
  assert.equal(c.history.length, 3601);
  close(c.current.time - c.history[0].time, 30, 1e-9);
  const before = structuredClone(c.history);
  c.scrub(100);
  c.playback = true;
  c.speed = 0.25;
  c.advance(0.8);
  close(c.cursor, 124);
  assert.deepEqual(c.snapshot, before[124]);
  assert.deepEqual(c.history, before);
});
test("recording waits for activity, keeps the afterglow, and preserves history at rest", () => {
  const c = new ExperimentClock();
  for (let i = 0; i < 100; i++) c.advance(0.1);
  assert.equal(c.recording, false);
  assert.equal(c.history.length, 1);
  assert.equal(c.recordedTime, 0);
  assert.ok(c.current.time > 9);
  c.setTarget(pose(0.4));
  for (let i = 0; i < 6; i++) c.advance(0.1);
  c.hold();
  c.advance(0.1);
  assert.equal(c.recording, true);
  assert.equal(c.current.emf, 0);
  assert.ok(c.current.temperature > 0.01);
  for (let i = 0; i < 250 && c.recording; i++) c.advance(0.1);
  assert.equal(c.recording, false);
  const history = structuredClone(c.history),
    duration = c.recordedTime;
  const physicalTime = c.current.time,
    heat = c.current.temperature;
  for (let i = 0; i < 400; i++) c.advance(0.1);
  assert.deepEqual(c.history, history);
  assert.equal(c.recordedTime, duration);
  assert.ok(c.current.time > physicalTime + 39);
  assert.ok(c.current.temperature < heat);
  c.setTarget(pose(-1));
  c.advance(0.1);
  assert.equal(c.recording, true);
  assert.ok(c.recordedTime > duration);
  assert.ok(c.recordedTime < duration + 0.12);
  assert.deepEqual(c.history.slice(0, history.length), history);
});
test("manual pause holds the exact live state even while recording is idle", () => {
  const c = new ExperimentClock();
  for (let i = 0; i < 10; i++) c.advance(0.1);
  const live = structuredClone(c.current);
  c.pause();
  assert.deepEqual(c.snapshot, live);
  assert.equal(c.setTarget(pose(0)), false);
  c.advance(0.1);
  assert.deepEqual(c.snapshot, live);
  c.live();
  c.setTarget(pose(0));
  c.advance(0.1);
  assert.equal(c.recording, true);
});
test("unreachable targets settle instead of recording indefinitely", () => {
  const c = new ExperimentClock();
  c.setTarget({ ...pose(0), position: [0, 1, 0] });
  for (let i = 0; i < 300; i++) c.advance(0.1);
  assert.equal(c.blocked, true);
  assert.equal(c.recording, false);
  const count = c.history.length;
  c.advance(0.1);
  assert.equal(c.history.length, count);
});
test("coil quadrature converges toward the same finite-core field", () => {
  const p = [0.17, 0.4, 0.2],
    a = coilBasis(p, 48),
    b = coilBasis(p, 96),
    c = coilBasis(p, 192);
  assert.ok(
    Math.hypot(...b.B.map((x, i) => x - c.B[i])) <
      Math.hypot(...a.B.map((x, i) => x - c.B[i])) + 1e-12,
  );
  b.B.forEach((x, i) => close(x, c.B[i], 1e-7));
});

test("reaction force and torque account for the instantaneous source work", async () => {
  const { reaction } = await import("../src/induction.js");
  const s = createExperiment({
    ...pose(-0.8),
    quaternion: axisAngle([0, 1, 0], 0.3),
  });
  s.current = 0.07;
  s.velocity = [0.3, 0.2, 0.1];
  s.angular = [0, 0.4, 0.1];
  const r = reaction(s);
  close(
    dot(r.force, s.velocity) + dot(r.torque, s.angular),
    -s.current * inducedEMF(s.pose, s.velocity, s.angular),
    1e-7,
  );
});
test("fresh configurations preserve the chosen pose and polarity", () => {
  const c = new ExperimentClock(),
    p = {
      position: [-0.8, 0.1, 0.2],
      quaternion: axisAngle([0, 1, 0], 0.2),
      polarity: -1,
    };
  c.reset(false, p);
  assert.deepEqual(c.snapshot.pose, p);
  assert.equal(c.snapshot.closed, false);
  assert.equal(c.snapshot.current, 0);
  assert.equal(c.history.length, 1);
});
