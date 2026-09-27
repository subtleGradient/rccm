import { THREE, createWorld, clearGroup, addArrow, addRing, addBox } from './scene.js';
import { assemble } from './math.mjs';

const $ = (id) => document.getElementById(id);
const colors = { q: '#e1b35b', e: '#76d7e4', b: '#ec95ae', frame: '#507969' };
const world = createWorld($('glyph-viewport'), { span: 6, position: [5, 4, 6] });
const state = { mode: 'composite', load: 0.2, slip: 0.35, twist: 0.25, active: null };
let groups = {};
const axes = ['t', 'x', 'y', 'z'];
const channelFor = (r, c) => r === c ? 'q' : (r === 0 && c === 1) || (r === 1 && c === 0) ? 'e' : (r === 1 && c === 2) || (r === 2 && c === 1) ? 'b' : 'zero';
const signed = (n, places = 2) => `${n > 0 ? '+' : ''}${Object.is(n, -0) ? (0).toFixed(places) : n.toFixed(places)}`;
const matrixButtons = [];

for (let r = 0; r < 4; r++) {
  const row = document.createElement('tr');
  const label = document.createElement('th');
  label.scope = 'row'; label.textContent = axes[r]; row.append(label);
  for (let c = 0; c < 4; c++) {
    const cell = document.createElement('td');
    const button = document.createElement('button');
    button.type = 'button'; button.dataset.channel = channelFor(r, c);
    button.dataset.row = r; button.dataset.col = c;
    button.addEventListener('mouseenter', () => focusChannel(button.dataset.channel, r, c));
    button.addEventListener('focus', () => focusChannel(button.dataset.channel, r, c));
    button.addEventListener('mouseleave', () => { if (document.activeElement !== button) focusChannel(null); });
    button.addEventListener('blur', () => focusChannel(null));
    button.addEventListener('click', () => focusChannel(button.dataset.channel, r, c));
    matrixButtons.push(button); cell.append(button); row.append(cell);
  }
  $('tensor-body').append(row);
}

function focusChannel(channel, r, c) {
  state.active = channel;
  const messages = {
    q: r === 0 ? 'Ûtt = −q. The temporal diagonal reads remaining phase capacity, with the minus sign of the chosen signature.' : `Û${axes[r]}${axes[c]} = 1/q. All three spatial directions share the same scalar packing coefficient.`,
    e: `Û${axes[r]}${axes[c]} is one half of the signed slip pair. Its transpose has the opposite sign. The cyan arrow encodes their common x direction.`,
    b: `Û${axes[r]}${axes[c]} is one half of the vorticity pair. The x–y plane rotates about z; reversing its handedness reverses both signs.`,
    zero: `Û${axes[r]}${axes[c]} is zero in this fixture: only x slip and z vorticity are switched on.`,
  };
  $('matrix-note').textContent = messages[channel] || 'Focus or hover a matrix entry to isolate its visual channel. The off-diagonal pair changes sign across the diagonal.';
  matrixButtons.forEach((b) => b.classList.toggle('is-active', channel !== null && b.dataset.channel === channel));
  Object.entries(groups).forEach(([name, group]) => {
    group.traverse((object) => {
      if (!object.material) return;
      for (const mat of Array.isArray(object.material) ? object.material : [object.material]) {
        if (mat.userData.baseOpacity === undefined) mat.userData.baseOpacity = mat.opacity;
        mat.transparent = true;
        mat.opacity = mat.userData.baseOpacity * (channel && channel !== name ? 0.16 : 1);
      }
    });
  });
  world.render();
}

function segment(group, a, b, color, opacity = 1) {
  const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...a), new THREE.Vector3(...b)]);
  const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color, opacity, transparent: true }));
  group.add(line); return line;
}

function readableArrow(group, origin, direction, color, length) {
  const arrow = addArrow(group, origin, direction, color, length);
  const head = Math.min(length * 0.45, 0.24);
  arrow.setLength(length, head, Math.min(length * 0.35, 0.18));
  const vector = new THREE.Vector3(...direction).normalize();
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, length - head, 8), new THREE.MeshBasicMaterial({ color }));
  shaft.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), vector);
  shaft.position.fromArray(origin).addScaledVector(vector, (length - head) / 2);
  group.add(shaft);
  return arrow;
}

