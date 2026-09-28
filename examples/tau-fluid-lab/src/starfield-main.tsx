import { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { FluidStarfield } from './scene';
import { CAVITY, advanceSceneTime, cavityCenter, cavityProjection, entrainedProjection, makeCavityShellSeeds } from './starfield-cavity';
import '@fontsource-variable/inter';
import './starfield.css';

function SceneClock({ playing, onTick }: { playing: boolean; onTick: (delta: number) => void }) {
  const elapsed = useRef(0);
  useFrame((_, delta) => {
    if (!playing) { elapsed.current = 0; return; }
    elapsed.current += Math.min(delta, 0.05);
    if (elapsed.current < 1 / 30) return;
    onTick(elapsed.current);
    elapsed.current = 0;
  });
  return null;
}

function LayersPanel({ mediumVisible, cavityVisible, selected, onMediumVisible, onCavityVisible, onSelect }: {
  mediumVisible: boolean; cavityVisible: boolean; selected: boolean;
  onMediumVisible: (visible: boolean) => void; onCavityVisible: (visible: boolean) => void; onSelect: () => void;
}) {
  return <section className="panel-section" aria-labelledby="layers-title">
    <div className="section-title"><h2 id="layers-title">Layers</h2><span>02</span></div>
    <div className="layer-list">
      <div className="layer-row">
        <span className="layer-swatch medium-swatch" aria-hidden="true" />
        <div className="layer-copy"><strong>Tau medium</strong><small>Fluid markers</small></div>
        <label className="visibility-toggle">
          <input type="checkbox" name="showMedium" aria-label="Show tau medium" checked={mediumVisible} onChange={event => onMediumVisible(event.target.checked)} />
          <span aria-hidden="true" />
        </label>
      </div>
      <div className={`layer-row${selected ? ' selected' : ''}`}>
        <button type="button" className="layer-select" aria-pressed={selected} onClick={onSelect}>
          <span className="layer-swatch cavity-swatch" aria-hidden="true" />
          <span className="layer-copy"><strong>Tornadonut 01</strong><small>Toroidal cavity</small></span>
        </button>
        <label className="visibility-toggle">
          <input type="checkbox" name="showCavity" aria-label="Show Tornadonut 01" checked={cavityVisible} onChange={event => onCavityVisible(event.target.checked)} />
          <span aria-hidden="true" />
        </label>
      </div>
    </div>
  </section>;
}

function InspectionPanel({ selected, time }: { selected: boolean; time: number }) {
  return <section className="panel-section inspection" aria-labelledby="inspection-title">
    <div className="section-title"><h2 id="inspection-title">Inspection</h2><span>{selected ? '01 / 01' : '—'}</span></div>
    {selected ? <>
      <div className="inspection-heading"><span className="inspection-mark" aria-hidden="true" /><h3>Tornadonut 01</h3></div>
      <p className="inspection-note">The core is empty. In the focused tensor model, its inertia belongs to the displaced, entrained tau medium around the boundary.</p>
      <dl className="property-list">
        <div><dt>Source</dt><dd>GfX-2 §5.2</dd></div>
        <div><dt>Center</dt><dd>{cavityCenter(time).map(value => value.toFixed(1)).join(', ')}</dd></div>
        <div><dt>Coasting speed</dt><dd>{(CAVITY.travel / CAVITY.duration).toFixed(2)} units/s</dd></div>
        <div><dt>Intrinsic core mass</dt><dd>0</dd></div>
        <div><dt>Added-mass model</dt><dd>m = k ρτ Vτ</dd></div>
        <div><dt>Major radius</dt><dd>{CAVITY.majorRadius.toFixed(2)}</dd></div>
        <div><dt>Tube radius</dt><dd>{CAVITY.tubeRadius.toFixed(2)}</dd></div>
      </dl>
      <p className="units-note">Geometry and speed in scene units. Motion is prescribed.</p>
    </> : <p className="empty-inspection">Select Tornadonut 01 in Layers to inspect its geometry.</p>}
  </section>;
}

function PlaybackPanel({ time, playing, onPlay, onScrub, onReset }: {
  time: number; playing: boolean; onPlay: () => void; onScrub: (time: number) => void; onReset: () => void;
}) {
  return <section className="panel-section playback" aria-labelledby="playback-title">
    <div className="section-title"><h2 id="playback-title">Playback</h2><span>SCENE TIME</span></div>
    <div className="time-readout"><strong>{time.toFixed(1)}</strong><span>/ {CAVITY.duration.toFixed(1)}</span></div>
    <input type="range" name="sceneTime" aria-label="Scene time" min="0" max={CAVITY.duration} step="0.05" value={time} onChange={event => onScrub(Number(event.target.value))} />
    <div className="playback-actions">
      <button type="button" className="play-button" onClick={onPlay}>{playing ? 'Pause' : 'Play'}</button>
      <button type="button" className="reset-button" onClick={onReset}>Reset to start</button>
    </div>
  </section>;
}

function StarfieldPlayground() {
  const [compact, setCompact] = useState(() => window.matchMedia('(max-width: 700px)').matches);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [mediumVisible, setMediumVisible] = useState(true);
  const [cavityVisible, setCavityVisible] = useState(true);
  const [selected, setSelected] = useState(false);
  const shellSeeds = useMemo(() => makeCavityShellSeeds(1250), []);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 700px)');
    const onChange = () => setCompact(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  const onPlay = () => {
    if (!playing && time >= CAVITY.duration) setTime(0);
    setPlaying(value => !value);
  };
  const onScrub = (value: number) => { setPlaying(false); setTime(value); };
  const onReset = () => { setPlaying(false); setTime(0); };

  return <main className="playground">
    <div className="scene" aria-label="3D tau medium with one toroidal cavity">
      <Canvas
        key={compact ? 'compact' : 'wide'}
        aria-label="Tau fluid starfield"
        camera={{ position: compact ? [0.4, -1.4, 8.5] : [0.4, 0, 8.5], fov: 52, near: 0.1, far: 80 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={['#050a10']} />
        <SceneClock playing={playing} onTick={delta => setTime(value => advanceSceneTime(value, delta))} />
        {mediumVisible && <FluidStarfield project={cavityVisible ? cavityProjection : undefined} time={time} opacity={0.72} />}
        {mediumVisible && cavityVisible && <FluidStarfield seeds={shellSeeds} project={entrainedProjection} time={time} color={selected ? '#e0fff1' : '#b7e3d8'} size={0.057} opacity={0.96} />}
        <OrbitControls target={compact ? [0.4, -1.4, 0] : [0.4, 0, 0]} autoRotate autoRotateSpeed={0.5} enablePan={false} enableDamping minDistance={5} maxDistance={14} />
      </Canvas>
    </div>
    <aside className="floating-panel" aria-label="Scene controls">
      <header className="panel-header"><span>TAU FLUID LAB / COMPONENT PLAYGROUND</span><h1>Coasting cavity</h1><p>One tornadonut moving through the medium.</p></header>
      <LayersPanel mediumVisible={mediumVisible} cavityVisible={cavityVisible} selected={selected} onMediumVisible={setMediumVisible} onCavityVisible={setCavityVisible} onSelect={() => setSelected(value => !value)} />
      <InspectionPanel selected={selected} time={time} />
      <PlaybackPanel time={time} playing={playing} onPlay={onPlay} onScrub={onScrub} onReset={onReset} />
      <p className="model-note">Prescribed motion; no force or mass is solved here.</p>
    </aside>
  </main>;
}

createRoot(document.getElementById('root')!).render(<StarfieldPlayground />);
