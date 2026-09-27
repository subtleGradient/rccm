(function () {
  'use strict';
  const M = window.TensorExamples;
  const host = document.getElementById('scene-content');
  let scene = 'compass';
  let sample = 'center';
  let revealed = false;
  const source = '<a href="../RCCM-GfX-2.tex">RCCM-GfX-2.tex</a>';
  const eSource = '<a href="https://openstax.org/books/university-physics-volume-2/pages/5-4-electric-field">OpenStax: electric field and F = QE</a>';
  const bSource = '<a href="https://openstax.org/books/university-physics-volume-2/pages/11-5-force-and-torque-on-a-current-loop">OpenStax: magnetic dipole torque</a>';
  const hairSource = '<a href="https://openstax.org/books/college-physics-2e/pages/18-1-static-electricity-and-charge-conservation-of-charge">OpenStax: static charge and repulsion</a>';
  const stories = {
    clock: {
      number:'01 / Capacity', title:'The clock changes. Nothing starts falling.',
      intro:'Imagine being inside a small, uniformly loaded region. Compare the same resting clock in two different capacity conditions, against the same background time coordinate.',
      change:'Remaining capacity q: 0.8 → 0.5.', held:'No spatial slope; e = b = 0. Clock at rest in both worlds.',
      worlds:['More capacity · q = 0.8','Less capacity · q = 0.5'],
      question:'Does a lower capacity level, on its own, create a direction to fall?',
      outcomes:[['0.894 local seconds','For one background-coordinate second, the resting clock advances √0.8 ≈ 0.894 seconds.'],['0.707 local seconds','For the same background-coordinate interval, it advances √0.5 ≈ 0.707 seconds.']],
      takeaway:'A pressure level sets the clock reading. A pressure slope supplies a direction. These uniform interiors have no pressure-gradient acceleration.',
      prediction:'Next change: keep the clock’s local q fixed, but give the region a vertical slope. Open “Falling” to inspect that pair.',
      method:'Two separately prescribed, homogeneous static patches; this is not a physical transition that creates load without work. The time factors use dτ = √q dt for the resting observer. The spatial metric coefficients are 1/q, while ruler factors are 1/√q. These exaggerated capacities are not a weak-gravity Earth model.',
      bodies:'The clock is a test object. There is no contact force or initial velocity to confuse with the scalar comparison. Comparisons use a common background time; signal travel and synchronization are outside this fixture.',
      sources:`${source}, §3.1. <a href="../RCCM-Condensed.tex">Condensed</a>, “Pressure Deficits, Symmetry Breaking, and Acoustic Covariance,” separates scalar time dilation from gradients.`
    },
    electric: {
      number:'02 / Sliding', title:'Same positive bead. Opposite push.',
      intro:'A charged bead rests on a horizontal frictionless guide. The electric field reverses. The bead’s charge, mass and initial motion stay the same.',
      change:'Electric direction: eₓ = +0.002 → −0.002.', held:'q = 0.8; all other e and b components are zero. Bead charge Q > 0.',
      worlds:['Field points right','Field points left'],
      question:'Which way does the positive bead first accelerate?',
      outcomes:[['Push to the right','The positive test charge responds in the electric-field direction.'],['Push to the left','The same positive charge now feels an opposite electric force.']],
      takeaway:'A uniform electric field can push a charge. You do not need a gradient of the electric field for this force.',
      prediction:'Keep either field fixed and replace the bead with a negative charge. Which way would the electric force point?',
      method:'The field is prescribed and approximately uniform over the bead. The dimensionless e coefficient carries the direction; the response fixture adds F = QE with a fixed positive calibration E ∝ e. The drawings show direction, not force magnitude or a computed trajectory. Reversing a component preserves its squared kinematic load.',
      bodies:'The guide is supported by the laboratory and balances vertical weight; it permits horizontal motion. The bead is initially at rest and treated as a test charge. The field generator and bead self-field are outside the displayed sample.',
      sources:`${source}, §3.2 (slip identification); ${eSource} (separate conventional response law).`
    },
    compass: {
      number:'03 / Twisting', title:'Same needle. Opposite turn.',
      intro:'Look down at a compass on a frictionless pivot. Its magnetic moment starts to the right. Reverse the surrounding field while leaving the needle exactly where it was.',
      change:'Magnetic direction: bᵧ = +0.003 → −0.003.', held:'q = 0.8; e = 0. Needle moment points +x; initial spin is zero.',
      worlds:['Field toward +y','Field toward −y'],
      question:'The needle starts in the same position. Which way does it first turn?',
      outcomes:[['Counterclockwise','The moment points +x and the field +y. Their turning couple points +z, out of the page.'],['Clockwise','The field reverses to −y. The turning couple points −z, into the page.']],
      takeaway:'A uniform magnetic field can turn a magnetic moment. A field gradient is needed for translation of an ideal fixed dipole; the pivot holds this centre in place.',
      prediction:'Keep the field fixed and point the needle’s moment along it. What happens to the initial turning couple?',
      method:'A small rigid permanent dipole in a prescribed uniform field, with B ∝ b under a fixed positive calibration. The conventional response is τ = m × B. The curved arrows show initial torque, not a simulated settling motion. Damping would be needed to make a real needle settle.',
      bodies:'The pivot is attached to the laboratory. It supports weight, fixes the centre, and allows rotation about z. x is right, y is up the page, z is toward you. All three sampler positions report the same external field. The needle’s moment and its own field are not extra entries in that applied-field sample.',
      sources:`${source}, §3.3 (the y-axis vorticity uses the xz/zx pair); ${bSource} (separate conventional response law).`
    },
    falling: {
      number:'04 / Gravity as unequal squeeze', title:'The stronger push comes from above.',
      intro:'Be the rock above a planet. Fluid presses on you from every side. The planet leaves less static pressure on your underside, so the push from above wins. Here is how circulation becomes that unequal squeeze.',
      change:'Vertical slope: dq/dy = 0 → 2 × 10⁻¹⁶ per metre.', held:'q at the centre = 0.999999999; e = b = 0. Rock initially at rest.',
      worlds:['Equal squeeze · no net push','Stronger above · net push down'],
      question:'Both rocks have the same centre reading. Compare the pushes, then reveal their net effect.',
      outcomes:[['The pushes balance','The fluid squeezes from every side, but the opposing pushes cancel. Low q by itself supplies no direction to fall.'],['The downward push wins','Higher pressure above pushes down harder than lower pressure below pushes up. For this chosen slope, the difference gives about 8.99 m/s² downward.']],
      takeaway:'The rock falls because pressure pushes harder from the side away from the planet. q records how much static pressure remains; the difference across the rock gives the push a direction.',
      prediction:'Now put the same rock halfway between two identical, freely moving masses. Both lower the local q, but their pressure slopes oppose. Does low q alone tell the rock which way to start falling?',
      method:'The causal picture uses Pstatic = Pc − applied loads and q = Pstatic/Pc. Persistent circulation occupies the pressure budget; this is a maintained state, not a continual expenditure of fluid or energy. The source’s body-force bridge is F = −Veff ∇Pstatic, where Veff is an effective hydrodynamic displacement, not the rock’s geometric volume. The numerical comparison remains a local first-order field patch: A has q(y) = q₀; B has q(y) = q₀ + (2 × 10⁻¹⁶ m⁻¹)y. Samples are at y = −1, 0, +1 metre, and exact decimal capacities are retained. c = 299792458 m/s gives −8.987551787… m/s². This uses the focused source’s weak, static, slow-test-body reduction, not its full dynamics.',
      bodies:'The rock includes cavitation structures and the surrounding fluid recruited into their motion. Its isolated, symmetric self-field supplies no preferred direction; these samplers inspect the ambient field. A is a locally uniform field; B approximates a small region above a gravitating body. The planet also responds to the rock. The two are free to move; the illustration freezes an instant and evaluates only the test-body limit. Pressure arrows represent effective ambient pushes; their differences are enormously exaggerated for visibility. Real empty-looking space can have q below one because a distant mass’s field reaches it.',
      sources:`${source}, §2 (finite pressure budget), §5.3 (mass-generated deficit and F = −Veff ∇Pstatic). <a href="../RCCM-Condensed.tex">Condensed</a>, “The Kinematic Origin of Inertia” places the cavitation and surrounding added mass; “Pressure Deficits, Symmetry Breaking, and Acoustic Covariance” separates level from slope.`
    },
    hair: {
      number:'05 / Field plus material response', title:'Reverse both charges. The hairs still spread.',
      intro:'Zoom in on two neighbouring hairs, rooted in the scalp. Give their tips equal positive charges in A and equal negative charges in B. Keep their starting shapes and charge magnitudes fixed.',
      change:'One shared polarity: both tips positive → both tips negative.', held:'Same geometry and |Q|. Same scalar background q = 0.8; b = 0.',
      worlds:['Two positive tips','Two negative tips'],
      question:'The electric-field arrows reverse. Does the repulsion reverse too?',
      outcomes:[['Electric forces point apart','Positive tips respond along the other tip’s electric field: left tip leftward, right tip rightward.'],['Electric forces still point apart','Both Q and E reverse. Their product QE keeps the same direction at each tip.']],
      takeaway:'The field reading is one part of the story. The charge responding to it is another. Same-sign strands repel for either sign of charge.',
      prediction:'Change just the right tip’s charge sign, leaving the left tip positive. Do the tips now tend to spread apart or bend toward each other?',
      method:'A two-tip approximation: at each tip, inspect the applied field from the other tip, excluding its own self-field. The displayed matrices assemble that applied electric component with a prescribed scalar background; they do not claim to be the complete tensor inside a strand. q is unchanged under the global polarity reversal; squared electric amplitudes and pair interaction signs are unchanged.',
      bodies:'The roots constrain the hairs. Arrows show mutual electric force only, not the total force or a solved final shape. To explain full hair raising, resolve charge along many hairs and add bending stiffness, gravity, air and root constraints. Strong enough like-charge repulsion spreads the strands; their detailed shape needs that material model. The two sampler locations are a deliberately reduced example of one reading per place, not one tensor per hair.',
      sources:`${source}, §3 (matrix slots); <a href="../RCCM-Condensed.tex">Condensed</a>, “Coulomb’s Law,” discusses self and interaction terms. ${eSource} and ${hairSource} supply the separate macroscopic force picture.`
    }
  };
  const arrow = (x1,y1,x2,y2,cls='solid') => {
    const a=Math.atan2(y2-y1,x2-x1), len=9, spread=.55;
    const x3=x2-len*Math.cos(a-spread), y3=y2-len*Math.sin(a-spread);
    const x4=x2-len*Math.cos(a+spread), y4=y2-len*Math.sin(a+spread);
    return `<path class="${cls}" d="M${x1} ${y1}L${x2} ${y2}M${x3} ${y3}L${x2} ${y2}L${x4} ${y4}"/>`;
  };
  const text = (x,y,value,cls='',anchor='start') => `<text x="${x}" y="${y}" class="${cls}" text-anchor="${anchor}">${value}</text>`;
  const dot = (id,x,y,label,tx=x,ty=y+26) => `<g role="button" tabindex="0" data-sample="${id}" aria-label="Sample ${label}" aria-pressed="${sample===id}" class="${sample===id?'selected':''}"><circle cx="${x}" cy="${y}" r="8" class="sample-dot"/>${text(tx,ty,label,'label-small','middle')}</g>`;
  const hairDot = (id,x) => `<g role="button" tabindex="0" data-sample="${id}" aria-label="Sample ${id} hair tip" aria-pressed="${sample===id}" class="${sample===id?'selected':''}"><circle cx="${x}" cy="116" r="24" class="sample-ring"/>${text(x,196,`sample ${id}`,'label-small','middle')}</g>`;
  const svg = (description,body) => `<svg viewBox="0 0 500 285" role="img" aria-label="${description}">${body}</svg>`;
  function gravityStory(){
    const ring=(x,y,scale=1)=>`<g transform="translate(${x} ${y}) scale(${scale})"><ellipse cx="0" cy="0" rx="44" ry="26" fill="var(--elecbg)" stroke="var(--electric)" stroke-width="2"/><ellipse cx="0" cy="0" rx="20" ry="10" fill="var(--paper)" stroke="var(--electric)" stroke-width="2"/><path class="field" d="M−31 −13Q−10 −30 17 −20M8 −26L17 −20L7 −17"/></g>`.replaceAll('−','-');
    return `<section class="gravity-cause" aria-label="Why circulation leads to falling in RCCM">
      <div class="cause-grid">
        <article><div class="world-stage">${svg('Matter represented by persistent circulating rings around cavities.',ring(180,121,1.2)+ring(283,158,.9)+ring(305,77,.7)+text(250,246,'cavities + circulating fluid','','middle'))}</div><h4>1. Matter keeps circulating</h4><p>Your “tornadonuts”: persistent cavitation structures and organised circulation. The rock and the planet both contain these structures. Moving them also recruits surrounding fluid.</p></article>
        <article><div class="world-stage">${svg('The same finite pressure budget is partitioned into circulation load and remaining static pressure.',text(250,50,'One finite pressure budget','','middle')+'<rect x="44" y="82" width="412" height="62" rx="4" fill="var(--capbg)"/><path d="M44 82H183V144H44Z" fill="var(--elecbg)"/>'+text(114,119,'load','','middle')+text(320,119,'static pressure','','middle')+text(250,186,'q = static pressure / full budget','','middle')+text(250,232,'Schematic partition; not the numeric example.','label-small','middle'))}</div><h4>2. Less static pressure remains</h4><p>Circulation occupies part of the budget for as long as it persists. The remainder is static pressure; <strong>q measures that fraction.</strong> In the planet’s exterior field, this remainder is smaller nearer the planet.</p></article>
        <article><div class="world-stage">${svg('A rock above a planet receives a stronger ambient pressure push from above and a weaker push from below.',arrow(250,26,250,82,'field-q pressure-top')+'<path d="M220 100L242 83L269 98L278 121L251 136L222 124Z" fill="#979d91" stroke="var(--ink)" stroke-width="2"/>'+arrow(250,168,250,141,'field-q pressure-bottom')+'<path d="M77 283Q250 140 423 283" fill="var(--capbg)" stroke="var(--capacity)" stroke-width="2"/>'+text(250,261,'planet','','middle')+text(281,46,'stronger push ↓','label-small')+text(281,159,'weaker push ↑','label-small')+arrow(162,88,162,143)+text(90,168,'rock falls','label-small'))}</div><h4>3. The squeeze is unequal</h4><p>The rock’s far side meets higher ambient pressure. Its planet-facing side meets lower pressure. <strong>The push from above exceeds the push from below.</strong> That imbalance accelerates the rock downward.</p></article>
      </div>
      <p class="cause-bridge">The rock and its surrounding moving fluid respond together. The planet responds to the rock too. In this mass-only scene, each body is pushed toward the other’s lower-pressure neighbourhood.</p>
      <p class="cause-bridge"><strong>Now isolate the cause.</strong> Keep the centre reading identical and change only the pressure slope. Green arrows show opposing pressure pushes; black arrows reveal the net result. Arrow differences are exaggerated.</p>
    </section>`;
  }
  function picture(world,s) {
    const isA=world==='a';
    if(scene==='clock'){
      const q=s.q.value,rate=M.clockRate(s), angle=rate*2*Math.PI-Math.PI/2;
      return svg(`A resting clock at capacity ${q}. Reveal the relative clock advance.`,
        `<rect x="58" y="45" width="70" height="165" rx="5" fill="none" stroke="var(--capacity)" stroke-width="2"/><rect x="59" y="${209-163*q}" width="68" height="${163*q}" fill="var(--capbg)"/>${text(93,240,`q = ${q}`,'','middle')}<circle cx="306" cy="131" r="81" fill="var(--paper)" stroke="var(--ink)" stroke-width="2"/>`+
        Array.from({length:12},(_,i)=>{const a=i*Math.PI/6;return `<path class="solid" d="M${306+70*Math.sin(a)} ${131-70*Math.cos(a)}L${306+75*Math.sin(a)} ${131-75*Math.cos(a)}"/>`;}).join('')+
        '<path class="solid ghost" d="M306 131V72"/><circle cx="306" cy="131" r="4" fill="var(--ink)"/>'+
        `<g class="response">${arrow(306,131,306+57*Math.cos(angle),131+57*Math.sin(angle),'field-q')}${text(306,244,`${rate.toFixed(3)} seconds`,'','middle')}</g>${text(250,22,'Same background interval: 1 second','label-small','middle')}`);
    }
    if(scene==='electric'){
      const d=Math.sign(s.e[0]);
      return svg(`Positive test bead in a uniform electric field pointing ${d>0?'right':'left'}.`,
        '<rect x="35" y="54" width="9" height="147" fill="var(--electric)" opacity=".35"/><rect x="456" y="54" width="9" height="147" fill="var(--electric)" opacity=".35"/>'+
        [86,118].map(y=>[115,250,385].map(x=>arrow(x-d*32,y,x+d*32,y,'field')).join('')).join('')+
        text(250,34,'Applied electric field','label-small','middle')+text(25,42,d>0?'+':'−')+text(461,42,d>0?'−':'+')+
        '<path class="solid" d="M87 188H412M117 188V210M382 188V210"/><circle cx="250" cy="169" r="18" fill="#f2ea89" stroke="var(--ink)" stroke-width="2"/>'+text(250,175,'+','','middle')+
        `<g class="response">${arrow(250,229,250+d*98,229)}${text(250+d*98,253,'electric force','label-small','middle')}</g>`+text(250,276,'Supported guide; free horizontal motion.','label-small','middle'));
    }
    if(scene==='compass'){
      const d=Math.sign(s.b[1]);
      const field=[80,140,200,300,360,420].map(x=>arrow(x,d>0?220:60,x,d>0?60:220,'field-b')).join('');
      const torque = d>0 ? '<path class="solid" d="M351 142Q351 41 250 41M259 36L250 41L259 46"/>' : '<path class="solid" d="M351 142Q351 243 250 243M259 238L250 243L259 248"/>';
      return svg(`A pivoted needle points right; the uniform magnetic field points ${d>0?'up':'down'} the page.`,
        `<g opacity=".38">${field}</g><circle cx="250" cy="142" r="82" fill="var(--paper)" fill-opacity=".8" stroke="var(--line)" stroke-width="2"/>`+
        text(250,27,d>0?'B toward +y':'B toward −y','','middle')+
        '<path d="M170 142L250 130L250 154Z" fill="var(--muted)"/><path d="M330 142L250 130L250 154Z" class="needle"/><circle cx="250" cy="142" r="6" fill="var(--paper)" stroke="var(--ink)" stroke-width="2"/>'+text(317,124,'N')+text(173,124,'S')+
        `${text(250,187,'moment m → +x','label-small','middle')}<g class="response">${torque}</g>`+
        dot('left',170,142,'left tip',153,268)+dot('center',250,142,'pivot',250,268)+dot('right',330,142,'right tip',347,268));
    }
    if(scene==='falling'){
      const topStart=isA?60:47, bottomStart=isA?215:197;
      return svg(`Ambient pressure pushes on a rock from all sides. ${isA?'Equal opposing pushes balance.':'A larger downward push from above exceeds the upward push from below.'}`,
        `<path d="M110 36H430M110 142H430M110 248H430" stroke="var(--line)" stroke-dasharray="4 7"/>`+
        text(24,31,isA?'Same pressure':'Higher pressure','label-small')+
        text(24,275,isA?'Same pressure':'Lower pressure · planetward','label-small')+
        `<g class="pressure-push ${isA?'equal-push':'unequal-push'}">${arrow(226,topStart,226,106,'field-q pressure-top')}${arrow(226,bottomStart,226,169,'field-q pressure-bottom')}${arrow(147,139,193,139,'field-q')}${arrow(305,139,259,139,'field-q')}</g>`+
        '<path d="M205 124L223 112L248 126L256 147L239 162L211 160L195 141Z" fill="#979d91" stroke="var(--ink)" stroke-width="2"/>'+
        text(21,91,isA?'push down':'stronger push ↓','label-small')+
        text(21,203,isA?'push up':'weaker push ↑','label-small')+
        (isA ? '<g class="response">'+text(81,153,'net = 0')+'</g>' : `<g class="response">${arrow(89,118,89,167)}${text(42,153,'net ↓','label-small')}</g>`)+
        dot('above',373,36,'above +1 m',373,60)+dot('center',373,142,'centre 0',373,169)+dot('below',373,248,'below −1 m',373,277));
    }
    const charge=isA?'+':'−', color=isA?'#f2ea89':'#cde9fa';
    return svg(`Two rooted hairs with ${isA?'positive':'negative'} tip charges. The electric field at each tip comes from the other tip.`,
      '<path d="M96 285Q250 189 404 285" fill="#e6ddd0" stroke="var(--ink)" stroke-width="2"/><path class="solid" d="M219 240Q181 205 180 127M281 240Q319 205 320 127"/>'+text(250,278,'roots anchored in scalp','label-small','middle')+
      `<circle cx="180" cy="116" r="17" fill="${color}" stroke="var(--ink)" stroke-width="2"/><circle cx="320" cy="116" r="17" fill="${color}" stroke="var(--ink)" stroke-width="2"/>${text(180,121,charge,'','middle')}${text(320,121,charge,'','middle')}`+
      text(250,29,'Electric field from the other tip','label-small','middle')+
      arrow(isA?189:124,66,isA?124:189,66,'field')+arrow(isA?311:376,66,isA?376:311,66,'field')+
      `<g class="response">${arrow(159,131,90,131)}${arrow(341,131,410,131)}${text(86,158,'force','label-small','middle')}${text(414,158,'force','label-small','middle')}</g>`+
      hairDot('left',180)+hairDot('right',320));
  }
  const axes=['t','x','y','z'];
  function matrix(s,changed){
    let out='<div class="numeric-matrix" role="group" aria-label="Tensor matrix, basis time x y z"><div></div>'+axes.map(a=>`<div class="axis">${a}</div>`).join('');
    for(let i=0;i<16;i++){
      if(i%4===0)out+=`<div class="axis">${axes[i/4]}</div>`;
      const row=Math.floor(i/4),col=i%4;
      const group=row===col?'cap':row===0||col===0?'elec':'mag';
      const active=changed.includes(i);
      const color=active||s.cells[i].value!==0?group:'';
      out+=`<div class="numeric-cell ${color} ${active?'changed':''}" aria-label="${axes[row]} ${axes[col]}: ${s.cells[i].text}${active?'; changes between A and B':''}">${s.cells[i].text}</div>`;
    }
    return out+'</div>';
  }
  function sampleChoices(){
    if(scene==='compass')return [['left','Left tip'],['center','Pivot'],['right','Right tip']];
    if(scene==='falling')return [['above','Above · +1 m'],['center','Centre · 0'],['below','Below · −1 m']];
    if(scene==='hair')return [['left','Left hair tip'],['right','Right hair tip']];
    return [];
  }
  function readingLocation(){
    if(scene==='compass')return `Applied field · ${sample==='center'?'pivot':sample+' tip'}`;
    if(scene==='falling')return `Local state · ${sample==='center'?'centre':sample}`;
    if(scene==='hair')return `Other hair’s field · ${sample} tip`;
    return scene==='clock'?'Local state · at the clock':'Applied field · at the bead';
  }
  function readingNote(s){
    if(scene==='falling')return `${s.q.label} = ${s.q.text} exactly. The spatial entries are its reciprocal.`;
    if(scene==='clock')return `q = ${s.q.text}; all six directional components are zero.`;
    if(scene==='compass')return `q = 0.8; bᵧ = ${s.b[1]>0?'+':''}${s.b[1]}; all other directional components are zero.`;
    return `q = 0.8; eₓ = ${s.e[0]>0?'+':''}${s.e[0]}; all other directional components are zero.`;
  }
  function draw(){
    const story=stories[scene], pair=M.pair(scene,sample), choices=sampleChoices();
    host.classList.toggle('revealed',revealed);
    host.innerHTML=`<div class="scene-header"><div><div class="scene-number">${story.number}</div><h3>${story.title}</h3><p>${story.intro}</p></div></div>
      ${scene==='falling'?gravityStory():''}
      <div class="change-strip"><div><strong class="change-label">The one change</strong><p>${story.change}</p></div><div><strong>Held fixed</strong><p>${story.held}</p></div></div>
      ${choices.length?`<div class="sample-controls" aria-label="Sample location"><div class="sample-label">Move the sampler in both worlds:</div>${choices.map(([id,label])=>`<button type="button" data-sample="${id}" aria-pressed="${id===sample}">${label}</button>`).join('')}</div>`:''}
      <div class="reveal-bar"><button type="button" id="reveal-response" aria-expanded="${revealed}" aria-controls="scene-outcomes">${revealed?'Hide the response':'Reveal what happens'}</button><p>${story.question}</p></div>
      <div class="worlds">${['a','b'].map((world,i)=>{
        const s=pair[world];return `<article class="world"><div class="world-header"><div class="world-letter">${world.toUpperCase()}</div><h4>${story.worlds[i]}</h4></div><div class="world-stage">${picture(world,s)}</div><div class="reading-header"><p class="reading-location">${readingLocation()}</p><p>Û${world.toUpperCase()}</p></div>${matrix(s,pair.changed)}<p class="reading-note">${readingNote(s)}</p></article>`;
      }).join('')}</div>
      <p class="diff-legend"><span class="diff-symbol" aria-hidden="true"></span>${pair.changed.length?`${pair.changed.length} outlined cells change between A and B at this sample.`:'No matrix cells change at this sample.'} ${scene==='falling'&&sample==='center'?'Now compare the readings above and below.':''} All matrix entries are dimensionless.</p>
      <div class="outcomes" id="scene-outcomes" ${revealed?'':'hidden'}>${story.outcomes.map((o,i)=>`<div class="outcome"><h4>${i===0?'A':'B'} · ${o[0]}</h4><p>${o[1]}</p></div>`).join('')}</div><p class="takeaway" ${revealed?'':'hidden'}>${story.takeaway}</p>
      <details class="story-method"><summary>What this scene assumes · equations and sources</summary><div class="method-grid"><div><h4>Field and response</h4><p>${story.method}</p></div><div><h4>Objects and boundaries</h4><p>${story.bodies}</p></div></div><p>${story.sources}</p></details>
      <p class="prediction">${story.prediction}</p>`;
  }
  function selectSample(next){
    if(!sampleChoices().some(([id])=>id===next))return;
    sample=next;draw();
    host.querySelector(`.sample-controls [data-sample="${sample}"]`)?.focus({preventScroll:true});
  }
  document.querySelectorAll('[data-scene]').forEach(button=>button.addEventListener('click',()=>{
    scene=button.dataset.scene;sample=scene==='hair'?'left':'center';revealed=false;
    document.querySelectorAll('[data-scene]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    draw();
  }));
  host.addEventListener('click',event=>{
    const sampler=event.target.closest('[data-sample]');
    if(sampler){selectSample(sampler.dataset.sample);return;}
    if(event.target.closest('#reveal-response')){
      revealed=!revealed;host.classList.toggle('revealed',revealed);
      const button=document.getElementById('reveal-response');
      button.textContent=revealed?'Hide the response':'Reveal what happens';button.setAttribute('aria-expanded',String(revealed));
      document.getElementById('scene-outcomes').hidden=!revealed;host.querySelector('.takeaway').hidden=!revealed;
    }
  });
  host.addEventListener('keydown',event=>{
    const target=event.target.closest('g[data-sample]');
    if(target&&(event.key==='Enter'||event.key===' ')){event.preventDefault();selectSample(target.dataset.sample);}
  });
  draw();
})();
