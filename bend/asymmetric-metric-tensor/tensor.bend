import Base
import ./exact.bend as Exact

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

# Values at a chosen off-diagonal slot and its transposed address, in order.
# This record carries no addresses; the full matrix assembler comes later.
type ComponentPair is Data:
  ComponentPair{here: Exact.Signed, across: Exact.Signed}

def symmetric_pair(+value: Exact.Signed) -> ComponentPair:
  ComponentPair{value, value}

def antisymmetric_pair(+value: Exact.Signed) -> ComponentPair:
  ComponentPair{value, Exact.negate(value)}

# Transposing a pair exchanges values. Negating a pair reverses both signs.
def transpose_pair(pair: ComponentPair) -> ComponentPair:
  match pair:
    case ComponentPair{here, across}:
      ComponentPair{across, here}

def negate_pair(pair: ComponentPair) -> ComponentPair:
  match pair:
    case ComponentPair{here, across}:
      ComponentPair{Exact.negate(here), Exact.negate(across)}
