(function(){
  'use strict';
  const G=window.ChargeGeometry,TAU=2*Math.PI;
  const lab=document.getElementById('winding-lab');
  let mode='both',tilt=56,yaw=20,hand=1,flow=1,phase=.11;
  const f=n=>n.toFixed(2);
  function project(p,a,b){
    const [x,y,z]=G.turn(p,a,b);
    return [250+73*x,195-73*y,z];
  }
  function stroke(points,color,width,opacity=1,cap='round'){
    return `<path d="M${points.map(p=>`${f(p[0])} ${f(p[1])}`).join('L')}" fill="none" stroke="${color}" stroke-width="${width}" stroke-opacity="${opacity}" stroke-linecap="${cap}" stroke-linejoin="round"/>`;
  }
  function arrow(a,b,color,width=2.5){
    const angle=Math.atan2(b[1]-a[1],b[0]-a[0]),size=9;
    return stroke([a,b],color,width)+stroke([[b[0]-size*Math.cos(angle-.5),b[1]-size*Math.sin(angle-.5)],b,[b[0]-size*Math.cos(angle+.5),b[1]-size*Math.sin(angle+.5)]],color,width);
  }
  function windingSvg(a,b,h,d,reference=false){
    const objects=[],wire=[];
    for(let j=0;j<12;j++)wire.push(Array.from({length:49},(_,i)=>project(G.torus(j*TAU/12,i*TAU/48),a,b)));
    for(let j=0;j<6;j++)wire.push(Array.from({length:97},(_,i)=>project(G.torus(i*TAU/96,j*TAU/6),a,b)));
    const color=mode==='hole'?'#266982':mode==='tube'?'#9b3e62':'var(--ink)';
    const count=420;
    for(let i=0;i<count;i++){
      const p=project(G.path(i*TAU/count,mode,h,d),a,b),q=project(G.path((i+1)*TAU/count,mode,h,d),a,b);
      objects.push({z:(p[2]+q[2])/2,html:stroke([p,q],'var(--paper)',9,1,'butt')+stroke([p,q],color,5)});
    }
    for(let i=0;i<7;i++){
      const t=(i+.3)*TAU/7,p=project(G.path(t,mode,h,d),a,b),q=project(G.path(t+.055,mode,h,d),a,b);
      objects.push({z:q[2]+.02,html:arrow(p,q,color,2.4)});
    }
    // This slider places a marker on the path, rather than advancing a clock.
    // Reversing flow changes arrows while preserving the marker's position.
    const bead=project(G.path(phase*TAU,mode,h,1),a,b);
    objects.push({z:bead[2]+.03,html:`<circle cx="${f(bead[0])}" cy="${f(bead[1])}" r="8" fill="var(--paper)" stroke="var(--ink)" stroke-width="3"/>`});
    const axis=project([0,0,2.1],a,b);
    const label=mode==='both'?(h===1?'Reference handedness':'Mirror handedness'):'One planar circulation';
    return `<svg viewBox="0 0 500 400" role="img" aria-label="${reference?'Reference':'Manipulated'} torus winding. ${label}. Object tilt ${a} degrees, turn ${b} degrees. Flow ${d===1?'forward':'reversed'}. Wire torus is a transparent guide; the thick path passes over and under itself in projection.">
      <ellipse cx="250" cy="365" rx="140" ry="11" fill="var(--ink)" opacity=".05"/>
      <g opacity=".28">${wire.map(p=>stroke(p,'var(--muted)',1)).join('')}</g>
      ${arrow([250,195],axis,'var(--muted)',1.5)}${objects.sort((x,y)=>x.z-y.z).map(p=>p.html).join('')}
      <text x="250" y="28" text-anchor="middle">${mode==='both'?'Both circulations together':mode==='hole'?'Around the central hole':'Around the tube’s cross-section'}</text>
      <text x="250" y="390" text-anchor="middle" class="label-small">${reference?'Reference object':`Same camera · object turned ${yaw}°`}</text>
    </svg>`;
  }
  function draw(){
    document.getElementById('winding-reference').innerHTML=windingSvg(56,20,1,1,true);
    document.getElementById('winding-object').innerHTML=windingSvg(tilt,yaw,hand,flow);
    const combined=mode==='both';
    document.getElementById('winding-status').textContent=combined?(hand===1?'Same handedness as the reference.':'Opposite handedness: the mirror pattern.'):'A single loop supplies an axis; it does not supply this knot’s handedness.';
    document.getElementById('winding-motion').textContent=combined?`Follow the arrows: ${flow*2} turns around the hole; ${flow*hand*3} around the tube. The signs use directions attached to the doughnut.`:'Move the bead with the slider to see which hole this loop goes around.';
    document.getElementById('winding-operation').textContent=!combined?'This is one planar loop. Turn it over: its apparent clockwise sense changes, without changing the object into a different kind of charge.':flow===-1?'All flow arrows reversed. The bead retraces the same path; reversing both windings leaves its handedness unchanged.':hand===-1?'One winding reversed. This loads a different, mirrored path; turning the whole object cannot produce it.':'Turn or tilt the whole object. Its axis moves, while the winding relationship stays the same.';
    lab.querySelectorAll('[data-winding-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.windingMode===mode)));
    document.getElementById('winding-mirror').setAttribute('aria-pressed',String(hand===-1));
    document.getElementById('winding-mirror').disabled=!combined;
    document.getElementById('winding-reverse').setAttribute('aria-pressed',String(flow===-1));
    document.getElementById('winding-turn-value').textContent=`${yaw}°`;
    document.getElementById('winding-tilt-value').textContent=`${tilt}°`;
  }
  lab.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button)return;
    if(button.dataset.windingMode)mode=button.dataset.windingMode;
    else if(button.id==='winding-mirror')hand*=-1;
    else if(button.id==='winding-reverse')flow*=-1;
    else if(button.id==='winding-halfturn'){yaw=(yaw+180)%360;document.getElementById('winding-turn').value=yaw;}
    else if(button.id==='winding-reset'){
      mode='both';tilt=56;yaw=20;hand=1;flow=1;phase=.11;
      document.getElementById('winding-turn').value=yaw;document.getElementById('winding-tilt').value=tilt;document.getElementById('winding-trace').value=phase*100;
    }else return;
    draw();
  });
  lab.addEventListener('input',event=>{
    const value=Number(event.target.value);
    if(event.target.id==='winding-turn')yaw=value;
    else if(event.target.id==='winding-tilt')tilt=value;
    else if(event.target.id==='winding-trace')phase=value/100;
    else return;
    draw();
  });
  function exterior(charge){
    const arrows=[];
    const directions=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1],[.707,.707,0],[-.707,.707,0],[.707,-.707,0],[-.707,-.707,0]];
    for(const p of directions){
      const field=G.pointField(charge,p),start=p.map(v=>v*1.35),end=start.map((v,i)=>v+.65*field[i]);
      arrows.push({z:p[2],html:arrow(project(start,36,22),project(end,36,22),'var(--electric)',3)});
    }
    return `<svg viewBox="0 0 500 400" role="img" aria-label="${charge>0?'Positive point charge with outward electric field on every side':'Negative point charge with inward electric field on every side'}. Field arrows are not material flow."><ellipse cx="250" cy="195" rx="155" ry="98" fill="none" stroke="var(--line)" stroke-width="2" stroke-dasharray="5 5"/><ellipse cx="250" cy="195" rx="69" ry="155" fill="none" stroke="var(--line)" stroke-width="2" stroke-dasharray="5 5"/>${arrows.filter(p=>p.z<0).map(p=>p.html).join('')}<circle cx="250" cy="195" r="27" fill="${charge>0?'#f2ea89':'#cde9fa'}" stroke="var(--ink)" stroke-width="2"/><text x="250" y="204" text-anchor="middle" class="charge-sign">${charge>0?'+':'−'}</text>${arrows.filter(p=>p.z>=0).map(p=>p.html).join('')}<text x="250" y="32" text-anchor="middle">${charge>0?'Outward on every side':'Inward on every side'}</text><text x="250" y="389" text-anchor="middle" class="label-small">Electric field · not fluid escaping or entering</text></svg>`;
  }
  document.getElementById('charge-outward').innerHTML=exterior(1);
  document.getElementById('charge-inward').innerHTML=exterior(-1);
  draw();
})();
