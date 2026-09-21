import Base
import ./session.bend as S
import ./view.bend as V
import ./render.bend as R

type Smoke is Data:
  Smoke{state: S.State, remaining: Nat}

def view(input: Smoke) -> Smoke & Image:
  match input:
    case Smoke{+state, +remaining}:
      (Smoke{state, remaining}, R.draw!(V.scene(state)))

def tick(events: List<Event>, input: Smoke) -> IO(Maybe<Smoke>):
  match input:
    case Smoke{state, 0n}:
      do IO<Maybe<Smoke>>:
        IO.print("PASS: native window presented four frames through the ! render path")
        IO.pure(Maybe<Smoke>, None{})
    case Smoke{state, 1n+rest}:
      IO.pure(Maybe<Smoke>, Some{Smoke{S.advance(state), rest}})

def main() -> IO(Unit):
  App.run(~Smoke, ~App{view, tick}, "Foam - native smoke test",
          1024, 768, Smoke{S.initial(42), 3n})
