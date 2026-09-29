const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

// Run the very same pure functions embedded in the standalone teaching page.
const html = fs.readFileSync(path.join(__dirname, 'pressure-slip-shove.html'), 'utf8');
const source = html.match(/<script id="shove-model">([\s\S]*?)<\/script>/)[1];
const context = {};
vm.createContext(context);
vm.runInContext(source, context);
const model = context.ShoveModel;
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-12, `${actual} ≠ ${expected}`);

test('aligned, orthogonal and opposed local flows obey the squared-speed budget', () => {
  for (const [angle, dynamic, capacity, interaction] of [[0, .16, .84, .08], [90, .08, .92, 0], [180, 0, 1, -.08]]) {
    const s = model.overlap(angle);
    near(s.dynamic, dynamic);
    near(s.capacity, capacity);
    near(s.interaction, interaction);
    near(s.dynamic + s.capacity, 1);
    near(s.self, .08);
  }
});

test('every allowed angle conserves capacity and keeps total pressure nonnegative', () => {
  for (let angle = 0; angle <= 180; angle++) {
    const s = model.overlap(angle);
    assert.ok(s.dynamic >= 0 && s.dynamic <= .160000000001);
    assert.ok(s.capacity >= .839999999999 && s.capacity <= 1);
    near(s.dynamic, s.self + s.interaction);
    near(s.capacity + s.dynamic, 1);
  }
});

test('an independent vector norm agrees with the cross-term expansion', () => {
  for (const [a, b] of [[[.2, 0, 0], [.2, 0, 0]], [[.2, 0, 0], [0, .2, 0]], [[.2, 0, 0], [-.2, 0, 0]], [[.1, -.2, .15], [-.2, -.1, .1]]]) {
    const s = model.velocityBudget(a, b);
    near(s.dynamic, a.reduce((sum, v, i) => sum + (v + b[i]) ** 2, 0));
    near(s.dynamic, s.self + s.interaction);
    const reversed = model.velocityBudget(a.map(v => -v), b.map(v => -v));
    near(reversed.dynamic, s.dynamic);
    near(reversed.interaction, s.interaction);
    near(model.velocityBudget(a, b.map(v => -v)).interaction, -s.interaction);
  }
});

test('capacity slope sets gravity direction; equal pressure has zero shove', () => {
  near(model.gravity(0), 0);
  near(model.gravity(2e-16), -8.987551787368176);
  near(model.gravity(-2e-16), 8.987551787368176);
});

test('a uniform external electric field still pushes opposite charges oppositely', () => {
  near(model.electricForce(1, 3), 3);
  near(model.electricForce(-1, 3), -3);
  near(model.electricForce(0, 3), 0);
  near(model.electricForce(-1, -3), 3);
});

test('both charge signs give repulsion for like pairs and attraction for unlike pairs', () => {
  for (const source of [-1, 1]) {
    for (const probe of [-1, 1]) {
      const pair = model.pair(source, probe);
      assert.equal(pair.rightForce, source * probe);
      assert.equal(pair.leftForce, -pair.rightForce);
      assert.equal(pair.aligned, source !== probe);
      near(pair.capacity, pair.aligned ? .84 : 1);
    }
  }
});

test('impossible local budgets and non-finite inputs are rejected, not silently clipped', () => {
  for (const angle of [-1, 181, NaN, Infinity]) assert.throws(() => model.overlap(angle));
  assert.throws(() => model.velocityBudget([1, 0, 0], [1, 0, 0]));
  assert.throws(() => model.velocityBudget([1, 0, 0], [0, 0, 0]));
  assert.throws(() => model.velocityBudget([NaN, 0, 0], [0, 0, 0]));
  assert.throws(() => model.velocityBudget([0, 0], [0, 0, 0]));
});
