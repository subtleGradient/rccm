import {THREE,createWorld,addBox,addRing,addArrow} from './scene.js';
import {gapState} from './math.mjs';
const world=createWorld(document.getElementById('hero-tank'),{span:6,position:[5,3.6,7.5]});
addBox(world.root,[0,0,0],[5.5,3.1,2.5],'#90b295',.012);
for(let x=-2.25;x<=2.26;x+=.5)for(let y=-1;y<=1.01;y+=.5){const s=gapState([x,y,0],'opposite');const color=new THREE.Color('#b27837').lerp(new THREE.Color('#d4d8ab'),s.q);addBox(world.root,[x,y,0],[.41,.41,.41],color,.1);if(Math.abs(x)<1.1)addArrow(world.root,[x,y,.25],s.e,'#83d6d5',Math.hypot(...s.e)*.60);}
for(const [x,sign,color] of [[-1.5,1,'#e5e88c'],[1.5,-1,'#b5dceb']]){addRing(world.root,[x,0,0],.47,color,[0,0,1],.115);for(let k=0;k<3;k++){const t=k*2*Math.PI/3;addArrow(world.root,[x+.48*Math.cos(t),.48*Math.sin(t),.15],[-sign*Math.sin(t),sign*Math.cos(t),0],color,.19);}}
world.render();
