import { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { FluidStarfield } from './scene';
import { ParticleFlow } from './pair-particles';
import {
  addedMass, integrateBoundary, localResiduals, pairStateAt, rotationalInertia, samplePairField, solvePairHistory, tensorAt,
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
type Scenario = 'like' | 'opposite';
type PoseAngles = Pick<PairOptions, 'positiveYaw' | 'positiveTilt' | 'negativeYaw' | 'negativeTilt'>;
type InitialOrientation = PoseAngles & Pick<PairOptions, 'positiveYawRate' | 'positiveTiltRate' | 'negativeYawRate' | 'negativeTiltRate'>;
const PRESET_POSE: PoseAngles = { positiveYaw: 0, positiveTilt: 0, negativeYaw: 0, negativeTilt: Math.PI };
const chargeColor = (winding: 1 | -1) => winding === 1 ? '#f9d96c' : '#bcd9ff';
const randomAngleOffset = () => (Math.random() < 0.5 ? -1 : 1) * (0.12 + Math.random() * 0.11);
const randomAngularRate = () => (Math.random() < 0.5 ? -1 : 1) * (0.02 + Math.random() * 0.015);
const randomizeInitialOrientation = (base: PoseAngles): InitialOrientation => ({
  positiveYaw: base.positiveYaw + randomAngleOffset(),
  positiveTilt: base.positiveTilt + randomAngleOffset(),
  negativeYaw: base.negativeYaw + randomAngleOffset(),
  negativeTilt: base.negativeTilt + randomAngleOffset(),
  positiveYawRate: randomAngularRate(),
  positiveTiltRate: randomAngularRate(),
  negativeYawRate: randomAngularRate(),
  negativeTiltRate: randomAngularRate(),
});
const scenarioOptions = (scenario: Scenario, intensity = 1): PairOptions => ({
  intensity,
  startHalfSeparation: scenario === 'like' ? 1.15 : 2,
  positiveWinding: scenario === 'like' ? -1 : 1,
  negativeWinding: -1,
  ...randomizeInitialOrientation(PRESET_POSE),
});
const cavityName = (id: CavityId, scenario: Scenario | null) => scenario === 'like'
  ? id === 'positive' ? 'fake electron 1' : 'fake electron 2'
  : scenario === 'opposite' ? id === 'positive' ? 'fake positron' : 'fake electron'
    : id === 'positive' ? 'Tornadonut 01' : 'Tornadonut 02';
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
  const [options, setOptions] = useState<PairOptions>(() => scenarioOptions('opposite'));
  const [scenario, setScenario] = useState<Scenario | null>('opposite');
  const history = useMemo(() => solvePairHistory(options), [options]);
  const [time, setTime] = useState(0);
  const timeRef = useRef(0);
  const poseBase = useRef<PoseAngles>({ ...PRESET_POSE });
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
  useEffect(() => { timeRef.current = 0; setTime(0); setPlaying(true); }, [history]);

  const contactTime = history.contactTime;
  const duration = history.duration;
  const shownTime = Math.min(time, duration);
  const state = pairStateAt(history, shownTime);
  const point = gapPoint(state, probeOffset);
  const field = samplePairField(point, state, options.intensity);
  const readingTensor = tensorAt(point, state, options.intensity);
  const selectedPose = selection === 'positive' || selection === 'negative' ? state[selection] : null;
  const selectedForce = selectedPose ? integrateBoundary(selectedPose, state, options.intensity) : null;
  const residual = selectedPose ? localResiduals(selectedPose, state, options.intensity) : null;

  const changeOptions = (patch: Partial<PairOptions>) => {
    poseBase.current = {
      positiveYaw: patch.positiveYaw ?? poseBase.current.positiveYaw,
      positiveTilt: patch.positiveTilt ?? poseBase.current.positiveTilt,
      negativeYaw: patch.negativeYaw ?? poseBase.current.negativeYaw,
      negativeTilt: patch.negativeTilt ?? poseBase.current.negativeTilt,
    };
    setOptions(value => ({ ...value, ...patch }));
  };
  const rerollInitialOrientation = () => {
    const orientation = randomizeInitialOrientation(poseBase.current);
    setOptions(current => ({ ...current, ...orientation }));
  };
  const chooseScenario = (next: Scenario) => {
    poseBase.current = { ...PRESET_POSE };
    setScenario(next);
    setOptions(current => scenarioOptions(next, current.intensity));
    timeRef.current = 0;
    setTime(0);
    setSelection('probe');
    setProbeOffset([0, 0, 0]);
    setPositiveVisible(true);
    setNegativeVisible(true);
    setPressureVisible(true);
    setForcesVisible(true);
    setProbeVisible(true);
  };
  const onTick = (delta: number) => {
    const next = timeRef.current + delta;
    if (next >= duration) {
      timeRef.current = 0;
      setTime(0);
      rerollInitialOrientation();
      return;
    }
    timeRef.current = next;
    setTime(next);
  };
  const onPlay = () => {
    if (!playing && shownTime >= duration - 1e-4) {
      timeRef.current = 0;
      setTime(0);
      rerollInitialOrientation();
    }
    setPlaying(value => !value);
  };
  const onScrub = (value: number) => { setPlaying(false); timeRef.current = value; setTime(value); };
  const onReset = () => { setPlaying(false); timeRef.current = 0; setTime(0); };
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
          <ParticleFlow history={history} intensity={options.intensity} time={shownTime} group="positive" count={270} color={chargeColor(options.positiveWinding)} visible={positiveVisible} />
          <ParticleFlow history={history} intensity={options.intensity} time={shownTime} group="negative" count={270} color={chargeColor(options.negativeWinding)} visible={negativeVisible} />
          <FieldVectors state={state} intensity={options.intensity} mode={vectorMode} />
          <BoundaryForces state={state} intensity={options.intensity} visible={forcesVisible} selected={selection === 'positive' || selection === 'negative' ? selection : null} />
          <GapProbe point={point} state={state} intensity={options.intensity} visible={probeVisible} />
        </>
        <OrbitControls target={[0, 0, 0]} autoRotate autoRotateSpeed={0.32} enablePan={false} enableDamping minDistance={5} maxDistance={15} />
      </Canvas>
    </div>
    {pressureVisible && <PressureLegend />}
    <aside className="floating-panel" aria-label="Pair field controls">
      <header className="panel-header"><span>TAU FLUID LAB / CHARGE FIELD</span><h1>Charge encounters</h1><p>Pick an encounter, then watch the moving fluid and the pushes around two empty cavities.</p></header>
      <section className="panel-section pair-scenarios" aria-labelledby="pair-scenarios-title">
        <div className="section-title"><h2 id="pair-scenarios-title">Scenarios</h2><span>STARTING STATES</span></div>
        <article className={`pair-scenario${scenario === 'like' ? ' active' : ''}`}>
          <button type="button" aria-pressed={scenario === 'like'} onClick={() => chooseScenario('like')}><span>01 / LIKE CHARGES</span><strong>fake electron 1 + fake electron 2</strong><small>Start close · spread toward the edges · new orientation and motion each loop</small></button>
          <div className="pair-scenario-story">
            <p>Imagine standing in the fluid between them. Their facing slip flows oppose one another, so that patch of fluid moves less. Less motion leaves more of the local pressure budget as static pressure.</p>
            <p>That higher-pressure patch presses outward on both cavity boundaries. The fluid on their far sides does not cancel the facing flow in the same way, so the pushes are uneven: one cavity is pushed left, the other right. Watch the blue net-push arrows and the widening gap.</p>
          </div>
        </article>
        <article className={`pair-scenario${scenario === 'opposite' ? ' active' : ''}`}>
          <button type="button" aria-pressed={scenario === 'opposite'} onClick={() => chooseScenario('opposite')}><span>02 / OPPOSITE CHARGES</span><strong>fake positron + fake electron</strong><small>Start far apart · meet before 10 s · new orientation and motion each loop</small></button>
          <div className="pair-scenario-story">
            <p>Now stand in the same gap. The facing slip flows run together, speeding the fluid there. In this trial pressure ledger, faster motion spends more of the budget as dynamic pressure, leaving less static pressure in the gap.</p>
            <p>The fluid outside the pair then presses harder than the fluid between them. That uneven squeeze draws both empty boundaries inward. Look for the lower-pressure violet gap and the two force arrows pointing toward each other.</p>
            <p className="pair-scenario-footnote">If these were a real electron and positron and they met, the pair would annihilate. This page holds at its calculated contact until the ten-second loop restarts instead of inventing an annihilation animation; the TeX also proposes a possible pre-contact orbit.</p>
          </div>
        </article>
        <div className="pair-loop-angles" aria-label="Starting yaw, tilt, and angular velocity for this loop">
          <span>THIS LOOP · ANGLES rad · RATES rad/s</span>
          <div><strong>T01 angle</strong><span>yaw {signed(options.positiveYaw)} · tilt {signed(options.positiveTilt)}</span></div>
          <div><strong>T01 rate</strong><span>yaw {signed(options.positiveYawRate)} · tilt {signed(options.positiveTiltRate)}</span></div>
          <div><strong>T02 angle</strong><span>yaw {signed(options.negativeYaw)} · tilt {signed(options.negativeTilt)}</span></div>
          <div><strong>T02 rate</strong><span>yaw {signed(options.negativeYawRate)} · tilt {signed(options.negativeTiltRate)}</span></div>
        </div>
        <p className="pair-scenario-caveat">Illustrative RCCM field sketch, not a solved electron–positron flow. The first load and every loop draw new yaw, tilt, and starting angular motion for both cavities. Their orientation changes the geometry, not the assigned charge.</p>
      </section>
      <section className="panel-section" aria-labelledby="pair-layers-title">
        <div className="section-title"><h2 id="pair-layers-title">Layers</h2><span>FIELD / DISPLAY</span></div>
        <div className="layer-list">
          <div className="layer-row">
            <span className="layer-swatch medium-swatch" aria-hidden="true" />
            <div className="layer-copy"><strong>Tau medium</strong><small>Fluid parcels and trails</small></div>
            <label className="visibility-toggle"><input type="checkbox" aria-label="Show tau medium" checked={mediumVisible} onChange={event => setMediumVisible(event.target.checked)} /><span aria-hidden="true" /></label>
          </div>
          <LayerRow name={cavityName('positive', scenario)} detail={options.positiveWinding === -1 ? 'Negative winding · milky blue' : 'Positive winding · sour yellow'} color={chargeColor(options.positiveWinding)} selected={selection === 'positive'} visible={positiveVisible} onSelect={() => setSelection('positive')} onVisible={setPositiveVisible} />
          <LayerRow name={cavityName('negative', scenario)} detail={options.negativeWinding === -1 ? 'Negative winding · milky blue' : 'Positive winding · sour yellow'} color={chargeColor(options.negativeWinding)} selected={selection === 'negative'} visible={negativeVisible} onSelect={() => setSelection('negative')} onVisible={setNegativeVisible} />
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
            <div><dt><i className={options.positiveWinding === -1 ? 'key-dot negative-key' : 'key-dot positive-key'} />T01 slip</dt><dd>{formatVector(field.positive.slip)}</dd></div>
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
          <div className="inspection-heading"><span className="inspection-mark" style={{ borderColor: chargeColor(selectedPose.winding) }} aria-hidden="true" /><h3>{cavityName(selection as CavityId, scenario)}</h3></div>
          <p className="inspection-note">A boundary in the tau medium. Rotation turns the whole field and preserves its declared charge.</p>
          <dl className="property-list">
            <div><dt>Winding</dt><dd>{selectedPose.winding > 0 ? '+1 positive' : '−1 negative'}</dd></div>
            <div><dt>Center</dt><dd>{formatVector(selectedPose.center)}</dd></div>
            <div><dt>Speed</dt><dd>{fmt(length(selectedPose.velocity), 3)} units/s</dd></div>
            <div><dt>Yaw rate</dt><dd>{signed(selectedPose.angularVelocity[1])} rad/s</dd></div>
            <div><dt>Tilt rate</dt><dd>{signed(selectedPose.angularVelocity[0])} rad/s</dd></div>
            <div><dt>Net push</dt><dd>{formatVector(selectedForce.force)}</dd></div>
            <div><dt>Net torque</dt><dd>{formatVector(selectedForce.torque)}</dd></div>
            <div><dt>Added mass</dt><dd>{fmt(addedMass, 3)} normalized</dd></div>
            <div><dt>Rotational inertia</dt><dd>{fmt(rotationalInertia, 3)} normalized</dd></div>
            <div><dt>Boundary flux error</dt><dd>{fmt(residual.boundaryFlux, 3)}</dd></div>
            <div><dt>Divergence error</dt><dd>{fmt(residual.divergence, 3)}</dd></div>
          </dl>
          <div className="pair-slider-grid">
            <label>Yaw <strong>{fmt(selection === 'positive' ? options.positiveYaw : options.negativeYaw, 2)}</strong><input type="range" min="-1.5" max="1.5" step="0.03" value={selection === 'positive' ? options.positiveYaw : options.negativeYaw} onChange={event => changeOptions(selection === 'positive' ? { positiveYaw: Number(event.target.value) } : { negativeYaw: Number(event.target.value) })} /></label>
            <label>Tilt <strong>{fmt(selection === 'positive' ? options.positiveTilt : options.negativeTilt, 2)}</strong><input type="range" min="-3.5" max="3.5" step="0.03" value={selection === 'positive' ? options.positiveTilt : options.negativeTilt} onChange={event => changeOptions(selection === 'positive' ? { positiveTilt: Number(event.target.value) } : { negativeTilt: Number(event.target.value) })} /></label>
          </div>
        </>}
        {selection === null && <p className="empty-inspection">Select a cavity or the gap probe.</p>}
      </section>
      <section className="panel-section pair-hypothesis" aria-labelledby="hypothesis-title">
        <div className="section-title"><h2 id="hypothesis-title">Field hypothesis</h2><span>ADJUSTABLE</span></div>
        <label className="pair-field-slider">Flow strength <strong>{fmt(options.intensity, 2)}×</strong><input type="range" min="0.5" max="1.4" step="0.02" value={options.intensity} onChange={event => changeOptions({ intensity: Number(event.target.value) })} /></label>
        <button type="button" className="pair-secondary-button" onClick={() => { setScenario(null); changeOptions({ negativeWinding: options.negativeWinding === -1 ? 1 : -1 }); }}>Flip right winding · now {options.negativeWinding === -1 ? 'negative' : 'positive'}</button>
        <p className="pair-context">Conjugation mirrors the winding field. A camera turn or physical rotation does not switch charge.</p>
        <dl className="property-list"><div><dt>Center separation</dt><dd>{fmt(separation(state), 3)}</dd></div><div><dt>Contact</dt><dd>{contactTime === null ? 'None in 10 s' : `${fmt(contactTime, 2)} s · hold to 10 s`}</dd></div></dl>
        <p className="pair-context">This trial Bernoulli ledger emphasizes transverse slip: toroidal circulation contributes only a small background share to pressure. Motion integrates the pressure change around each cavity relative to that cavity alone, with normalized added mass. The green tangential arrows show a separate vorticity-driven twist. Boundary flux and divergence errors expose where the field is incomplete.</p>
      </section>
      <PlaybackPanel duration={duration} time={shownTime} playing={playing} onPlay={onPlay} onScrub={onScrub} onReset={onReset} />
      <p className="model-note">Illustrative 3D field inspired by RCCM-GfX-2 §§1–5, 10.6, 16.2. Pressure, surface forces, and motion follow this toy’s assumed field; they do not establish the physical charge dynamics or annihilation of real particles.</p>
    </aside>
  </main>;
}

createRoot(document.getElementById('root')!).render(<PairPlayground />);
