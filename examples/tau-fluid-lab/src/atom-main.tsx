import { useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { FluidStarfield } from './scene';
import { add, length, sub, type Vec3 } from './model';
import { ATOM, atomTensor, cavityAt, chargeColor, integrateAtomLoads, sampleAtomField } from './atom-field';
import { addElectron, clearObservation, createAtomSimulation, removeElectron, stepAtomSimulation, type AtomSimulation } from './atom-simulation';
import { AtomClock, AtomSlice, BodyIndicator, ElectronTrails, LiveFluidTracers, ObservationBox, OccupancyCloud, SLICES, type SliceKind, type SliceRange } from './atom-visuals';
import '@fontsource-variable/inter';
import './starfield.css';
import './atom.css';

const sliceKinds: SliceKind[] = ['pressure', 'electric', 'twist'];
const fixed = (value: number, digits = 2) => value.toFixed(digits);
const vector = (value: Vec3) => value.map(axis => `${axis >= 0 ? '+' : ''}${fixed(axis)}`).join('  ');

function RadialProfile({ simulation }: { simulation: AtomSimulation }) {
  const values = Array.from(simulation.observation.radial, (value, i) => {
    const lo = i * ATOM.halfSize / ATOM.radialBins, hi = (i + 1) * ATOM.halfSize / ATOM.radialBins;
    return value / (4 * Math.PI / 3 * (hi ** 3 - lo ** 3));
  });
  const peak = Math.max(...values, 1e-12);
  return <div className="atom-radial">
    <div className="atom-caption">Observed residence by radius</div>
    <svg viewBox="0 0 288 67" role="img" aria-label="Measured electron residence per shell volume, from zero to 4.4 scene units from the proton">
      <path d="M0 49.5 H288" stroke="#52707d" strokeWidth="0.6" />
      {values.map((value, i) => <rect key={i} x={i * 8 + 1} y={49 - 43 * value / peak} width="6" height={43 * value / peak} rx="1" fill="#b8d8f1" opacity={0.25 + 0.6 * value / peak} />)}
      <text x="0" y="64">0</text><text x="144" y="64" textAnchor="middle">2.2</text><text x="288" y="64" textAnchor="end">4.4 r</text>
    </svg>
    <p>Measured time per shell volume. Bright cloud = more residence; empty space = unvisited so far.</p>
  </div>;
}

function AtomPlayground() {
  const [initial] = useState(() => createAtomSimulation(1));
  const simulation = useRef(initial);
  const [, setRevision] = useState(0);
  const refresh = () => setRevision(value => value + 1);
  const sim = simulation.current;
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [selection, setSelection] = useState<string>('electron-1');
  const [probe, setProbe] = useState<Vec3>([1.1, 0.6, 0.4]);
  const [showMedium, setShowMedium] = useState(true);
  const [showCavities, setShowCavities] = useState(true);
  const [showCloud, setShowCloud] = useState(true);
  const [showTrails, setShowTrails] = useState(true);
  const [showForces, setShowForces] = useState(true);
  const [autoOrbit, setAutoOrbit] = useState(true);
  const [view, setView] = useState<'field' | 'residence'>('field');
  const [sliceVisible, setSliceVisible] = useState<Record<SliceKind, boolean>>({ pressure: true, electric: true, twist: true });
  const [sliceOffsets, setSliceOffsets] = useState<Record<SliceKind, number>>({ pressure: 0, electric: 0, twist: 0 });
  const [sliceOpacity, setSliceOpacity] = useState(0.57);
  const [cloudOpacity, setCloudOpacity] = useState(0.65);
  const [notice, setNotice] = useState('');
  const ranges = useRef<Record<SliceKind, SliceRange>>({ pressure: { low: 0, high: 1 }, electric: { low: 0, high: 0 }, twist: { low: 0, high: 0 } });
  const electronCount = sim.bodies.length - 1;
  const selected = sim.bodies.find(body => body.id === selection);
  const field = sampleAtomField(add(sim.bodies[0].pose.center, probe), sim.bodies, sim.intensity);
  const matrix = atomTensor(field);
  const observation = sim.observation;
  const measuredTime = observation.insideTime + observation.outsideTime;
  const outsideCount = sim.bodies.slice(1).filter(body => sub(body.pose.center, sim.bodies[0].pose.center).some(axis => Math.abs(axis) >= ATOM.halfSize)).length;
  const stars = useMemo(() => {
    let seed = 37129;
    const random = () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 4294967296; };
    return Float32Array.from({ length: 1350 * 3 }, () => (random() * 2 - 1) * ATOM.halfSize);
  }, []);

  const insertElectron = () => {
    const id = addElectron(simulation.current);
    if (id) { setSelection(id); setNotice(''); }
    else setNotice(electronCount >= ATOM.maxElectrons ? 'Eight electrons is the limit for this live prototype.' : 'No clear insertion site found. Try adding again.');
    refresh();
  };
  const remove = (id?: string) => {
    removeElectron(simulation.current, id);
    if (!simulation.current.bodies.some(body => body.id === selection)) setSelection('proton');
    setNotice(''); refresh();
  };
  const newRun = () => {
    const current = simulation.current;
    const next = createAtomSimulation(current.bodies.length - 1, current.initialMotion, current.intensity);
    next.elasticContacts = current.elasticContacts;
    simulation.current = next;
    setSelection(next.bodies.at(-1)!.id); setNotice(''); setPlaying(true); refresh();
  };
  const updateStrength = (intensity: number) => {
    simulation.current.intensity = intensity;
    simulation.current.loads = integrateAtomLoads(simulation.current.bodies, intensity);
    clearObservation(simulation.current); refresh();
  };
  const inspectPoint = (point: Vec3) => { setProbe(point); setSelection('probe'); };

  return <main className="playground atom-playground">
    <div className="scene" aria-label="Continuous proton and electron fluid experiment with three perpendicular tensor slices">
      <Canvas camera={{ position: [10.2, 6.4, 14.8], fov: 48, filmOffset: 7.5, near: 0.1, far: 250 }} dpr={[1, 1.6]} gl={{ antialias: true, alpha: false }}>
        <color attach="background" args={['#040a12']} />
        <AtomClock simulation={simulation} playing={playing} speed={speed} onUpdate={refresh} />
        <ObservationBox />
        {view === 'field' && sliceKinds.filter(kind => sliceVisible[kind]).map(kind => <AtomSlice key={kind} simulation={simulation} kind={kind} offset={sliceOffsets[kind]} opacity={sliceOpacity} onProbe={inspectPoint} ranges={ranges} />)}
        {view === 'field' && showMedium && <>
          <FluidStarfield seeds={stars} time={sim.time} project={point => cavityAt(add(point, simulation.current.bodies[0].pose.center), simulation.current.bodies) ? null : point} color="#729298" opacity={0.24} size={0.019} />
          <LiveFluidTracers simulation={simulation} count={400} />
        </>}
        {showCavities && sim.bodies.map(body => <LiveFluidTracers key={body.id} simulation={simulation} sourceId={body.id} count={260} color={chargeColor(body)} />)}
        {showCloud && <OccupancyCloud simulation={simulation} opacity={cloudOpacity} />}
        {showTrails && <ElectronTrails simulation={simulation} />}
        {sim.bodies.map(body => <BodyIndicator key={body.id} simulation={simulation} body={body} selected={selection === body.id} showForce={showForces && view === 'field'} onSelect={() => setSelection(body.id)} />)}
        {selection === 'probe' && <mesh position={probe}><sphereGeometry args={[0.035, 12, 12]} /><meshBasicMaterial color="#ffffff" depthTest={false} /></mesh>}
        <OrbitControls target={[0, 0, 0]} autoRotate={autoOrbit && playing} autoRotateSpeed={0.23} enableDamping enablePan={false} minDistance={6} maxDistance={42} />
      </Canvas>
    </div>

    <div className="atom-hud">
      <a href={import.meta.env.PROD ? './lab.html' : './'}>τ / FLUID LAB</a>
      <div className="atom-run-status"><i className={playing && !sim.fault ? 'running' : ''} />{sim.fault ? 'NUMERICAL STOP' : playing ? 'LIVE EXPERIMENT' : 'PAUSED'}<span>{fixed(sim.time, 1)} s</span></div>
      <p>Following the moving proton · drag to orbit · scroll to approach</p>
      <div className="atom-view-switch" aria-label="Scene view"><button className={view === 'field' ? 'active' : ''} onClick={() => setView('field')}>Field anatomy</button><button className={view === 'residence' ? 'active' : ''} onClick={() => { setView('residence'); setShowCloud(true); }}>Where electrons go</button></div>
    </div>

    <div className="atom-legends">
      {view === 'field' ? sliceKinds.filter(kind => sliceVisible[kind]).map(kind => <div className="atom-legend" key={kind}>
        <div><span>{SLICES[kind].plane} / {SLICES[kind].title}</span><b>{SLICES[kind].symbol}</b></div>
        <div className="atom-ramp" style={{ background: `linear-gradient(90deg, ${SLICES[kind].low}, ${SLICES[kind].mid}, ${SLICES[kind].high})` }} />
        <div className="atom-legend-values"><span>{fixed(ranges.current[kind].low, 3)}</span><span>{kind === 'pressure' ? 'relative range' : '0 at gray'}</span><span>{fixed(ranges.current[kind].high, 3)}</span></div>
      </div>) : <div className="atom-residence-legend"><span>MEASURED RESIDENCE / {fixed(observation.time, 1)} s</span><p>The cloud fills only where electrons have visited. Dark regions have not been sampled yet.</p></div>}
    </div>

    <aside className="floating-panel atom-panel" aria-label="Proton and electron experiment controls">
      <header className="panel-header"><span>08 / OPEN-ENDED FIELD EXPERIMENT</span><h1>Proton + electrons</h1><p>Add a negative cavity. Watch the shared field change, then let its path leave a record.</p></header>

      <section className="panel-section atom-population">
        <div className="section-title"><h2>In the fluid</h2><span>1 p⁺ / {electronCount} e⁻</span></div>
        <div className="atom-population-actions"><button className="atom-primary" onClick={insertElectron} disabled={electronCount >= ATOM.maxElectrons}>+ Add electron</button><button className="atom-button" disabled={!electronCount} onClick={() => remove(selected?.kind === 'electron' ? selected.id : undefined)}>− Remove</button></div>
        <div className="atom-body-list">
          {sim.bodies.map(body => <div className={`atom-body-row${selection === body.id ? ' selected' : ''}`} key={body.id}>
            <button onClick={() => setSelection(body.id)}><i style={{ borderColor: chargeColor(body) }} /><span><strong>{body.name}</strong><small>{body.kind === 'proton' ? '+1 charge · 32× inertia · free to recoil' : '−1 charge · independent orientation'}</small></span></button>
            {body.kind === 'electron' && <button className="atom-remove" aria-label={`Remove ${body.name}`} onClick={() => remove(body.id)}>×</button>}
          </div>)}
        </div>
        <p className="atom-note">Add or remove while running. Each population change starts a fresh visit record.</p>
        {outsideCount > 0 && <p className="atom-notice">{outsideCount} electron{outsideCount > 1 ? 's are' : ' is'} outside the observation cube. Still simulated; no boundary wall sends it back.</p>}
        {notice && <p className="atom-notice" role="status">{notice}</p>}
      </section>

      <section className="panel-section atom-playback">
        <div className="section-title"><h2>Keep going</h2><span>NO LOOP / NO END TIME</span></div>
        <div className="atom-time"><strong>{fixed(sim.time, 1)}</strong><span>scene seconds</span></div>
        <div className="atom-control-row"><button className="atom-primary" disabled={!!sim.fault} onClick={() => setPlaying(value => !value)}>{playing ? 'Pause' : 'Play'}</button><button className="atom-button" disabled={playing || !!sim.fault} onClick={() => { stepAtomSimulation(simulation.current); stepAtomSimulation(simulation.current); refresh(); }}>Step</button><button className="atom-button" onClick={newRun}>New run ↻</button></div>
        <label className="atom-inline">Time scale<select value={speed} onChange={event => setSpeed(Number(event.target.value))}><option value="0.25">¼×</option><option value="0.5">½×</option><option value="1">1×</option><option value="2">2×</option></select></label>
        <label className="atom-slider">Starting sideways motion <strong>{fixed(sim.initialMotion, 1)}×</strong><input type="range" min="0" max="1.6" step="0.1" value={sim.initialMotion} onChange={event => { sim.initialMotion = Number(event.target.value); refresh(); }} /></label>
        <p className="atom-note">For new electrons and new runs. Zero releases from rest; 1× starts near local turning balance. Each start gets a random plane, yaw, tilt, and angular motion.</p>
        {sim.fault && <p className="atom-notice" role="alert">{sim.fault}</p>}
      </section>

      <section className="panel-section">
        <div className="section-title"><h2>Three cuts through the state</h2><span>CLICK A SLICE TO PROBE</span></div>
        {sliceKinds.map(kind => <div className="atom-slice-control" key={kind}>
          <label className="atom-check"><input type="checkbox" checked={sliceVisible[kind]} onChange={event => setSliceVisible(current => ({ ...current, [kind]: event.target.checked }))} /><i style={{ background: `linear-gradient(135deg, ${SLICES[kind].low}, ${SLICES[kind].high})` }} /><strong>{SLICES[kind].title}</strong><span>{SLICES[kind].plane}</span></label>
          <p>{SLICES[kind].note}</p>
          <label className="atom-slice-offset">{SLICES[kind].axis} offset <input type="range" min={-ATOM.halfSize} max={ATOM.halfSize} step="0.05" value={sliceOffsets[kind]} onChange={event => setSliceOffsets(current => ({ ...current, [kind]: Number(event.target.value) }))} /><output>{fixed(sliceOffsets[kind], 1)}</output></label>
        </div>)}
        <label className="atom-slider">Slice opacity <strong>{Math.round(sliceOpacity * 100)}%</strong><input type="range" min="0.1" max="0.95" step="0.01" value={sliceOpacity} onChange={event => setSliceOpacity(Number(event.target.value))} /></label>
        <p className="atom-note">One shared pressure field. The other two cuts show signed tensor components along different axes; their colors do not label positive and negative particles.</p>
      </section>

      <section className="panel-section">
        <div className="section-title"><h2>Where electrons spend time</h2><span>{fixed(observation.time, 1)} s OBSERVED</span></div>
        <div className="atom-check-grid"><label><input type="checkbox" checked={showCloud} onChange={event => setShowCloud(event.target.checked)} />Visit cloud</label><label><input type="checkbox" checked={showTrails} onChange={event => setShowTrails(event.target.checked)} />Recent paths</label></div>
        <label className="atom-slider">Cloud glow <strong>{Math.round(cloudOpacity * 100)}%</strong><input type="range" min="0.1" max="1" step="0.01" value={cloudOpacity} onChange={event => setCloudOpacity(Number(event.target.value))} /></label>
        <RadialProfile simulation={sim} />
        <dl className="property-list"><div><dt>Cells visited</dt><dd>{observation.occupied.toLocaleString()} / {(ATOM.gridSize ** 3).toLocaleString()}</dd></div><div><dt>Time outside the cube</dt><dd>{measuredTime > 0 ? fixed(observation.outsideTime / measuredTime * 100, 1) : '0.0'}% of electron time</dd></div></dl>
        <button className="atom-button atom-wide" onClick={() => { clearObservation(simulation.current); refresh(); }}>Clear observations · keep motion</button>
        <p className="atom-note">Accumulated positions in the proton’s moving frame. Recent paths retain 20 seconds; the cloud keeps residence totals for this population. Unvisited does not mean forbidden.</p>
      </section>

      <section className="panel-section">
        <div className="section-title"><h2>Inspection</h2><span>{selection === 'probe' ? 'FLUID POINT' : selected?.kind.toUpperCase() ?? '—'}</span></div>
        {selected && <>
          <h3 className="atom-inspection-name">{selected.name}</h3>
          <dl className="property-list">
            <div><dt>Relative position</dt><dd>{vector(sub(selected.pose.center, sim.bodies[0].pose.center))}</dd></div>
            <div><dt>World velocity</dt><dd>{vector(selected.pose.velocity)}</dd></div>
            <div><dt>Net pressure force</dt><dd>{vector(sim.loads[selected.id].force)}</dd></div>
            <div><dt>Distance from proton</dt><dd>{fixed(length(sub(selected.pose.center, sim.bodies[0].pose.center)), 3)}</dd></div>
            <div><dt>Yaw / tilt</dt><dd>{fixed(selected.pose.yaw)} / {fixed(selected.pose.tilt)} rad</dd></div>
            <div><dt>Angular velocity</dt><dd>{vector(selected.pose.angularVelocity)}</dd></div>
          </dl>
          <p className="atom-note">The camera follows the proton’s translation. Its world velocity records its recoil. All values use this experiment’s normalized units.</p>
        </>}
        {selection === 'probe' && <>
          <p className="atom-note">Slice intersection sample at {vector(probe)} relative to the proton.</p>
          {field.inside ? <p className="atom-notice">Inside {sim.bodies.find(body => body.id === field.inside)?.name}: this is a void, with no fluid state to read.</p> : <>
            <dl className="property-list"><div><dt>Capacity q</dt><dd>{fixed(field.q, 4)}</dd></div><div><dt>Electric slip αv⊥</dt><dd>{vector(field.e)}</dd></div><div><dt>Twist αtₚΩ</dt><dd>{vector(field.b)}</dd></div></dl>
            <div className="atom-matrix" aria-label="Local asymmetric tensor matrix">{matrix?.flatMap((row, i) => row.map((value, j) => <span key={`${i}-${j}`} className={i === j ? 'symmetric' : i === 0 || j === 0 ? 'electric' : 'twist'}>{value >= 0 ? '+' : ''}{fixed(value)}</span>))}</div>
          </>}
        </>}
      </section>

      <section className="panel-section">
        <div className="section-title"><h2>Display & field</h2><span>EXPERIMENT CONTROLS</span></div>
        <div className="atom-check-grid"><label><input type="checkbox" checked={showMedium} onChange={event => setShowMedium(event.target.checked)} />Tau medium</label><label><input type="checkbox" checked={showCavities} onChange={event => setShowCavities(event.target.checked)} />Cavity tracers</label><label><input type="checkbox" checked={showForces} onChange={event => setShowForces(event.target.checked)} />Net pushes</label><label><input type="checkbox" checked={autoOrbit} onChange={event => setAutoOrbit(event.target.checked)} />Slow camera orbit</label></div>
        <label className="atom-slider">Field strength <strong>{fixed(sim.intensity, 2)}×</strong><input type="range" min="0.5" max="1.4" step="0.02" value={sim.intensity} onChange={event => updateStrength(Number(event.target.value))} /></label>
        <label className="atom-check"><input type="checkbox" checked={sim.elasticContacts} onChange={event => { sim.elasticContacts = event.target.checked; clearObservation(sim); refresh(); }} />Elastic contact safeguard</label>
        <p className="atom-note">At touching boundaries, this optional toy rule supplies an elastic impulse. {sim.contacts} contact impulses so far. With it off, boundaries may overlap; no annihilation or merger is modeled.</p>
      </section>

      <details className="atom-model-details"><summary>What this experiment can tell us</summary>
        <p>RCCM-GfX-2.tex is the current formal source for this page: §§2–3 supply the pressure and tensor map; §5 the stress-divergence route; §16.2 proposes orbital confinement and quantization.</p>
        <p>This prototype extends the pair’s trial charge-slip halo to multiple sources. It adds their vectors before spending the static-pressure budget, then integrates the change in pressure around each cavity. The local swirls populate the slip and twist tensor readings. Those swirls do not spend pressure in this selective closure.</p>
        <p>The proton is a freely moving +1 torus with an illustrative 32× inertia, and all cavity sizes are enlarged for visibility. The clock never loops. Randomness sets the initial conditions; subsequent wandering follows the calculated pressure forces and optional contact rule.</p>
        <p>The visit cloud is measured trajectory residence. A full fluid PDE, proton boundary solution, helicity confinement, and standing-wave quantization are still missing. No orbital shells or probability lobes are supplied to the solver, so familiar-looking clouds would be observations of this trial model, not a derivation of atomic orbitals.</p>
        <p>The fluid halo remains an assumed field: no-flux, full momentum exchange with the medium, and numerical convergence have not been established.</p>
      </details>
      <footer className="atom-footer"><span>Illustrative RCCM field experiment</span><a href="./pair.html">Open the original pair study ↗</a></footer>
    </aside>
  </main>;
}

createRoot(document.getElementById('root')!).render(<AtomPlayground />);
