import * as THREE from '../voxel-tank/vendor/three.module.js';
import { assemble } from '../voxel-tank/math.mjs';

const $ = (id) => document.getElementById(id);
const canvas = $('scene');
const tank = $('tank-area');
const resolution = { x: 12, y: 8, z: 1 };
const vacuum = { q: 1, e: [0, 0, 0], b: [0, 0, 0] };
const stateAt = () => vacuum; // Empty scene. Source fields will enter at this boundary.
let selection = [{ x: 5, y: 3, z: 0 }];
let cursor = { ...selection[0] };
let hover = null;
let activeTool = 'inspect';
let visible = true;
let cells = [];
let renderer;
const scene = new THREE.Scene();
scene.background = new THREE.Color('#1b1b1d');
const camera = new THREE.OrthographicCamera(0, 1, 0, 1, .1, 2000);
camera.position.z = 1000;
const group = new THREE.Group();
scene.add(group);
const box = new THREE.BoxGeometry(1, 1, 1);
box.rotateX(.10);
box.rotateY(-.14);
const edges = new THREE.EdgesGeometry(box);
const palette = { normal: '#535358', hover: '#85858c', A: '#a8d2ff', B: '#e9bd86' };
const same = (a, b) => a && b && a.x === b.x && a.y === b.y && a.z === b.z;
const address = (v) => `[${v.x}, ${v.y}, ${v.z}]`;
const format = (n) => Math.abs(n) < 1e-10 ? '0.000' : n.toFixed(3).replace('-', '−');

try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor('#1b1b1d');
} catch {
  $('render-error').hidden = false;
}

function render() { renderer?.render(scene, camera); }

function paintSelection() {
  for (const cell of cells) {
    const index = selection.findIndex((value) => same(value, cell.address));
    const slot = index === 0 ? 'A' : index === 1 ? 'B' : null;
    const color = slot ? palette[slot] : same(hover, cell.address) ? palette.hover : palette.normal;
    cell.wire.material.color.set(color);
    cell.face.material.color.set(slot ? color : '#b0b0b8');
    cell.face.material.opacity = slot ? .085 : .012;
  }
  const rect = tank.getBoundingClientRect();
  $('selection-marks').replaceChildren(...selection.map((value, index) => {
    const mark = document.createElement('div');
    mark.className = 'selection-mark';
    mark.dataset.slot = index ? 'B' : 'A';
    mark.textContent = mark.dataset.slot;
    mark.style.left = `${(value.x + .08) * rect.width / resolution.x}px`;
    mark.style.top = `${(resolution.y - 1 - value.y + .08) * rect.height / resolution.y}px`;
    return mark;
  }));
  render();
}

function inspect() {
  $('selection-summary').innerHTML = selection.length
    ? selection.map((value, index) => `<div class="selection-chip" data-slot="${index ? 'B' : 'A'}"><span>${index ? 'B' : 'A'}</span><span class="address">${address(value)}</span></div>`).join('')
    : '<div class="no-selection">No voxels selected</div>';
  $('inspector-data').hidden = !selection.length;
  $('empty-selection').hidden = Boolean(selection.length);
  $('clear-selection').disabled = !selection.length;
  if (selection.length) {
    const a = stateAt(selection[0]);
    const first = assemble(a);
    const comparing = selection.length === 2;
    const b = comparing ? stateAt(selection[1]) : null;
    const second = comparing ? assemble(b) : null;
    const matrix = comparing ? second.map((row, i) => row.map((value, j) => value - first[i][j])) : first;
    $('matrix-name').textContent = comparing ? 'ΔÛ · B − A' : 'Û · Voxel A';
    $('matrix-values').innerHTML = matrix.map((row, i) => `<tr><th scope="row">${'txyz'[i]}</th>${row.map((value, j) => `<td class="${i === j ? 'diagonal' : ''}">${format(value)}</td>`).join('')}</tr>`).join('');
    $('capacity-value').textContent = format(comparing ? b.q - a.q : a.q);
    $('weight-value').textContent = format(comparing ? 1 / b.q - 1 / a.q : 1 / a.q);
    for (const [id, label] of [['capacity', 'Capacity · q'], ['weight', 'Spatial weight · 1/q'], ['slip', 'Slip · e'], ['twist', 'Twist · b']]) {
      $(`${id}-label`).textContent = `${comparing ? 'Δ ' : ''}${label}`;
    }
    $('state-note').textContent = comparing ? 'Same vacuum state. Every difference is zero.' : 'Unperturbed vacuum. No matter layers.';
  }
  paintSelection();
}

