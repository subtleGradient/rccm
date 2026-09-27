# Voxel workbench · first visual step

[Direction, captured verbatim](DIRECTION.md). This is the new design conversation;
the earlier voxel-tank and tau-tank remain previous explorations.

Serve the repository root with `python3 -m http.server 8777 --bind 127.0.0.1`,
then open <http://localhost:8777/examples/voxel-workbench/>.

## This step

A full-window Three.js canvas, a quiet one-deep tank, floating layers and tensor
inspection, and a bottom toolbar. Click one voxel for its state; click another
for B − A. A third click replaces B; clicking a selected voxel removes it.
Arrow keys move the voxel cursor; Space or Enter selects it; Escape clears.
X/Y change the resolution. Z stays at one for this first visual decision.

The empty scene is unperturbed vacuum: q = 1, e = b = 0, and U = diag(−1,1,1,1),
from RCCM-GfX-2.tex §§1–3. The inspector uses the existing tested tensor assembler.
Every voxel therefore has the same state and every difference is zero.
The slight depth of the wire boxes is a drawing choice, not a tensor deformation.

## Next, after visual feedback

Do not advance through this list without another user nudge. The requested pace
is one small visible change, then feedback. The next change should follow the
user's reaction to the current layout and voxel appearance.

- Refine the voxel's appearance and editor proportions.
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
- The default tank has one layer, with separately readable voxel outlines.
- Selecting A and B updates their marks, coordinates, and the matrix/diff label.
- X/Y changes rebuild the grid and keep selection addresses in bounds.
- The panel can be hidden; narrow windows retain a usable canvas and toolbar.
- No console errors, horizontal page overflow, or remote runtime dependencies.

Three.js and Inter reuse the adjacent study's vendored files and licenses.
Toolbar icons are Heroicons 2.2.0, MIT; their license is in `icons/LICENSE`.
