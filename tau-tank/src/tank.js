import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {InductionVisuals} from './induction-view.js';
import {coilBasis,rotate} from './induction.js';
import {sample,unit,cross,norm,clamp,cellCentre,cavityDistance} from './fields.js';
const COLORS={flow:0xcee6d7,slip:0xefcf83,spin:0xbaaceb};
export const common=`
 uniform int uCount; uniform vec3 uPositions[6]; uniform vec3 uSizes[6]; uniform vec4 uRotations[6]; uniform float uInduction; uniform float uClosed; uniform float uKinds[6];
 uniform float uSlice; uniform float uSliceZ;
 float seg(vec3 p,vec3 a,vec3 b){vec3 d=b-a;return length(p-a-d*clamp(dot(p-a,d)/dot(d,d),0.,1.))-.025;}
 float boxS(vec3 p,vec3 b){vec3 d=abs(p)-b;return length(max(d,0.))+min(max(d.x,max(d.y,d.z)),0.);}
 float rig(vec3 p){float d=10.;for(int i=0;i<5;i++){float x=-.12+float(i)*.06;d=min(d,length(vec2(p.x-x,length(p.yz)-.72))-.032);}
 d=min(d,length(p-vec3(1.05,-1.14,0.))-.29);d=min(d,boxS(p-vec3(0.,-1.83,0.),vec3(1.48,.065,.24)));d=min(d,boxS(p-vec3(0.,-1.28,0.),vec3(.055,.5,.055)));
 for(int i=0;i<2;i++){float z=i==0?-.06:.06;float x=i==0?1.01:1.09;d=min(d,seg(p,vec3(0.,-.72,z),vec3(.48,-1.52,z)));if(i==1&&uClosed<.5){d=min(d,seg(p,vec3(.48,-1.52,z),vec3(.68,-1.52,z)));d=min(d,seg(p,vec3(.68,-1.52,z),vec3(.819,-1.362,z)));d=min(d,seg(p,vec3(.89,-1.52,z),vec3(x,-1.52,z)));}else d=min(d,seg(p,vec3(.48,-1.52,z),vec3(x,-1.52,z)));d=min(d,seg(p,vec3(x,-1.52,z),vec3(x,-1.24,0.)));}return d;}
 float cavity(vec3 p){float d=10.;for(int i=0;i<6;i++){if(i>=uCount)break;vec3 a=p-uPositions[i];vec4 qrot=uRotations[i];vec3 qr=-qrot.xyz;a+=2.*cross(qr,cross(qr,a)+qrot.w*a);vec3 q=abs(a)-uSizes[i];float box=length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.);float sphere=length(a)-uSizes[i].x;vec2 cy=vec2(length(a.xz)-uSizes[i].x,abs(a.y)-uSizes[i].y);float coin=length(max(cy,0.))+min(max(cy.x,cy.y),0.);d=min(d,uKinds[i]>1.5?coin:mix(box,sphere,uKinds[i]));}if(uInduction>.5)d=min(d,rig(p));return d;}
 float focus(vec3 p){return mix(1.,mix(.055,1.,1.-smoothstep(.22,.45,abs(p.z-uSliceZ))),uSlice);}
`;
const volumeVertex=`varying vec3 vOrigin;varying vec3 vDirection;void main(){vOrigin=(inverse(modelMatrix)*vec4(cameraPosition,1.)).xyz;vDirection=position-vOrigin;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const volumeFragment=`precision highp sampler3D;uniform sampler3D uData;uniform float uPresence;uniform float uResolution;uniform float uLens;uniform float uGrid;varying vec3 vOrigin;varying vec3 vDirection;${common}
 vec2 hitBox(vec3 o,vec3 d){vec3 inv=1./d;vec3 a=(-vec3(2.)-o)*inv;vec3 b=(vec3(2.)-o)*inv;vec3 lo=min(a,b),hi=max(a,b);return vec2(max(lo.x,max(lo.y,lo.z)),min(hi.x,min(hi.y,hi.z)));}
 void main(){vec3 dir=normalize(vDirection);vec2 bounds=hitBox(vOrigin,dir);float start=max(bounds.x,0.);if(bounds.y<=start)discard;float stepSize=(bounds.y-start)/72.;vec4 accum=vec4(0.);float jitter=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453);for(int i=0;i<72;i++){vec3 p=vOrigin+dir*(start+(float(i)+jitter)*stepSize);float d=cavity(p);if(d<0.)continue;vec4 v=texture(uData,(p+2.)*.25);float ambient=v.r;float q=v.g;float load=1.-q;float signCharge=v.a;vec3 mint=vec3(.49,.79,.63);vec3 gold=vec3(1.,.70,.24);vec3 blue=vec3(.30,.64,1.);vec3 purple=vec3(.70,.53,.97);vec3 col=mint;
 if(uLens<.5){col=mix(mint,signCharge>0.?gold:blue,min(abs(signCharge)*.8,.7));}
 else if(uLens<1.5){col=mix(vec3(.19,.42,.37),vec3(.70,.93,.77),ambient);}
 else if(uLens<2.5){col=mix(vec3(.26,.48,.38),gold,clamp(load*1.4,0.,1.));}
 else if(uLens<3.5){col=mix(vec3(.29,.56,.48),signCharge>0.?gold:blue,clamp(v.b*2.,0.,1.));}
 else{col=mix(vec3(.23,.37,.39),purple,clamp(v.b*1.7,0.,1.));}
 vec3 f=abs(fract((p+2.)*.25*uResolution)-.5);vec3 edge=smoothstep(vec3(.47),vec3(.5),f);float line=max(min(edge.x,edge.y),max(min(edge.x,edge.z),min(edge.y,edge.z)));
 float density=(.08+.22*ambient*ambient)*uPresence;float a=(1.-exp(-density*stepSize))*focus(p);float edgeAlpha=1.-exp(-line*uGrid*8.*stepSize*focus(p));col*=.85+.15*(p.y+2.)*.25;accum.rgb+=(1.-accum.a)*col*a;accum.a+=(1.-accum.a)*a;accum.a+=(1.-accum.a)*edgeAlpha;if(accum.a>.94)break;}gl_FragColor=vec4(accum.rgb/max(accum.a,.00001),accum.a);}