function rebuild() {
  if (!renderer) return;
  const bounds = $('workbench').getBoundingClientRect();
  renderer.setSize(bounds.width, bounds.height, false);
  camera.right = bounds.width;
  camera.bottom = bounds.height;
  camera.updateProjectionMatrix();
  for (const cell of cells) {
    cell.wire.material.dispose();
    cell.face.material.dispose();
  }
  group.clear();
  cells = [];
  const rect = tank.getBoundingClientRect();
  const dx = rect.width / resolution.x;
  const dy = rect.height / resolution.y;
  const size = Math.min(dx, dy) * .76;
  for (let y = 0; y < resolution.y; y++) {
    for (let x = 0; x < resolution.x; x++) {
      const wire = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: palette.normal }));
      const face = new THREE.Mesh(box, new THREE.MeshBasicMaterial({ color: '#b0b0b8', transparent: true, opacity: .012, depthWrite: false }));
      const unit = new THREE.Group();
      unit.add(face, wire);
      unit.scale.setScalar(size);
      unit.position.set(rect.left + (x + .5) * dx, rect.top + (resolution.y - y - .5) * dy, 0);
      group.add(unit);
      cells.push({ address: { x, y, z: 0 }, wire, face });
    }
  }
  $('column-labels').style.gridTemplateColumns = `repeat(${resolution.x}, 1fr)`;
  $('column-labels').innerHTML = Array.from({ length: resolution.x }, (_, x) => `<span>${x}</span>`).join('');
  $('row-labels').style.gridTemplateRows = `repeat(${resolution.y}, 1fr)`;
  $('row-labels').innerHTML = Array.from({ length: resolution.y }, (_, y) => `<span>${resolution.y - y - 1}</span>`).join('');
  $('voxel-count').textContent = `${resolution.x * resolution.y} voxels`;
  $('layer-resolution').textContent = `${resolution.x} × ${resolution.y} × 1`;
  selection = selection.filter((value) => value.x < resolution.x && value.y < resolution.y);
  cursor.x = Math.min(cursor.x, resolution.x - 1);
  cursor.y = Math.min(cursor.y, resolution.y - 1);
  hover = null;
  inspect();
}

function pick(event) {
  if (!visible || activeTool !== 'inspect') return null;
  const rect = tank.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX >= rect.right || event.clientY < rect.top || event.clientY >= rect.bottom) return null;
  return { x: Math.floor((event.clientX - rect.left) / rect.width * resolution.x), y: resolution.y - 1 - Math.floor((event.clientY - rect.top) / rect.height * resolution.y), z: 0 };
}

function select(value) {
  const existing = selection.findIndex((item) => same(item, value));
  if (existing !== -1) selection.splice(existing, 1);
  else if (selection.length < 2) selection.push(value);
  else selection[1] = value;
  cursor = { ...value };
  inspect();
}

function tool(name) {
  activeTool = name;
  $('pointer-tool').setAttribute('aria-pressed', String(name === 'pointer'));
  $('inspect-tool').setAttribute('aria-pressed', String(name === 'inspect'));
  canvas.style.cursor = name === 'inspect' ? 'crosshair' : 'default';
  $('tool-hint').textContent = name === 'inspect' ? 'Click a voxel. Click another to compare.' : 'Pointer · no objects in the scene yet.';
  hover = null;
  paintSelection();
}

canvas.addEventListener('pointermove', (event) => { hover = pick(event); paintSelection(); });
canvas.addEventListener('pointerleave', () => { hover = null; paintSelection(); });
canvas.addEventListener('click', (event) => { const value = pick(event); if (value) select(value); });
$('pointer-tool').addEventListener('click', () => tool('pointer'));
$('inspect-tool').addEventListener('click', () => tool('inspect'));
$('clear-selection').addEventListener('click', () => { selection = []; inspect(); });
$('toggle-tank').addEventListener('click', () => {
  visible = !visible;
  group.visible = visible;
  tank.style.visibility = visible ? 'visible' : 'hidden';
  $('toggle-tank').setAttribute('aria-pressed', String(visible));
  render();
});
for (const axis of ['x', 'y']) {
  const input = $(`resolution-${axis}`);
  const update = () => {
    const value = Number(input.value);
    resolution[axis] = Number.isFinite(value) ? Math.max(1, Math.min(Number(input.max), Math.round(value))) : resolution[axis];
    input.value = resolution[axis];
    rebuild();
  };
  input.addEventListener('input', () => {
    if (input.value && input.validity.valid) update();
  });
  input.addEventListener('change', update);
}

function panels(show) {
  $('panels').hidden = !show;
  $('show-panels').setAttribute('aria-expanded', String(show));
}
$('show-panels').addEventListener('click', () => panels($('panels').hidden));
$('hide-panels').addEventListener('click', () => { panels(false); $('show-panels').focus(); });
panels(!matchMedia('(max-width:760px)').matches);

document.addEventListener('keydown', (event) => {
  if (event.target instanceof HTMLInputElement) return;
  if (event.key === 'Escape') { selection = []; inspect(); }
  if (event.key.toLowerCase() === 'i') tool('inspect');
  if (event.key.toLowerCase() === 'v') tool('pointer');
  if (event.target !== canvas || activeTool !== 'inspect' || !visible) return;
  const movements = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] };
  if (movements[event.key]) {
    event.preventDefault();
    cursor.x = Math.max(0, Math.min(resolution.x - 1, cursor.x + movements[event.key][0]));
    cursor.y = Math.max(0, Math.min(resolution.y - 1, cursor.y + movements[event.key][1]));
    hover = { ...cursor };
    paintSelection();
  }
  if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); select({ ...cursor }); }
});
new ResizeObserver(rebuild).observe($('workbench'));
tool('inspect');
rebuild();
