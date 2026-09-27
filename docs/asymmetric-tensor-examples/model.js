/* Exact matrix bookkeeping and declared response fixtures, not a coupled RCCM solver. */
(function (root) {
  'use strict';
  const C = 299792458;
  const Q0 = 9999999990000000n;
  const DEN = 10000000000000000n;
  const DELTA = 2n;
  const clean = n => Object.is(n, -0) ? 0 : n;
  function capacity(value) {
    if (!(value > 0 && value <= 1)) throw new RangeError('Capacity must lie in (0, 1].');
    return {value, text:String(value), label:String(value), inverse:String(1/value)};
  }
  function exactCapacity(n, label) {
    const text = `${n / DEN}.${String(n % DEN).padStart(16,'0')}`;
    return {value:Number(n)/Number(DEN), text, label, inverse:`1/${label}`, exact:n.toString()};
  }
  function state(q, e=[0,0,0], b=[0,0,0]) {
    const [ex,ey,ez]=e, [bx,by,bz]=b;
    const values=[-q.value,-ex,-ey,-ez,ex,1/q.value,-bz,by,ey,bz,1/q.value,-bx,ez,-by,bx,1/q.value];
    const cells=values.map((value,i)=>{
      value=clean(value);
      const isQ = i===0 || i===5 || i===10 || i===15;
      const text = isQ ? (i===0 ? `−${q.label}` : q.inverse) : String(value).replace('-','−');
      return {value,text,key:isQ ? `${i===0?'negative':'inverse'}:${q.exact||q.text}` : String(value)};
    });
    return {q,e,b,cells};
  }
  function pair(kind, sample) {
    let a,b;
    const q=capacity(.8);
    switch(kind){
      case 'clock': a=state(q); b=state(capacity(.5)); break;
      case 'electric': a=state(q,[.002,0,0]); b=state(q,[-.002,0,0]); break;
      case 'compass': a=state(q,[0,0,0],[0,.003,0]); b=state(q,[0,0,0],[0,-.003,0]); break;
      case 'falling': {
        const offset=sample==='above'?1n:sample==='below'?-1n:0n;
        a=state(exactCapacity(Q0,'q₀'));
        b=state(exactCapacity(Q0+offset*DELTA,offset===0n?'q₀':offset>0n?'q₊':'q₋'));
        break;
      }
      case 'hair': {
        const direction=sample==='right'?1:-1;
        a=state(q,[direction*.002,0,0]); b=state(q,[-direction*.002,0,0]); break;
      }
      default: throw new Error(`Unknown scene: ${kind}`);
    }
    return {a,b,changed:a.cells.flatMap((cell,i)=>cell.key!==b.cells[i].key?[i]:[])};
  }
  function cross(a,b){return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]].map(clean);}
  const api={pair,capacity,state,cross,clockRate:s=>Math.sqrt(s.q.value),electricForce:(charge,e)=>e.map(x=>clean(charge*x)),gravityAcceleration:world=>world==='a'?0:-C*C/2*(Number(DELTA)/Number(DEN)),C};
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.TensorExamples=api;
})(typeof globalThis==='object'?globalThis:this);
