import { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { add, length, sub, type Vec3 } from './model';
import { ATOM, atomTensor, chargeColor, sampleAtomField, slipAppearance } from './atom-field';
import { addElectron, clearObservation, createAtomSimulation, removeElectron, setOrbital, stepAtomSimulation, type AtomSimulation } from './atom-simulation';
import { AtomClock, AtomSlice, BodyIndicator, ElectronTrails, ObservationBox, OccupancyCloud, SLICES, METRICS, type SliceKind, type SliceMetric, type SliceRange } from './atom-visuals';
import { CavityFlow, FluidVolume } from './atom-fluid';
import { OrbitalReference } from './atom-reference';
import { ORBITALS, type Orbital } from './atom-orbitals';
import '@fontsource-variable/inter';
import './starfield.css';
import './atom.css';

const kinds: SliceKind[] = ['pressure', 'electric', 'twist'];
const orbitalKeys = Object.keys(ORBITALS) as Orbital[];
const metricKeys = Object.keys(METRICS) as SliceMetric[];
const fixed = (value: number, digits = 2) => value.toFixed(digits);
const vector = (value: Vec3) => value.map(axis => `${axis >= 0 ? '+' : ''}${fixed(axis)}`).join('  ');
const referenceURL = 'https://ocw.mit.edu/courses/6-974-fundamentals-of-photonics-quantum-electronics-spring-2006/8a3eb732190cc7fc2520fa122bed8dcd_hydrogen_atom.pdf';

function RadialProfile({ simulation }: { simulation: AtomSimulation }) {
  const values = Array.from(simulation.observation.radial, (value, i) => {
    const lo = i * ATOM.halfSize / ATOM.radialBins, hi = (i + 1) * ATOM.halfSize / ATOM.radialBins;
    return value / (4 * Math.PI / 3 * (hi ** 3 - lo ** 3));
  });
  const peak = Math.max(...values, 1e-12);
  return <div className="atom-radial"><div className="atom-caption">Recorded residence by radius</div>
    <svg viewBox="0 0 288 67" role="img" aria-label={`Recorded electron time per shell volume from zero to ${ATOM.halfSize} scene units`}>
      <path d="M0 49.5 H288" stroke="#52707d" strokeWidth="0.6" />
      {values.map((value, i) => <rect key={i} x={i * 8 + 1} y={49 - 43 * value / peak} width="6" height={43 * value / peak} rx="1" fill="#b8d8f1" opacity={0.25 + 0.6 * value / peak} />)}
      <text x="0" y="64">0</text><text x="144" y="64" textAnchor="middle">{ATOM.halfSize / 2}</text><text x="288" y="64" textAnchor="end">{ATOM.halfSize} r</text>
    </svg><p>This records the animated paths. The lavender reference cloud is supplied separately.</p>
  </div>;
}

function AtomPlayground() {
  const [initial] = useState(() => createAtomSimulation(2));
  const simulation = useRef(initial);
  const [, setRevision] = useState(0);
  const refresh = () => setRevision(value => value + 1);
  const sim = simulation.current;
  const [playing, setPlaying] = useState(true), [speed, setSpeed] = useState(1);
  const [selection, setSelection] = useState('proton'), [probe, setProbe] = useState<Vec3>([1.1, 0.6, 0.4]);
  const [showMedium, setShowMedium] = useState(true), [showCavities, setShowCavities] = useState(true);
  const [showReference, setShowReference] = useState(true), [showCloud, setShowCloud] = useState(true), [showTrails, setShowTrails] = useState(true);
  const [showForces, setShowForces] = useState(false), [autoOrbit, setAutoOrbit] = useState(true);
  const [view, setView] = useState<'field' | 'residence'>('field');
  const [visible, setVisible] = useState<Record<SliceKind, boolean>>({ pressure: true, electric: true, twist: true });
  const [offsets, setOffsets] = useState<Record<SliceKind, number>>({ pressure: 0, electric: 0, twist: 0 });
  const [opacities, setOpacities] = useState<Record<SliceKind, number>>({ pressure: 0.46, electric: 0.5, twist: 0.44 });
  const [metrics, setMetrics] = useState<Record<SliceKind, SliceMetric>>({ pressure: 'capacity', electric: 'slip', twist: 'twist' });
  const [ambient, setAmbient] = useState(0.015), [fluidOpacity, setFluidOpacity] = useState(0.48), [particleCount, setParticleCount] = useState(10000);
  const [cloudOpacity, setCloudOpacity] = useState(0.34), [referenceOpacity, setReferenceOpacity] = useState(0.17);
  const [nextOrbital, setNextOrbital] = useState<Orbital>('1s');
  const ranges = useRef<Record<SliceKind, SliceRange>>({ pressure: { low: 0, high: 1 }, electric: { low: -1, high: 1 }, twist: { low: 0, high: 0 } });
  const electronCount = sim.bodies.length - 1, selected = sim.bodies.find(body => body.id === selection);
  const point = add(sim.bodies[0].pose.center, probe), field = sampleAtomField(point, sim.bodies, sim.intensity), matrix = atomTensor(field);
  const tint = slipAppearance(point, sim.bodies, sim.intensity, sim.interpretation);
  const observation = sim.observation;

  const insert = () => { const id = addElectron(simulation.current, nextOrbital); if (id) setSelection(id); refresh(); };
  const remove = (id?: string) => { removeElectron(simulation.current, id); if (!sim.bodies.some(body => body.id === selection)) setSelection('proton'); refresh(); };
  const changeOrbital = (id: string, orbital: Orbital) => { setOrbital(simulation.current, id, orbital); refresh(); };
  const newRun = (preset?: Orbital[]) => {
    const current = simulation.current, guides = preset ?? current.bodies.slice(1).map(body => body.orbital);
    const next = createAtomSimulation(0, current.motionRate, current.intensity);
    next.avoidance = current.avoidance; next.interpretation = current.interpretation;
    for (const orbital of guides) addElectron(next, orbital);
    simulation.current = next; setSelection(next.bodies.at(-1)!.id); setPlaying(true); refresh();
  };
  const changeMotion = (key: 'motionRate' | 'avoidance', value: number) => { sim[key] = value; clearObservation(sim); refresh(); };
  const allSlices = kinds.every(kind => visible[kind]);

  return <main className="playground atom-playground">
    <div className="scene" aria-label="Knotted proton cavity in a volume of charge-colored tau fluid with independently movable slices">
      <Canvas camera={{ position: [17.8, 10.8, 24.4], fov: 49, filmOffset: 8.5, near: 0.1, far: 250 }} dpr={[1, 1.6]} gl={{ antialias: true, alpha: false }}>
        <color attach="background" args={['#070b13']} />
        <AtomClock simulation={simulation} playing={playing} speed={speed} onUpdate={refresh} />
        <ObservationBox />
        {view === 'field' && kinds.filter(kind => visible[kind]).map(kind => <AtomSlice key={kind} simulation={simulation} kind={kind} metric={metrics[kind]} offset={offsets[kind]} opacity={opacities[kind]} ambient={ambient} onProbe={point => { setProbe(point); setSelection('probe'); }} ranges={ranges} />)}
        {view === 'field' && showMedium && <FluidVolume simulation={simulation} count={particleCount} opacity={fluidOpacity} />}
        {showCavities && sim.bodies.map(body => <CavityFlow key={body.id} simulation={simulation} body={body} />)}
        {showReference && <OrbitalReference simulation={simulation} orbitals={sim.bodies.slice(1).map(body => body.orbital)} opacity={referenceOpacity} />}
        {showCloud && <OccupancyCloud simulation={simulation} opacity={cloudOpacity} />}
        {showTrails && <ElectronTrails simulation={simulation} />}
        {sim.bodies.map(body => <BodyIndicator key={body.id} simulation={simulation} body={body} selected={selection === body.id} showForce={showForces} onSelect={() => setSelection(body.id)} />)}
        {selection === 'probe' && <mesh position={probe}><sphereGeometry args={[0.055, 12, 12]} /><meshBasicMaterial color="#ffffff" depthTest={false} /></mesh>}
        <OrbitControls target={[0, 0, 0]} autoRotate={autoOrbit && playing} autoRotateSpeed={0.16} enableDamping enablePan minDistance={4} maxDistance={85} />
      </Canvas>
    </div>

    <div className="atom-hud">
      <a href={import.meta.env.PROD ? './lab.html' : './'}>τ / FLUID LAB</a>
      <div className="atom-run-status"><i className={playing && !sim.fault ? 'running' : ''} />{sim.fault ? 'STOPPED' : playing ? 'ORBITAL SKETCH' : 'PAUSED'}<span>{fixed(sim.time, 1)} s</span></div>
      <p>Drag to orbit · right-drag to pan · scroll to enter the fluid</p>
      <div className="atom-view-switch" aria-label="Scene view"><button className={view === 'field' ? 'active' : ''} onClick={() => setView('field')}>Fluid & slices</button><button className={view === 'residence' ? 'active' : ''} onClick={() => { setView('residence'); setShowCloud(true); }}>Orbital space</button></div>
      <div className="atom-mini-legend"><span><i className="positive" />Positive slip</span><span><i className="neutral" />Neutral / balanced</span><span><i className="negative" />Negative slip</span></div>
    </div>

    <div className="atom-legends">
      {view === 'field' ? kinds.filter(kind => visible[kind]).map(kind => {
        const metric = METRICS[metrics[kind]];
        return <div className="atom-legend" key={kind}><div><span>{SLICES[kind].plane} / {metric.title}</span><b>{SLICES[kind].axis} {offsets[kind] >= 0 ? '+' : ''}{fixed(offsets[kind], 1)}</b></div>
          <div className="atom-ramp" style={{ background: `linear-gradient(90deg, ${metric.low}, ${metric.mid}, ${metric.high})` }} />
          <div className="atom-legend-values"><span>{fixed(ranges.current[kind].low, 3)}</span><span>{metrics[kind] === 'slip' ? 'source-weighted hue' : metric.symbol}</span><span>{fixed(ranges.current[kind].high, 3)}</span></div></div>;
      }) : <div className="atom-residence-legend"><span>LAVENDER / SUPPLIED SHAPE · ICE BLUE / RECORDED VISITS</span><p>The reference shows where the selected hydrogenic state has probability. Moving cavities explore an illustrative approximation.</p></div>}
    </div>

    <aside className="floating-panel atom-panel" aria-label="Orbital and fluid exploration controls">
      <header className="panel-header"><span>08 / ORBITAL & FLUID PLAYGROUND</span><h1>A knot in the fluid.</h1><p>One positive cavity. A cloud of possibilities. Move through the fluid and cut it open.</p><div className="atom-prototype-tag">Illustrative motion · RCCM-inspired field</div></header>

      <section className="panel-section atom-playback">
        <div className="section-title"><h2>Keep it moving</h2><span>{fixed(sim.time, 1)} s · CONTINUOUS</span></div>
        <div className="atom-control-row"><button className="atom-primary" disabled={!!sim.fault} onClick={() => setPlaying(value => !value)}>{playing ? 'Pause' : 'Play'}</button><button className="atom-button" disabled={playing || !!sim.fault} onClick={() => { for (let i = 0; i < 6; i++) stepAtomSimulation(sim); refresh(); }}>Step</button><button className="atom-button" onClick={() => newRun()}>New run ↻</button></div>
        <label className="atom-inline">Playback speed<select value={speed} onChange={event => setSpeed(Number(event.target.value))}><option value="0.25">¼×</option><option value="0.5">½×</option><option value="1">1×</option><option value="2">2×</option></select></label>
        {sim.fault && <p className="atom-notice" role="alert">{sim.fault}</p>}
      </section>

      <section className="panel-section atom-population">
        <div className="section-title"><h2>In the fluid</h2><span>1 p⁺ / {electronCount} e⁻</span></div>
        <div className="atom-population-actions"><select aria-label="Orbital guide for the next electron" value={nextOrbital} onChange={event => setNextOrbital(event.target.value as Orbital)}>{orbitalKeys.map(key => <option key={key} value={key}>{ORBITALS[key].label}</option>)}</select><button className="atom-primary" disabled={electronCount >= ATOM.maxElectrons} onClick={insert}>+ Electron</button></div>
        <div className="atom-body-list">{sim.bodies.map(body => <div key={body.id} className={`atom-body-card${selection === body.id ? ' selected' : ''}`}>
          <div className="atom-body-row"><button onClick={() => setSelection(body.id)}><i className={body.kind === 'proton' ? 'knot' : ''} style={{ borderColor: chargeColor(body) }} /><span><strong>{body.name}</strong><small>{body.kind === 'proton' ? '+1 · empty knotted tube · enlarged for visibility' : '−1 · independently tumbling cavity'}</small></span></button>{body.kind === 'electron' && <button className="atom-remove" aria-label={`Remove ${body.name}`} onClick={() => remove(body.id)}>×</button>}</div>
          {body.kind === 'electron' && <label className="atom-orbital-select">Shape guide<select value={body.orbital} aria-label={`${body.name} orbital guide`} onChange={event => changeOrbital(body.id, event.target.value as Orbital)}>{orbitalKeys.map(key => <option key={key} value={key}>{ORBITALS[key].label}</option>)}</select></label>}
        </div>)}</div>
        <div className="atom-quick-presets"><span>Try a space</span><button onClick={() => newRun(['1s', '1s'])}>Shared 1s</button><button onClick={() => newRun(['1s', '2s'])}>Nested s</button><button onClick={() => newRun(['1s', '2px'])}>s + p lobes</button></div>
        <p className="atom-note">Two electrons begin in the same 1s guide. Excited shapes are a design palette; this does not assign one separate shell to every electron. Changing a guide reseeds its position.</p>
      </section>

      <section className="panel-section atom-cuts">
        <div className="section-title"><h2>Three movable slices</h2><button className="atom-text-button" onClick={() => setVisible({ pressure: !allSlices, electric: !allSlices, twist: !allSlices })}>{allSlices ? 'Hide all' : 'Show all'}</button></div>
        {view !== 'field' && <button className="atom-button atom-wide" onClick={() => setView('field')}>Show fluid & slices</button>}
        {kinds.map(kind => <div className={`atom-slice-control${visible[kind] ? '' : ' is-off'}`} key={kind}>
          <div className="atom-slice-heading"><span className="atom-axis-badge">{SLICES[kind].plane}</span><select aria-label={`${SLICES[kind].plane} slice quantity`} value={metrics[kind]} onChange={event => setMetrics(current => ({ ...current, [kind]: event.target.value as SliceMetric }))}>{metricKeys.map(metric => <option key={metric} value={metric}>{METRICS[metric].title}</option>)}</select><button aria-label={`Toggle ${SLICES[kind].plane} slice`} aria-pressed={visible[kind]} className={`atom-toggle${visible[kind] ? ' on' : ''}`} onClick={() => setVisible(current => ({ ...current, [kind]: !current[kind] }))}>{visible[kind] ? 'ON' : 'OFF'}</button></div>
          <label className="atom-slice-offset">Move {SLICES[kind].axis}<input type="range" min={-ATOM.halfSize} max={ATOM.halfSize} step="0.05" value={offsets[kind]} aria-label={`${SLICES[kind].plane} slice position on ${SLICES[kind].axis}`} onChange={event => setOffsets(current => ({ ...current, [kind]: Number(event.target.value) }))} /><output>{offsets[kind] >= 0 ? '+' : ''}{fixed(offsets[kind], 1)}</output><button aria-label={`Center ${SLICES[kind].plane} slice`} onClick={() => setOffsets(current => ({ ...current, [kind]: 0 }))}>↺</button></label>
          <label className="atom-slice-offset">Opacity<input type="range" min="0.05" max="0.9" step="0.01" value={opacities[kind]} aria-label={`${SLICES[kind].plane} slice opacity`} onChange={event => setOpacities(current => ({ ...current, [kind]: Number(event.target.value) }))} /><output>{Math.round(opacities[kind] * 100)}%</output></label>
          <p>{METRICS[metrics[kind]].note}</p>
        </div>)}
        <label className="atom-slider">Ambient visibility <strong>{Math.round(ambient * 100)}%</strong><input type="range" min="0" max="0.3" step="0.005" value={ambient} onChange={event => setAmbient(Number(event.target.value))} /></label>
        <p className="atom-note">Slide each cut across the full 24-unit volume. Click a cut to inspect the fluid there. Ambient values fade toward transparent.</p>
      </section>

      <section className="panel-section">
        <div className="section-title"><h2>Read the fluid</h2><span>YELLOW / GRAY / BLUE</span></div>
        <div className="atom-fluid-ramp"><span>Negative</span><span>Neutral / balanced</span><span>Positive</span></div>
        <p className="atom-note">Each tracer borrows color from nearby charge-linked slip sources. Opposing contributions mix toward gray; overlapping negative contributions deepen the blue. Color stays tied to charge when a cavity tumbles.</p>
        <label className="atom-check atom-hypothesis"><input type="checkbox" checked={sim.interpretation > 0} onChange={event => { sim.interpretation = event.target.checked ? 0.65 : 0; sim.revision++; refresh(); }} />Show proposed blue avoided regions</label>
        <p className="atom-note">A visual hypothesis: tint orbital nodes blue and soften preferred regions toward gray. This overlay explores your capacity idea; its colors are authored, and do not cause the guided motion. Scalar capacity q remains a separate reading.</p>
        <label className="atom-slider">Fluid density <strong>{particleCount.toLocaleString()} tracers</strong><input type="range" min="3000" max="18000" step="1000" value={particleCount} onChange={event => setParticleCount(Number(event.target.value))} /></label>
        <label className="atom-slider">Fluid visibility <strong>{Math.round(fluidOpacity * 100)}%</strong><input type="range" min="0.1" max="0.85" step="0.01" value={fluidOpacity} onChange={event => setFluidOpacity(Number(event.target.value))} /></label>
        <label className="atom-slider">Slip & circulation strength <strong>{fixed(sim.intensity, 1)}×</strong><input type="range" min="0.3" max="2" step="0.05" value={sim.intensity} onChange={event => { sim.intensity = Number(event.target.value); sim.revision++; refresh(); }} /></label>
      </section>

      <section className="panel-section">
        <div className="section-title"><h2>Shapes & wandering</h2><span>GUIDED, NOT SOLVED</span></div>
        <div className="atom-check-grid"><label><input type="checkbox" checked={showReference} onChange={event => setShowReference(event.target.checked)} />Reference cloud</label><label><input type="checkbox" checked={showCloud} onChange={event => setShowCloud(event.target.checked)} />Recorded visits</label><label><input type="checkbox" checked={showTrails} onChange={event => setShowTrails(event.target.checked)} />Recent paths</label><label><input type="checkbox" checked={showForces} onChange={event => setShowForces(event.target.checked)} />Guide nudges</label></div>
        <label className="atom-slider">Lavender reference <strong>{Math.round(referenceOpacity * 100)}%</strong><input type="range" min="0.02" max="0.5" step="0.01" value={referenceOpacity} onChange={event => setReferenceOpacity(Number(event.target.value))} /></label>
        <label className="atom-slider">Recorded cloud glow <strong>{Math.round(cloudOpacity * 100)}%</strong><input type="range" min="0.05" max="0.8" step="0.01" value={cloudOpacity} onChange={event => setCloudOpacity(Number(event.target.value))} /></label>
        <label className="atom-slider">Wandering speed <strong>{fixed(sim.motionRate, 1)}×</strong><input type="range" min="0.25" max="2" step="0.05" value={sim.motionRate} onChange={event => changeMotion('motionRate', Number(event.target.value))} /></label>
        <label className="atom-slider">Mutual avoidance <strong>{fixed(sim.avoidance, 1)}×</strong><input type="range" min="0" max="2" step="0.05" value={sim.avoidance} onChange={event => changeMotion('avoidance', Number(event.target.value))} /></label>
        <p className="atom-note">The supplied 1s, 2s and 2p densities guide a smooth random walk. Gentle avoidance lets electrons give each other room. Their paths are imagined; the cloud shapes come from hydrogenic wavefunctions.</p>
        <RadialProfile simulation={sim} />
        <button className="atom-button atom-wide" onClick={() => { clearObservation(sim); refresh(); }}>Clear recorded visits · keep moving</button>
        <p className="atom-note">{fixed(observation.time, 1)} s recorded · {observation.occupied.toLocaleString()} cells visited. Paths retain 30 seconds. Empty recorded cells mean unvisited so far.</p>
      </section>

      <section className="panel-section">
        <div className="section-title"><h2>Inspection</h2><span>{selection === 'probe' ? 'FLUID POINT' : selected?.kind.toUpperCase() ?? '—'}</span></div>
        {selected && <><h3 className="atom-inspection-name">{selected.name}</h3>
          {selected.kind === 'electron' ? <p className="atom-note">{ORBITALS[selected.orbital].description} Hydrogen reference energy: approximately {selected.orbital === '1s' ? '−13.6' : '−3.4'} eV. This value labels the isolated hydrogen state, not this multi-electron sketch.</p> : <p className="atom-note">A (2,3) trefoil tube with an empty interior. Flow marks wrap around its boundary; there is no solid proton surface. This knot is a chosen visual proxy.</p>}
          <dl className="property-list"><div><dt>Relative position</dt><dd>{vector(sub(selected.pose.center, sim.bodies[0].pose.center))}</dd></div><div><dt>Motion velocity</dt><dd>{vector(selected.pose.velocity)}</dd></div><div><dt>Distance from proton</dt><dd>{fixed(length(sub(selected.pose.center, sim.bodies[0].pose.center)))}</dd></div><div><dt>Yaw / tilt</dt><dd>{fixed(selected.pose.yaw)} / {fixed(selected.pose.tilt)} rad</dd></div></dl>
        </>}
        {selection === 'probe' && <><p className="atom-note">At {vector(probe)} relative to the proton.</p>{field.inside ? <p className="atom-notice">Inside a cavity: no fluid state to read.</p> : <>
          <dl className="property-list"><div><dt>Capacity q</dt><dd>{fixed(field.q, 4)}</dd></div><div><dt>Slip color balance</dt><dd>{fixed(tint.balance, 3)}</dd></div><div><dt>Electric slip αv⊥</dt><dd>{vector(field.e)}</dd></div><div><dt>Twist αtₚΩ</dt><dd>{vector(field.b)}</dd></div></dl>
          <div className="atom-matrix" aria-label="Local illustrative asymmetric tensor matrix">{matrix?.flatMap((row, i) => row.map((value, j) => <span key={`${i}-${j}`} className={i === j ? 'symmetric' : i === 0 || j === 0 ? 'electric' : 'twist'}>{value >= 0 ? '+' : ''}{fixed(value)}</span>))}</div>
        </>}</>}
      </section>

      <section className="panel-section"><div className="section-title"><h2>Scene layers</h2><span>EXPLORE FREELY</span></div><div className="atom-check-grid"><label><input type="checkbox" checked={showMedium} onChange={event => setShowMedium(event.target.checked)} />Volume fluid</label><label><input type="checkbox" checked={showCavities} onChange={event => setShowCavities(event.target.checked)} />Cavity flow</label><label><input type="checkbox" checked={autoOrbit} onChange={event => setAutoOrbit(event.target.checked)} />Camera orbit</label></div></section>

      <details className="atom-model-details"><summary>What is borrowed, and what is imagined?</summary>
        <p><strong>From RCCM-GfX-2.tex:</strong> transverse slip, internal twisting, the remaining scalar capacity, and the asymmetric tensor map (§§1–3). Its atomic-quantization entry is a proposed roadmap. It does not specify a trefoil proton or this electron motion.</p>
        <p><strong>From hydrogen:</strong> analytic 1s, 2s and real 2p probability densities, including the 2s radial node and 2p nodal plane. <a href={referenceURL} target="_blank" rel="noreferrer">MIT’s wavefunction tables ↗</a> supply the shapes; energy labels use the hydrogen 1/n² series and <a href="https://physics.nist.gov/PhysRefData/Handbook/Tables/hydrogentable1.htm" target="_blank" rel="noreferrer">NIST’s ground-state energy ↗</a>. Nodes are not established negative-pressure barriers.</p>
        <p><strong>For this toy:</strong> a trefoil proton, enlarged cavities, orbital-gradient steering, random stirring, soft avoidance, 32:1 visual inertia and optional blue node tint. These make the scene explorable; they do not solve the fluid PDE or show measured electron trajectories. The reference cloud stays separate from recorded visits.</p>
        <p>One proton plus two electrons is the negative hydrogen ion, not helium. Both can share the 1s spatial region; its correlated two-electron density is not represented by these independent hydrogen templates. Additional electrons and excited combinations are an unrestricted design sandbox, not claims of bound atomic states.</p>
        <p>Yellow/gray/blue measures the chosen source-weighted slip interpretation. Gray can mean balance even with nonzero tensor components; it does not assert zero field. The pressure slice uses a separate trial vector-sum budget. The cube is an observation window, and background tracers are replenished at its edges.</p>
      </details>
      <footer className="atom-footer"><span>Visual exploration first · physics solver later</span><a href="./pair.html">Open the unchanged pair study ↗</a></footer>
    </aside>
  </main>;
}
createRoot(document.getElementById('root')!).render(<AtomPlayground />);
