import Base

# Coordinate labels, not lengths, times, or component values.
# Row/column order follows RCCM-GfX-2.tex section 3.3: t, x, y, z.
type Axis is Data:
  T{}
  X{}
  Y{}
  Z{}

type Slot is Data:
  Slot{row: Axis, column: Axis}

def row(s: Slot) -> Axis:
  match s:
    case Slot{r, c}:
      r

def column(s: Slot) -> Axis:
  match s:
    case Slot{r, c}:
      c

# The address operation behind transposition. No numerical value is negated.
def swap(s: Slot) -> Slot:
  match s:
    case Slot{r, c}:
      Slot{c, r}
