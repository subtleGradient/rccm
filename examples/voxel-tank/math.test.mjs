import test from 'node:test';
import assert from 'node:assert/strict';
import {assemble, gapState, pressureFaces} from './math.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-10, `${a} != ${b}`);
test('vacuum, signs, and reciprocal packing follow the Cartesian matrix',()=>{
  assert.deepEqual(assemble({q:1,e:[0,0,0],b:[0,0,0]}).map(r=>r.map(v=>v||0)),[[-1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]]);
  const u=assemble({q:.25,e:[.1,.2,.3],b:[.4,.5,.6]});
  near(u[0][1],-.1);near(u[1][2],-.6);near(u[1][3],.5);near(u[2][3],-.4);
  for(let i=0;i<4;i++)for(let j=i+1;j<4;j++)near(u[i][j],-u[j][i]);
  near(u[1][1],4);
  assert.throws(()=>assemble({q:0,e:[0,0,0],b:[0,0,0]}));
});
test('phase overlap preserves sign reversal and distinguishes gap alignment',()=>{
  const a=gapState([0,0,0],'opposite'), b=gapState([0,0,0],'positive'), c=gapState([0,0,0],'negative');
  assert.ok(a.q < b.q);near(b.q,c.q);near(b.e[1],0);
  assert.ok(a.cross>0);assert.ok(b.cross<0);
  for(let x=-4;x<=4;x+=.1)for(const mode of ['opposite','positive','negative','mass','uniform']){
    const s=gapState([x,.1,0],mode);assert.ok(s.q>0&&s.q<=1);
  }
});
test('face pressure gives equal/opposite forces and uniform pressure cancels',()=>{
  for(const mode of ['opposite','positive','negative','mass','uniform']){
    const left=pressureFaces(-1.5,mode),right=pressureFaces(1.5,mode);
    near(left.force,-right.force);
    if(mode==='opposite'||mode==='mass')assert.ok(left.force>0);
    if(mode==='positive'||mode==='negative')assert.ok(left.force<0);
    if(mode==='uniform')near(left.force,0);
    near(left.force,left.left-left.right);
  }
});
