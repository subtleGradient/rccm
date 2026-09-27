import '@fontsource-variable/inter';
import './style.css';
import { defaults, presets, sample, splitMatrix, cellCentre, cellIndex, clamp } from './fields.js';
import {InductionUI} from './induction-ui.js';
import { TankView } from './tank.js';

const state=defaults();state.readout=!matchMedia('(prefers-reduced-motion: reduce)').matches;
const $=id=>document.getElementById(id);
const range=(id,label,min,max,step,value,unit='')=>`<label class="range-label" for="${id}"><span>${label}</span><output id="${id}-value">${value}${unit}</output></label><input name="${id}" id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${value}">`;
const toggle=(id,label,checked=true)=>`<label class="toggle-row" for="${id}"><span>${label}</span><input id="${id}" name="${id}" type="checkbox" ${checked?'checked':''}></label>`;
$('app').innerHTML=`
<header class="app-header"><a class="brand" href="/" aria-label="Homepage"><span class="brand-mark">τ</span><span>Tau Tank</span></a><span class="header-divider"></span><span class="studio-label">Field studio</span><div class="header-spacer"></div><div class="frozen-label"><span class="pause-symbol">Ⅱ</span> State frozen</div><button type="button" id="readout" class="button readout-button">Pause readout</button><button type="button" class="button quiet" id="help">How to read</button></header>
<main class="workspace">
<aside class="sidebar left" id="layers-panel" aria-label="Field and appearance controls">
 <div class="section-heading"><h2>The medium</h2><button type="button" class="button mobile-close" data-close-panel>Close</button><span class="mono desktop-only">01</span></div>
 <div class="layer-intro">One continuous volume.<br>Many ways to see it.</div>
 <div class="layer-list">
  <label class="layer" for="flow"><span class="layer-symbol flow-symbol">↝</span><span><strong>Longitudinal</strong><small>Compression & drift</small></span><input id="flow" name="flow" type="checkbox" checked></label>
  <label class="layer" for="slip"><span class="layer-symbol slip-symbol">⇢</span><span><strong>Transverse slip</strong><small>Directional electric strain</small></span><input id="slip" name="slip" type="checkbox" checked></label>
  <label class="layer" for="spin"><span class="layer-symbol spin-symbol">⟳</span><span><strong>Vorticity</strong><small>Oriented magnetic twist</small></span><input id="spin" name="spin" type="checkbox" checked></label>
 </div>
 <section class="control-section"><div class="section-heading"><h3>Visibility</h3><span class="quiet-label">Display only</span></div>
 ${range('opacity','Medium presence',0,100,1,36,'%')}
 ${range('grain','Field markers',0,500,1,65,'%')}
 ${range('grid','Voxel edges',0,100,1,28,'%')}
 <label class="select-label" for="resolution">Voxel resolution<select id="resolution" name="resolution"><option value="8">8 × 8 × 8</option><option value="12" selected>12 × 12 × 12</option><option value="18">18 × 18 × 18</option><option value="24">24 × 24 × 24</option></select></label>
 </section>
 <section class="control-section">${toggle('slice','Focus slab',false)}<div id="slice-control" hidden>${range('sliceZ','Depth through tank',-1.8,1.8,.05,0)}</div></section>
 <section class="control-section"><div class="section-heading"><h3>Cavities</h3><span class="mono" id="source-count">03</span></div><div id="source-list"></div><div class="add-row"><select id="new-shape" name="new-shape" aria-label="New cavity shape"><option value="sphere">Bubble</option><option value="brick">Brick</option><option value="coin">Penny</option><option value="magnet">Bar magnet</option></select><button type="button" class="button" id="add-source">＋ Add</button></div></section>
 <p class="aside-note">Objects are cavities in the medium. Drag one to reshape the sampled field.</p>
</aside>
<section class="studio" aria-label="Three-dimensional tau tank">
 <div class="view-header"><div><div class="eyebrow">Observation volume</div><h1 id="scene-title">Dipole study</h1></div><div class="view-actions"><button type="button" class="button mobile-toggle" data-panel="layers-panel">Layers</button><button type="button" class="button" id="home">Home view</button><button type="button" class="button" id="orbit" aria-pressed="false">Orbit</button><button type="button" class="button mobile-toggle" data-panel="inspector-panel">Inspect</button></div></div>
 <div class="lens-strip" role="group" aria-label="Field lens"><button type="button" data-lens="combined" aria-pressed="true">Composite</button><button type="button" data-lens="capacity">Capacity</button><button type="button" data-lens="pressure">Pressure</button><button type="button" data-lens="slip">Slip</button><button type="button" data-lens="spin">Twist</button></div>
 <div id="stage"><canvas id="tank" aria-label="Rotatable continuous tau-fluid volume with animated field markers and empty cavities"></canvas><div id="cavity-labels"></div><div id="error" role="alert" hidden></div><div class="stage-hint" id="stage-hint">Drag to orbit · scroll to zoom · click to sample</div><div class="stage-scale"><span></span> 1 m</div><div class="axis-key"><span class="ax-x">x</span><span class="ax-y">y</span><span class="ax-z">z</span></div></div>
 <div class="scene-foot"><div class="field-legend" id="field-legend"><span><i class="swatch capacity"></i>Capacity</span><span><i class="swatch positive"></i>＋</span><span><i class="swatch negative"></i>−</span><span><i class="swatch twist"></i>Twist</span></div><div class="mono render-status" id="render-status">1,728 voxels</div></div>
 <div class="presets" role="group" aria-label="Authored scenes">${[['dipole','01','Dipole','Opposite charge'],['repel','02','Repulsion','Matching charge'],['vortex','03','Vortex','Magnetic twist'],['pressure','04','Compression','Capacity gradient'],['mixed','05','Mixed field','All channels']].map(([id,no,title,sub])=>`<button type="button" class="preset" data-preset="${id}" aria-pressed="${id==='dipole'}"><span class="preset-number">${no}</span><span><strong>${title}</strong><small>${sub}</small></span></button>`).join('')}</div>
</section>
<aside class="sidebar right" id="inspector-panel" aria-label="Selected voxel and cavity inspector">
 <div class="section-heading"><h2>Local state</h2><button type="button" class="button mobile-close" data-close-panel>Close</button><span class="sample-indicator desktop-only">Sample</span></div>
 <div class="inspector-tabs" role="group" aria-label="Inspector"><button type="button" data-inspector="voxel" aria-pressed="true">Voxel</button><button type="button" data-inspector="cavity">Cavity</button></div>
 <div id="voxel-inspector">
 <div class="probe-heading"><strong id="voxel-index">[7, 6, 6]</strong><span class="mono" id="probe-position"></span></div>
 <div class="matrix-heading"><span>Asymmetric tensor <em>Û</em></span><div class="matrix-switch" role="group" aria-label="Tensor part"><button type="button" data-part="U" aria-pressed="true">U</button><button type="button" data-part="S">S</button><button type="button" data-part="A">A</button></div></div>
 <div class="matrix" id="matrix" aria-label="Four by four local tensor"></div>
 <div id="matrix-detail" class="matrix-detail">Capacity on the diagonal. Slip & twist in the signed pairs.</div>
 <div class="readings"><div><span>Remaining capacity</span><strong id="q-value"></strong><small>q = Pstatic / Pc</small></div><div><span>Spatial weight</span><strong id="packing-value"></strong><small>1 / q</small></div></div>
 <section class="control-section"><div class="section-heading"><h3>Pressure budget</h3><span class="mono">Pc = 1</span></div><div class="budget-bar" id="budget-bar" role="img" aria-label="Pressure budget partitions"></div><dl class="ledger" id="ledger"></dl><div class="ledger-ambient"><span>Ambient capacity</span><strong id="ambient-value"></strong></div></section>
 <section class="control-section"><div class="section-heading"><h3>Vector readings</h3><span class="mono">x · y · z</span></div><dl class="vectors" id="vectors"></dl></section>
 </div>
 <div id="cavity-inspector" hidden><div class="cavity-heading"><h3 id="cavity-name">Positive cavity</h3><span id="cavity-shape" class="quiet-label">Spherical boundary</span></div>${range('charge','Net charge',-2,2,.1,1)}${range('mass','Mass loading',0,3,.1,.7)}${range('moment','Magnetic moment',0,2,.1,0)}${range('angle','Orientation',-180,180,5,0,'°')}<div class="position-controls" id="position-controls"></div><button type="button" class="button quiet" id="remove-source">Remove cavity</button></div>
 <details class="state-controls"><summary>State palette</summary><div class="state-controls-inner">${range('ambient','Background capacity',.55,1,.01,.9)}${range('compression','Longitudinal gain',0,2,.05,.7)}${range('slipGain','Slip gain',0,2,.05,1)}${range('spinGain','Twist gain',0,2,.05,1)}${range('alpha','Modulus ratio α',0,1,.01,.55)}${range('tempo','Readout speed',.2,2,.1,1)}</div></details>
 <div class="mode-note"><span class="mono">Visual sandbox</span><p>Authored fields. Readout motion continues while the state is frozen.</p></div>
</aside>
</main>
<dialog id="guide"><div class="guide-heading"><h2>Read the medium</h2><button type="button" class="button" id="close-guide">Close</button></div><p>The volume is continuous. Its cells are samples, and objects are empty boundaries within it.</p><dl><dt>Capacity</dt><dd>Translucency follows ambient capacity. The presence control changes visual clarity only.</dd><dt>Pressure</dt><dd>Gold marks show loaded regions. The selected voxel's budget separates static capacity, background load, dynamic load and structural shear.</dd><dt>Slip & twist</dt><dd>Small tapered trails reveal transverse direction. Orbiting beads circle each local vorticity axis. Brightness and trail length show relative strength.</dd><dt>Frozen state, living readout</dt><dd>The animation is a field glyph, not matter flowing or a prediction of motion. Pause readout stops the visual cues independently.</dd><dt>Inspect & arrange</dt><dd>Click the tank to sample a cell on the current depth plane. Drag a cavity to move it, or edit its position in the inspector. Use the focus slab to look deeper.</dd></dl><p class="guide-source">Tensor and ledger: RCCM-GfX-2, sections 2–3. Seven independent tensor readings. Normalized display units: c = 1, Pc = 1, tp = 0.55.</p></dialog>
<div class="sr-only" id="announcement" aria-live="polite"></div>`;
let view,induction,part='U',inspector='voxel';
const f=(x,d=2)=>Math.abs(x)<.0005?'0.00':x.toFixed(d).replace('-','−');
function announce(text){$('announcement').textContent=text;}
function syncSources(){
 $('source-count').textContent=String(state.sources.length).padStart(2,'0');
 $('source-list').innerHTML=state.sources.map((s,i)=>`<button type="button" class="source-row" data-source="${i}" aria-pressed="${state.selected===i}"><span class="source-dot ${s.charge>0?'positive':s.charge<0?'negative':'neutral'}">${s.charge>0?'+':s.charge<0?'−':'○'}</span><span>${s.name}</span><span class="source-shape">${s.shape==='sphere'?'bubble':s.shape}</span></button>`).join('');
 document.querySelectorAll('[data-source]').forEach(b=>b.addEventListener('click',()=>{state.selected=+b.dataset.source;setInspector('cavity');syncSources();syncCavity();view.selectSource();}));
 $('add-source').disabled=state.sources.length>=6;
 syncCavity();
}
function syncCavity(){
 const s=state.sources[state.selected];if(!s)return;
 $('cavity-name').textContent=s.name;$('cavity-shape').textContent=s.shape==='sphere'?'Spherical boundary':s.shape+' boundary';
 for(const k of ['charge','mass','moment','angle']){$(k).value=s[k];$(k+'-value').textContent=f(s[k],k==='angle'?0:1)+(k==='angle'?'°':'');}
 $('position-controls').innerHTML=['x','y','z'].map((axis,i)=>range('pos-'+axis,axis.toUpperCase()+' position',-1.5,1.5,.05,s.position[i].toFixed(2),' m')).join('');
 ['x','y','z'].forEach((axis,i)=>$('pos-'+axis).addEventListener('input',e=>{s.position[i]=+e.target.value;$('pos-'+axis+'-value').textContent=f(s.position[i])+' m';updateField();}));
 $('remove-source').disabled=state.sources.length<=1;
}
function inspect(){
 const p=cellCentre(state.probe,state.resolution),r=sample(p,state),u=splitMatrix(r.U,part),index=cellIndex(p,state.resolution);
 $('voxel-index').textContent='['+index.join(', ')+']'+(r.inside?' · cavity':'');$('probe-position').textContent=p.map(x=>f(x,1)).join(' / ')+' m';
 const axes=['t','x','y','z'];let h='<span></span>'+axes.map(x=>`<span class="matrix-axis">${x}</span>`).join('');
 const symbols=[['−q','−ex','−ey','−ez'],['ex','1/q','−bz','by'],['ey','bz','1/q','−bx'],['ez','−by','bx','1/q']];
 for(let i=0;i<4;i++){h+=`<span class="matrix-axis">${axes[i]}</span>`;for(let j=0;j<4;j++){const kind=i===j?'diagonal':(i===0||j===0)?'electric':'magnetic';h+=`<button type="button" class="matrix-cell ${kind}" data-slot="${i},${j}" ${r.inside?'disabled':''} aria-label="${part} ${axes[i]} ${axes[j]}: ${f(u[i][j],3)}, ${symbols[i][j]}">${r.inside?'—':f(u[i][j])}</button>`;}}
 $('matrix').innerHTML=h;
 document.querySelectorAll('[data-slot]').forEach(b=>b.addEventListener('click',()=>{const [i,j]=b.dataset.slot.split(',').map(Number);$('matrix-detail').textContent=`${part}${axes[i]}${axes[j]} = ${f(u[i][j],4)} · ${i===j?'scalar capacity':i===0||j===0?'transverse slip · '+symbols[i][j]:'vorticity · '+symbols[i][j]}`;}));
 $('q-value').textContent=r.inside?'—':(r.q*100).toFixed(1)+'%';$('packing-value').textContent=r.inside?'—':(1/r.q).toFixed(2)+'×';$('ambient-value').textContent=r.inside?'—':(r.ambient*100).toFixed(1)+'%';
 if(r.inside){$('budget-bar').innerHTML='';$('ledger').innerHTML='<div>No fluid within this cavity.</div>';$('vectors').innerHTML='';$('matrix-detail').textContent='Empty cavity. Select a voxel in the surrounding medium.';return;}
 $('matrix-detail').textContent=(state.preset==='induction'?'Fixed background · e = E, b = −B. ':'')+'αs = '+f(Math.sqrt(r.q),3)+' · αg = '+f(Math.sqrt(r.ambient),3)+' · αa = '+f(Math.sqrt(r.q/r.ambient),3);
 const budget=[['static','Remaining static',r.q],['macro','Background load',r.macro],['dynamic','Dynamic load',r.dynamic],['shear','Structural shear',r.shear]];
 $('budget-bar').innerHTML=budget.map(([k,label,value])=>`<span class="${k}" style="--portion:${value*100}%" title="${label}: ${(value*100).toFixed(1)}%"></span>`).join('');
 $('ledger').innerHTML=budget.map(([k,label,value])=>`<div><dt><i class="swatch ${k}"></i>${label}</dt><dd>${(value*100).toFixed(1)}%</dd></div>`).join('');
 $('vectors').innerHTML=[['v∥ / c',r.longitudinal],['v⊥ / c',r.slip],['tp Ω',r.omega.map(x=>x*state.tp)],['e = α v⊥/c',r.e],['b = α tp Ω',r.b]].map(([k,v])=>`<div><dt>${k}</dt><dd>${v.map(x=>f(x)).join(' · ')}</dd></div>`).join('');
}
function setInspector(which){inspector=which;$('voxel-inspector').hidden=which!=='voxel';$('cavity-inspector').hidden=which!=='cavity';document.querySelectorAll('[data-inspector]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.inspector===which)));}
function updateField(){view?.rebuild();inspect();}
function syncDisplay(){
 for(const k of ['opacity','grain','grid']){$(k).value=Math.round(state[k]*100);$(k+'-value').textContent=Math.round(state[k]*100)+'%';}
 $('readout').textContent=state.readout?'Pause readout':'Play readout';
 $('resolution').value=state.resolution;
 for(const k of ['flow','slip','spin'])$(k).checked=state.layers[k];
 for(const [id,k] of [['ambient','ambient'],['compression','compression'],['slipGain','slip'],['spinGain','spin'],['alpha','alpha'],['tempo','tempo']]){$(id).value=state[k];$(id+'-value').textContent=f(state[k]);}
}
try{view=new TankView($('tank'),$('cavity-labels'),state,{
 onProbe:p=>{state.probe=p;setInspector('voxel');inspect();},
 onSelect:i=>{state.selected=i;if(state.preset==='induction'){induction?.selectInspector();return;}setInspector('cavity');syncSources();},
 onFrame:dt=>induction?.frame(dt),
 canMove:()=>induction?.canMove(),
 onMagnetTarget:p=>induction?.target(p),
 onMove:()=>{syncCavity();inspect();},
 onStats:fps=>{$('render-status').textContent=(state.resolution**3).toLocaleString()+' voxels · '+(state.readout?fps+' fps':'readout paused');}
});}catch(error){$('error').hidden=false;$('error').textContent='The 3D view could not start. This toy needs WebGL 2. '+error.message;console.error(error);}
for(const k of ['opacity','grain','grid'])$(k).addEventListener('input',e=>{state[k]=+e.target.value/100;$(k+'-value').textContent=e.target.value+'%';view?.sync();});
for(const k of ['flow','slip','spin'])$(k).addEventListener('change',e=>{state.layers[k]=e.target.checked;view?.sync();});
for(const [id,k] of [['ambient','ambient'],['compression','compression'],['slipGain','slip'],['spinGain','spin'],['alpha','alpha'],['tempo','tempo']])$(id).addEventListener('input',e=>{state[k]=+e.target.value;$(id+'-value').textContent=f(state[k]);if(k!=='tempo')updateField();});
$('resolution').addEventListener('change',e=>{state.resolution=+e.target.value;updateField();announce(state.resolution+' cells per axis');});
$('slice').addEventListener('change',e=>{state.slice=e.target.checked;$('slice-control').hidden=!state.slice;view?.sync();});
$('sliceZ').addEventListener('input',e=>{state.sliceZ=+e.target.value;$('sliceZ-value').textContent=f(state.sliceZ);state.probe[2]=state.sliceZ;inspect();view?.sync();});
$('readout').addEventListener('click',()=>{state.readout=!state.readout;syncDisplay();view.dirty=true;announce(state.readout?'Visual readout running.':'Visual readout paused.');});
$('home').addEventListener('click',()=>view?.home());
$('orbit').addEventListener('click',e=>{state.orbit=!state.orbit;e.target.setAttribute('aria-pressed',String(state.orbit));});
const titles={dipole:'Dipole study',repel:'Repulsion study',vortex:'Vortex study',pressure:'Compression study',mixed:'Mixed field'};
for(const b of document.querySelectorAll('[data-preset]'))b.addEventListener('click',()=>{state.preset=b.dataset.preset;state.sources=presets[state.preset]();state.selected=0;state.spin=state.preset==='vortex'?1.7:1;state.compression=state.preset==='pressure'?1.5:.7;state.slip=1;$('scene-title').textContent=titles[state.preset];document.querySelectorAll('[data-preset]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));syncSources();syncDisplay();updateField();announce(titles[state.preset]);});
for(const b of document.querySelectorAll('[data-lens]'))b.addEventListener('click',()=>{state.lens=b.dataset.lens;document.querySelectorAll('[data-lens]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));const legends={combined:'Capacity · yellow + / blue − · lavender twist',capacity:'Higher ambient capacity → greater opacity',pressure:'Gold → greater total pressure load',slip:'Tapered trails → transverse strain e = α v⊥/c',spin:'Orbit → rotational sense · intensity → twist b = α tp Ω'};$('field-legend').textContent=legends[state.lens];view?.sync();});
for(const b of document.querySelectorAll('[data-inspector]'))b.addEventListener('click',()=>setInspector(b.dataset.inspector));
for(const b of document.querySelectorAll('[data-part]'))b.addEventListener('click',()=>{part=b.dataset.part;document.querySelectorAll('[data-part]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));inspect();});
for(const k of ['charge','mass','moment','angle'])$(k).addEventListener('input',e=>{const s=state.sources[state.selected];if(!s)return;s[k]=+e.target.value;if(k==='charge'){s.name=s.charge>.05?'Positive cavity':s.charge<-.05?'Negative cavity':s.moment>.1?'Magnetic cavity':'Neutral cavity';$('cavity-name').textContent=s.name;const row=document.querySelector('[data-source="'+state.selected+'"]');if(row){row.children[0].textContent=s.charge>0?'+':s.charge<0?'−':'○';row.children[0].className='source-dot '+(s.charge>0?'positive':s.charge<0?'negative':'neutral');row.children[1].textContent=s.name;}}$(k+'-value').textContent=f(s[k],k==='angle'?0:1)+(k==='angle'?'°':'');updateField();});
$('add-source').addEventListener('click',()=>{if(state.sources.length>=6)return;const shape=$('new-shape').value;const sizes={sphere:[.28,.28,.28],brick:[.4,.25,.27],coin:[.3,.08,.3],magnet:[.45,.14,.16]};state.sources.push({id:'cavity-'+Date.now(),name:'Cavity '+(state.sources.length+1),shape,size:sizes[shape],position:[0,-.9,.8],mass:.6,charge:0,moment:shape==='magnet'?1:0,angle:0});state.selected=state.sources.length-1;setInspector('cavity');syncSources();updateField();});
$('remove-source').addEventListener('click',()=>{if(state.sources.length<=1)return;state.sources.splice(state.selected,1);state.selected=0;syncSources();updateField();});
$('help').addEventListener('click',()=>$('guide').showModal());$('close-guide').addEventListener('click',()=>$('guide').close());
for(const b of document.querySelectorAll('[data-panel]'))b.addEventListener('click',()=>{const p=$(b.dataset.panel);const open=p.classList.contains('drawer-open');document.querySelectorAll('.sidebar').forEach(x=>x.classList.remove('drawer-open'));if(!open)p.classList.add('drawer-open');b.setAttribute('aria-expanded',String(!open));});
syncSources();syncDisplay();inspect();

function closePanels(){document.querySelectorAll('.sidebar').forEach(p=>p.classList.remove('drawer-open'));document.querySelectorAll('[data-panel]').forEach(b=>b.setAttribute('aria-expanded','false'));}
for(const b of document.querySelectorAll('[data-close-panel]'))b.addEventListener('click',closePanels);
document.addEventListener('keydown',e=>{if(e.key==='Escape')closePanels();});

if(view){induction=new InductionUI(state,view,{syncDisplay,inspect,setInspector});induction.activate();}
