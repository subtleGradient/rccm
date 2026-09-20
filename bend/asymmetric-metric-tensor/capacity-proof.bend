import Base
import ./capacity.bend as Capacity
import ./capacity-laws.bend as Laws
import ./rational-proof.bend as RP
import ./rational-laws.bend as RL

def Laws.exhausted_rejected(used):
  {==}

def Laws.positive_accepted(p, used):
  {==}

def Laws.capacity_value(p, used):
  {==}

def Laws.used_value(p, used):
  {==}

def Laws.inverse_value(p, used):
  {==}

def Laws.numerator_bounded(p, used):
  match p:
    case 0n:
      match used:
        case 0n:
          {==}
        case 1n+u:
          {==}
    case 1n+previous:
      Laws.numerator_bounded(previous, used)

def Laws.budget(state):
  match state:
    case Capacity.Regular{p, used}:
      RL.partition_unit(p, used)

def Laws.reciprocal(state):
  match state:
    case Capacity.Regular{+p, used}:
      RL.ratio_reciprocal(p, Nat.add(p, used))
