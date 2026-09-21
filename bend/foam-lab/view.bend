import Base
import ./timeline.bend as T
import ./session.bend as S
import ./render.bend as R

# These are frames actually present on the tape, not time-minus-delta guesses.
def ghosts(fuel: Nat, tape: T.Tape) -> R.Ghosts:
  match fuel tape:
    case 0n _:
      R.NoGhosts{}
    case _ T.Empty{}:
      R.NoGhosts{}
    case 1n+rest T.Saved{T.Snapshot{frame, _}, older}:
      R.Ghost{frame, ghosts(rest, T.drop(older, 23))}

def scene(state: S.State) -> R.Scene:
  match state:
    case S.State{+tape, +selected, playback,
                 S.Options{view, onion, inspect, cutoff}, S.Pointer{x, y, _, _}}:
      +snapshot = T.at(tape, selected, S.fallback())
      R.make_scene(T.frame(snapshot), ghosts(3n, T.drop(tape, (selected + 24 : U32))),
                   view, playback, onion, inspect, cutoff, x, y,
                   T.minimum(snapshot), T.count(tape), selected)

def draw(input: S.State) -> S.State & Image:
  +state = input
  (state, R.draw!(scene(state)))
