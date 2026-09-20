import Base
import ./units.bend as U
import ./flux.bend as F
import ./flux-laws.bend as Laws
import ./balance-laws.bend as BL
import ./balance-proof.bend as BP

def Laws.axis_x():
  {==}
def Laws.axis_y():
  {==}
def Laws.axis_z():
  {==}
def Laws.transport_row(scale, momentum, matrix):
  {==}
def Laws.sampled_faces(scale, momentum, left, middle, right):
  {==}
def Laws.gain_contents(n, d, left, right):
  {==}
def Laws.both_cells(width, left, middle, right):
  {==}
def Laws.total_contents(left, right):
  {==}
def Laws.boundary_contents(width, left, middle, right):
  {==}

def Laws.shared_face_cancels(width, faces):
  match faces:
    case F.Faces{U.Measure{left}, U.Measure{middle}, U.Measure{right}}:
      BL.telescoping_scaled(U.inverse_value(U.Length{}, width), left, middle, right)