`;
export const particleVertex=`attribute vec3 aDirection;attribute float aStrength;attribute float aSeed;uniform float uTime;uniform float uCell;uniform float uKind;uniform float uPixelRatio;uniform float uGain;varying float vAlpha;varying float vAngle;varying vec3 vWorld;${common}
 void main(){vec3 d=aDirection;float t=fract(uTime*(.16+.24*min(aStrength,1.))+aSeed);vec3 p=position;vec3 tangent=d;if(uKind>1.5){vec3 ref=abs(d.y)>.88?vec3(1.,0.,0.):vec3(0.,1.,0.);vec3 a=normalize(cross(d,ref)),b=cross(d,a);float angle=uTime*(.8+min(aStrength,2.))+aSeed*6.283185;p+=uCell*.28*(a*cos(angle)+b*sin(angle));tangent=-a*sin(angle)+b*cos(angle);}else{p+=d*(t-.5)*uCell*.83;}
 vWorld=p;vec4 mv=modelViewMatrix*vec4(p,1.);vec4 dirView=modelViewMatrix*vec4(tangent,0.);vAngle=atan(dirView.y,dirView.x);float fade=uKind>1.5?1.:smoothstep(0.,.16,t)*(1.-smoothstep(.84,1.,t));vAlpha=step(.000005,aStrength)*(.025+.85*pow(min(aStrength*2.,1.),.75))*fade*uGain*focus(p);if(cavity(p)<.02)vAlpha=0.;gl_Position=projectionMatrix*mv;gl_PointSize=(uKind>1.5?3.4:uKind>.5?7.5:4.6)*uPixelRatio;}
