import {test} from 'node:test';import assert from 'node:assert/strict';
import {tensor,splitMatrix,sample,defaults,cellCentre,cavityDistance,presets,dot} from '../src/fields.js';
test('seven readings assemble the sixteen signed Cartesian slots',()=>{
 const u=tensor(.5,[1,2,3],[4,5,6]);assert.deepEqual(u,[[-.5,-1,-2,-3],[1,2,-6,5],[2,6,2,-4],[3,-5,4,2]]);
 const s=splitMatrix(u,'S'),a=splitMatrix(u,'A');for(let i=0;i<4;i++)for(let j=0;j<4;j++){assert.equal(s[i][j],s[j][i]);assert.ok(a[i][j]===-a[j][i]);assert.equal(s[i][j]+a[i][j],u[i][j]);}
 assert.throws(()=>tensor(0,[0,0,0],[0,0,0]),RangeError);
});
test('authored fixture pressure ledger closes across all presets and extreme gains',()=>{
 for(const preset of Object.values(presets))for(const gain of [0,1,3]){const s={...defaults(),sources:preset(),slip:gain,spin:gain,compression:gain};for(let x=-2;x<=2;x+=.4)for(let y=-2;y<=2;y+=.5){const r=sample([x,y,.2],s);assert.ok(r.q>0&&r.q<=1);assert.ok(Math.abs(r.q+r.macro+r.dynamic+r.shear-1)<1e-12);assert.ok(Math.abs(r.dynamic-dot(r.longitudinal,r.longitudinal)-dot(r.slip,r.slip)-dot(r.rotation,r.rotation))<1e-12);assert.ok(r.U.flat().every(Number.isFinite));}}
});
test('readout and camera settings cannot alter the sampled physical state',()=>{const s=defaults(),p=[.2,.4,.6],before=sample(p,s);assert.deepEqual(sample(p,{...s,readout:false,tempo:4,orbit:true,opacity:.9,resolution:24}),before);});
test('grid selection and cavities respect their boundaries',()=>{assert.deepEqual(cellCentre([2,-2,0],4),[1.5,-1.5,.5]);for(const s of defaults().sources)assert.ok(cavityDistance(s.position,s)<0);});

test('penny cavity is a disk rather than its enclosing box',()=>{const coin=presets.pressure()[1];assert.ok(cavityDistance(coin.position,coin)<0);assert.ok(cavityDistance(coin.position.map((x,i)=>x+([.29,0,.29][i])),coin)>0);});
test('modulus ratio controls both antisymmetric sectors without changing capacity',()=>{const s=defaults(),p=[.2,.4,.6],a=sample(p,s),b=sample(p,{...s,alpha:0});assert.equal(a.q,b.q);assert.ok(b.e.every(x=>x===0));assert.ok(b.b.every(x=>x===0));});
