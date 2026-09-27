import { THREE, createWorld, clearGroup, addArrow, addRing, addBox } from './scene.js';

// A fixed, smooth geometry specimen. Coordinates are in specimen units;
// q, e and b are dimensionless renderer inputs. b is the analytic curl of
// w = k (-y f, x f, 0), so changing its sign preserves curl consistency.
const FINE = 32;
const RADIUS = 0.5;
const WIDTH = 0.24;
const COLOURS = { q: 0xe8ac4d, e: 0x62d6d9, b: 0xee98ad, ref: 0xb8c6b7 };

export function specimen([x, y, z], handedness = 1) {
  const r2 = x * x + y * y;
  const w2 = WIDTH * WIDTH;
  const r02 = RADIUS * RADIUS;
  const g = Math.exp(-(((r2 - r02) ** 2) / (4 * r02) + z * z) / w2);
  const broad = Math.exp(-(r2 + z * z) / 4);
  const f = g + 0.22 * broad;
  const k = 0.25 * handedness;
  const bz = k * (2 * f - r2 * (r2 - r02) * g / (r02 * w2) - 0.11 * r2 * broad);
  const radial = 2 * k * z * (g / w2 + 0.22 * broad / 4);
  const e = [-handedness * 0.5 * y * g, handedness * 0.5 * x * g, 0];
  const vRot = [-k * y * f, k * x * f, 0];
  const baselineLoad = 0.65 * g;
  // c = alpha = t_p = 1 in specimen units; P_shear = 0. Both
  // kinetic channels spend the remaining capacity of the nested ledger.
  const q = 1 - baselineLoad - e.reduce((sum, v) => sum + v * v, 0)
    - vRot.reduce((sum, v) => sum + v * v, 0);
  return {
    q, e, vRot, baselineLoad,
    b: [radial * x, radial * y, bz],
  };
}

const fineSamples = [];
for (let k = 0; k < FINE; k++) for (let j = 0; j < FINE; j++) for (let i = 0; i < FINE; i++) {
  const p = [i, j, k].map(v => -1 + 2 * (v + 0.5) / FINE);
  fineSamples.push({ ijk: [i, j, k], ...specimen(p) });
}

export function sampleDefect(divisions, handedness = 1) {
  if (![1, 2, 4].includes(divisions)) throw new RangeError('Use 1, 2 or 4 divisions per axis.');
  const size = 2 / divisions;
  const cells = Array.from({ length: divisions ** 3 }, (_, id) => ({
    q: 0, invQ: 0, e: [0, 0, 0], b: [0, 0, 0], bSq: 0, count: 0,
    center: [id % divisions, Math.floor(id / divisions) % divisions, Math.floor(id / divisions ** 2)].map(v => -1 + (v + 0.5) * size),
  }));
  for (const sample of fineSamples) {
    const [i, j, k] = sample.ijk.map(v => Math.floor(v * divisions / FINE));
    const cell = cells[i + divisions * j + divisions ** 2 * k];
    cell.q += sample.q;
    cell.invQ += 1 / sample.q;
    cell.bSq += sample.b.reduce((sum, v) => sum + v * v, 0);
    cell.count++;
    for (let axis = 0; axis < 3; axis++) {
      cell.e[axis] += handedness * sample.e[axis];
      cell.b[axis] += handedness * sample.b[axis];
    }
  }
  return cells.map(cell => ({ ...cell,
    q: cell.q / cell.count, invQ: cell.invQ / cell.count, bSq: cell.bSq / cell.count,
    e: cell.e.map(v => v / cell.count), b: cell.b.map(v => v / cell.count),
  }));
}

export function summarize(cells) {
  const count = cells.reduce((s, c) => s + c.count, 0);
  const mean = key => cells.reduce((s, c) => s + c[key] * c.count, 0) / count;
  return { q: mean('q'), invQ: mean('invQ'),
    bz: cells.reduce((s, c) => s + c.b[2] * c.count, 0) / count,
    rms: Math.sqrt(mean('bSq')), count };
}

function soften(object, opacity) {
  object.traverse(child => {
    if (child.material) {
      child.material.transparent = true;
      child.material.opacity = opacity;
      child.material.depthWrite = false;
    }
  });
  return object;
}

function makeHalo(group, center, radius, opacity) {
  const points = Array.from({ length: 65 }, (_, i) => new THREE.Vector3(
    center[0] + radius * Math.cos(i * Math.PI / 32),
    center[1] + radius * Math.sin(i * Math.PI / 32), center[2]));
  const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineDashedMaterial({
    color: COLOURS.b, transparent: true, opacity, dashSize: radius * 0.2, gapSize: radius * 0.15,
  }));
  line.computeLineDistances();
  group.add(line);
}

function glyph(group, cell, center, size) {
  const depletion = 1 - cell.q;
  // Sphere volume, rather than radius, carries the capacity deficit.
  const radius = size * 0.31 * Math.cbrt(depletion);
  const bead = new THREE.Mesh(new THREE.SphereGeometry(Math.max(0.00001, radius), 14, 10), new THREE.MeshStandardMaterial({
    color: COLOURS.q, roughness: 0.45, transparent: true, opacity: 0.8,
  }));
  bead.position.set(...center);
  group.add(bead);
  const eLength = Math.hypot(...cell.e);
  if (eLength > 1e-6) addArrow(group, center, cell.e, COLOURS.e, size * Math.min(0.55, 0.24 + eLength * 4));
  const bLength = Math.hypot(...cell.b);
  const rms = Math.sqrt(cell.bSq);
  makeHalo(group, center, size * (0.32 + Math.min(0.10, rms * 0.3)), 0.42);
  if (bLength > 1e-6) {
    addRing(group, center, size * (0.20 + Math.min(0.06, bLength * 0.22)), COLOURS.b, cell.b, size * 0.014);
    addArrow(group, center, cell.b, COLOURS.b, size * Math.min(0.50, bLength * 0.8 + 0.25));
  }
}