`;
export const particleFragment=`uniform vec3 uColor;uniform float uKind;varying float vAlpha;varying float vAngle;varying vec3 vWorld;
 void main(){vec2 p=gl_PointCoord-.5;float c=cos(vAngle),s=sin(vAngle);vec2 q=mat2(c,-s,s,c)*vec2(p.x,-p.y);float alpha;if(uKind>1.5){float d=length(p);alpha=(1.-smoothstep(.16,.44,d));}else{float taper=mix(.035,.13,smoothstep(-.42,.25,q.x));alpha=(1.-smoothstep(taper,taper+.13,abs(q.y)))*(1.-smoothstep(.38,.5,abs(q.x)));alpha*=smoothstep(-.5,.22,q.x);}
 gl_FragColor=vec4(uColor,alpha*clamp(vAlpha,0.,1.));}
`;
const lineVertex=`varying vec3 vWorld;void main(){vWorld=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const lineFragment=`uniform vec3 uColor;uniform float uGain;varying vec3 vWorld;${common}void main(){gl_FragColor=vec4(uColor,clamp(uGain,0.,1.)*focus(vWorld));}`;
export const bubbleVertex=`varying vec3 vNormal;varying vec3 vView;void main(){vec4 w=modelMatrix*vec4(position,1.);vNormal=normalize(mat3(modelMatrix)*normal);vView=cameraPosition-w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`;
export const bubbleFragment=`uniform vec3 uColor;uniform float uSelected;varying vec3 vNormal;varying vec3 vView;void main(){vec3 n=normalize(vNormal);float facing=abs(dot(n,normalize(vView)));float rim=pow(1.-facing,3.);float glint=pow(max(dot(n,normalize(vec3(-1.,2.,2.))),0.),45.);float a=.008+rim*(.55+uSelected*.25)+glint*.3;vec3 col=mix(uColor,vec3(.96,1.,.94),clamp(glint+rim*.5,0.,1.));gl_FragColor=vec4(col,a);}`;

export class TankView{
 constructor(canvas,labelRoot,state,callbacks){
  this.canvas=canvas;this.labels=labelRoot;this.state=state;this.callbacks=callbacks;this.time=0;this.last=performance.now();this.frames=0;this.statsAt=this.last;this.bodies=[];this.particles={};
  this.renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
  this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.2));this.renderer.setClearColor(0x000000,0);this.renderer.outputColorSpace=THREE.SRGBColorSpace;
  this.scene=new THREE.Scene();this.camera=new THREE.PerspectiveCamera(34,1,.05,80);this.home();
  this.controls=new OrbitControls(this.camera,canvas);this.controls.enableDamping=true;this.controls.dampingFactor=.075;this.controls.minDistance=5.9;this.controls.maxDistance=20;this.controls.maxPolarAngle=Math.PI*.84;this.controls.enablePan=false;this.controls.autoRotateSpeed=.42;this.dirty=true;this.controls.addEventListener('change',()=>this.dirty=true);
  this.uniforms={uCount:{value:0},uPositions:{value:Array.from({length:6},()=>new THREE.Vector3())},uSizes:{value:Array.from({length:6},()=>new THREE.Vector3())},uRotations:{value:Array.from({length:6},()=>new THREE.Vector4(0,0,0,1))},uInduction:{value:0},uClosed:{value:1},uKinds:{value:new Float32Array(6)},uSlice:{value:0},uSliceZ:{value:0}};
  this.volumeMaterial=new THREE.ShaderMaterial({uniforms:{...this.uniforms,uData:{value:null},uPresence:{value:state.opacity},uResolution:{value:state.resolution},uLens:{value:0},uGrid:{value:state.grid}},vertexShader:volumeVertex,fragmentShader:volumeFragment,side:THREE.BackSide,transparent:true,depthWrite:false});
  this.volume=new THREE.Mesh(new THREE.BoxGeometry(4,4,4),this.volumeMaterial);this.volume.renderOrder=2;this.scene.add(this.volume);
  this.fieldGroup=new THREE.Group();this.scene.add(this.fieldGroup);this.bodyGroup=new THREE.Group();this.scene.add(this.bodyGroup);
  this.selection=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1,1,1)),new THREE.LineBasicMaterial({color:0xd1edce,transparent:true,opacity:.52,depthWrite:false}));this.selection.renderOrder=5;this.scene.add(this.selection);
  this.buildFrame();this.makeFloor();this.installPointer();this.rebuild();
  this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(canvas.parentElement);this.resize();
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();document.getElementById('error').hidden=false;document.getElementById('error').textContent='The graphics context was interrupted. Reload to restore the tank.';});
  this.renderer.setAnimationLoop(()=>this.frame());
 }
 home(){this.camera.position.set(5.8,4.3,7.4);this.camera.lookAt(0,0,0);if(this.controls){this.controls.target.set(0,0,0);this.controls.update();}}
 resize(){const r=this.canvas.parentElement.getBoundingClientRect();this.renderer.setSize(r.width,r.height,false);this.camera.aspect=r.width/r.height;this.camera.fov=THREE.MathUtils.radToDeg(2*Math.atan(Math.tan(THREE.MathUtils.degToRad(34)/2)*Math.max(1,1.12/this.camera.aspect)));this.camera.updateProjectionMatrix();this.dirty=true;}
 buildFrame(){
  const box=new THREE.BoxGeometry(4.018,4.018,4.018),edge=new THREE.EdgesGeometry(box);box.dispose();this.frameLines=new THREE.LineSegments(edge,new THREE.LineBasicMaterial({color:0xadd2b7,transparent:true,opacity:.38,depthWrite:false}));this.frameLines.renderOrder=6;this.scene.add(this.frameLines);
  const p=[];for(const x of [-2,2])for(const y of [-2,2])for(const z of [-2,2])for(let a=0;a<3;a++){const from=[x,y,z],to=[x,y,z];to[a]-=Math.sign(to[a])*.16;p.push(...from,...to);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));this.scene.add(new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:0xc6dfbd,transparent:true,opacity:.65})));
 }
 makeFloor(){
  const grid=new THREE.GridHelper(16,48,0x718c73,0x57725c);grid.position.y=-2.2;grid.material.transparent=true;grid.material.opacity=.09;grid.material.depthWrite=false;this.scene.add(grid);
  const geo=new THREE.PlaneGeometry(11,11);const mat=new THREE.ShaderMaterial({vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 vUv;void main(){float d=length((vUv-.5)*2.);float a=(1.-smoothstep(.15,.75,d))*.25;gl_FragColor=vec4(.015,.045,.023,a);}',transparent:true,depthWrite:false});
  const shadow=new THREE.Mesh(geo,mat);shadow.rotation.x=-Math.PI/2;shadow.position.y=-2.19;this.scene.add(shadow);
 }
 disposeGroup(group){for(const obj of [...group.children]){group.remove(obj);obj.traverse(o=>{o.geometry?.dispose();if(Array.isArray(o.material))o.material.forEach(m=>m.dispose());else o.material?.dispose();});}}
 rebuild(){
  this.inductionVisuals?.dispose();this.inductionVisuals=null;
  this.uniforms.uInduction.value=this.state.preset==='induction'?1:0;
  if(this.state.preset==='induction')this.state.coilCache=new Map();
  const s=this.state,n=s.resolution,h=4/n,data=new Float32Array(n*n*n*4);this.samples=[];
  for(let z=0;z<n;z++)for(let y=0;y<n;y++)for(let x=0;x<n;x++){
   const p=[-2+(x+.5)*h,-2+(y+.5)*h,-2+(z+.5)*h],r=(s.preset==='induction'&&(s.coilCache.set(p.join(','),coilBasis(p))),sample(p,s,true)),i=x+n*(y+n*z),m=norm(r.b)*2;
   data[i*4]=r.ambient;data[i*4+1]=r.q;data[i*4+2]=s.lens==='spin'?m:norm(r.e)*2;data[i*4+3]=r.charge;this.samples.push({p,r,x,y,z});
  }
  this.texture?.dispose();this.texture=new THREE.Data3DTexture(data,n,n,n);this.texture.format=THREE.RGBAFormat;this.texture.type=THREE.FloatType;this.texture.minFilter=THREE.NearestFilter;this.texture.magFilter=THREE.NearestFilter;this.texture.unpackAlignment=1;this.texture.needsUpdate=true;this.volumeMaterial.uniforms.uData.value=this.texture;this.volumeMaterial.uniforms.uResolution.value=n;
  this.disposeGroup(this.fieldGroup);this.particles={};this.twistRings=null;this.streamlines=null;
  if(s.preset==='induction'){
   this.makeSurfaceGrid(n);this.makeBodies();this.inductionVisuals=new InductionVisuals(this,{common,particleVertex,particleFragment,bubbleVertex,bubbleFragment});this.refreshInduction();this.sync();return;
  }
  const stride=Math.max(1,Math.ceil(n/13));
  for(const [kind,key] of ['flow','slip','spin'].entries()){
   const pos=[],dirs=[],strength=[],seeds=[];
   for(const {p,r,x,y,z} of this.samples){if(x%stride||y%stride||z%stride)continue;if(kind===0&&(x%2||y%2||z%2))continue;if(s.sources.some(b=>cavityDistance(p,b)<h*.48))continue;const v=kind===0?r.longitudinal:kind===1?r.e:r.b,mag=norm(v);if(mag<.006)continue;pos.push(...p);dirs.push(...unit(v));strength.push(mag);seeds.push(((x*73+y*197+z*31+kind*11)%997)/997);}
   const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('aDirection',new THREE.Float32BufferAttribute(dirs,3));geo.setAttribute('aStrength',new THREE.Float32BufferAttribute(strength,1));geo.setAttribute('aSeed',new THREE.Float32BufferAttribute(seeds,1));
   const material=new THREE.ShaderMaterial({uniforms:{...this.uniforms,uTime:{value:this.time},uCell:{value:h},uKind:{value:kind},uPixelRatio:{value:this.renderer.getPixelRatio()},uGain:{value:s.grain},uColor:{value:new THREE.Color(COLORS[key])}},vertexShader:particleVertex,fragmentShader:particleFragment,transparent:true,depthWrite:false,blending:THREE.NormalBlending});
   const points=new THREE.Points(geo,material);points.frustumCulled=false;points.renderOrder=4;this.fieldGroup.add(points);this.particles[key]=points;
  }
  this.makeTwistRings(h,stride);this.makeStreamlines();this.makeSurfaceGrid(n);this.makeBodies();this.sync();
 }
 makeTwistRings(h,stride){
  const verts=[];
  for(const {p,r,x,y,z} of this.samples){if(x%(stride*2)||y%(stride*2)||z%(stride*2)||r.inside||norm(r.b)<.01)continue;const d=unit(r.omega),u=unit(cross(d,Math.abs(d[1])>.9?[1,0,0]:[0,1,0])),v=cross(d,u),at=a=>p.map((x,i)=>x+h*.28*(u[i]*Math.cos(a)+v[i]*Math.sin(a)));
   for(let k=0;k<14;k++)verts.push(...at(k/14*Math.PI*2),...at((k+1)/14*Math.PI*2));verts.push(...p.map((x,i)=>x-d[i]*h*.28),...p.map((x,i)=>x+d[i]*h*.28));
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));const mat=new THREE.ShaderMaterial({uniforms:{...this.uniforms,uColor:{value:new THREE.Color(COLORS.spin)},uGain:{value:.14}},vertexShader:lineVertex,fragmentShader:lineFragment,transparent:true,depthWrite:false});this.twistRings=new THREE.LineSegments(geo,mat);this.twistRings.renderOrder=3;this.fieldGroup.add(this.twistRings);
 }
 makeSurfaceGrid(n){
  const p=[];for(let axis=0;axis<3;axis++)for(const side of [-2.004,2.004])for(let i=1;i<n;i++){const v=-2+4*i/n;for(let a=0;a<2;a++){const b=(axis+1)%3,c=(axis+2)%3,start=[0,0,0],end=[0,0,0];start[axis]=end[axis]=side;start[a?b:c]=end[a?b:c]=v;start[a?c:b]=-2;end[a?c:b]=2;p.push(...start,...end);}}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));this.surfaceGrid=new THREE.LineSegments(geo,new THREE.LineBasicMaterial({color:0x000000,transparent:true,opacity:.1,depthWrite:false}));this.surfaceGrid.renderOrder=3;this.fieldGroup.add(this.surfaceGrid);
 }
 makeStreamlines(){
  const s=this.state,paths=[],verts=[];
  // Authored visual traces follow the sampled slip or vorticity direction.
  const magnetic=s.preset==='vortex';
  for(const src of s.sources){if(!magnetic&&src.charge<=0)continue;const count=magnetic?8:10;
   for(let k=0;k<count;k++){let p;const angle=(k/count)*Math.PI*2;
    if(magnetic){const a=src.angle*Math.PI/180;p=[src.position[0]+.6*Math.cos(a)+Math.cos(angle)*.12,src.position[1]+.6*Math.sin(a)+Math.sin(angle)*.12,src.position[2]+Math.sin(angle)*.18];}
    else p=[src.position[0]+Math.cos(angle)*.36,src.position[1]+Math.sin(angle)*.36,src.position[2]+Math.sin(angle*2)*.14];
    const line=[new THREE.Vector3(...p)];
    for(let j=0;j<140;j++){const r=sample(p,s),dir=unit(magnetic?r.omega:r.slip);if(norm(dir)<.1)break;p=p.map((v,i)=>v+dir[i]*.032);if(p.some(v=>Math.abs(v)>1.99)||s.sources.some(o=>cavityDistance(p,o)<.02))break;line.push(new THREE.Vector3(...p));}
    if(line.length<8)continue;paths.push(line);for(let j=1;j<line.length;j++)verts.push(...line[j-1].toArray(),...line[j].toArray());
   }
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));const mat=new THREE.ShaderMaterial({uniforms:{...this.uniforms,uColor:{value:new THREE.Color(magnetic?COLORS.spin:0xd1dcc0)},uGain:{value:.18}},vertexShader:lineVertex,fragmentShader:lineFragment,transparent:true,depthWrite:false});this.streamlines=new THREE.LineSegments(geo,mat);this.streamlines.renderOrder=3;this.fieldGroup.add(this.streamlines);this.paths=paths;
 }
 makeBodies(){
  this.disposeGroup(this.bodyGroup);this.bodies=[];this.bodyLabels=[];this.poleLabels=[];this.labels.innerHTML='';const s=this.state;this.uniforms.uCount.value=s.sources.length;
  s.sources.forEach((b,i)=>{
   this.uniforms.uPositions.value[i].fromArray(b.position);this.uniforms.uSizes.value[i].fromArray(b.size);this.uniforms.uRotations.value[i].fromArray(b.quaternion||[0,0,Math.sin(b.angle*Math.PI/360),Math.cos(b.angle*Math.PI/360)]);this.uniforms.uKinds.value[i]=b.shape==='sphere'?1:b.shape==='coin'?2:0;
   const geo=b.shape==='sphere'?new THREE.SphereGeometry(b.size[0],40,28):b.shape==='coin'?new THREE.CylinderGeometry(b.size[0],b.size[0],b.size[1]*2,40):new RoundedBoxGeometry(b.size[0]*2,b.size[1]*2,b.size[2]*2,3,.045);
   const color=b.charge>.05?0xf2d898:b.charge<-.05?0x9dcff7:0xc5e6cb;
   const mat=new THREE.ShaderMaterial({vertexShader:bubbleVertex,fragmentShader:bubbleFragment,uniforms:{uColor:{value:new THREE.Color(color)},uSelected:{value:i===s.selected?1:0}},transparent:true,depthWrite:false,side:THREE.DoubleSide});
   const mesh=new THREE.Mesh(geo,mat);mesh.position.fromArray(b.position);if(b.quaternion)mesh.quaternion.fromArray(b.quaternion);else mesh.rotation.z=b.angle*Math.PI/180;mesh.userData.index=i;mesh.renderOrder=5;
   if(s.preset==='induction'){mat.uniforms.uColor.value.set(0xcab5ff);const edges=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(...b.size.map(v=>v*2))),new THREE.LineBasicMaterial({color:0xcab5ff,transparent:true,opacity:.52,depthWrite:false}));mesh.add(edges);}this.bodyGroup.add(mesh);this.bodies.push(mesh);
   const label=document.createElement('div');label.className='cavity-label'+(b.charge<0?' negative':'');const sign=b.charge>.05?'+':b.charge<-.05?'−':b.moment>.1?'⟳':'○';label.innerHTML=`<span class="label-line"></span><span class="label-sign">${sign}</span><span>${b.name}</span>`;this.labels.appendChild(label);this.bodyLabels.push(label);
   if(b.moment>.1){for(const [sign,text] of [[1,'N'],[-1,'S']]){const pole=document.createElement('span');pole.className='pole-label';pole.textContent=text;this.labels.appendChild(pole);this.poleLabels.push({element:pole,body:mesh,offset:new THREE.Vector3(sign*(b.size[0]+.065),0,0)});}}
  });
 }
 selectSource(){this.dirty=true;this.bodies.forEach((b,i)=>b.material.uniforms.uSelected.value=i===this.state.selected?1:0);}
 sync(){this.dirty=true;const s=this.state;this.uniforms.uSlice.value=s.slice?1:0;this.uniforms.uSliceZ.value=s.sliceZ;this.volumeMaterial.uniforms.uPresence.value=s.opacity;this.volumeMaterial.uniforms.uGrid.value=s.grid;const lenses={combined:0,capacity:1,pressure:2,slip:3,spin:4};this.volumeMaterial.uniforms.uLens.value=lenses[s.lens];
  if(this.texture){const data=this.texture.image.data;this.samples.forEach(({r},i)=>data[i*4+2]=s.lens==='spin'?norm(r.b)*2:norm(r.e)*2);this.texture.needsUpdate=true;}
  for(const [k,p] of Object.entries(this.particles)){p.visible=k==='coil'?(s.inductionDisplay?.coil??true):s.layers[k];let lens=s.lens==='combined'?1:s.lens==='pressure'?(k==='flow'?1:.14):s.lens==='slip'?(k==='slip'?1:.08):s.lens==='spin'?(k==='spin'?1:.08):.22;p.material.uniforms.uGain.value=s.grain*lens;}
  if(this.twistRings){this.twistRings.visible=s.layers.spin;this.twistRings.material.uniforms.uGain.value=s.grain*(s.lens==='spin'?.28:s.lens==='combined'?.085:.025);}
  if(this.streamlines){this.streamlines.visible=s.preset==='vortex'?s.layers.spin:s.layers.slip;this.streamlines.material.uniforms.uGain.value=s.grain*(s.lens==='capacity'?.06:.19);}
  if(this.surfaceGrid)this.surfaceGrid.material.opacity=s.grid*.8;
  this.inductionVisuals?.sync();this.updateSelection();
 }
 updateSelection(){this.dirty=true;const p=cellCentre(this.state.probe,this.state.resolution);this.selection.position.fromArray(p);this.selection.scale.setScalar(4/this.state.resolution*.999);}
 installPointer(){
  const ray=new THREE.Raycaster(),mouse=new THREE.Vector2(),plane=new THREE.Plane(),hit=new THREE.Vector3(),offset=new THREE.Vector3();let down=null,drag=null;
  const setRay=e=>{const rect=this.canvas.getBoundingClientRect();mouse.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);ray.setFromCamera(mouse,this.camera);};
  this.canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;down={x:e.clientX,y:e.clientY,moved:false};setRay(e);const pick=ray.intersectObjects(this.bodies,false)[0];if(pick){const i=pick.object.userData.index;if(this.state.preset==='induction'&&!this.callbacks.canMove?.())return;this.state.selected=i;this.callbacks.onSelect(i);this.selectSource();this.controls.enabled=false;drag=this.state.sources[i];plane.setFromNormalAndCoplanarPoint(this.camera.getWorldDirection(new THREE.Vector3()),pick.object.position);ray.ray.intersectPlane(plane,hit);offset.copy(hit).sub(pick.object.position);this.canvas.setPointerCapture(e.pointerId);e.stopImmediatePropagation();}},true);
  this.canvas.addEventListener('pointermove',e=>{if(!down)return;if(Math.hypot(e.clientX-down.x,e.clientY-down.y)>4)down.moved=true;if(!drag||!down.moved)return;setRay(e);if(ray.ray.intersectPlane(plane,hit)){hit.sub(offset);if(this.state.preset==='induction'){this.callbacks.onMagnetTarget?.(hit.toArray());}else{drag.position=hit.toArray().map((v,i)=>clamp(v,-1.95+drag.size[i],1.95-drag.size[i]));this.rebuild();this.callbacks.onMove();}}e.stopImmediatePropagation();},true);
  const end=e=>{if(!down)return;if(!drag&&!down.moved){setRay(e);plane.set(new THREE.Vector3(0,0,1),-this.state.sliceZ);if(ray.ray.intersectPlane(plane,hit)&&hit.toArray().every(v=>Math.abs(v)<=2)){this.state.probe=cellCentre(hit.toArray(),this.state.resolution);this.updateSelection();this.callbacks.onProbe(this.state.probe);}}
   if(drag){e.stopImmediatePropagation();this.controls.enabled=true;if(this.canvas.hasPointerCapture(e.pointerId))this.canvas.releasePointerCapture(e.pointerId);}down=null;drag=null;};
  this.canvas.addEventListener('pointerup',end,true);this.canvas.addEventListener('pointercancel',end,true);
 }
 refreshInduction(){
  if(!this.inductionVisuals)return;
  const s=this.state,pose=s.induction.pose,b=s.sources[0];this.uniforms.uClosed.value=s.induction.closed?1:0;b.position=pose.position.slice();b.quaternion=pose.quaternion.slice();
  this.bodies[0].position.fromArray(b.position);this.bodies[0].quaternion.fromArray(b.quaternion);this.uniforms.uPositions.value[0].fromArray(b.position);this.uniforms.uRotations.value[0].fromArray(b.quaternion);
  for(const pole of this.poleLabels)pole.element.textContent=(pole.offset.x>0)===(pose.polarity>0)?'N':'S';
  this.samples.forEach((v,i)=>{v.r=sample(v.p,s,true);this.texture.image.data[i*4+2]=s.lens==='spin'?norm(v.r.B)*2:norm(v.r.E)*2;});this.texture.needsUpdate=true;this.inductionVisuals.update();this.dirty=true;
 }
 frame(){
  const now=performance.now(),dt=Math.min((now-this.last)/1000,.05);this.last=now;if(document.hidden)return;this.callbacks.onFrame?.(dt);const s=this.state;if(s.readout)this.time+=dt*s.tempo;
  for(const p of Object.values(this.particles))p.material.uniforms.uTime.value=this.time;
  this.inductionVisuals?.animate(this.time);this.controls.autoRotate=s.orbit;this.controls.update();if(!s.readout&&!s.orbit&&!this.dirty){if(now-this.statsAt>1100){this.callbacks.onStats(0);this.frames=0;this.statsAt=now;}return;}this.dirty=false;
  const r=this.canvas.getBoundingClientRect();for(let i=0;i<this.bodies.length;i++){const b=s.sources[i],p=new THREE.Vector3(...b.position);p.y+=Math.max(b.size[1],.2)+.15;p.project(this.camera);const label=this.bodyLabels[i];label.style.left=(p.x*.5+.5)*r.width+'px';label.style.top=(-p.y*.5+.5)*r.height+'px';label.style.opacity=s.slice&&Math.abs(b.position[2]-s.sliceZ)>.6?'.25':'1';label.hidden=p.z>1;}
  for(const pole of this.poleLabels){const p=pole.offset.clone().applyMatrix4(pole.body.matrixWorld).project(this.camera);pole.element.style.left=(p.x*.5+.5)*r.width+'px';pole.element.style.top=(-p.y*.5+.5)*r.height+'px';pole.element.hidden=p.z>1;}
  const scaleA=new THREE.Vector3(0,0,0).project(this.camera),scaleB=new THREE.Vector3(1,0,0).project(this.camera);document.querySelector('.stage-scale>span').style.width=Math.hypot((scaleB.x-scaleA.x)*r.width/2,(scaleB.y-scaleA.y)*r.height/2)+'px';
  this.renderer.render(this.scene,this.camera);this.frames++;if(now-this.statsAt>1100){this.callbacks.onStats(Math.round(this.frames*1000/(now-this.statsAt)));this.frames=0;this.statsAt=now;}
 }
}