function lattice(group, packing, flat = false) {
  const n = Math.round(4 * packing);
  const extent = flat ? 1.5 : 1.2;
  for (let i = 0; i <= n; i++) {
    const k = -extent + i * extent * 2 / n;
    if (flat) {
      segment(group, [-extent, k, -0.2], [extent, k, -0.2], colors.q, 0.36);
      segment(group, [k, -extent, -0.2], [k, extent, -0.2], colors.q, 0.36);
    } else {
      for (const side of [-extent, extent]) {
        segment(group, [-extent, k, side], [extent, k, side], colors.q, 0.26);
        segment(group, [k, -extent, side], [k, extent, side], colors.q, 0.26);
        segment(group, [-extent, side, k], [extent, side, k], colors.q, 0.26);
        segment(group, [k, side, -extent], [k, side, extent], colors.q, 0.26);
        segment(group, [side, -extent, k], [side, extent, k], colors.q, 0.26);
        segment(group, [side, k, -extent], [side, k, extent], colors.q, 0.26);
      }
    }
  }
}

function directedLoop(group, w, flat) {
  if (Math.abs(w) < 0.00001) return;
  const z = flat ? 0.12 : 0;
  const radius = 0.50 + Math.abs(w) * 2;
  const sign = Math.sign(w);
  const arcLength = 2 * Math.PI / 3 - 0.4;
  for (let i = 0; i < 3; i++) {
    const start = i * 2 * Math.PI / 3 + 0.2;
    const arc = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.025 + Math.abs(w) * 0.045, 8, 40, arcLength), new THREE.MeshBasicMaterial({ color: colors.b }));
    arc.rotation.z = start; arc.position.z = z; group.add(arc);
    const angle = sign > 0 ? start + arcLength : start;
    const tangent = new THREE.Vector3(-Math.sin(angle) * sign, Math.cos(angle) * sign, 0);
    const tip = new THREE.Vector3(radius * Math.cos(angle), radius * Math.sin(angle), z).addScaledVector(tangent, 0.07);
    const head = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.3, 16), new THREE.MeshBasicMaterial({ color: colors.b }));
    head.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent);
    head.position.copy(tip).addScaledVector(tangent, -0.15); group.add(head);
  }
  if (!flat) {
    segment(group, [0, 0, -1.5], [0, 0, 1.5], colors.b, 0.4);
    readableArrow(group, [0, 0, 0], [0, 0, sign], colors.b, 0.45 + Math.abs(w));
  }
}

function slipArrow(group, s, flat) {
  if (Math.abs(s) < 0.00001) return;
  const length = Math.abs(s) * 4;
  const origin = [-Math.sign(s) * length / 2, 0, flat ? 0.24 : 0.28];
  readableArrow(group, origin, [Math.sign(s), 0, 0], colors.e, length);
}

const descriptions = {
  composite: {
    title: 'Three channels, kept legible',
    label: 'COMPOSITE / LOCAL REST FRAME',
    caption: 'Amber grid density reads 1/q. Cyan points along slip. Rose arrowheads give the handedness of rotation about z. Drag to orbit; scroll to zoom.',
    copy: 'The fixed outer frame is the voxel’s sampling footprint. Its amber lattice becomes denser as capacity falls. A cyan arrow gives signed transverse slip; a rose loop gives signed vorticity. Keeping separate shapes for separate readings makes this the strongest default when neighboring voxels must be compared.',
  },
  bubble: {
    title: 'Feel the budget as a shrinking reservoir',
    label: 'BUBBLE / CAPACITY RESERVOIR',
    caption: 'Amber sphere volume is proportional to q; its fixed outline marks q = 1. The outer packing rings encode 1/q. Cyan and rose keep their previous meanings.',
    copy: 'The amber sphere holds the remaining pressure capacity: volume ∝ q, so its radius ∝ ∛q. Load drains this visual reservoir while the outer packing rings multiply. This language makes depletion bodily and immediate. The sphere is a display vessel; the voxel still samples the same fixed region of the fluid.',
  },
  flat: {
    title: 'Make a whole tank easy to scan',
    label: 'PLANAR / X–Y INSTRUMENT',
    caption: 'A flat x–y glyph: amber packing grid, cyan signed x slip, rose circulation about z. The camera faces the plane when this renderer is selected.',
    copy: 'Flattening the instrument removes occlusion. A row of these glyphs makes neighboring values easy to compare, especially on a slice through the tank. This fixture’s slip lies in x and its twist axis is z, so the whole active state fits in one plane. Arbitrary 3D directions require an axis marker or a return to the composite renderer.',
  },
};

