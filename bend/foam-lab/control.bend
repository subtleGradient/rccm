import Base

# Exact presentation/playback controls only; no dynamics or history.
type View is Data:
  Medium{}
  Voids{}

def flip(view: View) -> View:
  match view:
    case Medium{}:
      Voids{}
    case Voids{}:
      Medium{}

def is_voids(view: View) -> Bool:
  match view:
    case Medium{}:
      False{}
    case Voids{}:
      True{}

type Playback is Data:
  Playing{}
  Paused{}
  AtBoundary{}

# The renderer must explicitly leave AtBoundary after selecting a valid frame.
def toggle(playback: Playback) -> Playback:
  match playback:
    case Playing{}:
      Paused{}
    case Paused{}:
      Playing{}
    case AtBoundary{}:
      AtBoundary{}

def should_advance(playback: Playback) -> Bool:
  match playback:
    case Playing{}:
      True{}
    case Paused{}:
      False{}
    case AtBoundary{}:
      False{}

# inside=True means inside a supplied diagnostic VOID mask.
# This only selects its appearance: no mask or simulation state is updated.
def visibility(view: View, inside: Bool) -> Bool:
  match view:
    case Medium{}:
      Bool.not(inside)
    case Voids{}:
      inside
