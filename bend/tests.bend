import Base
import ./pressure.bend as Pressure

# These are finite regression checks, not a universal proof of the model.
def near(a: F32, b: F32) -> Bool:
  (F32.abs((a - b : F32)) <= 0.000001 : F32)

def matches(
  result: Maybe<Pressure.Budget>, used: F32, remaining: F32
) -> Bool:
  match result:
    case None{}:
      False{}
    case Some{Pressure.Budget{+dynamic_fraction, +alpha_s_sq}}:
      near(dynamic_fraction, used) &&
      near(alpha_s_sq, remaining) &&
      near((dynamic_fraction + alpha_s_sq : F32), 1.0)

def rejected(result: Maybe<Pressure.Budget>) -> Bool:
  match result:
    case None{}:
      True{}
    case Some{budget}:
      False{}

def checks() -> Bool:
  matches(Pressure.sample(0.0), 0.0, 1.0) &&
  matches(Pressure.sample(0.25), 0.0625, 0.9375) &&
  matches(Pressure.sample(0.5), 0.25, 0.75) &&
  matches(Pressure.sample(0.75), 0.5625, 0.4375) &&
  matches(Pressure.sample(0.9), 0.81, 0.19) &&
  matches(Pressure.sample(1.0), 1.0, 0.0) &&
  rejected(Pressure.sample(F32.neg(0.1))) &&
  rejected(Pressure.sample(1.01)) &&
  rejected(Pressure.sample((1.0 / 0.0 : F32))) &&
  rejected(Pressure.sample((0.0 / 0.0 : F32)))

# F32 arithmetic runs on the target, not in the proof checker.
# Fail with a nonzero process exit so scripts can use this as a gate.
def finish(ok: Bool) -> IO(Unit):
  match ok:
    case False{}:
      IO.die(Unit, 1, "FAIL: pressure sample regression")
    case True{}:
      IO.print("PASS: 10 pressure sample cases")

def main() -> IO(Unit):
  finish(checks())
