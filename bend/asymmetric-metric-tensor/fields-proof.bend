import Base
import ./tensor.bend as T
import ./fields-laws.bend as Laws

def Laws.eval_constant(value, point):
  {==}
def Laws.eval_coordinate(axis, point):
  {==}
def Laws.eval_sum(a, b, p):
  {==}
def Laws.eval_product(a, b, p):
  {==}
def Laws.diff_constant(value, axis):
  {==}
def Laws.diff_self(axis):
  match axis:
    case T.T{}:
      {==}
    case T.X{}:
      {==}
    case T.Y{}:
      {==}
    case T.Z{}:
      {==}
def Laws.diff_sum(a, b, axis):
  {==}
def Laws.diff_product(a, b, axis):
  {==}
def Laws.derivative_fixture():
  {==}
def Laws.cross_coordinate():
  {==}
