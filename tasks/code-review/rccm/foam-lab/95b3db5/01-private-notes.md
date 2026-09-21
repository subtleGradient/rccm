# Prosecution notes

These engineering notes are intentionally reviewable repository artifacts,
not private participant information.

## Incentive

Tom wants a beautiful, real, source-constrained toy. The implementation chooses
a bounded driven ledger rather than inventing post-cavitation dynamics.

## Falsification

The independent reviewer at the anchored commit found:

1. GUI Image pixels used integer coordinates while CPU captures used centers.
   The timeline baseline gives a concrete divergent pixel at `(100,696)`.
2. The inspector sampled outside the field's declared domain when the cursor
   moved over window chrome.
3. The unqualified capacity-exhausted banner overstated the explicitly finite
   grid detector.

Other attacks: stored versus reconstructed past, branching dropping future
history, view-only inversion, invalid reciprocals, negative capacity handling,
finite inputs, bounded memory, hitboxes and misleading physical claims.

## Simplicity and reversibility

The scene is a pure field function plus bounded actual state history. No
foreign graphics effect, dependency installation, hidden PDE or OS screenshot
permission is required. Interventions are explicit; rewind restores snapshots.
