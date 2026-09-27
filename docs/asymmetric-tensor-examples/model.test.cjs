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
test('metric weights convert squared intervals, while clocks and rulers use square roots', () => {
  for(const [q,clock,length] of [[.8,.8944271909999159,1.118033988749895],[.5,.7071067811865476,1.4142135623730951],[.25,.5,2],[.001,.03162277660168379,31.622776601683793]]){
    const s=m.state(m.capacity(q)), scales=m.metricScales(s);
    assert.ok(Math.abs(scales.clock-clock)<1e-12);
    assert.ok(Math.abs(scales.length-length)<1e-12);
    assert.ok(Math.abs(scales.clock*scales.length-1)<1e-12);
    // A light ray advances c*q coordinate metres per reference second.
    // Local rulers and the local clock must still measure speed c.
    assert.ok(Math.abs((m.C*q*scales.length/scales.clock)/m.C-1)<1e-12);
  }
  const {a,b}=m.pair('clock');
  assert.ok(Math.abs(60*m.metricScales(b).clock/m.metricScales(a).clock-47.434164902525694)<1e-12);
  assert.ok(Math.abs(m.metricScales(b).length/m.metricScales(a).length-1.2649110640673518)<1e-12);
  const extreme=m.state(m.capacity(.001));
  assert.equal(extreme.cells[0].value,-.001);
  for(const i of [5,10,15]) assert.equal(extreme.cells[i].value,1000);
});
test('the chosen remaining-capacity branch excludes zero, negative and over-budget q', () => {
  for(const q of [0,-.5,1.25,Infinity,NaN]) assert.throws(()=>m.capacity(q),RangeError);
  assert.deepEqual(m.metricScales(m.state(m.capacity(1))),{clock:1,length:1});
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
test('flipping only the right charge changes repulsion to attraction at both hairs', () => {
  const left=m.pair('hair','left'), right=m.pair('hair','right');
  assert.deepEqual(left.changed,[1,4]);
  assert.deepEqual(right.changed,[]);
  assert.ok(m.electricForce(1,left.a.e)[0]<0);
  assert.ok(m.electricForce(1,left.b.e)[0]>0);
  assert.ok(m.electricForce(1,right.a.e)[0]>0);
  assert.ok(m.electricForce(-1,right.b.e)[0]<0);
  assert.deepEqual(right.a.e,right.b.e,'the same local applied field can push opposite charges in opposite directions');
});
test('all electric directions occupy their own signed time-space pairs at fixed strength', () => {
  const expected={right:[.003,0,0],up:[0,.003,0],toward:[0,0,.003],diagonal:[.001,.002,.002]};
  for(const [direction,e] of Object.entries(expected)){
    const state=m.electricDirection(direction);
    assert.deepEqual(state.e,e);
    assert.ok(Math.abs(Math.hypot(...e)-.003)<1e-12);
    e.forEach((v,i)=>{
      assert.equal(state.cells[i+1].value, v===0?0:-v);
      assert.equal(state.cells[(i+1)*4].value,v);
    });
    assert.deepEqual(state.b,[0,0,0]);
    assert.equal(state.q.value,.8);
  }
});
