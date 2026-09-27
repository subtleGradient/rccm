import {THREE,createWorld,clearGroup,addBox,addArrow,addRing} from './scene.js';
import {gapState,pressureFaces,assemble,centers} from './math.mjs';
const $=id=>document.getElementById(id);
const world=createWorld($('tank'),{span:8,position:[5,4.8,9]});
const amber=new THREE.Color('#c78738'),cream=new THREE.Color('#e9e7b6');
const colour=q=>amber.clone().lerp(cream,Math.max(0,Math.min(1,(q-.4)/.6)));
const names={opposite:'Opposite charges',positive:'Two positive charges',negative:'Two negative charges',mass:'Two mass pressure wells',uniform:'Uniform squeeze'};
const explanations={opposite:'The slips between these opposite circulations align. The extra dynamic load lowers the gap’s static pressure. The outer fluid pushes the two boundaries inward.',positive:'These matching circulations oppose one another in the gap. Their overlap restores static pressure there. The inner-side push exceeds the outer-side push, driving the boundaries apart.',negative:'Both circulation signs are reversed. The slip arrows reverse, while the pressure budget stays the same as for two positive charges. The pressure imbalance pushes outward.',mass:'Both mass regions carry a static pressure deficit. Across either object, the other well lowers the inward-facing pressure. The surrounding fluid produces an inward resultant.',uniform:'Every face feels the same squeeze. All pressure arrows remain present, and their vector sum is zero. A large pressure value alone gives no preferred direction.'};
function torus(center,sign,color){addRing(world.root,[center,0,0],.46,color,[0,0,1],.115);for(let k=0;k<3;k++){const t=k*Math.PI*2/3;addArrow(world.root,[center+.46*Math.cos(t),.46*Math.sin(t),.13],[-sign*Math.sin(t),sign*Math.cos(t),0],color,.21);}}
function rebuild(){clearGroup(world.root);const mode=$('pair').value,n=Number($('gap-count').value),layer=$('layer').value,slice=$('slice').checked;
 $('gap-count-out').value=n;$('probe').max=n-1;const i=Math.min(+$('probe').value,n-1);$('probe').value=i;$('probe-out').value=(i+1)+' / '+n;$('scene-label').textContent=names[mode]+' / frozen field';
 addBox(world.root,[0,0,0],[7,3.1,2.7],'#6a8c76',.008);
 const zs=slice?[0]:[-.9,0,.9];
 for(const z of zs)for(let y=-1.2;y<=1.21;y+=.6)for(let x=-3.2;x<=3.21;x+=.4){
   const state=gapState([x,y,z],mode);if((centers.some(c=>Math.hypot(x-c,y)<.62)||Math.abs(x)<.95&&Math.abs(y)<.2)&&Math.abs(z)<.4)continue;
   if(layer!=='slip')addBox(world.root,[x,y,z],[.34,.50,slice?.13:.70],colour(state.q),slice?.18:.08);
   if(layer!=='pressure'&&Math.abs(y)<1&&Math.round((x+3.2)*10)%8===0)addArrow(world.root,[x,y,z+.13],state.e,'#83d6d5',Math.hypot(...state.e)*.60);
 }
 for(let k=0;k<n;k++){const x=-.85+(k+.5)*1.7/n,state=gapState([x,0,0],mode);addBox(world.root,[x,0,.02],[1.7/n*.88,.50,.55],k===i?'#ffffff':colour(state.q),.18);if(layer!=='pressure')addArrow(world.root,[x,0,.43],state.e,'#a4f4eb',Math.hypot(...state.e)*.90);}
 if(mode!=='uniform'){const signs=mode==='opposite'?[1,-1]:mode==='negative'?[-1,-1]:[1,1];centers.forEach((c,k)=>{
  if(mode==='mass'){const body=new THREE.Mesh(new THREE.SphereGeometry(.43,24,16),new THREE.MeshStandardMaterial({color:'#b8a987',roughness:.8}));body.position.x=c;world.root.add(body);addRing(world.root,[c,0,0],.59,'#d3b081',[0,0,1],.015);}else torus(c,signs[k],signs[k]===1?'#e7ee8c':'#b5dceb');
  const {force}=pressureFaces(c,mode);addArrow(world.root,[c,-.85,.15],[force,0,0],'#f2a5b9',Math.abs(force)*4.5);
 });}
 const x=-.85+(i+.5)*1.7/n,state=gapState([x,0,0],mode),q=state.q;
 $('q-out').value=q.toFixed(3);$('q-meter').style.width=q*100+'%';$('packing-out').value=(1/q).toFixed(3);$('slip-out').value=state.e[1].toFixed(3);$('overlap-out').value=state.cross.toFixed(3);
 $('matrix').innerHTML=assemble(state).flatMap((row,r)=>row.map((v,c)=>'<span class="'+(r===c?'diag':r===0||c===0?'electric':'magnetic')+'">'+(Math.abs(v)<.0005?'0.000':v.toFixed(3))+'</span>')).join('');
 const f=pressureFaces(-1.5,mode);$('face-left').value=f.left.toFixed(3)+' P꜀';$('face-right').value=f.right.toFixed(3)+' P꜀';$('face-left-bar').style.width=100*f.left+'%';$('face-right-bar').style.width=100*f.right+'%';$('net-force').textContent=(Math.abs(f.force)<1e-8?'Balanced · 0':(f.force>0?'→ Inward · +':'← Outward · ')+f.force.toFixed(3))+' P꜀A';$('explanation').textContent=explanations[mode];
 drawChart(mode,x);drawFaces(f);world.render();}
function drawChart(mode,probeX){const points=[];for(let i=0;i<=200;i++){const x=-3.5+i*7/200;points.push((35+i*3.65).toFixed(1)+','+(125-gapState([x,0,0],mode).q*95).toFixed(1));}const sourceMarks=centers.map(x=>'<line x1="'+(35+(x+3.5)*730/7)+'" x2="'+(35+(x+3.5)*730/7)+'" y1="18" y2="128" stroke="#203c3633" stroke-dasharray="4 4"/>').join('');$('pressure-chart').innerHTML='<line x1="35" x2="765" y1="30" y2="30" stroke="#203c3622"/><text x="0" y="34" fill="#586961" font-size="12">1.0</text><text x="0" y="129" fill="#586961" font-size="12">0.0</text>'+sourceMarks+'<polyline points="'+points.join(' ')+'" fill="none" stroke="#a66a2e" stroke-width="3"/><circle cx="'+(35+(probeX+3.5)*730/7)+'" cy="'+(125-gapState([probeX,0,0],mode).q*95)+'" r="6" fill="#203c36"/>' ;}
function drawFaces({left,right}){const l=left*150,r=right*150;$('face-diagram').innerHTML='<rect x="211" y="42" width="78" height="78" rx="6" fill="#e6e4d6" stroke="#203c36"/><text x="250" y="88" text-anchor="middle" fill="#203c36" font-size="15">left core</text><path d="M '+(201-l)+' 82 H 201 l -13 -7 m 13 7 l -13 7 M '+(299+r)+' 82 H 299 l 13 -7 m -13 7 l 13 7" fill="none" stroke="#a66a2e" stroke-width="4"/><text x="120" y="138" text-anchor="middle" font-size="13" fill="#586961">outer face</text><text x="380" y="138" text-anchor="middle" font-size="13" fill="#586961">gap face</text>';}
for(const id of ['pair','gap-count','layer','slice','probe'])$(id).addEventListener('input',rebuild);rebuild();
