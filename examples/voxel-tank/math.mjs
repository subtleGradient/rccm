// Normalized Cartesian state: q=Pstatic/Pc, e=alpha v_perp/c, b=alpha tp Omega.
export function assemble({q,e,b}) {
  if (!(q>0 && q<=1) || ![...e,...b].every(Number.isFinite)) throw new RangeError('Finite state and 0 < q <= 1 required.');
  const [x,y,z]=e,[i,j,k]=b;
  return [[-q,-x,-y,-z],[x,1/q,-k,j],[y,k,1/q,-i],[z,-j,i,1/q]];
}
export const centers=[-1.5,1.5];
// Authored smooth frozen phase-overlap specimen. Units: c=Pc=length unit=1.
// Each circulation field is divergence-free, u=a(-y,x,0)exp(-r²/2σ²).
// Alpha=1 for the displayed normalized channels; tp=.2 for curl normalization.
export function gapState([x,y,z],mode='opposite') {
  if(mode==='uniform') return {q:.72,e:[0,0,0],b:[0,0,0],cross:0,self:0};
  if(mode==='mass') {
    const load=centers.reduce((sum,c)=>sum+.28*Math.exp(-((x-c)**2+y*y+z*z)/(2*1.25**2)),0);
    return {q:1-load,e:[0,0,0],b:[0,0,0],cross:0,self:load};
  }
  const signs=mode==='opposite'?[1,-1]:mode==='negative'?[-1,-1]:[1,1];
  const sigma=1.25,a=.38/(sigma*Math.exp(-.5));
  const fields=centers.map((c,i)=>{
    const dx=x-c,g=Math.exp(-(dx*dx+y*y+z*z)/(2*sigma*sigma)),k=signs[i]*a*g;
    return {v:[-k*y,k*dx,0],curl:[k*dx*z/sigma**2,k*y*z/sigma**2,k*(2-(dx*dx+y*y)/sigma**2)]};
  });
  const e=fields[0].v.map((v,i)=>v+fields[1].v[i]);
  const b=fields[0].curl.map((v,i)=>.2*(v+fields[1].curl[i]));
  const self=fields.reduce((s,f)=>s+f.v.reduce((a,v)=>a+v*v,0),0);
  const cross=2*fields[0].v.reduce((s,v,i)=>s+v*fields[1].v[i],0);
  return {q:1-e.reduce((s,v)=>s+v*v,0),e,b,self,cross};
}
export function pressureFaces(center,mode,halfWidth=.32){
  const left=gapState([center-halfWidth,0,0],mode).q;
  const right=gapState([center+halfWidth,0,0],mode).q;
  return {left,right,force:left-right}; // F_x/(Pc A), two opposed faces of equal area.
}
