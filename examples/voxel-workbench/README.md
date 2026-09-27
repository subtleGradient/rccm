# Voxel workbench · outline elements and rasterized state

[Direction, captured verbatim](DIRECTION.md). This is the new design conversation;
the earlier voxel-tank and tau-tank remain previous explorations.
[Subsequent visual directions, captured verbatim](FEEDBACK.md).

Serve the repository root with `python3 -m http.server 8777 --bind 127.0.0.1`,
then open <http://localhost:8777/examples/voxel-workbench/>.

## This step

A full-window landscape Three.js studio, a glass tank filled with continuous
fluid, floating layers and tensor inspection, and a bottom toolbar. Voxels tile
the fluid volume exactly; unselected voxels have no visible boundaries or gaps.
Only hover and selection reveal a cell. The pointer selects and drags the outline
mass sphere in the XY plane; arrow keys nudge it, or Shift+arrows move it farther.
Its layer selects it, the eye includes/excludes it, and Reset restores its position.
The sphere remains a wireframe inside and outside the tank.

Press I for the voxel inspector. Click one voxel for its state; click another
for B − A. A third click replaces B; clicking a selected voxel removes it.
Arrow keys move the voxel cursor; Space or Enter selects it; Escape clears.
X/Y change the resolution. Z stays at one for this first visual decision.

The sphere changes pressure capacity q. Lower capacity renders as denser, darker
ink in the fluid. Its influence extends beyond its outline. The renderer and
inspector share one raster of volume-averaged state. Changing resolution changes
the sampling partition, preserving the contiguous volume. With Z=1 each cell
spans the full fluid depth. The glass and studio lighting are visual context.

Landscape is the only design target. There is no mobile layout. The panel and
selection workflow were accepted; the outline-to-fluid relationship is the
current visual question.

## Scene → tensor raster → appearance

`fields.mjs` samples the combined scene; `tank-view.js` renders the resulting
3D data texture and independent outline elements. The inspector reads the same
raster cells. There is no shader-only source or separately invented inspector state.

The first source is a uniform, unpolarized spherical mass in the macroscopic
Poisson limit. Its exterior normalized load is `r_s/r`; its interior load is
`r_s/(2R) × (3 − r²/R²)`, with `r_s=2GM/c²`. The chosen sphere has R=1.55 and
r_s=0.124 scene units. The interior and exterior join continuously in value
and radial derivative. The center has q=0.88. Infinity supplies q=1.

Source route: GfX §§2–3 supply the pressure ledger and Cartesian matrix;
§4.1 maps potential to pressure deficit; §6.4 supplies the macroscopic Poisson
limit. Condensed `eq:scalar_superposition` adds scalar loads and its refractive
impedance derivation gives `v₀²=2GM/r`. The uniform interior is the regular
spherical solution of that Poisson limit. The mass distribution is an editor
input; moving it evaluates a new frozen scene, with no time integration.

All enabled source loads combine before tensor assembly: `q=1−Σload`.
This unpolarized source has e=b=0. Each voxel averages q and 1/q separately
using 4×4×4 midpoint quadrature; the spatial diagonal is **mean(1/q)**.
Saturated states throw rather than silently clamping. The current single source
stays within q∈[0.88,1]. The sampling path accepts multiple source contributions;
this visual step exposes one editable element.

The renderer samples the raster with nearest filtering and integrates optical
color/opacity along the view ray. There are no drawn interior cell faces or grid
lines. The q-to-color mapping is an authored visual transfer, with contrast
spanning q=1 to q=0.88. Other tensor channels remain available in the inspector;
their visual vocabulary is a later design decision.

## Next, after visual feedback

Do not advance through this list without another user nudge. The requested pace
is one small visible change, then feedback. The next change should follow the
user's reaction to the current layout and voxel appearance.

- Refine the continuous fluid appearance from Tom's next visual feedback.
- Move and zoom world coordinates underneath the fixed screen sampling lattice.
  Clip the world at the tank boundary. The voxels themselves never follow the camera.
- Add matter/antimatter creation tools and return to the pointer after creation.
- Extend the source and rendering vocabulary to signed slip and twist.
- Explore deeper tanks and depth selection.

Pan and creation tools remain inactive. The visual vocabulary remains open.

## Acceptance before showing

- The scene fills the viewport, with panels floating above it.
- The tank reads as a glass aquarium filled with fluid, with no internal grid.
- The default partition has one cell through depth; neighboring cells share faces.
- Selecting A and B updates their marks, coordinates, and the matrix/diff label.
- X/Y changes rebuild the grid and keep selection addresses in bounds.
- Moving the outline changes sampled values while the tank stays fixed.
- Excluding the source restores the vacuum; sources outside the tank still influence it.
- The panel can be hidden, with the canvas remaining a single landscape scene.
- No console errors, horizontal page overflow, or remote runtime dependencies.

Three.js and Inter reuse the adjacent study's vendored files and licenses.
Toolbar icons are Heroicons 2.2.0, MIT; their license is in `icons/LICENSE`.

Run the five field/raster invariants with
`node --test examples/voxel-workbench/fields.test.mjs` from the repository root.
