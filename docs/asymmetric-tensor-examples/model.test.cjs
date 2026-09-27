const test = require('node:test');
const assert = require('node:assert/strict');
const m = require('./model.js');

test('capacity changes all four linked diagonal cells and preserves reciprocity', () => {
  const {a,b,changed} = m.pair('clock');
  assert.deepEqual(changed,[0,5,10,15]);
  assert.equal(a.q.value * a.cells[5].value,1);
  assert.equal(b.q.value * b.cells[5].value,1);
  assert.equal(m.clockRate(b),Math.sqrt(.5));
});
test('electric reversal changes only its signed time-space pair', () => {
  const {a,b,changed} = m.pair('electric');
  assert.deepEqual(changed,[1,4]);
  assert.equal(a.cells[1].value,-.002);
  assert.equal(b.cells[4].value,-.002);
  assert.deepEqual(m.electricForce(1,a.e),[.002,0,0]);
  assert.deepEqual(m.electricForce(1,b.e),[-.002,0,0]);
});
test('north/south compass reversal uses xz/zx cells and reverses torque', () => {
  const {a,b,changed} = m.pair('compass');
  assert.deepEqual(changed,[7,13]);
  assert.deepEqual(m.cross([1,0,0],a.b),[0,0,.003]);
  assert.deepEqual(m.cross([1,0,0],b.b),[0,0,-.003]);
  assert.equal(a.cells[7].value,.003);
  assert.equal(a.cells[13].value,-.003);
});
test('gravity keeps centre states identical but has a nonzero exact spatial difference', () => {
  assert.deepEqual(m.pair('falling','center').changed,[]);
  assert.deepEqual(m.pair('falling','above').changed,[0,5,10,15]);
  assert.equal(m.pair('falling','above').b.q.text,'0.9999999990000002');
  assert.equal(m.pair('falling','below').b.q.text,'0.9999999989999998');
  assert.equal(m.gravityAcceleration('a'),0);
  assert.ok(Math.abs(m.gravityAcceleration('b') + 8.987551787368176)<1e-12);
});
test('reversing both hairs reverses applied fields but preserves both force directions', () => {
  for (const sample of ['left','right']) {
    const {a,b,changed} = m.pair('hair',sample);
    assert.deepEqual(changed,[1,4]);
    assert.equal(a.e[0],-b.e[0]);
    assert.equal(m.electricForce(1,a.e)[0],m.electricForce(-1,b.e)[0]);
  }
  assert.ok(m.pair('hair','left').a.e[0]<0);
  assert.ok(m.pair('hair','right').a.e[0]>0);
});
