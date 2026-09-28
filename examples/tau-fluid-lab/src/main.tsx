import { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/inter';
import './style.css';
import { FluidViewport, type Layers, type Study } from './scene';
import { ChargePage } from './charge-page';
import { DURATION, DEFAULT_SETTINGS, admissible, parcelSeeds, sampleField, traceParcel, type CoreId, type PairSettings, type Vec3 } from './model';

const STUDIES: Record<Study, { number: string; title: string; subtitle: string; question: string; layers: Layers }> = {
  flow: {
    number: '01', title: 'Follow the fluid', subtitle: 'A parcel has its own route through a travelling pattern.',
    question: 'Follow the white bead as the pair moves. Does the bead travel with the hole?',
    layers: { volume: true, paths: true, streamlines: true, slice: false, twist: false },
  },
  cavities: {
    number: '02', title: 'Open the cavity', subtitle: 'Cut across the pair to see where the medium ends.',
    question: 'Move the slice through a core. Which parts contain fluid, and which are empty?',
    layers: { volume: true, paths: false, streamlines: false, slice: true, twist: false },
  },
  tensor: {
    number: '03', title: 'Read the tensor', subtitle: 'One point in the fluid; seven readings; sixteen matrix slots.',
    question: 'Hold the probe still while the pair passes. Which slots change together?',
    layers: { volume: true, paths: false, streamlines: false, slice: true, twist: true },
  },
  playground: {
    number: '04', title: 'Compose the world', subtitle: 'Place the pair and combine the visible layers.',
    question: 'Turn one core. Which changes come from moving fluid, and which come from your new view?',
    layers: { volume: true, paths: true, streamlines: false, slice: false, twist: true },
  },
};

function validSettings(value: unknown): value is PairSettings {
  if (!value || typeof value !== 'object') return false;
  const p = value as Record<string, unknown>;
  if (typeof p.travel !== 'number' || p.travel < 0 || p.travel > 1.2 || typeof p.intensity !== 'number' || p.intensity < 0.3 || p.intensity > 1.4) return false;
  for (const id of ['electron', 'positron']) {
    const c = p[id] as Record<string, unknown> | undefined;
    if (!c || !Array.isArray(c.offset) || c.offset.length !== 3 || c.offset.some(x => typeof x !== 'number' || !Number.isFinite(x) || Math.abs(x) > 1.4)) return false;
    if (['yaw', 'tilt', 'circulation'].some(key => typeof c[key] !== 'number' || !Number.isFinite(c[key]))) return false;
    if (Math.abs(c.yaw as number) > Math.PI || Math.abs(c.tilt as number) > 1.25 || Math.abs(c.circulation as number) > 1.2) return false;
  }
  return admissible(value as PairSettings);
}

function settingsFromUrl(): PairSettings {
  const raw = new URLSearchParams(location.search).get('pair');
  if (!raw) return DEFAULT_SETTINGS;
  try {
    const parsed: unknown = JSON.parse(raw);
    return validSettings(parsed) ? parsed : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function Nav({ study, query = '' }: { study?: Study | 'charge'; query?: string }) {
  return <header className="topbar">
    <a className="brand" href="./" aria-label="Homepage"><span className="brand-mark">τ</span><span>Tau Fluid Lab</span></a>
    <nav className="desktop-nav" aria-label="Experiments">
      {(Object.keys(STUDIES) as Study[]).map(id => <a key={id} className={study === id ? 'current' : ''} aria-current={study === id ? 'page' : undefined} href={`./${id}.html${query}`}>{STUDIES[id].number} <span>{id === 'cavities' ? 'Cavities' : id === 'tensor' ? 'Tensor' : id === 'playground' ? 'Playground' : 'Flow'}</span></a>)}
      <a className={study === 'charge' ? 'current' : ''} aria-current={study === 'charge' ? 'page' : undefined} href="./charge.html">05 <span>Charge</span></a>
    </nav>
    <span className="topbar-note">A visual field studio</span>
    <details className="mobile-nav"><summary>Experiments <span aria-hidden="true">☰</span></summary><nav aria-label="Experiments">{(Object.keys(STUDIES) as Study[]).map(id => <a key={id} href={`./${id}.html${query}`}>{STUDIES[id].number} {STUDIES[id].title}</a>)}<a href="./charge.html">05 Why cavities move</a></nav></details>
  </header>;
}

function Index() {
  return <>
    <Nav />
    <main className="index-shell">
      <div className="index-intro"><div className="eyebrow">A cube of tau fluid · Five studies</div><h1>Enter the fluid.</h1><p>Two circulating cavities travel through a continuous medium. Follow the fluid, cut open the volume, read the changing tensor, and discover why the pair moves.</p></div>
      <div className="index-art" aria-hidden="true"><div className="art-cube"><span className="art-orbit blue"></span><span className="art-orbit gold"></span><span className="art-beam"></span></div></div>
      <div className="study-cards">{(Object.keys(STUDIES) as Study[]).map(id => <a className="study-card" key={id} href={`./${id}.html`}><span>{STUDIES[id].number} / STUDY</span><strong>{STUDIES[id].title}</strong><p>{STUDIES[id].subtitle}</p><b aria-hidden="true">↗</b></a>)}<a className="study-card charge-feature-card" href="./charge.html"><span>05 / GUIDED STUDY</span><strong>Why cavities move</strong><p>See how circulation changes pressure, surface pushes, and the pair’s motion.</p><b aria-hidden="true">↗</b></a></div>
      <p className="index-footnote">Authored fields for visual exploration. The charge study uses a constrained teaching fixture to connect flow, pressure, and motion.</p>
    </main>
  </>;
}

function Slider({ label, value, min, max, step, unit = '', onChange, disabled = false }: { label: string; value: number; min: number; max: number; step: number; unit?: string; onChange: (value: number) => void; disabled?: boolean }) {
  const id = `control-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  return <div className="slider"><div className="slider-label"><label htmlFor={id}>{label}</label><output htmlFor={id}>{value.toFixed(step < 0.1 ? 2 : 1)}{unit}</output></div><input id={id} name={id} type="range" min={min} max={max} step={step} value={value} disabled={disabled} onChange={event => onChange(Number(event.target.value))} /></div>;
}

function LayerSwitch({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  const id = `layer-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  return <label className="layer-switch" htmlFor={id}><span>{label}</span><input id={id} name={id} type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)} /></label>;
}

function TensorInspector({ point, time, settings }: { point: Vec3; time: number; settings: PairSettings }) {
  const sample = sampleField(point, time, settings);
  if (sample.inside) return <div className="tensor-panel"><div className="panel-head"><span>LOCAL STATE</span><strong>Void</strong></div><p>The probe is inside a cavity. There is no fluid tensor here.</p></div>;
  return <div className="tensor-panel">
    <div className="panel-head"><span>LOCAL STATE</span><strong>{Math.round(sample.q * 100)}% capacity left</strong></div>
    <div className="ledger"><div><span>Ambient load</span><b>{(sample.macro * 100).toFixed(1)}%</b></div><div><span>Flow load</span><b>{(sample.dynamic * 100).toFixed(1)}%</b></div><div><span>Twist load</span><b>{(sample.shear * 100).toFixed(1)}%</b></div></div>
    <div className="meter"><span style={{ width: `${sample.q * 100}%` }}></span></div>
    <div className="tensor-legend"><span><i className="legend-dot blue"></i> slip e</span><span><i className="legend-dot gold"></i> twist b</span></div>
    <div className="matrix-wrap"><div className="matrix-labels"><span></span><span>t</span><span>x</span><span>y</span><span>z</span></div><div className="matrix-content">{sample.U.map((row, i) => <div className="matrix-row" key={i}><span className="matrix-axis">{['t', 'x', 'y', 'z'][i]}</span>{row.map((value, j) => <span key={j} className={`matrix-cell ${i === j ? 'diagonal' : i === 0 || j === 0 ? 'electric' : 'magnetic'}`} title={`U${i}${j} = ${value.toFixed(5)}`}>{value >= 0 ? '+' : ''}{value.toFixed(2)}</span>)}</div>)}</div></div>
    <p className="panel-note">q sets −q and 1/q. The blue and gold pairs reverse sign across the diagonal.</p>
  </div>;
}

function Experiment({ study }: { study: Study }) {
  const info = STUDIES[study];
  const [settings, setSettings] = useState<PairSettings>(settingsFromUrl);
  const [layers, setLayers] = useState<Layers>(info.layers);
  const [time, setTime] = useState(0);
  const timeRef = useRef(0);
  const [playing, setPlaying] = useState(true);
  const playingRef = useRef(true);
  const [speed, setSpeed] = useState(1);
  const speedRef = useRef(1);
  const [opacity, setOpacity] = useState(0.9);
  const [quality, setQuality] = useState<'low' | 'high'>('high');
  const [selected, setSelected] = useState<CoreId>('electron');
  const [sliceAxis, setSliceAxis] = useState(0);
  const [sliceOffset, setSliceOffset] = useState(0);
  const [probe, setProbe] = useState<Vec3>([-0.1, 0.4, 0.1]);
  const [following, setFollowing] = useState(false);
  const [tagged, setTagged] = useState(0);
  const [viewKey, setViewKey] = useState(0);
  const [mobileControls, setMobileControls] = useState(false);
  const query = `?pair=${encodeURIComponent(JSON.stringify(settings))}`;

  useEffect(() => {
    history.replaceState(null, '', `${location.pathname}${query}`);
  }, [query]);

  const resetTime = () => { timeRef.current = 0; setTime(0); playingRef.current = false; setPlaying(false); };
  const changeSettings = (update: (current: PairSettings) => PairSettings) => {
    setSettings(current => { const next = update(current); return validSettings(next) ? next : current; });
    resetTime();
  };
  const updateCore = (id: CoreId, patch: Partial<PairSettings[CoreId]>) => changeSettings(current => ({ ...current, [id]: { ...current[id], ...patch } }));
  const setLayer = (name: keyof Layers, checked: boolean) => setLayers(current => ({ ...current, [name]: checked }));
  const setPlayback = (next: boolean) => { playingRef.current = next; setPlaying(next); };
  const setMoment = (next: number) => { timeRef.current = next; setTime(next); setPlayback(false); };
  const setRate = (next: number) => { speedRef.current = next; setSpeed(next); };
  const path = useMemo(() => traceParcel(parcelSeeds(settings).filter((_, i) => i % 2 === 0)[tagged], settings), [settings, tagged]);
  const probePoint = following ? path[Math.min(path.length - 1, Math.floor(time * 36))] ?? probe : probe;
  const selectedCore = settings[selected];
  const hudReading = study === 'tensor' ? sampleField(probePoint, time, settings) : null;

  return <>
    <Nav study={study} query={query} />
    <main className="experiment-shell">
      <div className="experiment-heading"><div><span className="eyebrow">EXPERIMENT {info.number} / 05</span><h1>{info.title}</h1><p>{info.subtitle}</p></div><div className="study-status"><span className="status-pulse"></span> AUTHORED FIELD · LIVE</div></div>
      <div className="lab-layout">
        <div className="scene-column">
          <div className="viewport-frame">
            <FluidViewport key={viewKey} study={study} settings={settings} time={time} timeRef={timeRef} playingRef={playingRef} speedRef={speedRef} report={setTime} layers={layers} opacity={opacity} sliceAxis={sliceAxis} sliceOffset={sliceOffset} probe={probePoint} selected={selected} tagged={tagged} quality={quality} onSelect={setSelected} onPose={(id, offset) => updateCore(id, { offset })} />
            <div className="viewport-label top-left"><span className="crosshair">⌁</span> TAU CONTINUUM <small>01 / PAIR</small></div>
            <div className="viewport-label top-right">X ±{2.2} &nbsp; Y ±{2.2} &nbsp; Z ±{2.2}</div>
            <div className="viewport-caption"><span className="key-pair"><i className="legend-dot blue"></i> Electron</span><span className="key-pair"><i className="legend-dot gold"></i> Positron</span><span className="caption-separator"></span><span>{layers.paths ? 'Moving lines = tagged fluid' : layers.slice ? 'Colored plane = capacity cut' : 'Orbit to inspect depth'}</span>{layers.twist && <span>Ring + shaft = local internal twist axis</span>}</div>
            {hudReading && <div className="tensor-hud"><span>PROBE / TENSOR</span>{hudReading.inside ? <strong>VOID</strong> : <><strong>{Math.round(hudReading.q * 100)}% capacity</strong><div className="hud-matrix">{hudReading.U.flatMap((row, i) => row.map((value, j) => <span key={`${i}-${j}`} className={i === j ? 'bulk' : i === 0 || j === 0 ? 'slip' : 'twist'}>{value >= 0 ? '+' : ''}{value.toFixed(2)}</span>))}</div></>}</div>}
            <button className="view-reset" type="button" onClick={() => setViewKey(value => value + 1)}>Reset view</button>
          </div>
          <div className="transport"><button type="button" className="play-button" onClick={() => setPlayback(!playing)} aria-label={playing ? 'Pause' : 'Play'}>{playing ? 'Ⅱ' : '▶'}</button><button type="button" className="step-button" onClick={() => setMoment(Math.min(DURATION, time + 1 / 36))} aria-label="Step one frame">↦</button><span className="time-number">{time.toFixed(1)} <small>/ {DURATION.toFixed(0)}s</small></span><input type="range" aria-label="Experiment time" name="experiment-time" min="0" max={DURATION} step="0.01" value={time} onChange={event => setMoment(Number(event.target.value))} /><select aria-label="Playback speed" name="playback-speed" value={speed} onChange={event => setRate(Number(event.target.value))}><option value="0.25">¼×</option><option value="0.5">½×</option><option value="1">1×</option><option value="2">2×</option></select></div>
          {study === 'tensor' && <div className="tensor-spotlight"><TensorInspector point={probePoint} time={time} settings={settings} /></div>}
          <div className="scene-question"><span>LOOK FOR</span><p>{info.question}</p></div>
        </div>
        <aside className={`control-panel ${mobileControls ? 'open' : ''}`}>
          <button type="button" className="mobile-control-toggle" onClick={() => setMobileControls(!mobileControls)}>{mobileControls ? 'Close controls' : 'Open controls'} <span aria-hidden="true">⌃</span></button>
          <div className="control-content">
            <section className="control-section"><div className="section-heading"><span>01 / SOURCE</span><strong>Two circulating cavities</strong></div><div className="core-picker"><button type="button" className={selected === 'electron' ? 'active' : ''} onClick={() => setSelected('electron')}><i className="legend-dot blue"></i> Electron</button><button type="button" className={selected === 'positron' ? 'active' : ''} onClick={() => setSelected('positron')}><i className="legend-dot gold"></i> Positron</button></div>
              <Slider label="Pair separation" value={settings.positron.offset[0] - settings.electron.offset[0]} min={1.55} max={2.4} step={0.01} onChange={value => changeSettings(current => ({ ...current, electron: { ...current.electron, offset: [-value / 2, current.electron.offset[1], current.electron.offset[2]] }, positron: { ...current.positron, offset: [value / 2, current.positron.offset[1], current.positron.offset[2]] } }))} />
              <Slider label="Circulation" value={selectedCore.circulation} min={-1.2} max={1.2} step={0.01} onChange={value => updateCore(selected, { circulation: value })} />
              <Slider label="Turn / yaw" value={selectedCore.yaw * 180 / Math.PI} min={-180} max={180} step={1} unit="°" onChange={value => updateCore(selected, { yaw: value * Math.PI / 180 })} />
              <Slider label="Tilt" value={selectedCore.tilt * 180 / Math.PI} min={-70} max={70} step={1} unit="°" onChange={value => updateCore(selected, { tilt: value * Math.PI / 180 })} />
              <div className="position-controls">{(['x', 'y', 'z'] as const).map((axis, i) => <Slider key={axis} label={`Position ${axis}`} value={selectedCore.offset[i]} min={-1.4} max={1.4} step={0.01} onChange={value => updateCore(selected, { offset: selectedCore.offset.map((current, j) => j === i ? value : current) as unknown as Vec3 })} />)}</div>
              <Slider label="Pair travel" value={settings.travel} min={0} max={1.2} step={0.01} onChange={value => changeSettings(current => ({ ...current, travel: value }))} />
              <Slider label="Flow strength" value={settings.intensity} min={0.3} max={1.4} step={0.01} onChange={value => changeSettings(current => ({ ...current, intensity: value }))} />
              <button type="button" className="text-button" onClick={() => { setSettings(DEFAULT_SETTINGS); setLayers(info.layers); setProbe([-0.1, 0.4, 0.1]); resetTime(); }}>Reset experiment</button>
            </section>
            <section className="control-section"><div className="section-heading"><span>02 / LOOK</span><strong>Choose what the cube shows</strong></div><div className="layer-list"><LayerSwitch label="Tau medium" checked={layers.volume} onChange={value => setLayer('volume', value)} /><LayerSwitch label="Material paths" checked={layers.paths} onChange={value => setLayer('paths', value)} /><LayerSwitch label="Streamlines" checked={layers.streamlines} onChange={value => setLayer('streamlines', value)} /><LayerSwitch label="Capacity slice" checked={layers.slice} onChange={value => setLayer('slice', value)} /><LayerSwitch label="Internal twist axes" checked={layers.twist} onChange={value => setLayer('twist', value)} /></div>
              {layers.slice && <><div className="segmented" role="group" aria-label="Slice axis">{['Z', 'X', 'Y'].map((axis, i) => <button type="button" key={axis} className={sliceAxis === i ? 'active' : ''} onClick={() => setSliceAxis(i)}>{axis} plane</button>)}</div><Slider label="Slice position" value={sliceOffset} min={-2.1} max={2.1} step={0.02} onChange={setSliceOffset} /></>}
              <Slider label="Medium presence" value={opacity} min={0.1} max={1.8} step={0.01} onChange={setOpacity} />
              <div className="quality-control"><label htmlFor="render-quality">Display quality</label><select id="render-quality" name="render-quality" value={quality} onChange={event => setQuality(event.target.value as 'low' | 'high')}><option value="high">Fine</option><option value="low">Light</option></select></div>
            </section>
            <section className="control-section"><div className="section-heading"><span>03 / PROBE</span><strong>Read one place</strong></div><div className="segmented"><button type="button" className={!following ? 'active' : ''} onClick={() => setFollowing(false)}>Fixed point</button><button type="button" className={following ? 'active' : ''} onClick={() => setFollowing(true)}>Follow parcel</button></div>{following ? <Slider label="Tagged parcel" value={tagged} min={0} max={35} step={1} onChange={setTagged} /> : (['x', 'y', 'z'] as const).map((axis, i) => <Slider key={axis} label={`Probe ${axis}`} value={probe[i]} min={-2} max={2} step={0.02} onChange={value => setProbe(probe.map((current, j) => j === i ? value : current) as unknown as Vec3)} />)}<TensorInspector point={probePoint} time={time} settings={settings} /></section>
          </div>
        </aside>
      </div>
      <p className="model-note">The pair and its surrounding fields are authored for visual exploration. Fluid paths are traced through the authored velocity. The matrix uses the local GfX tensor convention; this experiment does not solve the full RCCM equations.</p>
    </main>
  </>;
}

const study = document.body.dataset.study;
createRoot(document.getElementById('root')!).render(study === 'charge' ? <><Nav study="charge" /><ChargePage /></> : study && study in STUDIES ? <Experiment study={study as Study} /> : <Index />);
