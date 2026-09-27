import { createTankView } from './tank-view.js';
import { fieldAt, rasterize, samplingFor, voxelIndex } from './fields.mjs';

const $ = (id) => document.getElementById(id);
const canvas = $('scene');
const baseGravityRadius = .124;
let detail = 2, depth = 'slice';
let resolution = samplingFor(detail, depth);
const elements = [{ id: 'mass-sphere', center: [-1.6, .4, 0], radius: 1.55, gravityRadius: baseGravityRadius, enabled: true }];
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
  view = createTankView(canvas, $('selection-marks'), {
    onElementMove(id, position) {
      elements.find((element) => element.id === id).center = position;
      updateField();
    },
  });
  view.updateRaster(raster);
  view.updateElements(elements, selectedElement);
} catch (error) {
  console.error(error);
  $('render-error').hidden = false;
}

function paintSelection() {
  view?.paint(activeTool === 'inspect' ? selection : [], activeTool === 'inspect' ? hover : null, resolution);
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

function inspectElement() {
  const element = elements.find((item) => item.id === selectedElement);
  $('voxel-inspector').hidden = activeTool !== 'inspect';
  $('element-inspector').hidden = activeTool === 'inspect';
  $('element-fields').hidden = !element;
  $('empty-element').hidden = Boolean(element);
  $('reset-sphere').disabled = !element;
  $('select-sphere').setAttribute('aria-pressed', String(Boolean(element)));
  $('toggle-sphere').setAttribute('aria-pressed', String(elements[0].enabled));
  if (!element) return;
  const values = { x: element.center[0], y: element.center[1], z: element.center[2], radius: element.radius, mass: element.gravityRadius / baseGravityRadius };
  for (const [property, value] of Object.entries(values)) {
    const input = $(`element-${property}`);
    if (document.activeElement !== input) input.value = Number(value.toFixed(2));
  }
  $('element-capacity').textContent = format(fieldAt(element.center, [{ ...element, enabled: true }]).q);
}

function updateField() {
  raster = rasterize(elements, resolution);
  view?.updateRaster(raster);
  view?.updateElements(elements, selectedElement);
  inspectElement();
  inspect();
}

function updateSampling() {
  resolution = samplingFor(detail, depth);
  selection = [];
  cursor = { x: Math.floor(resolution.x / 2), y: Math.floor(resolution.y / 2), z: Math.floor(resolution.z / 2) };
  hover = null;
  $('voxel-count').textContent = `${resolution.x * resolution.y * resolution.z} voxels`;
  $('voxel-size').textContent = `${resolution.cellSize} unit cubes`;
  $('depth-status').textContent = depth === 'slice' ? 'Slice' : 'Full';
  $('layer-resolution').textContent = `${resolution.x} × ${resolution.y} × ${resolution.z}`;
  $('depth-slice').setAttribute('aria-pressed', String(depth === 'slice'));
  $('depth-full').setAttribute('aria-pressed', String(depth === 'full'));
  updateField();
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

const toolHints = {
  pointer: 'Drag outline or XYZ handles · right-drag orbits · wheel zooms',
  inspect: 'Click one or two voxels · right-drag orbits · Page Up / Down steps through depth',
  orbit: 'Drag to orbit · wheel zooms · F fits the tank',
  pan: 'Drag to pan the view · wheel zooms · F fits the tank',
};
function tool(name) {
  activeTool = name;
  if (name === 'inspect') selectedElement = null;
  for (const key of Object.keys(toolHints)) $(`${key}-tool`).setAttribute('aria-pressed', String(name === key));
  view?.setTool(name);
  view?.updateElements(elements, selectedElement);
  canvas.style.cursor = name === 'inspect' ? 'crosshair' : name === 'pointer' ? 'default' : 'grab';
  $('tool-hint').textContent = toolHints[name];
  hover = null;
  inspectElement();
  paintSelection();
}

canvas.addEventListener('pointerdown', (event) => {
  if (activeTool !== 'pointer' || event.button !== 0 || view?.gizmoBusy()) return;
  const id = view?.pickElement(event, elements);
  selectedElement = id ?? null;
  view?.updateElements(elements, selectedElement);
  inspectElement();
  if (id) {
    const element = elements.find((item) => item.id === id);
    const point = view.pointInViewPlane(event, element.center);
    if (point) {
      drag = { element, start: [...element.center], offset: element.center.map((value, axis) => value - point[axis]) };
      view.beginDirectDrag();
      canvas.setPointerCapture(event.pointerId);
      canvas.style.cursor = 'grabbing';
    }
  }
  paintSelection();
});
canvas.addEventListener('pointermove', (event) => {
  if (drag) {
    const point = view.pointInViewPlane(event, drag.start);
    if (point) {
      drag.element.center = point.map((value, axis) => value + drag.offset[axis]);
      updateField();
    }
  } else {
    hover = pick(event);
    if (activeTool === 'pointer') canvas.style.cursor = view?.gizmoBusy() || view?.pickElement(event, elements) ? 'grab' : 'default';
    paintSelection();
  }
});
function endDrag(event) {
  if (!drag) return;
  drag = null;
  view?.endDirectDrag();
  if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
  canvas.style.cursor = 'default';
}
canvas.addEventListener('pointerup', endDrag);
canvas.addEventListener('pointercancel', (event) => {
  if (drag) { drag.element.center = drag.start; updateField(); }
  endDrag(event);
});
canvas.addEventListener('pointerleave', () => { hover = null; paintSelection(); });
canvas.addEventListener('click', (event) => {
  if (event.button !== 0) return;
  const value = pick(event);
  if (value) select(value);
});
for (const name of Object.keys(toolHints)) $(`${name}-tool`).addEventListener('click', () => tool(name));
$('select-sphere').addEventListener('click', () => {
  selectedElement = elements[0].id;
  tool('pointer');
  canvas.focus({ preventScroll: true });
});
$('toggle-sphere').addEventListener('click', () => {
  elements[0].enabled = !elements[0].enabled;
  updateField();
});
$('reset-sphere').addEventListener('click', () => {
  Object.assign(elements[0], { center: [-1.6, .4, 0], radius: 1.55, gravityRadius: baseGravityRadius, enabled: true });
  updateField();
});
for (const property of ['x', 'y', 'z', 'radius', 'mass']) {
  const input = $(`element-${property}`);
  input.addEventListener('input', () => {
    if (!input.value || !input.validity.valid) return;
    const element = elements.find((item) => item.id === selectedElement);
    if (!element) return;
    const value = Number(input.value);
    if (property === 'mass') element.gravityRadius = value * baseGravityRadius;
    else if (property === 'radius') element.radius = value;
    else element.center['xyz'.indexOf(property)] = value;
    updateField();
  });
  input.addEventListener('blur', inspectElement);
}
$('clear-selection').addEventListener('click', () => { selection = []; inspect(); });
$('toggle-tank').addEventListener('click', () => {
  visible = !visible;
  view?.setVisible(visible);
  $('tank-area').style.visibility = visible ? 'visible' : 'hidden';
  $('toggle-tank').setAttribute('aria-pressed', String(visible));
});
$('detail-resolution').addEventListener('input', (event) => { detail = Number(event.target.value); updateSampling(); });
for (const name of ['slice', 'full']) $(`depth-${name}`).addEventListener('click', () => {
  if (depth === name) return;
  depth = name;
  updateSampling();
});
$('frame-view').addEventListener('click', () => view?.frame());

function panels(show) {
  $('panels').hidden = !show;
  $('show-panels').setAttribute('aria-expanded', String(show));
}
$('show-panels').addEventListener('click', () => panels($('panels').hidden));
$('hide-panels').addEventListener('click', () => { panels(false); $('show-panels').focus(); });
panels(true);

document.addEventListener('keydown', (event) => {
  if (event.target.matches('input, select, textarea') || event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.key === 'Escape') {
    selection = []; selectedElement = null;
    view?.updateElements(elements, selectedElement);
    inspectElement(); inspect();
  }
  const shortcuts = { i: 'inspect', v: 'pointer', o: 'orbit', h: 'pan' };
  if (shortcuts[event.key.toLowerCase()]) tool(shortcuts[event.key.toLowerCase()]);
  if (event.key.toLowerCase() === 'f') view?.frame();
  const movements = { ArrowLeft: [-1, 0, 0], ArrowRight: [1, 0, 0], ArrowUp: [0, 1, 0], ArrowDown: [0, -1, 0], PageUp: [0, 0, 1], PageDown: [0, 0, -1] };
  if (event.target === canvas && activeTool === 'pointer' && selectedElement && movements[event.key]) {
    event.preventDefault();
    const element = elements.find((item) => item.id === selectedElement);
    element.center = element.center.map((value, axis) => value + movements[event.key][axis] * (event.shiftKey ? .5 : .1));
    updateField();
    return;
  }
  if (event.target !== canvas || activeTool !== 'inspect' || !visible) return;
  if (movements[event.key]) {
    event.preventDefault();
    for (const [index, axis] of ['x', 'y', 'z'].entries()) cursor[axis] = Math.max(0, Math.min(resolution[axis] - 1, cursor[axis] + movements[event.key][index]));
    hover = { ...cursor };
    paintSelection();
  }
  if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); select({ ...cursor }); }
});
function resize() {
  const bounds = $('workbench').getBoundingClientRect();
  view?.resize(bounds.width, bounds.height);
}
new ResizeObserver(resize).observe($('workbench'));
tool('pointer');
inspect();
resize();
