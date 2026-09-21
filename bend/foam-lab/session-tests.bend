import Base
import ./field.bend as F
import ./control.bend as C
import ./timeline.bend as T
import ./session.bend as S

def require(ok: Bool, label: String) -> IO(Unit):
  match ok:
    case True{}:
      IO.pure(Unit, Unit{})
    case False{}:
      IO.die(Unit, 1, "FAIL: " ++ label)

def same_frame(a: F.Frame, b: F.Frame) -> Bool:
  match a b:
    case F.Frame{at, seed_a, ax, ay, ap} F.Frame{bt, seed_b, bx, by, bp}:
      U32.is_eq(F32.bits(at), F32.bits(bt)) &&
      U32.is_eq(seed_a, seed_b) &&
      U32.is_eq(F32.bits(ax), F32.bits(bx)) &&
      U32.is_eq(F32.bits(ay), F32.bits(by)) &&
      U32.is_eq(F32.bits(ap), F32.bits(bp))

def same_sample(+a: S.State, +b: S.State) -> Bool:
  same_frame(T.frame(S.current(a)), T.frame(S.current(b))) &&
  U32.is_eq(F32.bits(T.minimum(S.current(a))), F32.bits(T.minimum(S.current(b))))

def size(state: S.State) -> U32:
  match state:
    case S.State{tape, _, _, _, _}:
      T.count(tape)

def selected(state: S.State) -> U32:
  match state:
    case S.State{_, index, _, _, _}:
      index

def playing(state: S.State) -> Bool:
  match state:
    case S.State{_, _, playback, _, _}:
      C.should_advance(playback)

def boundary(state: S.State) -> Bool:
  match state:
    case S.State{_, _, C.AtBoundary{}, _, _}:
      True{}
    case _:
      False{}

def closed(result: Maybe<S.State>) -> Bool:
  match result:
    case None{}:
      True{}
    case Some{_}:
      False{}

def steps(fuel: Nat, state: S.State) -> S.State:
  match fuel:
    case 0n:
      state
    case 1n+rest:
      steps(rest, S.advance(state))

def padded(fuel: Nat, tape: T.Tape) -> T.Tape:
  match fuel:
    case 0n:
      tape
    case 1n+rest:
      padded(rest, T.push(S.fallback(), tape))

def main() -> IO(Unit):
  +base = S.initial(42)
  +history = steps(12n, base)
  +past = S.seek(history, 4)
  +branch = S.advance(S.toggle(past))
  +broken = steps(180n, S.begin_stroke(base, 512.0, 376.0))
  +frozen = steps(20n, S.toggle(broken))
  +released = S.release(broken)
  do IO<Unit>:
    require(playing(base) && (T.minimum(S.current(base)) > 0.0 : F32), "initial regular branch")
    require(same_sample(base, S.flip(base)), "figure-ground switch preserves the sampled state")
    require(same_sample(base, S.threshold(base, 0.1)), "cutoff changes appearance only")
    require(same_sample(base, S.toggle_inspection(S.toggle_onion(base))), "inspection and onion skins do not evolve state")
    require(U32.is_eq(size(history), 13), "each advance records one actual snapshot")
    require(U32.is_eq(selected(past), 4) && Bool.not(playing(past)), "scrub pauses at the selected snapshot")
    require(U32.is_eq(size(branch), 10) && U32.is_eq(selected(branch), 0), "resuming the past discards its future before branching")
    require(U32.is_eq(selected(S.scrub(history, 72.0)), 12), "timeline left endpoint is oldest")
    require(U32.is_eq(selected(S.scrub(history, 952.0)), 0), "timeline right endpoint is newest")
    require(U32.is_eq(selected(S.newer(base)), 0), "newer cannot underflow")
    require(U32.is_eq(T.count(padded(230n, T.Empty{})), 180), "history memory remains bounded")
    require(boundary(broken) && (T.minimum(S.current(broken)) <= 0.0 : F32), "sampled capacity failure freezes")
    require(same_sample(broken, frozen) && U32.is_eq(size(broken), size(frozen)), "space and ticks cannot evolve a failed branch")
    require(playing(released) && (T.minimum(S.current(released)) > 0.0 : F32), "explicit load withdrawal starts a valid branch")
    require(closed(S.event(Close{}, base)) && closed(S.event(Key{27, True{}}, base)), "native close and escape")
    IO.print("PASS: session, real snapshot history, figure-ground invariance, branching and boundary regression gates")
