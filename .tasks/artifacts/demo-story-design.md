# TauLab executable demo story design

## Objective and audience

The audience is a curious technical reader, scientific programmer, physicist,
or game-simulation builder who has checked out the repository and is willing
to run one command. The objective is not to persuade them that RCCM is true.
It is to let them touch evidence that RCCM has crossed from prose into an
executable, falsifiable continuum-model laboratory.

## Reconciliation diagnosis

- **Expected pattern:** speculative theories arrive as equations, diagrams, or
  claims that cannot be independently exercised.
- **Prediction break:** this repository creates a numerical universe locally
  and lets the reader attack its output.
- **Valued variable:** whether RCCM can become a testable engineering object
  without laundering numerical success into physical proof.
- **Reconciliation policies:** measure a wave, refine the grid, replay the
  universe, and compare two independent hardware implementations.
- **New regime:** the reader leaves with a bounded result they can reproduce
  and a precise map of what remains unproven.

## Story skeleton

| Primitive | Demo choice |
|---|---|
| Baseline | A uniform, periodic tau continuum |
| Perspective | The reader as an observer outside the simulated universe |
| Goal | Determine whether one disturbance survives scientific scrutiny |
| Obstacle | A simulation can look plausible while leaking invariants or hiding numerical error |
| Stakes | Whether RCCM is an executable research program rather than an aesthetic claim |
| Core question | Can one locked theory version make a measured, converging, replayable prediction? |
| Causal chain | Seed → evolve → measure → refine → replay → cross-check |
| Emotional shift | Curiosity → suspicion → earned confidence → larger frontier |
| Payoff | Live pass/fail evidence, an exact state identity, and an honest claim boundary |

## Hook, retention, payoff, and trust

- **Hook:** “Create a universe. Disturb it once. Then try to catch it lying.”
- **Retention:** one live question per gate, with the measured number immediately
  beside its prediction or tolerance.
- **Payoff:** a compact certification card saying exactly what passed.
- **Trust:** a final boundary names the phenomena the demo does not establish:
  stable particles, gravity, electromagnetism, quantum statistics, and chemistry.

The report uses no false countdown, animation delay, stored result, or hidden
failure. It retains stopping cues and gives value in one command.

## Story Golf

### Story: A universe you can audit

- **Target:** a curious technical reader who has cloned the RCCM repository
- **Exact message:** This repo runs a deterministic, converging tau-continuum
  experiment on your machine and tells you exactly what worked and what remains
  unproven.
- **Required belief:** locally measured numerical evidence is more useful than
  another ontological promise.
- **Required action:** run `make demo` and inspect the result.
- **Axis scores:**
  - Translation Tax: 1
  - Identity Threat: 0
  - Causal Friction: 1
  - Apathy Risk: 1
  - Trust Burden: 0
- **Total score:** 3/25
- **Verdict:** God-Tier; the proof is local and the reader keeps agency.
- **Highest-friction axis:** a three-way tie between unfamiliar vocabulary,
  the bridge from continuum mechanics to RCCM, and optional urgency.
- **Mutation:** show measured behavior before introducing theory vocabulary.

## Thing Golf

The smallest coherent implementation adds one root command, one focused demo
module, one executable, and one test suite. The main liabilities are the new
public command and the temptation to duplicate solver logic. Mitigations:

- keep numerical evolution inside the existing `ReferenceSolver`;
- keep demo measurements in a separate, typed report object;
- test every displayed pass/fail condition;
- let unsupported Metal report an honest skip rather than a fake pass;
- make the process exit nonzero whenever a required CPU gate fails.

This adds modest maintenance weight but improves clarity and trust through a
single discoverable entry point and executable acceptance evidence.
