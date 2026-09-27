import { createTankView } from './tank-view.js';
import { rasterize, voxelIndex } from './fields.mjs';

const $ = (id) => document.getElementById(id);
const canvas = $('scene');
const tank = $('tank-area');
const resolution = { x: 12, y: 8, z: 1 };
const elements = [{ id: 'mass-sphere', center: [-1.6, .4, 0], radius: 1.55, gravityRadius: .124, enabled: true }];
let raster = rasterize(elements, resolution);
const stateAt = (address) => raster.cells[voxelIndex(address, resolution)];
let selection = [{ x: 5, y: 3, z: 0 }];
let cursor = { ...selection[0] };
let hover = null;
let activeTool = 'pointer';
let selectedElement = elements[0].id;
let drag = null;
let visible = true;
let view;
const same = (a, b) => a && b && a.x === b.x && a.y === b.y && a.z === b.z;
const address = (v) => `[${v.x}, ${v.y}, ${v.z}]`;
const format = (n) => Math.abs(n) < 1e-10 ? '0.000' : n.toFixed(3).replace('-', '−');

try {
  view = createTankView(canvas, $('selection-marks'));
  view.updateRaster(raster);
  view.updateElements(elements, selectedElement);
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
    const first = a.matrix;
    const comparing = selection.length === 2;
    const b = comparing ? stateAt(selection[1]) : null;
    const second = comparing ? b.matrix : null;
    const matrix = comparing ? second.map((row, i) => row.map((value, j) => value - first[i][j])) : first;
    $('matrix-name').textContent = comparing ? 'Δ⟨Û⟩ · B − A' : '⟨Û⟩ · Voxel A';
    $('matrix-values').innerHTML = matrix.map((row, i) => `<tr><th scope="row">${'txyz'[i]}</th>${row.map((value, j) => `<td class="${i === j ? 'diagonal' : ''}">${format(value)}</td>`).join('')}</tr>`).join('');
    $('capacity-value').textContent = format(comparing ? b.q - a.q : a.q);
    $('weight-value').textContent = format(comparing ? b.inverseQ - a.inverseQ : a.inverseQ);
    for (const channel of ['e', 'b']) {
      const values = comparing ? b[channel].map((value, axis) => value - a[channel][axis]) : a[channel];
      $(channel === 'e' ? 'slip-value' : 'twist-value').textContent = values.map((value) => format(value)).join(', ');
    }
    for (const [id, label] of [['capacity', 'Capacity · ⟨q⟩'], ['weight', 'Spatial weight · ⟨1/q⟩'], ['slip', 'Slip · ⟨e⟩'], ['twist', 'Twist · ⟨b⟩']]) {
      $(`${id}-label`).textContent = `${comparing ? 'Δ ' : ''}${label}`;
    }
    $('state-note').textContent = comparing ? 'Difference between the two sampled volumes.' : 'Average state across this voxel.';
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
  updateField();
}

function updateField() {
  raster = rasterize(elements, resolution);
  view?.updateRaster(raster);
  view?.updateElements(elements, selectedElement);
  $('sphere-position').textContent = `X ${elements[0].center[0].toFixed(2)} · Y ${elements[0].center[1].toFixed(2)}`;
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
  $('tool-hint').textContent = name === 'inspect' ? 'Click a voxel. Click another to compare.' : 'Drag the outline · arrow keys nudge · I inspects voxels';
  hover = null;
  paintSelection();
}

canvas.addEventListener('pointerdown', (event) => {
  if (activeTool !== 'pointer' || event.button !== 0) return;
  const id = view?.pickElement(event, elements);
  selectedElement = id ?? null;
  $('select-sphere').setAttribute('aria-pressed', String(id === elements[0].id));
  view?.updateElements(elements, selectedElement);
  if (id) {
    const element = elements.find((item) => item.id === id);
    const point = view.pointOnDepth(event, element.center[2]);
    if (point) {
      drag = { element, start: [...element.center], offset: element.center.map((value, axis) => value - point[axis]) };
      canvas.setPointerCapture(event.pointerId);
      canvas.style.cursor = 'grabbing';
    }
  }
  paintSelection();
});
canvas.addEventListener('pointermove', (event) => {
  if (drag) {
    const point = view.pointOnDepth(event, drag.element.center[2]);
    if (point) {
      drag.element.center = point.map((value, axis) => value + drag.offset[axis]);
      updateField();
    }
  } else {
    hover = pick(event);
    if (activeTool === 'pointer') canvas.style.cursor = view?.pickElement(event, elements) ? 'grab' : 'default';
    paintSelection();
  }
});
function endDrag(event) {
  drag = null;
  if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
  canvas.style.cursor = activeTool === 'inspect' ? 'crosshair' : 'default';
}
canvas.addEventListener('pointerup', endDrag);
canvas.addEventListener('pointercancel', (event) => {
  if (drag) { drag.element.center = drag.start; updateField(); }
  endDrag(event);
});
canvas.addEventListener('pointerleave', () => { hover = null; paintSelection(); });
canvas.addEventListener('click', (event) => { const value = pick(event); if (value) select(value); });
$('pointer-tool').addEventListener('click', () => tool('pointer'));
$('inspect-tool').addEventListener('click', () => tool('inspect'));
$('select-sphere').addEventListener('click', () => {
  selectedElement = elements[0].id;
  $('select-sphere').setAttribute('aria-pressed', 'true');
  view?.updateElements(elements, selectedElement);
  tool('pointer');
  canvas.focus({ preventScroll: true });
});
$('toggle-sphere').addEventListener('click', () => {
  elements[0].enabled = !elements[0].enabled;
  $('toggle-sphere').setAttribute('aria-pressed', String(elements[0].enabled));
  updateField();
});
$('reset-sphere').addEventListener('click', () => {
  elements[0].center = [-1.6, .4, 0];
  elements[0].enabled = true;
  $('toggle-sphere').setAttribute('aria-pressed', 'true');
  updateField();
});
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
  const movements = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] };
  if (event.target === canvas && activeTool === 'pointer' && selectedElement && movements[event.key]) {
    event.preventDefault();
    const element = elements.find((item) => item.id === selectedElement);
    element.center[0] += movements[event.key][0] * (event.shiftKey ? .5 : .1);
    element.center[1] += movements[event.key][1] * (event.shiftKey ? .5 : .1);
    updateField();
    return;
  }
  if (event.target !== canvas || activeTool !== 'inspect' || !visible) return;
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
tool('pointer');
rebuild();
