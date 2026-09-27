import { assemble } from '../voxel-tank/math.mjs';
import { createTankView } from './tank-view.js';

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
let view;
const same = (a, b) => a && b && a.x === b.x && a.y === b.y && a.z === b.z;
const address = (v) => `[${v.x}, ${v.y}, ${v.z}]`;
const format = (n) => Math.abs(n) < 1e-10 ? '0.000' : n.toFixed(3).replace('-', '−');

try {
  view = createTankView(canvas, $('selection-marks'));
} catch {
  $('render-error').hidden = false;
}

function paintSelection() {
  view?.paint(selection, hover, resolution);
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
  const bounds = $('workbench').getBoundingClientRect();
  view?.resize(bounds.width, bounds.height);
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
  return view?.pick(event, resolution) ?? null;
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
  view?.setVisible(visible);
  tank.style.visibility = visible ? 'visible' : 'hidden';
  $('toggle-tank').setAttribute('aria-pressed', String(visible));
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
panels(true);

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
