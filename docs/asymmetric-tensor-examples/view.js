(function () {
  'use strict';
  const M = window.TensorExamples;
  const host = document.getElementById('scene-content');
  let scene = 'hair';
  let sample = 'right';
  const source = '<a href="../RCCM-GfX-2.tex">RCCM-GfX-2.tex</a>';
  const eSource = '<a href="https://openstax.org/books/university-physics-volume-2/pages/5-4-electric-field">OpenStax: electric field and F = QE</a>';
  const bSource = '<a href="https://openstax.org/books/university-physics-volume-2/pages/11-5-force-and-torque-on-a-current-loop">OpenStax: magnetic dipole torque</a>';
  const hairSource = '<a href="https://openstax.org/books/college-physics-2e/pages/18-1-static-electricity-and-charge-conservation-of-charge">OpenStax: static charge and repulsion</a>';
  const stories = {
    clock: {
      number:'01 / Two watches', title:'An hour for you. About 47 minutes for your twin.',
      intro:'You and your twin take identical watches to two space stations near an extremely compact star. You stay farther out; he stays closer in. Engines hold both stations in place. During an hour on your watch, his records about 47 minutes. We choose a dramatic imaginary setting so the difference is easy to see.',
      change:'Less pressure capacity at his watch: q = 0.8 at yours; q = 0.5 at his.', held:'Identical watches. Both stations held still. No electric or magnetic field in these readings.',
      worlds:['You · farther from the star','Your twin · closer to the star'],
      outcomes:[['You live through 1 hour','Your watch records 60 minutes. You have time for an hour of reading, eating or talking.'],['He lives through about 47 minutes','His watch records 47 minutes 26 seconds during that same comparison interval. He has less elapsed time for those activities.']],
      takeaway:'His watch, heartbeat and thoughts all keep pace with one another. Life feels normal to him. The difference appears when you compare how much time each of you actually lived through.',
      prediction:'Now imagine he changes to a different brand of watch while staying in the same room. Would that remove the time difference?',
      method:'The model assigns the two resting clocks qA = 0.8 and qB = 0.5. For a shared interval of static background time, dτ = √q dt, so the twin records 60 × √(0.5/0.8) = 47.434… minutes, rounded to 47 min 26 s. These q values are chosen teaching inputs, not a calculation for a specified star or an Earth–Moon prediction. The source identifies remaining capacity with the rate of internal cycles; this illustration does not derive a microscopic oscillator from the fluid equations. The spatial entries remain 1/q.',
      bodies:'Both stations are supported by engines and stationary in the same static, nonrotating field. The engines balance the gravitational pull; this is not a free orbit. Each clock is small enough that field variation across it can be neglected. A pressure gradient can exist around the stations; it is not encoded by a single local matrix. Compare elapsed times over the same background interval after allowing for signal travel time. Travel to the stations and the effects of that journey are outside this comparison.',
      sources:`${source}, §3.1. <a href="../RCCM-Condensed.tex">Condensed</a>, “Pressure Deficits, Symmetry Breaking, and Acoustic Covariance,” separates scalar time dilation from gradients.`
    },
    electric: {
      number:'02 / A charged bead', title:'Swap the charged plates. The bead goes the other way.',
      intro:'Give a light bead a positive charge and put it on a smooth horizontal rail. A positive metal plate sits to its left; a negative plate sits to its right. The bead moves right. Swap the charges on the plates and it moves left. Why?',
      change:'Swap which plate is positive. The electric reading eₓ changes from +0.002 to −0.002.', held:'Same positive bead, starting at rest on the same rail. q = 0.8; other electric and magnetic readings are zero.',
      worlds:['Field points right','Field points left'],
      outcomes:[['The bead moves right','The positive plate on the left repels it; the negative plate on the right attracts it. Both effects point right.'],['The bead moves left','The negative plate on the left attracts it; the positive plate on the right repels it. Both effects now point left.']],
      takeaway:'The electric arrow tells you which way a positive charge gets pushed. A negative charge responds the other way. The bead’s charge matters as much as the field around it.',
      prediction:'Keep either field fixed and replace the bead with a negative charge. Which way would the electric force point?',
      method:'The field is prescribed and approximately uniform over the bead. The dimensionless e coefficient carries the direction; the response fixture adds F = QE with a fixed positive calibration E ∝ e. The pressure pictures explain the qualitative interaction proposed in Condensed; they do not reconstruct the combined pressure field of plates and bead from these numbers. The matrices show the applied electric component and a prescribed scalar background, not the bead’s complete self-plus-interaction state. A uniform applied E can exert force: its own spatial gradient need not be nonzero. Drawings show direction, not force magnitude or a computed trajectory. Reversing a component preserves its squared kinematic load.',
      bodies:'The guide is supported by the laboratory and balances vertical weight; it permits horizontal motion. The bead is initially at rest and treated as a test charge. The field generator and bead self-field are outside the displayed sample.',
      sources:`${source}, §3.2 (slip identification); <a href="../RCCM-Condensed.tex">Condensed</a>, “Coulomb’s Law,” for the proposed circulation/pressure interaction; ${eSource} for the separate conventional response law.`
    },
    compass: {
      number:'03 / A compass', title:'The field gives the needle a twist.',
      intro:'Put a compass flat on a table. Its north tip starts pointing right. Turn on a surrounding magnetic field that points up the page: the north tip starts turning upward. Reverse the field and that tip starts turning downward. The needle’s centre stays on its pin.',
      change:'Reverse the surrounding field: bᵧ = +0.003 → −0.003.', held:'Same needle, with its north tip pointing right and no initial spin. Same pivot. q = 0.8; electric readings are zero.',
      worlds:['Field points up the page','Field points down the page'],
      outcomes:[['North tip starts turning up','The right end moves up while the left end moves down: a counterclockwise turn around the pin.'],['North tip starts turning down','The right end moves down while the left end moves up: a clockwise turn around the same pin.']],
      takeaway:'A field can turn a magnet even when its strength is the same everywhere around it. The needle has an internal magnetic direction; the surrounding field twists that direction toward alignment.',
      prediction:'Start the north tip already pointing along the field. Is there still a sideways twist to get it turning?',
      method:'A small rigid permanent dipole in a prescribed uniform field, with B ∝ b under a fixed positive calibration. The conventional response is τ = m × B. m is the needle’s magnetic moment: its magnetic strength and direction. The two end pushes are an equivalent turning couple, a way to draw the distributed magnetic forces; they are not separate magnetic monopoles or a computed force density inside the needle. In a current-loop representation, opposite current directions on different parts of the loop give opposite magnetic forces and a net torque. The RCCM tensor mapping identifies the external rotational field; the macroscopic torque law is supplied separately. The arrows show initial torque. Without damping the needle can overshoot rather than settle. Translating an ideal fixed dipole requires a field gradient.',
      bodies:'The pivot is attached to the laboratory. It supports weight, fixes the centre, and allows rotation about z. x is right, y is up the page, z is toward you. All three sampler positions report the same external field. The needle’s moment and its own field are not extra entries in that applied-field sample.',
      sources:`${source}, §3.3 (the y-axis vorticity uses the xz/zx pair); <a href="../RCCM-Condensed.tex">Condensed</a>, “The Kinematic Origin of Charge &amp; The Magnetic Anomaly,” for circulation and magnetic moment; ${bSource} for the separate conventional response law.`
    },
    falling: {
      number:'04 / Gravity as unequal squeeze', title:'The stronger push comes from above.',
      intro:'Be the rock above a planet. Fluid presses on you from every side. The planet leaves less static pressure on your underside, so the push from above wins. Here is how circulation becomes that unequal squeeze.',
      change:'Vertical slope: dq/dy = 0 → 2 × 10⁻¹⁶ per metre.', held:'q at the centre = 0.999999999; e = b = 0. Rock initially at rest.',
      worlds:['Equal squeeze · no net push','Stronger above · net push down'],
      outcomes:[['The pushes balance','The fluid squeezes from every side, but the opposing pushes cancel. Low q by itself supplies no direction to fall.'],['The downward push wins','Higher pressure above pushes down harder than lower pressure below pushes up. For this chosen slope, the difference gives about 8.99 m/s² downward.']],
      takeaway:'The rock falls because pressure pushes harder from the side away from the planet. q records how much static pressure remains; the difference across the rock gives the push a direction.',
      prediction:'Now put the same rock halfway between two identical, freely moving masses. Both lower the local q, but their pressure slopes oppose. Does low q alone tell the rock which way to start falling?',
      method:'The causal picture uses Pstatic = Pc − applied loads and q = Pstatic/Pc. Persistent circulation occupies the pressure budget; this is a maintained state, not a continual expenditure of fluid or energy. The source’s body-force bridge is F = −Veff ∇Pstatic, where Veff is an effective hydrodynamic displacement, not the rock’s geometric volume. The numerical comparison remains a local first-order field patch: A has q(y) = q₀; B has q(y) = q₀ + (2 × 10⁻¹⁶ m⁻¹)y. Samples are at y = −1, 0, +1 metre, and exact decimal capacities are retained. c = 299792458 m/s gives −8.987551787… m/s². This uses the focused source’s weak, static, slow-test-body reduction, not its full dynamics.',
      bodies:'The rock includes cavitation structures and the surrounding fluid recruited into their motion. Its isolated, symmetric self-field supplies no preferred direction; these samplers inspect the ambient field. A is a locally uniform field; B approximates a small region above a gravitating body. The planet also responds to the rock. The two are free to move; the illustration freezes an instant and evaluates only the test-body limit. Pressure arrows represent effective ambient pushes; their differences are enormously exaggerated for visibility. Real empty-looking space can have q below one because a distant mass’s field reaches it.',
      sources:`${source}, §2 (finite pressure budget), §5.3 (mass-generated deficit and F = −Veff ∇Pstatic). <a href="../RCCM-Condensed.tex">Condensed</a>, “The Kinematic Origin of Inertia” places the cavitation and surrounding added mass; “Pressure Deficits, Symmetry Breaking, and Acoustic Covariance” separates level from slope.`
    },
    hair: {
      number:'05 / Attraction and repulsion', title:'Flip one charge. The hairs bend toward each other.',
      intro:'Start with two positively charged hair tips. They push apart. Now change only the right tip to negative: they attract. Their roots stay attached, so the free ends tend to bend toward each other. Here is the difference inside RCCM’s pressure picture.',
      change:'Only the right tip’s charge: positive → negative.', held:'Left tip stays positive. Same starting shapes and charge magnitudes. Prescribed background q = 0.8; magnetic readings are zero.',
      worlds:['Like charges · + and +','Opposite charges · + and −'],
      outcomes:[['Repulsion · apart','Higher interaction pressure between the like charges pushes them away from one another.'],['Attraction · together','Lower interaction pressure between opposite charges lets the surrounding pressure push them together.']],
      takeaway:'At the right tip, both matrices are identical: the positive left tip still supplies the same rightward electric field. But the right tip’s own charge has changed. Positive goes with the arrow; negative goes against it. That changes repulsion into attraction.',
      prediction:'Move the sampler to the left tip. Its own charge stayed positive, but the charge making its field changed. Which matrix entries change there?',
      method:'Two idealized tip charges are compared at the same frozen positions. At each tip, the applied electric field comes from the other tip and excludes self-field. A has charges (+Q,+Q); B has (+Q,−Q). At the right tip the applied field stays +x, while the responding charge reverses. At the left tip the applied field reverses and its responding charge stays positive. F = QE therefore reverses both forces. The displayed q is a prescribed scalar background, not a reconstructed total interaction-pressure field. Flipping one charge changes the interaction term even though each source’s squared self-amplitude is unchanged. Condensed supplies the qualitative pressure account; the drawing is not a solved fluid configuration.',
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
  const charge = (x,y,sign,r=24) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${sign==='+'?'#f2ea89':'#cde9fa'}" stroke="var(--ink)" stroke-width="2"/>${text(x,y+7,sign,'','middle')}`;
  const needle = (x,y,length=150) => `<path d="M${x-length/2} ${y}L${x} ${y-12}V${y+12}Z" fill="var(--muted)"/><path d="M${x+length/2} ${y}L${x} ${y-12}V${y+12}Z" fill="var(--magnetic)"/>`;
  function causeCards(label,beats,bridge){
    return `<section class="causal-story" aria-label="${label}"><div class="cause-grid">${beats.map(([title,description,drawing,words],i)=>`<article><div class="world-stage">${svg(description,drawing)}</div><div class="cause-copy"><h4>${i+1}. ${title}</h4><p>${words}</p></div></article>`).join('')}</div><p class="cause-bridge">${bridge}</p></section>`;
  }
  function chargePressure(like=true){
    return text(250,37,like?'Same kind of charge':'Opposite kinds of charge','','middle')+
      `<rect x="213" y="85" width="74" height="100" rx="12" fill="${like?'var(--elecbg)':'var(--capbg)'}"/><circle cx="156" cy="135" r="63" class="field"/><circle cx="344" cy="135" r="63" class="field"/>`+
      charge(156,135,'+')+charge(344,135,like?'+':'−')+
      arrow(219,109,219,159,'field')+arrow(281,like?159:109,281,like?109:159,'field')+
      arrow(like?123:76,218,like?76:123,218)+arrow(like?377:424,218,like?424:377,218)+
      text(250,261,like?'Higher pressure in the gap':'Lower pressure in the gap','','middle');
  }
  function clockStory(){
    const cycles=(y,count)=>Array.from({length:count},(_,i)=>`<path class="field-q" d="M${65+i*45} ${y}q11 -36 22 0t22 0"/>`).join('');
    return causeCards('Why you and your twin accumulate different amounts of time',[
      ['A watch counts physical cycles','A clock counts repeating physical motions, drawn as a row of waves.',
        text(250,45,'A repeating motion','','middle')+cycles(119,8)+text(250,215,'count the cycles → tell the time','','middle'),
        'A quartz watch counts tiny vibrations. An atomic clock counts cycles in atoms. In RCCM, those atoms are organised patterns in the same fluid that fills the space around them.'],
      ['The star changes the clock’s surroundings','Two stationary rooms sit at different distances from a compact star. Less pressure capacity remains at the nearer room.',
        '<circle cx="52" cy="143" r="49" fill="var(--elecbg)" stroke="var(--electric)" stroke-width="2"/><rect x="152" y="112" width="75" height="55" rx="6" fill="var(--paper)" stroke="var(--ink)" stroke-width="2"/><rect x="348" y="112" width="75" height="55" rx="6" fill="var(--paper)" stroke="var(--ink)" stroke-width="2"/>'+text(52,148,'star','label-small','middle')+text(189,146,'twin','','middle')+text(385,146,'you','','middle')+text(189,72,'nearer','label-small','middle')+text(385,72,'farther','label-small','middle')+text(189,220,'less left','label-small','middle')+text(385,220,'more left','label-small','middle')+'<rect x="151" y="184" width="76" height="12" fill="var(--capbg)"/><rect x="151" y="184" width="38" height="12" fill="var(--capacity)"/><rect x="347" y="184" width="76" height="12" fill="var(--capbg)"/><rect x="347" y="184" width="61" height="12" fill="var(--capacity)"/>',
        'The star’s circulating matter leaves less pressure capacity in nearby space. RCCM ties the pace of a particle’s internal cycles to that remaining capacity. Closer in, less remains, so your twin’s clock completes fewer cycles during the same shared interval.'],
      ['Compare the time you each lived','Elapsed time bars show one hour for you and about 47 minutes for your twin.',
        text(45,53,'During the same shared interval:')+text(45,103,'you','label-small')+'<rect x="137" y="78" width="300" height="36" rx="4" fill="var(--capbg)"/>'+text(287,103,'60 minutes','','middle')+text(45,170,'twin','label-small')+'<rect x="137" y="145" width="237" height="36" rx="4" fill="var(--capbg)"/>'+text(255,170,'47 minutes','','middle')+text(250,242,'Both watches work normally.','','middle'),
        'His watch and the processes in his body slow together compared with yours. He feels normal: his own second still feels like a second. You discover the difference by comparing elapsed time, with signal travel time accounted for.']
    ],'<strong>Where it appears in the matrix:</strong> q is the fraction of pressure capacity left at that watch: 0.8 means 80%; 0.5 means 50%. Changing q changes all four green diagonal cells. The time comparison uses those readings; you can follow the story without doing the calculation.');
  }
  function electricStory(){
    return causeCards('Why charged plates push the bead',[
      ['Like charges build pressure between them','Like charges have opposing circulation on their facing sides; the higher pressure between them pushes them apart.',chargePressure(true),
        'RCCM pictures charge as the handedness of tiny circulating structures. For two like charges, the flows on their facing sides oppose one another. Their combined motion is reduced there, leaving more static pressure in the gap. That pressure pushes them apart.'],
      ['Opposite charges lower it','Opposite charges have aligned circulation on their facing sides; lower pressure between them lets the surrounding pressure push them together.',chargePressure(false),
        'For opposite charges, the facing flows run together. Their combined motion uses more of the local pressure budget, leaving less static pressure between them. The higher pressure outside pushes them together.'],
      ['Both plates send this bead right','A positive bead is repelled rightward by the positive left plate and attracted rightward by the negative right plate.',
        '<rect x="50" y="70" width="18" height="139" rx="3" fill="var(--elecbg)"/><rect x="432" y="70" width="18" height="139" rx="3" fill="var(--elecbg)"/>'+text(59,51,'+','','middle')+text(441,51,'−','','middle')+charge(250,145,'+')+arrow(108,115,201,115)+arrow(299,174,392,174)+text(145,86,'repels →','label-small','middle')+text(348,213,'attracts →','label-small','middle')+text(250,265,'Both effects point right.','','middle'),
        'The bead is positive. The positive plate repels it and the negative plate attracts it. With + on the left and − on the right, both effects point right. Swap the plates’ charges and both effects point left.']
    ],'<strong>Where it appears in the matrix:</strong> the two amber cells record the electric direction. Their signs swap when the plates swap. These are readings of the field around the bead; the bead’s own charge tells you how it responds.');
  }
  function compassStory(){
    return causeCards('Why a magnetic field turns the compass needle',[
      ['The needle is already a magnet','Small aligned arrows inside a needle add up to one magnetic direction.',
        '<rect x="70" y="101" width="360" height="75" rx="16" fill="var(--magbg)" stroke="var(--magnetic)" stroke-width="2"/>'+[116,183,250,317,384].map(x=>arrow(x-19,138,x+19,138,'field-b')).join('')+text(49,146,'S','','middle')+text(451,146,'N','','middle')+text(250,235,'Little magnetic directions add up.','','middle'),
        'Inside the needle, many tiny magnetic regions point the same way. Their effects add up to one strong direction, from its south end toward its north end. RCCM connects this internal magnetism to organised circulation in matter.'],
      ['The field supplies a pair of turning pushes','An equivalent pair of opposite pushes acts at separated ends of the needle, turning it counterclockwise around its centre.',
        needle(250,141,235)+'<circle cx="250" cy="141" r="9" fill="var(--ink)"/>'+arrow(132,154,132,223)+arrow(368,126,368,57)+text(132,112,'S','','middle')+text(368,161,'N','','middle')+text(250,38,'Field points up the page','label-small','middle')+text(250,269,'Opposite pushes; the same turn.','','middle'),
        'The surrounding field acts on that internal magnetism. Imagine one hand pushing the north end up the page and another pushing the south end down. The pushes cancel as a shove, but they work together as a twist. That twist is called torque.'],
      ['The pin lets it turn','The north tip begins on the right and turns upward toward the field, while the centre remains on the pin.',
        `<g opacity=".25">${needle(250,147,210)}</g><g transform="rotate(-55 250 147)">${needle(250,147,210)}</g><circle cx="250" cy="147" r="9" fill="var(--ink)"/><path class="solid" d="M380 147Q380 36 275 36M284 31L275 36L284 41"/>`+text(250,268,'North tip starts turning toward the field.','label-small','middle'),
        'The centre is attached to a pin; the ends are free to swing. So the needle rotates. Reverse the surrounding field and the twist reverses. The needle starts turning the other way, even though it begins in exactly the same position.']
    ],'<strong>Where it appears in the matrix:</strong> the purple pair records the surrounding field’s direction. The needle has its own direction, shown by its north tip. You need both directions to know which way it starts turning. The paired push arrows are a picture of the total twist.');
  }
  function hairStory(){
    return causeCards('Why changing one charge changes repulsion into attraction',[
      ['Like charges: more pressure in the gap','Like charges have opposing flow on their facing sides and a higher-pressure gap.',chargePressure(true),
        'RCCM connects charge sign to the handedness of a tiny circulating structure. With like charges, the facing flows oppose each other. Their combined motion is reduced in the gap, leaving more static pressure there. The extra pressure pushes the tips apart.'],
      ['Opposite charges: less pressure in the gap','Flipping the right charge aligns the facing flows and lowers static pressure between them.',chargePressure(false),
        'Flip the right charge and its circulation reverses. The facing flows now reinforce each other. More of the pressure budget goes into motion between the tips, so less static pressure remains there. The higher pressure outside pushes them together.'],
      ['The field and the responding charge are separate','The same rightward applied electric field pushes a positive tip right and a negative tip left.',
        text(250,36,'Same field here →','','middle')+charge(250,107,'+')+arrow(284,107,387,107)+text(85,114,'positive','label-small')+charge(250,191,'−')+arrow(217,191,115,191)+text(333,198,'negative','label-small')+text(250,261,'Different charge → opposite force','','middle'),
        'At the right tip, the field supplied by the left tip still points right. A positive right tip follows it; a negative right tip responds leftward. The field arrow describes the surroundings. The charge sign describes the object placed there.']
    ],'<strong>Look at the right-tip matrices below.</strong> They are the same, yet the force reverses. The object’s charge is additional information. <a href="#electric-components">See where eₓ, eᵧ and e<sub>z</sub> fit into this →</a>');
  }
  const causalStory = () => ({clock:clockStory,electric:electricStory,compass:compassStory,falling:gravityStory,hair:hairStory})[scene]();
  function gravityStory(){
    const ring=(x,y,scale=1)=>`<g transform="translate(${x} ${y}) scale(${scale})"><ellipse cx="0" cy="0" rx="44" ry="26" fill="var(--elecbg)" stroke="var(--electric)" stroke-width="2"/><ellipse cx="0" cy="0" rx="20" ry="10" fill="var(--paper)" stroke="var(--electric)" stroke-width="2"/><path class="field" d="M−31 −13Q−10 −30 17 −20M8 −26L17 −20L7 −17"/></g>`.replaceAll('−','-');
    return `<section class="causal-story" aria-label="Why circulation leads to falling in RCCM">
      <div class="cause-grid">
        <article><div class="world-stage">${svg('Matter represented by persistent circulating rings around cavities.',ring(180,121,1.2)+ring(283,158,.9)+ring(305,77,.7)+text(250,246,'cavities + circulating fluid','','middle'))}</div><h4>1. Matter keeps circulating</h4><p>Your “tornadonuts”: persistent cavitation structures and organised circulation. The rock and the planet both contain these structures. Moving them also recruits surrounding fluid.</p></article>
        <article><div class="world-stage">${svg('The same finite pressure budget is partitioned into circulation load and remaining static pressure.',text(250,50,'One finite pressure budget','','middle')+'<rect x="44" y="82" width="412" height="62" rx="4" fill="var(--capbg)"/><path d="M44 82H183V144H44Z" fill="var(--elecbg)"/>'+text(114,119,'load','','middle')+text(320,119,'static pressure','','middle')+text(250,186,'q = static pressure / full budget','','middle')+text(250,232,'Schematic partition; not the numeric example.','label-small','middle'))}</div><h4>2. Less static pressure remains</h4><p>Circulation occupies part of the budget for as long as it persists. The remainder is static pressure; <strong>q measures that fraction.</strong> In the planet’s exterior field, this remainder is smaller nearer the planet.</p></article>
        <article><div class="world-stage">${svg('A rock above a planet receives a stronger ambient pressure push from above and a weaker push from below.',arrow(250,26,250,82,'field-q pressure-top')+'<path d="M220 100L242 83L269 98L278 121L251 136L222 124Z" fill="#979d91" stroke="var(--ink)" stroke-width="2"/>'+arrow(250,168,250,141,'field-q pressure-bottom')+'<path d="M77 283Q250 140 423 283" fill="var(--capbg)" stroke="var(--capacity)" stroke-width="2"/>'+text(250,261,'planet','','middle')+text(281,46,'stronger push ↓','label-small')+text(281,159,'weaker push ↑','label-small')+arrow(162,88,162,143)+text(90,168,'rock falls','label-small'))}</div><h4>3. The squeeze is unequal</h4><p>The rock’s far side meets higher ambient pressure. Its planet-facing side meets lower pressure. <strong>The push from above exceeds the push from below.</strong> That imbalance accelerates the rock downward.</p></article>
      </div>
      <p class="cause-bridge">The rock and its surrounding moving fluid respond together. The planet responds to the rock too. In this mass-only scene, each body is pushed toward the other’s lower-pressure neighbourhood.</p>
      <p class="cause-bridge"><strong>Now change just the pressure difference.</strong> Keep the centre reading identical. Green arrows show opposing pressure pushes; black arrows show the net result. Arrow differences are exaggerated.</p>
    </section>`;
  }
  function picture(world,s) {
    const isA=world==='a';
    if(scene==='clock'){
      const q=s.q.value, seconds=Math.round(3600*M.clockRate(s)/M.clockRate(M.pair('clock').a));
      const elapsed=`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;
      return svg(`${isA?'Your':'Your twin’s'} watch records ${Math.floor(seconds/60)} minutes and ${seconds%60} seconds during the same comparison interval.`,
        `<rect x="59" y="63" width="68" height="144" rx="5" fill="var(--capbg)"/><rect x="59" y="${207-144*q}" width="68" height="${144*q}" rx="4" fill="var(--capacity)"/>${text(93,235,`${Math.round(q*100)}% left`,'label-small','middle')}<rect x="250" y="43" width="110" height="190" rx="12" fill="var(--magbg)"/><rect x="199" y="80" width="212" height="119" rx="20" fill="var(--paper)" stroke="var(--ink)" stroke-width="3"/>`+
        `<g class="response">${text(305,151,elapsed,'elapsed','middle')}</g>${text(305,179,'minutes : seconds','label-small','middle')}${text(250,27,'Elapsed time during the same wait','label-small','middle')}${text(305,255,isA?'Your watch':'Your twin’s watch','','middle')}`);
    }
    if(scene==='electric'){
      const d=Math.sign(s.e[0]);
      return svg(`Positive test bead in a uniform electric field pointing ${d>0?'right':'left'}.`,
        '<rect x="35" y="54" width="9" height="147" fill="var(--electric)" opacity=".35"/><rect x="456" y="54" width="9" height="147" fill="var(--electric)" opacity=".35"/>'+
        [86,118].map(y=>[115,250,385].map(x=>arrow(x-d*32,y,x+d*32,y,'field')).join('')).join('')+
        text(250,34,'Electric field around the bead','label-small','middle')+text(25,42,d>0?'+':'−')+text(461,42,d>0?'−':'+')+
        '<path class="solid" d="M87 188H412M117 188V210M382 188V210"/><circle cx="250" cy="169" r="18" fill="#f2ea89" stroke="var(--ink)" stroke-width="2"/>'+text(250,175,'+','','middle')+
        `<g class="response">${arrow(250,229,250+d*98,229)}${text(250+d*98,253,'electric force','label-small','middle')}</g>`+text(250,276,'Supported guide; free horizontal motion.','label-small','middle'));
    }
    if(scene==='compass'){
      const d=Math.sign(s.b[1]);
      const field=[80,140,200,300,360,420].map(x=>arrow(x,d>0?220:60,x,d>0?60:220,'field-b')).join('');
      const torque = d>0 ? '<path class="solid" d="M351 142Q351 41 250 41M259 36L250 41L259 46"/>' : '<path class="solid" d="M351 142Q351 243 250 243M259 238L250 243L259 248"/>';
      return svg(`A pivoted needle points right; the uniform magnetic field points ${d>0?'up':'down'} the page.`,
        `<g opacity=".38">${field}</g><circle cx="250" cy="142" r="82" fill="var(--paper)" fill-opacity=".8" stroke="var(--line)" stroke-width="2"/>`+
        text(250,27,d>0?'Field points up the page':'Field points down the page','','middle')+
        '<path d="M170 142L250 130L250 154Z" fill="var(--muted)"/><path d="M330 142L250 130L250 154Z" class="needle"/><circle cx="250" cy="142" r="6" fill="var(--paper)" stroke="var(--ink)" stroke-width="2"/>'+text(317,124,'N')+text(173,124,'S')+
        `${text(250,187,'North tip starts on the right','label-small','middle')}<g class="response">${torque}</g>`+
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
    const rightSign=isA?'+':'−', rightColor=isA?'#f2ea89':'#cde9fa';
    return svg(`Two rooted hairs with ${isA?'two positive tips that repel':'a positive left tip and a negative right tip that attract'}. Amber field arrows come from the other tip; black arrows show force.`,
      '<path d="M96 285Q250 189 404 285" fill="#e6ddd0" stroke="var(--ink)" stroke-width="2"/><path class="solid" d="M219 240Q181 205 180 127M281 240Q319 205 320 127"/>'+text(250,278,'roots anchored in scalp','label-small','middle')+
      `<circle cx="180" cy="116" r="17" fill="#f2ea89" stroke="var(--ink)" stroke-width="2"/><circle cx="320" cy="116" r="17" fill="${rightColor}" stroke="var(--ink)" stroke-width="2"/>${text(180,121,'+','','middle')}${text(320,121,rightSign,'','middle')}`+
      text(250,29,'Electric field from the other tip','label-small','middle')+
      arrow(isA?189:124,66,isA?124:189,66,'field')+arrow(311,66,376,66,'field')+
      `<g class="response">${arrow(159,146,isA?90:228,146)}${arrow(341,146,isA?410:272,146)}${text(132,174,'force','label-small','middle')}${text(368,174,'force','label-small','middle')}</g>`+
      hairDot('left',180)+hairDot('right',320));
  }
  const axes=['t','x','y','z'];
  function matrix(s,changed,mark='changes between A and B'){
    let out='<div class="numeric-matrix" role="group" aria-label="Tensor matrix, basis time x y z"><div></div>'+axes.map(a=>`<div class="axis">${a}</div>`).join('');
    for(let i=0;i<16;i++){
      if(i%4===0)out+=`<div class="axis">${axes[i/4]}</div>`;
      const row=Math.floor(i/4),col=i%4;
      const group=row===col?'cap':row===0||col===0?'elec':'mag';
      const active=changed.includes(i);
      const sign=s.cells[i].value<0?'negative':s.cells[i].value>0?'positive':'zero';
      const color=active||s.cells[i].value!==0?group:'';
      out+=`<div class="numeric-cell ${color} ${active?'changed':''}" data-sign="${sign}" aria-label="${axes[row]} ${axes[col]}: ${s.cells[i].text}${active?'; '+mark:''}">${s.cells[i].text}</div>`;
    }
    return out+'</div>';
  }
  let electricDirection='right';
  const directionNames={right:'Right · x',up:'Up · y',toward:'Toward you · z',diagonal:'Diagonal · x + y + z'};
  function electricGuide(){
    const state=M.electricDirection(electricDirection), origin=[160,165], ends=[[330,165],[160,40],[270,247]];
    const tip=state.e.reduce((p,v,i)=>[p[0]+v/.003*(ends[i][0]-origin[0]),p[1]+v/.003*(ends[i][1]-origin[1])],[...origin]);
    const drawing=ends.map(([x,y])=>arrow(...origin,x,y,'solid ghost')).join('')+
      arrow(...origin,...tip,'field electric-vector')+'<circle cx="160" cy="165" r="5" fill="var(--ink)"/>'+
      text(352,170,'x · right','label-small')+text(160,22,'y · up','label-small','middle')+text(303,251,'z · toward you','label-small')+text(98,191,'sample','label-small');
    const entries=state.e.flatMap((v,i)=>v!==0?[i+1,(i+1)*4]:[]);
    const labels=['eₓ','eᵧ','e<sub>z</sub>'], descriptions=['right (+) / left (−)','up (+) / down (−)','toward you (+) / away (−)'];
    document.getElementById('electric-vector-demo').innerHTML=`<div class="demo-controls" aria-label="Electric field direction">${Object.entries(directionNames).map(([id,label])=>`<button type="button" data-electric-direction="${id}" aria-pressed="${id===electricDirection}">${label}</button>`).join('')}</div><div class="explain-pair vector-demo"><div><div class="world-stage">${svg(`Electric field direction: ${directionNames[electricDirection]}.`,drawing)}</div><div class="component-readings">${state.e.map((v,i)=>`<p><strong>${labels[i]} = ${v}</strong><span>${descriptions[i]}</span></p>`).join('')}</div><p class="small">Same field strength in 3D; only its direction changes. q stays 0.8 and all magnetic entries stay zero. This is a perspective sketch, so arrow length on the page varies.</p></div><div><p class="reading-location">At this one sample location</p>${matrix(state,entries,'active electric component')}<p class="reading-note">${entries.length} amber cells describe ${entries.length/2} nonzero direction component${entries.length===2?'':'s'}. The sign within each pair is fixed by the tensor’s construction.</p></div></div>`;
  }
  let cssChoice='translate';
  const cssExamples={
    translate:{label:'Move right',name:'translateX(80px)',rows:[[1,0,0,80],[0,1,0,0],[0,0,1,0],[0,0,0,1]],changed:[3],explanation:'The last column adds 80 pixels to x. A local point [20, 30, 0, 1] becomes [100, 30, 0, 1].'},
    scale:{label:'Stretch width',name:'scaleX(2)',rows:[[2,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]],changed:[0],explanation:'The first diagonal value doubles x. That same point becomes [40, 30, 0, 1]. The square is drawn twice as wide.'},
    rotate:{label:'Turn in 3D',name:'rotateY(60deg)',rows:[[.5,0,Math.sqrt(3)/2,0],[0,1,0,0],[-Math.sqrt(3)/2,0,.5,0],[0,0,0,1]],changed:[0,2,8,10],explanation:'x and z mix as the square turns around its vertical axis. The grid rounds the two 0.866… entries; the CSS uses their full values. No elapsed time or physical force is implied.'}
  };
  function cssGuide(){
    const fixture=cssExamples[cssChoice], labels=['x','y','z','w'];
    const columns=labels.map((_,c)=>fixture.rows.map(row=>row[c]));
    const css=`matrix3d(${columns.flat().join(', ')})`;
    const serialized=`matrix3d(\n  ${columns.map(col=>col.join(', ')).join(',\n  ')}\n)`;
    const grid='<div class="numeric-matrix" role="group" aria-label="CSS transform matrix, rows and columns x y z w"><div></div>'+labels.map(label=>`<div class="axis">${label}</div>`).join('')+fixture.rows.map((row,r)=>`<div class="axis">${labels[r]}</div>`+row.map((v,c)=>`<div class="numeric-cell transform-cell ${fixture.changed.includes(r*4+c)?'changed':''}" data-sign="${v<0?'negative':v>0?'positive':'zero'}" aria-label="${labels[r]} ${labels[c]}: ${v}">${String(Number(v.toFixed(3))).replace('-','−')}</div>`).join('')).join('')+'</div>';
    document.getElementById('css-transform-demo').innerHTML=`<div class="demo-controls" aria-label="CSS transform example">${Object.entries(cssExamples).map(([id,example])=>`<button type="button" data-css-transform="${id}" aria-pressed="${id===cssChoice}">${example.label}</button>`).join('')}</div><div class="explain-pair css-demo"><div><div class="css-stage" role="img" aria-label="A real CSS square with ${fixture.name}; a dashed outline marks its original position."><span class="css-stage-label">${fixture.name}</span><div class="css-ghost"></div><div class="css-tile" style="transform:${css}">div →</div><span class="css-stage-note">Dashed outline = before</span></div><p>${fixture.explanation}</p></div><div><p class="reading-location">CSS matrix · x, y, z, w</p>${grid}<pre class="css-code"><code>${serialized}</code></pre></div></div>`;
  }
  function drawGuides(){
    document.getElementById('charge-field-picture').innerHTML=svg('One positive source charge. To its left, the electric field points left, giving negative ex. To its right, it points right, giving positive ex.',
      charge(250,134,'+',34)+arrow(188,134,73,134,'field')+arrow(312,134,427,134,'field')+text(250,47,'The source stays positive','','middle')+text(104,198,'eₓ < 0','','middle')+text(396,198,'eₓ > 0','','middle')+text(250,254,'Field direction depends on where you stand.','label-small','middle'));
    document.getElementById('slip-picture').innerHTML=svg('A schematic of neighbouring layers sliding sideways relative to each other. The upper layer moves right while the lower one is the reference.',
      '<path d="M64 165H352L425 218H137Z" fill="var(--capbg)" stroke="var(--capacity)" stroke-width="2"/><path d="M100 91H388L461 144H173Z" fill="var(--elecbg)" stroke="var(--electric)" stroke-width="2"/><path class="solid ghost" d="M137 218L173 144M352 165L388 91"/>'+arrow(193,62,338,62,'field')+text(266,34,'sideways motion','','middle')+text(243,196,'lower layer','label-small','middle')+text(250,268,'A picture of shear within the medium.','label-small','middle'));
    electricGuide();cssGuide();
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
    host.innerHTML=`<div class="scene-header"><div><div class="scene-number">${story.number}</div><h3>${story.title}</h3><p>${story.intro}</p></div></div>
      ${causalStory()}
      <div class="change-strip"><div><strong class="change-label">The one change</strong><p>${story.change}</p></div><div><strong>Held fixed</strong><p>${story.held}</p></div></div>
      ${choices.length?`<div class="sample-controls" aria-label="Sample location"><div class="sample-label">Move the sampler in both worlds:</div>${choices.map(([id,label])=>`<button type="button" data-sample="${id}" aria-pressed="${id===sample}">${label}</button>`).join('')}</div>`:''}
      <div class="worlds">${['a','b'].map((world,i)=>{
        const s=pair[world];return `<article class="world"><div class="world-header"><div class="world-letter">${world.toUpperCase()}</div><h4>${story.worlds[i]}</h4></div><div class="world-stage">${picture(world,s)}</div><div class="outcome"><h4>${story.outcomes[i][0]}</h4><p>${story.outcomes[i][1]}</p></div><div class="reading-header"><p class="reading-location">${readingLocation()}</p><p>Û${world.toUpperCase()}</p></div>${matrix(s,pair.changed)}<p class="reading-note">${readingNote(s)}</p></article>`;
      }).join('')}</div>
      <p class="diff-legend"><span class="diff-symbol" aria-hidden="true"></span>${pair.changed.length?`${pair.changed.length} outlined cells change between A and B at this sample.`:'No matrix cells change at this sample.'} ${scene==='falling'&&sample==='center'?'Now compare the readings above and below.':''} All matrix entries are dimensionless.</p>
      <div class="sign-key" aria-label="Cell sign legend"><span><span class="sign-swatch sign-positive" aria-hidden="true">+</span> Positive · dark on light</span><span><span class="sign-swatch sign-negative" aria-hidden="true">−</span> Negative · light on dark</span><span><span class="sign-swatch sign-zero" aria-hidden="true">0</span> Zero · neutral</span></div>
      <p class="takeaway">${story.takeaway}</p>
      <details class="story-method"><summary>What this scene assumes · equations and sources</summary><div class="method-grid"><div><h4>Field and response</h4><p>${story.method}</p></div><div><h4>Objects and boundaries</h4><p>${story.bodies}</p></div></div><p>${story.sources}</p></details>
      <p class="prediction">${story.prediction}</p>`;
  }
  function selectSample(next){
    if(!sampleChoices().some(([id])=>id===next))return;
    sample=next;draw();
    host.querySelector(`.sample-controls [data-sample="${sample}"]`)?.focus({preventScroll:true});
  }
  document.querySelectorAll('[data-scene]').forEach(button=>button.addEventListener('click',()=>{
    scene=button.dataset.scene;sample=scene==='hair'?'right':'center';
    document.querySelectorAll('[data-scene]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    draw();
  }));
  host.addEventListener('click',event=>{
    const sampler=event.target.closest('[data-sample]');
    if(sampler){selectSample(sampler.dataset.sample);return;}
  });
  host.addEventListener('keydown',event=>{
    const target=event.target.closest('g[data-sample]');
    if(target&&(event.key==='Enter'||event.key===' ')){event.preventDefault();selectSample(target.dataset.sample);}
  });
  document.getElementById('electric-vector-demo').addEventListener('click',event=>{
    const button=event.target.closest('[data-electric-direction]');
    if(!button)return;
    electricDirection=button.dataset.electricDirection;electricGuide();
    document.querySelector(`[data-electric-direction="${electricDirection}"]`).focus({preventScroll:true});
  });
  document.getElementById('css-transform-demo').addEventListener('click',event=>{
    const button=event.target.closest('[data-css-transform]');
    if(!button)return;
    cssChoice=button.dataset.cssTransform;cssGuide();
    document.querySelector(`[data-css-transform="${cssChoice}"]`).focus({preventScroll:true});
  });
  draw();
  drawGuides();
})();
