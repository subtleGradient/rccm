import Base
import ./control.bend as C
import ./control-laws.bend as Laws

# AI-drafted proofs, pending human review of the independent specifications.
def Laws.flip_medium():
  {==}
def Laws.flip_voids():
  {==}
def Laws.flip_twice(view):
  match view:
    case C.Medium{}:
      {==}
    case C.Voids{}:
      {==}
def Laws.select_medium():
  {==}
def Laws.select_voids():
  {==}

def Laws.toggle_playing():
  {==}
def Laws.toggle_paused():
  {==}
def Laws.toggle_boundary():
  {==}
def Laws.toggle_twice(playback):
  match playback:
    case C.Playing{}:
      {==}
    case C.Paused{}:
      {==}
    case C.AtBoundary{}:
      {==}
def Laws.playing_advances():
  {==}
def Laws.paused_frozen():
  {==}
def Laws.boundary_frozen():
  {==}
def Laws.toggled_boundary_frozen():
  {==}

def Laws.medium_inside_hidden():
  {==}
def Laws.medium_outside_visible():
  {==}
def Laws.voids_inside_visible():
  {==}
def Laws.voids_outside_hidden():
  {==}
def Laws.visibility_complement(view, inside):
  match view inside:
    case C.Medium{} False{}:
      {==}
    case C.Medium{} True{}:
      {==}
    case C.Voids{} False{}:
      {==}
    case C.Voids{} True{}:
      {==}
def Laws.visibility_roundtrip(view, inside):
  match view:
    case C.Medium{}:
      {==}
    case C.Voids{}:
      {==}
