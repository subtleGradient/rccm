import * as THREE from './vendor/three.module.js';
import {OrbitControls} from './vendor/OrbitControls.js';
export {THREE};
export function createWorld(element,{span=6,position=[5,4,6]}={}){
  const scene=new THREE.Scene();scene.background=new THREE.Color('#102c28');
  const camera=new THREE.PerspectiveCamera(38,1,.01,150);camera.position.fromArray(position);camera.lookAt(0,0,0);
  let renderer;
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});}catch(error){element.innerHTML='<p class="error">This tank needs WebGL. The field definitions, readouts and prediction exercises remain below.</p>';throw error;}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));renderer.setClearColor('#102c28');element.append(renderer.domElement);
  renderer.domElement.tabIndex=0;renderer.domElement.setAttribute('aria-label','Interactive three-dimensional tank. Drag to orbit, scroll to zoom. Arrow keys rotate.');
  const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=false;controls.enablePan=false;controls.minDistance=span*.55;controls.maxDistance=span*4;
  const root=new THREE.Group();scene.add(root);
  scene.add(new THREE.AmbientLight(0xffffff,1.7));const key=new THREE.DirectionalLight(0xffeccb,3);key.position.set(3,8,5);scene.add(key);
  const fill=new THREE.DirectionalLight(0x86c6c0,1.5);fill.position.set(-5,1,-3);scene.add(fill);
  const floor=new THREE.GridHelper(span,12,0x517e6c,0x25483e);floor.position.y=-span*.32;scene.add(floor);
  const render=()=>renderer.render(scene,camera);controls.addEventListener('change',render);
  const resize=()=>{const w=element.clientWidth,h=element.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();render();};
  const observer=new ResizeObserver(resize);observer.observe(element);
  const bar=document.createElement('div');bar.className='viewport-tools';
  for(const [label,action] of [['Front',()=>{camera.position.set(0,.001,span*1.5);controls.target.set(0,0,0);controls.update();}],['Reset view',()=>{camera.position.fromArray(position);controls.target.set(0,0,0);controls.update();}]]){const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',()=>{action();render();});bar.append(b);}element.append(bar);
  renderer.domElement.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;event.preventDefault();const s=new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));s.theta+=event.key==='ArrowLeft'?-.12:event.key==='ArrowRight'?.12:0;s.phi+=event.key==='ArrowUp'?-.12:event.key==='ArrowDown'?.12:0;s.makeSafe();camera.position.setFromSpherical(s).add(controls.target);controls.update();render();});
  resize();return {scene,camera,renderer,controls,root,render,dispose(){observer.disconnect();controls.dispose();clearGroup(scene);renderer.dispose();}};
}
export function clearGroup(group){const geometries=new Set(),materials=new Set();group.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m));});group.clear();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}
export function addArrow(group,origin,vector,color,length){const d=new THREE.Vector3(...vector),mag=d.length();if(mag<1e-8)return null;const l=length??mag;const arrow=new THREE.ArrowHelper(d.normalize(),new THREE.Vector3(...origin),l,color,Math.min(l*.28,.18),Math.min(l*.14,.09));group.add(arrow);return arrow;}
export function addRing(group,position,radius,color,axis=[0,0,1],tube=.025){const mesh=new THREE.Mesh(new THREE.TorusGeometry(radius,tube,8,64),new THREE.MeshStandardMaterial({color,roughness:.5,metalness:.1}));mesh.position.fromArray(position);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),new THREE.Vector3(...axis).normalize());group.add(mesh);return mesh;}
export function addBox(group,position,size,color,opacity=.2){const box=new THREE.Group(),geo=new THREE.BoxGeometry(...size);const fill=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color,transparent:true,opacity,depthWrite:false}));const edge=new THREE.LineSegments(new THREE.EdgesGeometry(geo),new THREE.LineBasicMaterial({color,transparent:true,opacity:.45}));box.add(fill,edge);box.position.fromArray(position);group.add(box);return box;}
// Match lightweight document navigation on small screens without a framework.
const header=document.querySelector('.site-header');if(header&&!header.querySelector('.mobile-nav')){const nav=header.querySelector('nav');if(nav){const d=document.createElement('details');d.className='mobile-nav';const s=document.createElement('summary');s.textContent='Studies';d.append(s,nav.cloneNode(true));header.append(d);}}
