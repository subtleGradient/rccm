import Base
import ./session.bend as S

# Reproducible input replays. They use the same advance/failure path as the GUI.
def steps(fuel: Nat, state: S.State) -> S.State:
  match fuel:
    case 0n:
      state
    case 1n+rest:
      steps(rest, S.advance(state))

def medium() -> S.State:
  S.toggle(steps(132n, S.initial(42)))

def voids() -> S.State:
  S.flip(medium())

def time_layers() -> S.State:
  S.toggle_inspection(S.toggle_onion(S.seek(steps(168n, S.initial(42)), 8)))

def boundary() -> S.State:
  steps(180n, S.begin_stroke(steps(32n, S.initial(42)), 512.0, 376.0))

def choose(kind: U32) -> S.State:
  match kind:
    case 1:
      voids()
    case 2:
      time_layers()
    case 3:
      boundary()
    case _:
      medium()
