const test=require('node:test');
const assert=require('node:assert/strict');
const g=require('./charge-geometry.js');
const close=(a,b)=>a.forEach((v,i)=>assert.ok(Math.abs(v-b[i])<1e-10,`${a} != ${b}`));
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];

test('object turns preserve distances and orientation rather than silently reflecting it',()=>{
  for(const [tilt,yaw] of [[0,0],[61,27],[90,180],[173,-82]]){
    const basis=[[1,0,0],[0,1,0],[0,0,1]].map(p=>g.turn(p,tilt,yaw));
    assert.ok(Math.abs(dot(cross(basis[0],basis[1]),basis[2])-1)<1e-12);
    const a=[1,2,3],b=[-2,.3,1];
    assert.ok(Math.abs(dot(g.turn(a,tilt,yaw),g.turn(b,tilt,yaw))-dot(a,b))<1e-12);
  }
  close(g.turn([0,0,1],0,180),[0,0,-1]);
});
test('the combined path is closed, lies on its torus, and mirror winding reflects one spatial axis',()=>{
  close(g.path(0,'both',1,1),g.path(2*Math.PI,'both',1,1));
  for(let i=0;i<80;i++){
    const t=i*Math.PI/40,p=g.path(t,'both',1,1),mirror=g.path(t,'both',-1,1);
    assert.ok(Math.abs((Math.hypot(p[0],p[1])-2)**2+p[2]**2-.7**2)<1e-12);
    close(mirror,[p[0],p[1],-p[2]]);
    // Reversing all motion retraces the same curve; it does not mirror it.
    close(g.path(t,'both',1,-1),g.path(2*Math.PI-t,'both',1,1));
  }
});
test('one circulation alone is a planar loop; two combined circulations occupy 3D',()=>{
  for(let i=0;i<40;i++){
    const t=i*Math.PI/20;
    assert.equal(g.path(t,'hole',1,1)[2],0);
    assert.equal(g.path(t,'tube',1,1)[1],0);
  }
  assert.ok(Math.abs(g.path(.4,'both',1,1)[2])>.5);
});
test('the declared point-charge exterior has radial flux of one sign on every side',()=>{
  for(const charge of [-1,1])for(const normal of [[1,0,0],[-1,0,0],[0,1,0],[0,0,-1],[.6,.8,0]]){
    const point=normal.map(v=>3*v),field=g.pointField(charge,point);
    assert.ok(Math.abs(dot(field,normal)-charge/9)<1e-12);
    close(g.pointField(charge,g.turn(point,53,29)),g.turn(field,53,29));
    close(g.pointField(-charge,point),field.map(v=>-v));
  }
  assert.throws(()=>g.pointField(1,[0,0,0]),RangeError);
});
