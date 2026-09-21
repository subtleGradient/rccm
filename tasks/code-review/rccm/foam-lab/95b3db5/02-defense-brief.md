# Defense brief

## Capture/GUI sampling

- **Defense:** both paths call the same renderer, so the PPM is genuine.
- **Finding survives:** calling the same function at different coordinates is
  not the same image.
- **Resolution:** Image tiles and capture now share pixel-center coordinates.
  New tests compare actual Image leaves with capture-coordinate pixels in
  the HUD and field, replacing a same-expression equality check.

## Inspector bounds

- **Defense:** the small out-of-bounds excursion is numerically stable.
- **Finding survives:** stability does not satisfy the declared input domain.
- **Resolution:** inspector text is gated before sampling. Outside readings
  are blank, not clamped to a misleading edge value; boundary regressions added.

## Failure wording

- **Defense:** sampled failure really freezes and never computes a reciprocal.
- **Finding survives:** that does not certify a continuous first-contact limit.
- **Resolution:** status is `SAMPLE LIMIT`; the banner specifies a
  `NONPOSITIVE CAPACITY SAMPLE`. The detector remains deliberately finite.

## Backend comparison

An initial same-evaluation CPU/GPU comparison reported identity, but Bend can
route a bang to CPU after a CPU fork in that evaluation. It was replaced with
separate-process whole-tree comparison. The measured frozen fixture differs
in 17 of 1,048,576 pixels by at most 1/255 per channel on this M1; CPU thread
counts agree exactly. The test requires at most 2/255, not pixel identity.

## Withdrawn attacks

Actual snapshot history, bounded memory, future truncation when branching,
complementary figure-ground masks, negative-q diagnostics, reachable finite
inputs and lack of invented post-yield dynamics survived the review.
