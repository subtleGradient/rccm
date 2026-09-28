import { useEffect, useMemo, useRef, useState } from 'react';
import { TORUS_MAJOR, TORUS_MINOR, type Vec3 } from './model';
import { ChargeScene } from './charge-scene';
import {
  CHARGE_DURATION, chargeSample, chargeSurfaceForces, chargeTimeline, initialChargeState, stateAt,
  type ChargeCase, type ChargeState,
} from './charge-model';

const STEPS = [
  { short: 'One cavity', title: 'Feel one circulating cavity', cue: 'Follow the blue ring. Fluid circles its equator, and a second, smaller circulation wraps around the tube.',
    focus: 'The pale speckles are tagged bits of tau medium. The ring arrows show a frozen flow direction; the speckles actually move.' },
  { short: 'The gap', title: 'What meets between them?', cue: 'Put a hand in the gap. A and B each contribute motion there. White shows the one resulting fluid velocity.',
    focus: 'For opposite winding the facing flows reinforce. Flip B to like winding: the facing contributions oppose and the same fluid can nearly stagnate.' },
  { short: 'Pressure', title: 'Where is the stronger squeeze?', cue: 'A fast shared current takes more of the finite budget, leaving less static pressure between the cavities.',
    focus: 'Violet is less static pressure; mint is more. Compare the gap with the outside of A. Like winding reverses the difference.' },
  { short: 'Surface pushes', title: 'Add every patch of the squeeze', cue: 'Every mint arrow pushes inward on a bit of cavity surface. Long arrows mean stronger pressure.',
    focus: 'The white arrow sums the whole torus. The cavities are held on aligned rails here; the fixture carries the opposing reaction.' },
  { short: 'Release', title: 'Let the pressure move them', cue: 'Release their positions along the rails. The white force arrows change their velocities; violet arrows show velocity already gained.',
    focus: 'The pressure field is sampled again as the gap changes. The run stops before the surfaces meet or the pair reaches the cube edge.' },
] as const;

function pressureAt(point: Vec3, state: ChargeState, scenario: ChargeCase) {
  const sample = chargeSample(point, state, scenario);
  return sample.inside ? 0 : sample.pressure;
}

function PressureGauge({ title, value }: { title: string; value: number }) {
  return <div className="charge-gauge"><div><span>{title}</span><strong>{Math.round(value * 100)}%</strong></div>
    <div className="charge-gauge-track"><span className={value >= 0.66 ? 'mint' : 'violet'} style={{ width: `${Math.max(0, Math.min(100, value * 100))}%` }} /></div>
  </div>;
}

