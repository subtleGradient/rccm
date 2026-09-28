import { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { FluidStarfield } from './scene';
import { ParticleFlow } from './pair-particles';
import {
  addedMass, integrateBoundary, localResiduals, pairStateAt, PAIR_FIELD, samplePairField, solvePairHistory, tensorAt,
  type CavityId, type PairOptions,
} from './pair-field';
import {
  BoundaryForces, FieldVectors, GapProbe, gapPoint,
  PressureLegend, PressureSlice, separation, TauCube,
} from './pair-visuals';
import { PlaybackPanel, SceneClock } from './playground-controls';
import { length, type Vec3 } from './model';
import '@fontsource-variable/inter';
import './starfield.css';
import './pair.css';

type Selection = CavityId | 'probe' | null;
type VectorMode = 'none' | 'slip' | 'vorticity';
const INITIAL_OPTIONS: PairOptions = { intensity: 1, positiveYaw: 0, positiveTilt: 0, negativeWinding: -1, negativeYaw: 0, negativeTilt: 0 };
const fmt = (value: number, digits = 2) => value.toFixed(digits);
const signed = (value: number) => `${value >= 0 ? '+' : ''}${fmt(value, 3)}`;
const formatVector = (vector: Vec3) => vector.map(value => signed(value)).join('  ');

function LayerRow({ name, detail, color, selected, visible, onSelect, onVisible }: {
  name: string; detail: string; color: string; selected: boolean; visible: boolean;
  onSelect: () => void; onVisible: (value: boolean) => void;
}) {
  return <div className={`layer-row${selected ? ' selected' : ''}`}>
    <button type="button" className="layer-select" aria-pressed={selected} onClick={onSelect}>
      <span className="layer-swatch cavity-swatch" style={{ borderColor: color }} aria-hidden="true" />
      <span className="layer-copy"><strong>{name}</strong><small>{detail}</small></span>
    </button>
    <label className="visibility-toggle">
      <input type="checkbox" aria-label={`Show ${name} markers`} checked={visible} onChange={event => onVisible(event.target.checked)} />
      <span aria-hidden="true" />
    </label>
  </div>;
}

function PairPlayground() {
  const [options, setOptions] = useState<PairOptions>(INITIAL_OPTIONS);
  const history = useMemo(() => solvePairHistory(options), [options]);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [selection, setSelection] = useState<Selection>('probe');
  const [mediumVisible, setMediumVisible] = useState(true);
  const [positiveVisible, setPositiveVisible] = useState(true);
  const [negativeVisible, setNegativeVisible] = useState(true);
  const [pressureVisible, setPressureVisible] = useState(true);
  const [forcesVisible, setForcesVisible] = useState(true);
  const [probeVisible, setProbeVisible] = useState(true);
  const [vectorMode, setVectorMode] = useState<VectorMode>('none');
  const [probeOffset, setProbeOffset] = useState<Vec3>([0, 0, 0]);
  const [compact, setCompact] = useState(() => window.matchMedia('(max-width: 700px)').matches);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 700px)');
    const onChange = () => setCompact(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  useEffect(() => { setTime(0); setPlaying(true); }, [history]);

  const contactTime = history.contactTime;
  const duration = contactTime ?? history.duration;
  const shownTime = Math.min(time, duration);
  const state = pairStateAt(history, shownTime);
  const point = gapPoint(state, probeOffset);
  const field = samplePairField(point, state, options.intensity);
  const readingTensor = tensorAt(point, state, options.intensity);
  const selectedPose = selection === 'positive' || selection === 'negative' ? state[selection] : null;
  const selectedForce = selectedPose ? integrateBoundary(selectedPose, state, options.intensity) : null;
  const residual = selectedPose ? localResiduals(selectedPose, state, options.intensity) : null;

  const changeOptions = (patch: Partial<PairOptions>) => setOptions(value => ({ ...value, ...patch }));
  const onTick = (delta: number) => {
    setTime(value => (value + delta) % duration);
  };
  const onPlay = () => {
    if (!playing && shownTime >= duration - 1e-4) setTime(0);
    setPlaying(value => !value);
  };
  const onScrub = (value: number) => { setPlaying(false); setTime(value); };
  const onReset = () => { setPlaying(false); setTime(0); };
  const probeAxis = (axis: number, value: number) => setProbeOffset(current => current.map((old, i) => i === axis ? value : old) as unknown as Vec3);

  return <main className="playground pair-playground">
    <div className="scene" aria-label="3D pair of fluid cavities with a sampled tau field">
      <Canvas
        key={compact ? 'compact' : 'wide'}
        camera={{ position: compact ? [0, -0.7, 10.3] : [0, 0.35, 9.5], fov: 51, near: 0.1, far: 80 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={['#050a10']} />
        <SceneClock playing={playing} onTick={onTick} />
        <TauCube />
        <>
          {pressureVisible && <PressureSlice history={history} intensity={options.intensity} time={shownTime} visible />}
          {mediumVisible && <FluidStarfield time={shownTime} project={seed => samplePairField(seed, state, options.intensity).inside ? null : seed} opacity={0.42} size={0.026} />}
          <ParticleFlow history={history} intensity={options.intensity} time={shownTime} group="medium" count={340} color="#9cd9d2" visible={mediumVisible} />
          <ParticleFlow history={history} intensity={options.intensity} time={shownTime} group="positive" count={270} color="#f9d96c" visible={positiveVisible} />
          <ParticleFlow history={history} intensity={options.intensity} time={shownTime} group="negative" count={270} color={options.negativeWinding === -1 ? '#bcd9ff' : '#f9d96c'} visible={negativeVisible} />
          <FieldVectors state={state} intensity={options.intensity} mode={vectorMode} />
          <BoundaryForces state={state} intensity={options.intensity} visible={forcesVisible} selected={selection === 'positive' || selection === 'negative' ? selection : null} />
          <GapProbe point={point} state={state} intensity={options.intensity} visible={probeVisible} />
        </>
        <OrbitControls target={[0, 0, 0]} autoRotate autoRotateSpeed={0.32} enablePan={false} enableDamping minDistance={5} maxDistance={15} />
      </Canvas>
    </div>
    {pressureVisible && <PressureLegend />}
    <aside className="floating-panel" aria-label="Pair field controls">
      <header className="panel-header"><span>TAU FLUID LAB / CHARGE FIELD</span><h1>Conjugate cavities</h1><p>Watch the sampled fluid and its boundary pushes. The cavity interiors contain no fluid markers.</p></header>
      <section className="panel-section" aria-labelledby="pair-layers-title">
        <div className="section-title"><h2 id="pair-layers-title">Layers</h2><span>FIELD / DISPLAY</span></div>
        <div className="layer-list">
          <div className="layer-row">
            <span className="layer-swatch medium-swatch" aria-hidden="true" />
            <div className="layer-copy"><strong>Tau medium</strong><small>Fluid parcels and trails</small></div>
            <label className="visibility-toggle"><input type="checkbox" aria-label="Show tau medium" checked={mediumVisible} onChange={event => setMediumVisible(event.target.checked)} /><span aria-hidden="true" /></label>
          </div>
          <LayerRow name="Tornadonut 01" detail="Positive winding · sour yellow" color="#f9d96c" selected={selection === 'positive'} visible={positiveVisible} onSelect={() => setSelection('positive')} onVisible={setPositiveVisible} />
          <LayerRow name="Tornadonut 02" detail={`${options.negativeWinding === -1 ? 'Negative winding · milky blue' : 'Positive winding · sour yellow'}`} color={options.negativeWinding === -1 ? '#bcd9ff' : '#f9d96c'} selected={selection === 'negative'} visible={negativeVisible} onSelect={() => setSelection('negative')} onVisible={setNegativeVisible} />
          <LayerRow name="Gap probe" detail="Two slips and resultant" color="#effff8" selected={selection === 'probe'} visible={probeVisible} onSelect={() => setSelection('probe')} onVisible={setProbeVisible} />
        </div>
        <div className="pair-display-controls">
          <label><input type="checkbox" checked={pressureVisible} onChange={event => setPressureVisible(event.target.checked)} /> Pressure slice</label>
          <label><input type="checkbox" checked={forcesVisible} onChange={event => setForcesVisible(event.target.checked)} /> Boundary pushes</label>
          <label>Vector overlay
            <select value={vectorMode} onChange={event => setVectorMode(event.target.value as VectorMode)}>
              <option value="none">None</option><option value="slip">Transverse slip</option><option value="vorticity">Internal vorticity</option>
            </select>
          </label>
        </div>
      </section>
      <section className="panel-section pair-inspection" aria-labelledby="pair-inspection-title">
        <div className="section-title"><h2 id="pair-inspection-title">Inspection</h2><span>{selection === 'probe' ? 'GAP PROBE' : selection?.toUpperCase() ?? '—'}</span></div>
        {selection === 'probe' && <>
          <p className="inspection-note">Place the probe in the space between the cavities. Arrow directions show each slip and their vector sum.</p>
          <div className="pair-slider-grid">
            {(['X', 'Y', 'Z'] as const).map((axis, i) => <label key={axis}>{axis} offset <strong>{signed(probeOffset[i])}</strong><input type="range" min="-1.2" max="1.2" step="0.02" value={probeOffset[i]} onChange={event => probeAxis(i, Number(event.target.value))} /></label>)}
          </div>
          {!field.inside && <dl className="property-list">
            <div><dt><i className="key-dot positive-key" />T01 slip</dt><dd>{formatVector(field.positive.slip)}</dd></div>
            <div><dt><i className={options.negativeWinding === -1 ? 'key-dot negative-key' : 'key-dot positive-key'} />T02 slip</dt><dd>{formatVector(field.negative.slip)}</dd></div>
            <div><dt><i className="key-dot sum-key" />Resultant slip</dt><dd>{formatVector(field.slip)}</dd></div>
            <div><dt>Slip interaction</dt><dd>{signed(field.interactionPressure)} P</dd></div>
            <div><dt>Static pressure</dt><dd>{fmt(field.staticPressure, 3)} P</dd></div>
            <div><dt>Capacity q</dt><dd>{fmt(field.q, 3)}</dd></div>
            <div><dt>Vorticity Ω</dt><dd>{formatVector(field.omega)}</dd></div>
          </dl>}
          {readingTensor && <details className="tensor-details"><summary>4 × 4 local tensor U</summary><pre>{readingTensor.map(row => row.map(value => value.toFixed(2).padStart(6)).join(' ')).join('\n')}</pre></details>}
          {field.inside && <p className="pair-warning">Probe is inside a cavity. Move it back into the medium.</p>}
        </>}
        {selectedPose && selectedForce && residual && <>
          <div className="inspection-heading"><span className="inspection-mark" style={{ borderColor: selectedPose.winding === 1 ? '#f9d96c' : '#bcd9ff' }} aria-hidden="true" /><h3>Tornadonut {selection === 'positive' ? '01' : '02'}</h3></div>
          <p className="inspection-note">A boundary in the tau medium. Rotation turns the whole field and preserves its declared charge.</p>
          <dl className="property-list">
            <div><dt>Winding</dt><dd>{selectedPose.winding > 0 ? '+1 positive' : '−1 negative'}</dd></div>
            <div><dt>Center</dt><dd>{formatVector(selectedPose.center)}</dd></div>
            <div><dt>Speed</dt><dd>{fmt(length(selectedPose.velocity), 3)} units/s</dd></div>
            <div><dt>Net push</dt><dd>{formatVector(selectedForce.force)}</dd></div>
            <div><dt>Net torque</dt><dd>{formatVector(selectedForce.torque)}</dd></div>
            <div><dt>Added mass</dt><dd>{fmt(addedMass, 3)} normalized</dd></div>
            <div><dt>Boundary flux error</dt><dd>{fmt(residual.boundaryFlux, 3)}</dd></div>
            <div><dt>Divergence error</dt><dd>{fmt(residual.divergence, 3)}</dd></div>
          </dl>
          <div className="pair-slider-grid">
            <label>Yaw <strong>{fmt(selection === 'positive' ? options.positiveYaw : options.negativeYaw, 2)}</strong><input type="range" min="-1.5" max="1.5" step="0.03" value={selection === 'positive' ? options.positiveYaw : options.negativeYaw} onChange={event => changeOptions(selection === 'positive' ? { positiveYaw: Number(event.target.value) } : { negativeYaw: Number(event.target.value) })} /></label>
            <label>Tilt <strong>{fmt(selection === 'positive' ? options.positiveTilt : options.negativeTilt, 2)}</strong><input type="range" min="-1.5" max="1.5" step="0.03" value={selection === 'positive' ? options.positiveTilt : options.negativeTilt} onChange={event => changeOptions(selection === 'positive' ? { positiveTilt: Number(event.target.value) } : { negativeTilt: Number(event.target.value) })} /></label>
          </div>
        </>}
        {selection === null && <p className="empty-inspection">Select a cavity or the gap probe.</p>}
      </section>
      <section className="panel-section pair-hypothesis" aria-labelledby="hypothesis-title">
        <div className="section-title"><h2 id="hypothesis-title">Field hypothesis</h2><span>ADJUSTABLE</span></div>
        <label className="pair-field-slider">Flow strength <strong>{fmt(options.intensity, 2)}×</strong><input type="range" min="0.5" max="1.4" step="0.02" value={options.intensity} onChange={event => changeOptions({ intensity: Number(event.target.value) })} /></label>
        <button type="button" className="pair-secondary-button" onClick={() => changeOptions({ negativeWinding: options.negativeWinding === -1 ? 1 : -1 })}>Conjugate Tornadonut 02 · now {options.negativeWinding === -1 ? 'negative' : 'positive'}</button>
        <p className="pair-context">Conjugation mirrors the winding field. A camera turn or physical rotation does not switch charge.</p>
        <dl className="property-list"><div><dt>Center separation</dt><dd>{fmt(separation(state), 3)}</dd></div><div><dt>Contact</dt><dd>{contactTime === null ? 'None in 10 s' : `${fmt(contactTime, 2)} s`}</dd></div></dl>
        <p className="pair-context">Pressure uses an assumed Bernoulli ledger. Forces integrate the displayed tensor traction over each cavity. Motion uses normalized added mass. Boundary flux and divergence errors expose where this trial field is incomplete.</p>
      </section>
      <PlaybackPanel duration={duration} time={shownTime} playing={playing} onPlay={onPlay} onScrub={onScrub} onReset={onReset} />
      <p className="model-note">Trial 3D field · GfX-2 §§1–5, 10.6, 16.2 · Condensed charge and collapse sections. The field is a hypothesis, not a solved charged-cavity continuum.</p>
    </aside>
  </main>;
}

createRoot(document.getElementById('root')!).render(<PairPlayground />);
