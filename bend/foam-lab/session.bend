import Base
import ./field.bend as F
import ./control.bend as C
import ./timeline.bend as T

type Options is Data:
  Options{view: C.View, onion: Bool, inspect: Bool, cutoff: F32}

type Pointer is Data:
  Pointer{x: F32, y: F32, held: Bool, scrubbing: Bool}

type State is Data:
  State{tape: T.Tape, selected: U32, playback: C.Playback, options: Options, pointer: Pointer}

def word(test: Bool, yes: U32, no: U32) -> U32:
  match test:
    case True{}:
      yes
    case False{}:
      no

def value(test: Bool, yes: F32, no: F32) -> F32:
  match test:
    case True{}:
      yes
    case False{}:
      no

def capacity(sample: F.Sample) -> F32:
  match sample:
    case F.Sample{q, _, _}:
      q

# Named, finite diagnostic grid; not a certified continuous global minimum.
# All four subregions are independent. No shared mutable array.
def grid_min(+depth: Nat, +frame: F.Frame, +x: F32, +y: F32, +w: F32, +h: F32) -> F32:
  match depth:
    case 0n:
      capacity(F.sample(frame, (x + w * 0.5 : F32), (y + h * 0.5 : F32)))
    case 1n+rest:
      +hw = (w * 0.5 : F32)
      +hh = (h * 0.5 : F32)
      a b c d = grid_min(rest, frame, x, y, hw, hh)
                grid_min(rest, frame, (x + hw : F32), y, hw, hh)
                grid_min(rest, frame, x, (y + hh : F32), hw, hh)
                grid_min(rest, frame, (x + hw : F32), (y + hh : F32), hw, hh)
      F32.min(F32.min(a, b), F32.min(c, d))

def measure(+frame: F.Frame) -> F32:
  match frame:
    case F.Frame{_, _, bx, by, _}:
      F32.min(grid_min(6n, frame, 0.0, 0.0, 1.6, 1.0),
              capacity(F.sample(frame, bx, by)))

def fallback() -> T.Snapshot:
  T.Snapshot{F.Frame{0.0, 42, 0.8, 0.5, 0.0}, 1.0}

def current(state: State) -> T.Snapshot:
  match state:
    case State{tape, selected, _, _, _}:
      T.at(tape, selected, fallback())

def playback_for(valid: Bool, playing: C.Playback) -> C.Playback:
  match valid:
    case True{}:
      playing
    case False{}:
      C.AtBoundary{}

def initial(+seed: U32) -> State:
  +frame = {F.Frame{0.0, seed, 0.8, 0.5, 0.0} : F.Frame}
  +minimum = measure(frame)
  State{T.Saved{T.Snapshot{frame, minimum}, T.Empty{}}, 0,
        playback_for((minimum > 0.0 : F32), C.Playing{}),
        Options{C.Medium{}, False{}, False{}, 0.72},
        Pointer{512.0, 376.0, False{}, False{}}}

# The actuator ramp/withdrawal below is an external load schedule.
# It is NOT viscous damping, recoil, or a fluid evolution equation.
def next_frame(frame: F.Frame, pointer: Pointer) -> F.Frame:
  match frame pointer:
    case F.Frame{time, seed, +bx, +by, +brush} Pointer{+x, +y, +held, _}:
      F.Frame{(time + 0.033333333 : F32), seed,
              value(held, F32.clamp(((x - 64.0) / 560.0 : F32), 0.0, 1.6), bx),
              value(held, F32.clamp(((y - 96.0) / 560.0 : F32), 0.0, 1.0), by),
              value(held, F32.min(1.4, (brush + 0.012 : F32)),
                          F32.max(0.0, (brush - 0.02 : F32)))}

def append(+frame: F.Frame, tape: T.Tape, options: Options, pointer: Pointer,
           requested: C.Playback) -> State:
  +minimum = measure(frame)
  State{T.push(T.Snapshot{frame, minimum}, tape), 0,
        playback_for((minimum > 0.0 : F32), requested), options, pointer}

def advance_active(state: State) -> State:
  match state:
    case State{+tape, +selected, _, options, +pointer}:
      append(next_frame(T.frame(T.at(tape, selected, fallback())), pointer), T.drop(tape, selected),
             options, pointer, C.Playing{})

def advance_if(allowed: Bool, state: State) -> State:
  match allowed:
    case False{}:
      state
    case True{}:
      advance_active(state)

def advance(+state: State) -> State:
  match state:
    case State{_, _, playback, _, _}:
      advance_if(C.should_advance(playback), state)

def flip(state: State) -> State:
  match state:
    case State{tape, selected, playback, Options{view, onion, inspect, cutoff}, pointer}:
      State{tape, selected, playback, Options{C.flip(view), onion, inspect, cutoff}, pointer}

def toggle_onion(state: State) -> State:
  match state:
    case State{tape, selected, playback, Options{view, on, inspect, cutoff}, pointer}:
      State{tape, selected, playback, Options{view, Bool.not(on), inspect, cutoff}, pointer}

def toggle_inspection(state: State) -> State:
  match state:
    case State{tape, selected, playback, Options{view, onion, on, cutoff}, pointer}:
      State{tape, selected, playback, Options{view, onion, Bool.not(on), cutoff}, pointer}

def threshold(state: State, delta: F32) -> State:
  match state:
    case State{tape, selected, playback, Options{view, onion, inspect, cutoff}, pointer}:
      State{tape, selected, playback,
            Options{view, onion, inspect, F32.clamp((cutoff + delta : F32), 0.1, 0.95)}, pointer}

