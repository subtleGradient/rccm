import Base
import ./field.bend as F
import ./control.bend as C
import ./render.bend as R

# A frozen render fixture with no preceding CPU fork. Separate process runs
# compare --gpu off against the default ! backend; this avoids a CPU fork in
# the same evaluation silently making the supposed GPU comparison a fallback.
# The supplied minimum is a HUD fixture, not a measured field statistic.
def main() -> Image:
  R.draw!(R.make_scene(F.Frame{0.0, 42, 0.8, 0.5, 0.0}, R.NoGhosts{},
    C.Medium{}, C.Paused{}, False{}, False{}, 0.72, 512.0, 376.0, 0.36, 1, 0))
