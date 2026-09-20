# Defense brief

Independent read-only review of `16bdf78` tested the candidates in
[the prosecution record](01-private-notes.md).

| Candidate | Evidence and result |
|---|---|
| Bad coordinate map | Independent axis laws plus sixteen arbitrary-entry cases fix new-to-old direction and both indices. Three-cycle and transpose/negation proofs check. **Withdrawn.** |
| Bad positive domain | Values are `(1+n)/(1+d)`; reciprocal explicitly reverses the positive numerator/denominator. Zero time uses a different type. **Withdrawn.** |
| Source conflation | Lesson 7 explicitly distinguishes focused `P_c(U−η)` from Condensed `sigma+rho u u`. Lesson 10 records the density/admittance bridge as unresolved. **Withdrawn.** |
| Wrong index/sign | `x_flux` selects first index X; `gain` is negative divergence; spatial-only raising and `−div Q` versus `+div tau` are stated. **Withdrawn.** |
| Cached conservation | `rates` computes both cells; `total` adds those values; `boundary` is a separate exterior-only expression. **Withdrawn.** |
| Unsound certificate | Insertion, addition, scaling, multiplication and normalization have constructive interpretation-preservation proofs. Even a bad ordering comparator cannot bypass those proofs. `observe` uses `1+d`; add/mul/sub realization links the certificate to actual `R.Q` operations. Certificate and realization evidence are consumed live by the transport chain. No unsafe/axiom escape found. A false equality of unrelated atoms was rejected. **Withdrawn.** |
| Reset/copied state or scope overclaim | `advance` adds impulse to existing momentum; `State is Type` is consumed/rebuilt; first fuel argument decreases. Docs explicitly claim universal one-step, not a separate all-fuel theorem. **Withdrawn.** |
| Untracked dependency | Fresh archive passed aggregate and layer proofs, demos 6–10, and their five intended failures. **Withdrawn.** |
| `Unit` name collision | `bend units.bend` fails because of `Base.Unit`; imported module and advertised workflows succeed. **Survives as non-blocking P3 at target.** |

## Follow-up correction

Parent renamed the nominal tag type to `UnitTag` in its implementation and
five new unit-law binders, with no changed mathematical proposition or
constructor domain. Standalone module preflight and all twelve well-typed
mutation preflights then passed. This correction is after the immutable
review target; no history was rewritten.
