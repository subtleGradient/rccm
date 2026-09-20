import Base
import ./tensor.bend as Tensor
import ./LAWS.bend as Laws

def Laws.swap_row(s):
  match s:
    case Tensor.Slot{r, c}:
      {==}

def Laws.swap_column(s):
  match s:
    case Tensor.Slot{r, c}:
      {==}

def Laws.swap_twice(s):
  match s:
    case Tensor.Slot{r, c}:
      {==}