def toggle(state: State) -> State:
  match state:
    case State{tape, selected, playback, options, Pointer{x, y, _, _}}:
      State{T.drop(tape, selected), 0, C.toggle(playback), options,
            Pointer{x, y, False{}, False{}}}

def seek(state: State, +index: U32) -> State:
  match state:
    case State{+tape, _, _, options, Pointer{x, y, _, scrubbing}}:
      +bounded = U32.min(index, (U32.max(1, T.count(tape)) - 1 : U32))
      minimum = T.minimum(T.at(tape, bounded, fallback()))
      State{tape, bounded, playback_for((minimum > 0.0 : F32), C.Paused{}),
            options, Pointer{x, y, False{}, scrubbing}}

def older(+state: State) -> State:
  match state:
    case State{_, selected, _, _, _}:
      seek(state, (selected + 1 : U32))

def newer(+state: State) -> State:
  match state:
    case State{_, +selected, _, _, _}:
      seek(state, word(U32.is_eq(selected, 0), 0, (selected - 1 : U32)))

def released(frame: F.Frame) -> F.Frame:
  match frame:
    case F.Frame{time, seed, bx, by, _}:
      F.Frame{time, seed, bx, by, 0.0}

def release(state: State) -> State:
  match state:
    case State{+tape, +selected, _, options, Pointer{x, y, _, _}}:
      append(released(T.frame(T.at(tape, selected, fallback()))), T.drop(tape, selected),
             options, Pointer{x, y, False{}, False{}}, C.Playing{})

def frame_seed(frame: F.Frame) -> U32:
  match frame:
    case F.Frame{_, seed, _, _, _}:
      seed

def remix(+state: State) -> State:
  initial((frame_seed(T.frame(current(state))) + 137 : U32))

def set_pointer(state: State, x: F32, y: F32, held: Bool, scrubbing: Bool) -> State:
  match state:
    case State{tape, selected, playback, options, _}:
      State{tape, selected, playback, options, Pointer{x, y, held, scrubbing}}

def scrub(+state: State, +x: F32) -> State:
  match state:
    case State{+tape, _, _, _, _}:
      +last = (U32.max(1, T.count(tape)) - 1 : U32)
      +fraction = F32.clamp(((x - 72.0) / 880.0 : F32), 0.0, 1.0)
      seek(state, F32.to_u32(((1.0 - fraction) * U32.to_f32(last) : F32)))

def move_case(scrubbing: Bool, state: State, x: F32) -> State:
  match scrubbing:
    case True{}:
      scrub(state, x)
    case False{}:
      state

def move(+state: State, +x: F32, +y: F32) -> State:
  match state:
    case State{_, _, _, _, Pointer{_, _, held, +scrubbing}}:
      move_case(scrubbing, set_pointer(state, x, y, held, scrubbing), x)

def inside(+x: F32, +y: F32, +left: F32, +top: F32, w: F32, h: F32) -> Bool:
  (x >= left : F32) && (x < (left + w : F32) : F32) &&
  (y >= top : F32) && (y < (top + h : F32) : F32)

def begin_stroke(state: State, x: F32, y: F32) -> State:
  match state:
    case State{+tape, +selected, _, options, _}:
      minimum = T.minimum(T.at(tape, selected, fallback()))
      State{T.drop(tape, selected), 0,
            playback_for((minimum > 0.0 : F32), C.Playing{}),
            options, Pointer{x, y, True{}, False{}}}

def click_region(region: U32, state: State, +x: F32, +y: F32) -> State:
  match region:
    case 1:
      flip(state)
    case 2:
      scrub(set_pointer(state, x, y, False{}, True{}), x)
    case 3:
      begin_stroke(state, x, y)
    case _:
      set_pointer(state, x, y, False{}, False{})

def click(down: Bool, state: State, +x: F32, +y: F32) -> State:
  match down:
    case False{}:
      set_pointer(state, x, y, False{}, False{})
    case True{}:
      click_region(word(inside(x, y, 768.0, 30.0, 192.0, 42.0), 1,
                   word(inside(x, y, 64.0, 676.0, 896.0, 40.0), 2,
                   word(inside(x, y, 64.0, 96.0, 896.0, 560.0), 3, 0))),
                   state, x, y)

def key(code: U32, state: State) -> State:
  match code:
    case 9:
      flip(state)
    case 32:
      toggle(state)
    case 109:
      flip(state)
    case 111:
      toggle_onion(state)
    case 105:
      toggle_inspection(state)
    case 117:
      release(state)
    case 114:
      remix(state)
    case 91:
      older(state)
    case 93:
      newer(state)
    case 43:
      threshold(state, 0.025)
    case 61:
      threshold(state, 0.025)
    case 45:
      threshold(state, (0.0 - 0.025 : F32))
    case _:
      state

def event(e: Event, state: State) -> Maybe<State>:
  match e:
    case Close{}:
      None{}
    case Key{27, True{}}:
      None{}
    case Key{+code, True{}}:
      Some{key(word((code >= 65 : U32) && (code <= 90 : U32),
                    (code + 32 : U32), code), state)}
    case Mouse{x, y, _, down}:
      Some{click(down, state, U32.to_f32(x), U32.to_f32(y))}
    case Move{x, y}:
      Some{move(state, U32.to_f32(x), U32.to_f32(y))}
    case _:
      Some{state}

def events(es: List<Event>, state: State) -> Maybe<State>:
  match es:
    case []:
      Some{state}
    case e <> rest:
      Maybe.bind(&1, State, State, event(e, state), next => events(rest, next))
