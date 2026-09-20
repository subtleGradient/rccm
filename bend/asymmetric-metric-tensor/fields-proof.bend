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

def Laws.diff_coordinate(coordinate,axis):
  match coordinate axis:
    case T.T{} T.T{}:
      {==}
    case T.T{} T.X{}:
      {==}
    case T.T{} T.Y{}:
      {==}
    case T.T{} T.Z{}:
      {==}
    case T.X{} T.T{}:
      {==}
    case T.X{} T.X{}:
      {==}
    case T.X{} T.Y{}:
      {==}
    case T.X{} T.Z{}:
      {==}
    case T.Y{} T.T{}:
      {==}
    case T.Y{} T.X{}:
      {==}
    case T.Y{} T.Y{}:
      {==}
    case T.Y{} T.Z{}:
      {==}
    case T.Z{} T.T{}:
      {==}
    case T.Z{} T.X{}:
      {==}
    case T.Z{} T.Y{}:
      {==}
    case T.Z{} T.Z{}:
      {==}