function rebuild() {
  clearGroup(world.root);
  const q = 1 - state.load - state.slip ** 2 - state.twist ** 2;
  const packing = 1 / q;
  groups = {};
  for (const name of ['q', 'e', 'b']) { groups[name] = new THREE.Group(); world.root.add(groups[name]); }
  const flat = state.mode === 'flat';
  if (!flat) addBox(world.root, [0, 0, 0], [3.5, 3.5, 3.5], colors.frame, 0.025);
  if (state.mode === 'bubble') {
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(1.28 * Math.cbrt(q), 36, 24), new THREE.MeshBasicMaterial({ color: colors.q, transparent: true, opacity: 0.15, depthWrite: false }));
    groups.q.add(sphere);
    const outline = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.28, 1)), new THREE.LineBasicMaterial({ color: colors.q, opacity: 0.2, transparent: true }));
    groups.q.add(outline);
    const rings = Math.round(3 * packing);
    for (let i = 0; i < rings; i++) {
      const y = -1.2 + 2.4 * (i + 0.5) / rings;
      const radius = Math.sqrt(1.48 ** 2 - y ** 2);
      const ring = addRing(groups.q, [0, y, 0], radius, colors.q, [0, 1, 0], 0.008);
      ring.material.transparent = true; ring.material.opacity = 0.25;
    }
  } else lattice(groups.q, packing, flat);
  directedLoop(groups.b, state.twist, flat);
  slipArrow(groups.e, state.slip, flat);

  $('load-value').textContent = state.load.toFixed(2);
  $('slip-value').textContent = signed(state.slip);
  $('twist-value').textContent = signed(state.twist);
  $('q-value').textContent = q.toFixed(3);
  $('packing-value').textContent = packing.toFixed(3);
  $('strain-value').textContent = (1 - q).toFixed(3);
  for (const [name, amount] of [['q', q], ['l', state.load], ['s', state.slip ** 2], ['w', state.twist ** 2]]) $('budget-' + name).style.setProperty('--part', `${amount * 100}%`);
  $('budget-equation').textContent = `${q.toFixed(3)} + ${state.load.toFixed(3)} + ${(state.slip ** 2).toFixed(3)} + ${(state.twist ** 2).toFixed(3)} = 1`;
  $('budget-equation').setAttribute('aria-label', `Pressure budget: q ${q.toFixed(4)}, background load ${state.load.toFixed(4)}, slip load ${(state.slip ** 2).toFixed(4)}, rotation load ${(state.twist ** 2).toFixed(4)}, sum 1`);
  const matrix = assemble({ q, e: [state.slip, 0, 0], b: [0, 0, state.twist] });
  matrixButtons.forEach((button) => {
    const r = Number(button.dataset.row), c = Number(button.dataset.col);
    const value = matrix[r][c];
    button.textContent = Math.abs(value) < 0.000001 ? '0' : signed(value, 2);
    button.setAttribute('aria-label', `U ${axes[r]} ${axes[c]}: ${value.toFixed(4)}. ${button.dataset.channel === 'q' ? 'Scalar capacity channel' : button.dataset.channel === 'e' ? 'Transverse slip channel' : button.dataset.channel === 'b' ? 'Vorticity channel' : 'Inactive channel'}.`);
  });
  const description = descriptions[state.mode];
  $('renderer-title').textContent = description.title;
  $('renderer-copy').textContent = description.copy;
  $('glyph-caption').textContent = description.caption;
  $('glyph-view-label').textContent = description.label;
  $('glyph-viewport').setAttribute('aria-label', `${description.label}. Remaining pressure capacity ${q.toFixed(3)}; spatial coefficient ${packing.toFixed(3)}; x slip ${signed(state.slip)}; z vorticity ${signed(state.twist)}.`);
  focusChannel(null);
}

for (const id of ['load', 'slip', 'twist']) $(id).addEventListener('input', (event) => { state[id] = Number(event.target.value); rebuild(); });
for (const field of ['slip', 'twist']) $('flip-' + field).addEventListener('click', () => { state[field] = -state[field]; $(field).value = state[field]; rebuild(); });
$('reset-glyph').addEventListener('click', () => {
  Object.assign(state, { load: 0.2, slip: 0.35, twist: 0.25 });
  for (const id of ['load', 'slip', 'twist']) $(id).value = state[id];
  rebuild();
});
document.querySelectorAll('[data-renderer]').forEach((button) => button.addEventListener('click', () => {
  state.mode = button.dataset.renderer;
  document.querySelectorAll('[data-renderer]').forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
  if (state.mode === 'flat') world.camera.position.set(0, 0, 8);
  else world.camera.position.set(5, 4, 6);
  world.controls.target.set(0, 0, 0); world.controls.update();
  rebuild();
}));
rebuild();
