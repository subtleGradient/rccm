import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export function SceneClock({ playing, onTick }: { playing: boolean; onTick: (delta: number) => void }) {
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

export function PlaybackPanel({ duration, time, playing, onPlay, onScrub, onReset }: {
  duration: number; time: number; playing: boolean;
  onPlay: () => void; onScrub: (time: number) => void; onReset: () => void;
}) {
  return <section className="panel-section playback" aria-labelledby="playback-title">
    <div className="section-title"><h2 id="playback-title">Playback</h2><span>SCENE TIME</span></div>
    <div className="time-readout"><strong>{time.toFixed(1)}</strong><span>/ {duration.toFixed(1)}</span></div>
    <input type="range" name="sceneTime" aria-label="Scene time" min="0" max={duration} step="0.05" value={time} onChange={event => onScrub(Number(event.target.value))} />
    <div className="playback-actions">
      <button type="button" className="play-button" onClick={onPlay}>{playing ? 'Pause' : 'Play'}</button>
      <button type="button" className="reset-button" onClick={onReset}>Reset to start</button>
    </div>
  </section>;
}
