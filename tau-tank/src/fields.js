import {fieldAt,apparatusDistance,magnetDistance} from './induction.js';
// Authored visual fixtures. No force integration or evolving PDE lives here.
// Ledger and Cartesian tensor follow RCCM-GfX-2.tex §§2–3.
export const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
export const dot = (a,b) => a.reduce((s,x,i)=>s+x*b[i],0);
export const cross = (a,b) => [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
export const norm = a => Math.hypot(...a);
export const unit = a => {const l=norm(a);return l>1e-8?a.map(x=>x/l):[0,0,0]};
export const defaults = () => ({preset:'dipole',resolution:12,lens:'combined',opacity:.36,grain:.65,grid:.28,slip:1,spin:1,compression:.7,ambient:.9,alpha:.55,tp:.55,readout:true,tempo:1,orbit:false,slice:false,sliceZ:0,layers:{flow:true,slip:true,spin:true},sources:presets.dipole(),selected:0,probe:[.42,.21,.21]});
const source=(id,name,shape,position,charge,mass,moment=0,angle=0)=>({id,name,shape,position,charge,mass,moment,angle,size:shape==='brick'?[.44,.28,.3]:shape==='magnet'?[.5,.15,.18]:shape==='coin'?[.3,.08,.3]:[.3,.3,.3]});
export const presets={
 dipole:()=>[source('a','Positive cavity','sphere',[-.88,.28,.18],1,.7),source('b','Negative cavity','sphere',[.84,-.2,-.12],-1,.6),source('c','Neutral cavity','brick',[.1,.83,-.88],0,1.1,.5,25)],
 repel:()=>[source('a','Positive cavity A','sphere',[-.85,.15,0],1,.6),source('b','Positive cavity B','sphere',[.85,-.15,0],1,.6)],
 vortex:()=>[source('a','Magnetic cavity','magnet',[-.72,.06,0],0,.5,1.4,20),source('b','Magnetic cavity B','magnet',[.7,.13,-.18],0,.5,1.1,105)],
 pressure:()=>[source('a','Heavy cavity','brick',[-.45,-.12,0],0,2.6),source('b','Light cavity','coin',[.82,.64,.2],0,.3)],
 mixed:()=>[source('a','Positive cavity','sphere',[-.92,.1,.36],1.3,.8),source('b','Negative cavity','coin',[.62,-.62,.45],-1,1),source('c','Magnetic cavity','magnet',[.5,.65,-.65],0,.9,1.4,60)]
};
export function cavityDistance(p,s){
 const v=p.map((x,i)=>x-s.position[i]),a=-s.angle*Math.PI/180;
 const r=[v[0]*Math.cos(a)-v[1]*Math.sin(a),v[0]*Math.sin(a)+v[1]*Math.cos(a),v[2]];
 if(s.shape==='sphere')return norm(r)-s.size[0];
 if(s.shape==='coin'){const a=Math.hypot(r[0],r[2])-s.size[0],b=Math.abs(r[1])-s.size[1];return Math.hypot(Math.max(a,0),Math.max(b,0))+Math.min(Math.max(a,b),0);}
 const d=r.map((x,i)=>Math.abs(x)-s.size[i]);return norm(d.map(x=>Math.max(0,x)))+Math.min(Math.max(...d),0);
}
export function tensor(q,e,b){
 if(!(q>0&&q<=1))throw new RangeError('Capacity must be in (0, 1].');
 return [[-q,-e[0],-e[1],-e[2]],[e[0],1/q,-b[2],b[1]],[e[1],b[2],1/q,-b[0]],[e[2],-b[1],b[0],1/q]];
}
export function splitMatrix(u,part='U') {return u.map((row,i)=>row.map((x,j)=>part==='S'?(x+u[j][i])/2:part==='A'?(x-u[j][i])/2:x));}
export function sample(p,state,renderOnly=false){
 if(state.preset==='induction' && state.induction){
  const r=fieldAt(p,state.induction,state.coilCache?.get(p.join(','))),q=.88,e=r.E,b=r.B.map(v=>-v);
  const inside=Math.min(magnetDistance(p,state.induction.pose),apparatusDistance(p))<0;
  if(renderOnly)return {...r,q,ambient:.9,charge:0,e,b,inside};
  return {...r,ambient:.9,q,macro:.1,dynamic:0,shear:.02,charge:0,longitudinal:[0,0,0],slip:e.map(v=>v/.55),omega:b.map(v=>v/(.55*.55)),rotation:[0,0,0],e,b,U:tensor(q,e,b),inside};
 }

 let macro=1-state.ambient,charge=0;
 let longitudinal=[0,0,0],slip=[.015,0,.008],omega=[0,.06,.025];
 for(const s of state.sources){
  const r=p.map((x,i)=>x-s.position[i]),r2=dot(r,r),g=Math.exp(-r2/1.18),soft=r2+.23;
  macro+=.14*s.mass*g;
  charge+=s.charge/Math.sqrt(soft)*.25;
  const a=s.angle*Math.PI/180,m=[Math.cos(a)*s.moment,Math.sin(a)*s.moment,0],md=dot(m,r);
  for(let i=0;i<3;i++){
   longitudinal[i]-=r[i]*g*s.mass*.14;
   slip[i]+=s.charge*r[i]*.15/Math.pow(soft,1.5);
   omega[i]+=.16*(3*r[i]*md/soft-m[i])/Math.pow(soft,1.5);
  }
 }
 macro=clamp(macro,0,.72);
 longitudinal=longitudinal.map(x=>x*state.compression);
 slip=slip.map(x=>x*state.slip);
 omega=omega.map(x=>x*state.spin);
 const ambient=1-macro;
 let rotation=omega.map(x=>x*.16);
 const shear=Math.min(ambient*.22,.018+norm(omega)*.055);
 const rawDynamic=dot(longitudinal,longitudinal)+dot(slip,slip)+dot(rotation,rotation);
 const limit=Math.max(.001,ambient-shear-.055);
 if(rawDynamic>limit){const k=Math.sqrt(limit/rawDynamic);longitudinal=longitudinal.map(x=>x*k);slip=slip.map(x=>x*k);rotation=rotation.map(x=>x*k);}
 const dynamic=dot(longitudinal,longitudinal)+dot(slip,slip)+dot(rotation,rotation);
 const q=ambient-dynamic-shear,e=slip.map(x=>x*state.alpha),b=omega.map(x=>x*state.alpha*state.tp);
 return {ambient,q,macro,dynamic,shear,charge,longitudinal,slip,omega,rotation,e,b,U:tensor(q,e,b),inside:state.sources.some(s=>cavityDistance(p,s)<0)};
}
export function cellCentre(p,n){const h=4/n;return p.map(v=>-2+(clamp(Math.floor((v+2)/h),0,n-1)+.5)*h);}
export function cellIndex(p,n){return p.map(v=>clamp(Math.floor((v+2)/4*n),0,n-1));}
