import Base
import ./session.bend as S
import ./view.bend as V

def finish(result: Maybe<S.State>) -> Maybe<S.State>:
  match result:
    case None{}:
      None{}
    case Some{state}:
      Some{S.advance(state)}

def tick(events: List<Event>, state: S.State) -> IO(Maybe<S.State>):
  do IO<Maybe<S.State>>:
    IO.sleep(8)
    IO.pure(Maybe<S.State>, finish(S.events(events, state)))

def main() -> IO(Unit):
  App.run(~S.State, ~App{V.draw, tick}, "Foam - the other side of empty",
          1024, 768, S.initial(42))