function reference(group, center) {
  const torus = addRing(group, center, RADIUS, COLOURS.ref, [0, 0, 1], WIDTH * 0.6);
  soften(torus, 0.18);
  const outer = addRing(group, center, RADIUS, COLOURS.ref, [0, 0, 1], 0.008);
  soften(outer, 0.65);
}

const ladder = {
  defect: ['One voxel per fundamental tornadonut', 'Store mean capacity, mean reciprocal weight, signed slip and twist, plus unresolved activity. Keep defect identity and winding as separate metadata.', 'A single matrix cannot reconstruct the route of the circulation inside its volume.'],
  atom: ['One voxel per atom', 'Average every constituent field and every part of the intervening fluid over the atomic sampling volume. Retain orientation and fluctuation channels alongside the mean.', 'A neutral aggregate can retain large local activity and a nontrivial scalar load.'],
  atom8: ['Eight voxels per atom', 'Divide the atomic sampling box into 2 × 2 × 2 volumes. Each cell carries its own average; neighbouring cells begin to expose spatial differences.', 'Eight states preserve more spatial structure than a single atom-wide mean.'],
  molecule: ['One voxel per molecule', 'The observation window covers the whole molecule and its internal fluid. Its directional channels preserve coherent alignment across that volume.', 'A mean dipole can survive even when the complete object has zero net charge.'],
  cell: ['One voxel per biological cell', 'Sample the interior, membrane and surrounding share of the volume. Keep averaged scalar load, coherent electromagnetic channels and local activity separate.', 'A boundary can dominate an effect while occupying a small fraction of the sampled volume.'],
  hand: ['One voxel per hand', 'Use the actual hand-sized observation volume. Aggregate its contents and retain material and geometric metadata needed for contacts and deformation.', 'The tensor average carries field state; contact shape needs additional geometry.'],
  human: ['One voxel per human', 'Average the fields throughout a human-sized window. Preserve total volume, orientation, scalar channels and variation before merging neighbouring windows.', 'Changing the volume changes the question the voxel answers.'],
  house: ['One voxel per house', 'Average walls, contents, air and intervening fluid with their actual volume weights. Coherent channels add; opposed orientations can cancel.', 'Equal-volume voxels can have equal means while containing very different internal arrangements.'],
  planet: ['Eight voxels per planet', 'Partition the planet-sized observation box into eight equal subvolumes. Keep capacity, reciprocal weight, coherent rotation and unresolved activity in each.', 'Eight samples expose hemispheric differences. Additional cells expose the surface and sharper internal gradients.'],
};

function boot() {
  const el = id => document.getElementById(id);
  let divisions = 2;
  const world = createWorld(el('resolution-viewport'), { span: 6, position: [5, 4, 6] });
  const controls = ['pair-handedness', 'show-reference', 'show-cells', 'show-glyphs'];
  function draw() {
    clearGroup(world.root);
    const opposite = el('pair-handedness').value === 'opposite';
    const allCells = [];
    const size = 2 / divisions;
    [-1.25, 1.25].forEach((offset, index) => {
      const hand = index === 1 && opposite ? -1 : 1;
      const cells = sampleDefect(divisions, hand);
      allCells.push(...cells);
      if (el('show-reference').checked) reference(world.root, [offset, 0, 0]);
      cells.forEach(cell => {
        const center = [cell.center[0] + offset, cell.center[1], cell.center[2]];
        if (el('show-cells').checked) addBox(world.root, center, [size * 0.985, size * 0.985, size * 0.985], COLOURS.ref, divisions === 4 ? 0.035 : 0.06);
        if (el('show-glyphs').checked) glyph(world.root, cell, center, size);
      });
    });
    const total = summarize(allCells);
    el('mean-q').textContent = total.q.toFixed(3);
    el('mean-inverse').textContent = total.invQ.toFixed(3);
    el('mean-twist').textContent = Math.abs(total.bz) < 1e-10 ? '0.000' : `${total.bz > 0 ? '+' : ''}${total.bz.toFixed(3)}`;
    el('rms-twist').textContent = total.rms.toFixed(3);
    el('resolution-caption').textContent = `2 defects · ${2 * divisions ** 3} visible cells · 32³ samples per defect`;
    el('resolution-status').textContent = opposite
      ? 'Opposed orientations cancel in the pair mean. RMS activity survives at every resolution.'
      : 'Aligned orientations add in the pair mean. Capacity and RMS activity are unchanged.';
    world.render();
  }
  for (const button of document.querySelectorAll('[data-resolution]')) {
    button.addEventListener('click', () => {
      divisions = Number(button.dataset.resolution);
      for (const other of document.querySelectorAll('[data-resolution]')) other.setAttribute('aria-pressed', String(other === button));
      draw();
    });
  }
  controls.forEach(id => el(id).addEventListener('change', draw));
  el('scale-ladder').addEventListener('change', event => {
    const [title, description, prediction] = ladder[event.target.value];
    el('scale-title').textContent = title;
    el('scale-description').textContent = description;
    el('scale-prediction').textContent = prediction;
  });
  draw();
}

if (typeof document !== 'undefined') {
  try { boot(); } catch (error) {
    const panel = document.getElementById('resolution-viewport');
    const message = document.createElement('p');
    message.className = 'resolution-error';
    message.textContent = `The 3D view could not start: ${error.message}. The sampling and reading guide remain below.`;
    panel.append(message);
    console.error(error);
  }
}
