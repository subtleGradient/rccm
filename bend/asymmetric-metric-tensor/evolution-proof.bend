import Base
import ./rational.bend as R
import ./units.bend as U
import ./evolution.bend as E
import ./evolution-laws.bend as Laws
import ./balance-laws.bend as BL
import ./balance-proof.bend as BP

def Laws.duration_contents(n, d):
  {==}
def Laws.advance_contents(n, d, wn, wd, p, left, right):
  {==}
def Laws.step_contents(dt, width, p, q, left, middle, right):
  {==}
def Laws.total_contents(p, q):
  {==}

def Laws.step_balance(dt, width, p, q, left, middle, right):
  BL.step_balance(p, q,
    R.mul(U.value(U.Time{}, E.seconds(dt)), U.inverse_value(U.Length{}, width)),
    left, middle, right)

def Laws.no_fuel(dt, width, faces, state):
  {==}
def Laws.one_more_step(fuel, dt, width, faces, state):
  {==}