export function ChargePage() {
  const [scenario, setScenario] = useState<ChargeCase>('opposite');
  const [step, setStep] = useState(1);
  const [separation, setSeparation] = useState(1.88);
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [quality, setQuality] = useState<'high' | 'low'>('high');
  const [showPressure, setShowPressure] = useState(true);
  const [viewKey, setViewKey] = useState(0);
  const guideRef = useRef<HTMLElement>(null);
  const mobileCueRef = useRef<HTMLDivElement>(null);

  const frames = useMemo(() => chargeTimeline(separation, scenario), [separation, scenario]);
  const state = step === 5 ? stateAt(frames, elapsed) : initialChargeState(separation);
  useEffect(() => {
    if (!playing) return;
    let animation = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const delta = Math.min((now - last) / 1000, 0.05);
      last = now;
      setElapsed(previous => {
        const next = previous + delta;
        if (step < 5) return next >= CHARGE_DURATION ? next % CHARGE_DURATION : next;
        if (next >= CHARGE_DURATION || stateAt(frames, next).stopped) return Math.min(next, CHARGE_DURATION);
        return next;
      });
      animation = requestAnimationFrame(tick);
    };
    animation = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animation);
  }, [playing, step, frames]);
  useEffect(() => {
    if (step === 5 && playing && (elapsed >= CHARGE_DURATION || stateAt(frames, elapsed).stopped)) setPlaying(false);
  }, [step, playing, elapsed, frames]);

  const chooseStep = (next: number) => {
    setStep(next);
    setElapsed(0);
    setPlaying(true);
    requestAnimationFrame(() => {
      if (window.matchMedia('(max-width: 860px)').matches) mobileCueRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else guideRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };
  const chooseScenario = (next: ChargeCase) => {
    if (scenario === next) return;
    setScenario(next);
    setElapsed(0);
    setPlaying(step < 5);
  };
  const chooseSeparation = (next: number) => {
    setSeparation(next);
    setElapsed(0);
    setPlaying(step < 5);
  };
  const leftFace = pressureAt([state.left + TORUS_MAJOR + TORUS_MINOR + 0.004, 0, 0], state, scenario);
  const leftOutside = pressureAt([state.left - TORUS_MAJOR - TORUS_MINOR - 0.004, 0, 0], state, scenario);
  const rightFace = pressureAt([state.right - TORUS_MAJOR - TORUS_MINOR - 0.004, 0, 0], state, scenario);
  const rightOutside = pressureAt([state.right + TORUS_MAJOR + TORUS_MINOR + 0.004, 0, 0], state, scenario);
  const centerReading = chargeSample([0, 0, 0], state, scenario);
  const force = useMemo(() => step >= 4 ? chargeSurfaceForces(state, scenario) : null,
    [step, scenario, state.left, state.right]);
  const selected = STEPS[step - 1];

  return <main className="charge-shell">
    <div className="charge-heading"><div><span className="eyebrow">STUDY 05 / CHARGE</span><h1>Why do the cavities move?</h1>
      <p>Stand in the tau fluid between two tornadonuts. Watch the circulation become an unequal squeeze.</p></div>
      <div className="charge-phase-key"><span className="negative">A · electron −</span><span className={scenario === 'like' ? 'negative' : 'positive'}>B · {scenario === 'like' ? 'electron −' : 'positron +'}</span></div>
    </div>
    <div className="charge-layout">
      <section className="charge-workspace" aria-label="Interactive charge fluid scene">
        <div className="charge-toolbar">
          <div className="charge-switch" role="group" aria-label="Charge comparison">
            <button type="button" className={scenario === 'opposite' ? 'active' : ''} aria-pressed={scenario === 'opposite'} onClick={() => chooseScenario('opposite')}>Opposite <span>− +</span></button>
            <button type="button" className={scenario === 'like' ? 'active' : ''} aria-pressed={scenario === 'like'} onClick={() => chooseScenario('like')}>Like <span>− −</span></button>
          </div>
          <span>Change B. Keep the geometry and scale.</span>
        </div>
        <div className="charge-mobile-step" ref={mobileCueRef}><span>{String(step).padStart(2, '0')} / 05</span><h2>{selected.title}</h2><p>{selected.cue}</p></div>
        <div className="charge-viewport">
          <ChargeScene key={viewKey} state={state} startSeparation={separation} scenario={scenario} step={step} visualTime={elapsed} playing={playing} quality={quality} showPressure={showPressure} />
          <div className="charge-viewport-top"><span>τ MEDIUM / ALIGNED PAIR</span><span>{step < 5 ? 'POSITIONS HELD' : state.stopped ? 'RANGE LIMIT' : 'X TRANSLATION RELEASED'}</span></div>
          <div className="charge-viewport-bottom"><span><i className="medium-dot" /> moving fluid</span><span><i className="stream-mark" /> frozen flow direction</span>
            {step >= 3 && <><span><i className="pressure-low" /> lower static pressure</span><span><i className="pressure-high" /> higher static pressure</span></>}
          </div>
          <button type="button" className="charge-view-reset" onClick={() => setViewKey(value => value + 1)}>Reset camera</button>
        </div>
        <div className="charge-transport">
          <button type="button" className="charge-play" onClick={() => { if (step === 5 && state.stopped) setElapsed(0); setPlaying(!playing || state.stopped); }}>{playing ? 'Ⅱ Pause' : '▶ Play'}</button>
          <span>{elapsed.toFixed(2)} <small>/ {CHARGE_DURATION} toy-time</small></span>
          <input type="range" aria-label="Toy time" min="0" max={CHARGE_DURATION} step="0.01" value={elapsed} onChange={event => { setElapsed(Number(event.target.value)); setPlaying(false); }} />
          <button type="button" onClick={() => { setElapsed(0); setPlaying(step < 5); }}>Reset</button>
        </div>
        <div className="charge-look-controls"><label>Starting separation <output>{separation.toFixed(2)}</output><input type="range" min="1.6" max="2.4" step="0.01" value={separation} onChange={event => chooseSeparation(Number(event.target.value))} /></label>
          <label className="charge-checkbox"><input type="checkbox" checked={showPressure} onChange={event => setShowPressure(event.target.checked)} /> Pressure cut</label>
          <label>Detail <select value={quality} onChange={event => setQuality(event.target.value as 'high' | 'low')}><option value="high">Fine</option><option value="low">Light</option></select></label></div>
      </section>
      <aside className="charge-guide" ref={guideRef}>
        <span className="eyebrow">{String(step).padStart(2, '0')} / 05 · CAUSAL WALKTHROUGH</span>
        <h2>{selected.title}</h2>
        <p className="charge-cue">{selected.cue}</p>
        <p className="charge-focus">{selected.focus}</p>
        {step === 1 && <><svg className="charge-cycle-inset" viewBox="0 0 300 124" role="img" aria-label="One fluid route circles the whole ring; a second circles a cross-section of its tube">
          <defs><marker id="cycle-arrow-white" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0 0L6 3.5L0 7" fill="none" stroke="#e6f6ff" strokeWidth="1.5" /></marker><marker id="cycle-arrow-green" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0 0L6 3.5L0 7" fill="none" stroke="#a6ffd0" strokeWidth="1.5" /></marker></defs>
          <text x="70" y="20" fill="#c7dfe8" textAnchor="middle">whole ring</text><text x="226" y="20" fill="#baf5d0" textAnchor="middle">tube cut</text>
          <ellipse cx="70" cy="72" rx="42" ry="25" fill="none" stroke="#99c8fb" strokeWidth="17" /><ellipse cx="70" cy="72" rx="63" ry="39" fill="none" stroke="#e6f6ff" strokeWidth="3" strokeDasharray="210 50" markerEnd="url(#cycle-arrow-white)" />
          <circle cx="226" cy="72" r="26" fill="#9bc9fa" fillOpacity=".72" /><circle cx="226" cy="72" r="39" fill="none" stroke="#a6ffd0" strokeWidth="4" strokeDasharray="162 83" markerEnd="url(#cycle-arrow-green)" />
          <text x="150" y="76" fill="#88abb4" textAnchor="middle" fontSize="22">→</text>
        </svg><div className="charge-explain-key"><span><i className="charge-key-line white" /> around the ring</span><span><i className="charge-key-line green" /> around the tube</span><span><i className="charge-key-wheel" /> small fluid wheel at a sampled place</span></div></>}
        {step === 2 && !centerReading.inside && <div className="charge-readout"><span>AT THE WHITE GAP PROBE</span><div><label>A contributes</label><strong>{Math.abs(centerReading.leftFlow[1]).toFixed(2)} {centerReading.leftFlow[1] >= 0 ? '↑' : '↓'}</strong></div><div><label>B contributes</label><strong>{Math.abs(centerReading.rightFlow[1]).toFixed(2)} {centerReading.rightFlow[1] >= 0 ? '↑' : '↓'}</strong></div><div className="charge-total"><label>One medium moves</label><strong>{Math.abs(centerReading.slip[1]).toFixed(2)} {centerReading.slip[1] >= 0 ? '↑' : '↓'}</strong></div></div>}
        {step >= 3 && <div className="charge-gauges"><span className="charge-readout-title">STATIC PRESSURE / FRACTION OF FULL BUDGET</span>
          <PressureGauge title="A · outside" value={leftOutside} /><PressureGauge title="A · facing gap" value={leftFace} />
          <PressureGauge title="B · facing gap" value={rightFace} /><PressureGauge title="B · outside" value={rightOutside} />
          <p>{scenario === 'opposite' ? 'Less squeeze in the gap; the outside wins.' : 'More squeeze in the gap; the facing sides win.'}</p></div>}
        {step >= 4 && force && <div className="charge-force-readout"><span>WHOLE-SURFACE PRESSURE SUM</span><strong>A {force[0][0] >= 0 ? '→' : '←'} {Math.abs(force[0][0]).toFixed(3)} <i /> B {force[1][0] >= 0 ? '→' : '←'} {Math.abs(force[1][0]).toFixed(3)}</strong><small>Normalized toy force · both cavities respond</small></div>}
        <div className="charge-step-list" aria-label="Guide steps">
          {STEPS.map((item, i) => <button type="button" key={item.short} className={step === i + 1 ? 'active' : ''} onClick={() => chooseStep(i + 1)} aria-current={step === i + 1 ? 'step' : undefined}><b>{String(i + 1).padStart(2, '0')}</b><span>{item.short}</span><i>↗</i></button>)}
        </div>
        <button type="button" className="charge-next" onClick={() => step === 5 ? (setElapsed(0), setPlaying(true)) : chooseStep(step + 1)}>{step === 5 ? 'Release again ↺' : `Next · ${STEPS[step].short} →`}</button>
      </aside>
    </div>
    <p className="charge-model-boundary">An authored aligned teaching fixture for RCCM’s proposed charge pressure mechanism. It does not solve the fluid equations for freely rotated defects; the full core-to-field construction remains open. The field, pressure cut, surface pushes, and released motion here use one shared calculation.</p>
  </main>;
}
