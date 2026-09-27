/* A torus-knot geometry fixture and a separate prescribed Coulomb exterior.
   No identification of a knot, helicity, or winding count with electric charge. */
(function(root){
  'use strict';
  function torus(u,v){
    const radius=2+.7*Math.cos(v);
    return [radius*Math.cos(u),radius*Math.sin(u),.7*Math.sin(v)];
  }
  function path(t,mode='both',hand=1,flow=1){
    const phase=flow*t;
    if(mode==='hole')return torus(phase,0);
    if(mode==='tube')return torus(0,hand*phase);
    if(mode!=='both')throw new Error('Unknown circulation mode.');
    // (2,3) and (2,-3) are mirror trefoils. Counts are illustrative, not Q.
    return torus(2*phase,hand*3*phase);
  }
  function turn([x,y,z],tilt=0,yaw=0){
    const a=tilt*Math.PI/180,b=yaw*Math.PI/180;
    const y1=y*Math.cos(a)-z*Math.sin(a),z1=y*Math.sin(a)+z*Math.cos(a);
    return [x*Math.cos(b)+z1*Math.sin(b),y1,-x*Math.sin(b)+z1*Math.cos(b)];
  }
  function pointField(charge,position){
    const r=Math.hypot(...position);
    if(r===0)throw new RangeError('The point-source centre is excluded.');
    return position.map(v=>charge*v/r**3);
  }
  const api={torus,path,turn,pointField};
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.ChargeGeometry=api;
})(typeof globalThis==='object'?globalThis:this);
