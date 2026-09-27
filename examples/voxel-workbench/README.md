# Voxel workbench · fluid volume

[Direction, captured verbatim](DIRECTION.md). This is the new design conversation;
the earlier voxel-tank and tau-tank remain previous explorations.
[Second visual direction, captured verbatim](FEEDBACK.md).

Serve the repository root with `python3 -m http.server 8777 --bind 127.0.0.1`,
then open <http://localhost:8777/examples/voxel-workbench/>.

## This step

A full-window landscape Three.js studio, a glass tank filled with continuous
fluid, floating layers and tensor inspection, and a bottom toolbar. Voxels tile
the fluid volume exactly; unselected voxels have no visible boundaries or gaps.
Only hover and selection reveal a cell. Click one voxel for its state; click another
for B − A. A third click replaces B; clicking a selected voxel removes it.
Arrow keys move the voxel cursor; Space or Enter selects it; Escape clears.
X/Y change the resolution. Z stays at one for this first visual decision.

The empty scene is unperturbed vacuum: q = 1, e = b = 0, and U = diag(−1,1,1,1),
from RCCM-GfX-2.tex §§1–3. The inspector uses the existing tested tensor assembler.
Every voxel therefore has the same state and every difference is zero.
The glass, lighting and fluid tint are drawing choices, not tensor values or
deformations. With Z=1 each selected cell spans the tank's full fluid depth.
The uniform fluid is rendered as one volume; its hidden partition determines
the selected voxel address through ray/volume intersection. Changing X/Y
changes that partition, preserving the seamless body of fluid.

Landscape is the only design target. There is no mobile layout. The panel and
selection workflow were accepted; the fluid appearance is the current question.

## Next, after visual feedback

Do not advance through this list without another user nudge. The requested pace
is one small visible change, then feedback. The next change should follow the
user's reaction to the current layout and voxel appearance.

- Refine the continuous fluid appearance from Tom's next visual feedback.
- Move and zoom world coordinates underneath the fixed screen sampling lattice.
  Clip the world at the tank boundary. The voxels themselves never follow the camera.
- Add matter/antimatter creation tools, return to the pointer after creation,
  show the pair in Layers, and let the user select and drag its wireframes.
- Sample the combined scene into every voxel's asymmetric metric-tensor state.
- Explore deeper tanks and depth selection.

Pan and creation tools are visibly inactive in this step. No sample mass or
invented field has been added. The visual vocabulary remains open.

## Acceptance before showing

- The scene fills the viewport, with panels floating above it.
- The tank reads as a glass aquarium filled with fluid, with no internal grid.
- The default partition has one cell through depth; neighboring cells share faces.
- Selecting A and B updates their marks, coordinates, and the matrix/diff label.
- X/Y changes rebuild the grid and keep selection addresses in bounds.
- The panel can be hidden, with the canvas remaining a single landscape scene.
- No console errors, horizontal page overflow, or remote runtime dependencies.

Three.js and Inter reuse the adjacent study's vendored files and licenses.
Toolbar icons are Heroicons 2.2.0, MIT; their license is in `icons/LICENSE`.
