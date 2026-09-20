import Base
import ./tensor.bend as Tensor
import ./LAWS.bend as Laws
import ./exact.bend as Exact

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

def Laws.from_nat_zero():
  {==}

def Laws.from_nat_successor(p):
  {==}

def Laws.negate_zero():
  {==}

def Laws.negate_positive(p):
  {==}

def Laws.negate_negative(p):
  {==}

def Laws.negate_twice(value):
  match value:
    case Exact.Zero{}:
      {==}
    case Exact.Positive{p}:
      {==}
    case Exact.Negative{p}:
      {==}

def Laws.symmetric_entries(value):
  {==}

def Laws.antisymmetric_entries(value):
  {==}

def Laws.transpose_pair_entries(here, across):
  {==}

def Laws.negate_pair_entries(here, across):
  {==}

def Laws.symmetric_transpose(value):
  {==}

def Laws.antisymmetric_transpose(value):
  %Laws.negate_twice(value) : {
    Tensor.ComponentPair{Exact.negate(value), _}
    == Tensor.negate_pair(Tensor.antisymmetric_pair(value)) : Tensor.ComponentPair
  }
  {==}
