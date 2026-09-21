import Base
import ./field.bend as F

# Actual sampled frames, newest first. No guessed/interpolated past.
type Snapshot is Data:
  Snapshot{frame: F.Frame, minimum: F32}

type Tape is Data:
  Empty{}
  Saved{snapshot: Snapshot, older: Tape}

def frame(snapshot: Snapshot) -> F.Frame:
  match snapshot:
    case Snapshot{value, _}:
      value

def minimum(snapshot: Snapshot) -> F32:
  match snapshot:
    case Snapshot{_, value}:
      value

def count(tape: Tape) -> U32:
  match tape:
    case Empty{}:
      0
    case Saved{_, older}:
      (1 + count(older) : U32)

def take(fuel: Nat, tape: Tape) -> Tape:
  match fuel tape:
    case 0n _:
      Empty{}
    case 1n+rest Empty{}:
      Empty{}
    case 1n+rest Saved{snapshot, older}:
      Saved{snapshot, take(rest, older)}

def drop_go(tape: Tape, +index: U32, zero: Bool) -> Tape:
  match tape zero:
    case Empty{} _:
      Empty{}
    case Saved{snapshot, older} True{}:
      Saved{snapshot, older}
    case Saved{_, older} False{}:
      drop_go(older, (index - 1 : U32), U32.is_eq(index, 1))

def drop(tape: Tape, +index: U32) -> Tape:
  drop_go(tape, index, U32.is_eq(index, 0))

def at_go(tape: Tape, +index: U32, zero: Bool, fallback: Snapshot) -> Snapshot:
  match tape zero:
    case Empty{} _:
      fallback
    case Saved{snapshot, _} True{}:
      snapshot
    case Saved{snapshot, older} False{}:
      at_go(older, (index - 1 : U32), U32.is_eq(index, 1), snapshot)

def at(tape: Tape, +index: U32, fallback: Snapshot) -> Snapshot:
  at_go(tape, index, U32.is_eq(index, 0), fallback)

def push(snapshot: Snapshot, tape: Tape) -> Tape:
  Saved{snapshot, take(179n, tape)}
