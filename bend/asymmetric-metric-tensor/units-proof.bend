import Base
import ./units.bend as U
import ./units-laws.bend as Laws
import ./rational-laws.bend as RL
import ./rational-proof.bend as RP

def Laws.value_contents(unit, v):
  {==}

def Laws.positive_contents(unit, n, d):
  {==}

def Laws.inverse_contents(unit, n, d):
  {==}

def Laws.reciprocal(unit, v):
  match v:
    case U.Positive{n, d}:
      RL.ratio_reciprocal(n, d)

def Laws.add_contents(unit, a, b):
  {==}
