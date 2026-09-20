# Lesson 8 — Walk between samples

[Previous: pressure units](07-stress.md) · [Course](../README.md)

## Place the field

Pause the fluid. Put one sampling mark at your left hand and one at your right.
At each mark sits a whole tensor. Read **the same slot**, `T_xx`, at both marks.
Your hands report a stress component; their separation reports a length.
Nothing has moved through time.

```text
left mark                                  right mark
T_xx = 0 Pa  -------- spacing = 1 m -------- T_xx = 2 Pa

same marks, farther apart:
T_xx = 0 Pa  -------- spacing = 2 m -------- T_xx = 2 Pa
```

**Before running:** write the two pressures and their separation. The difference
is 2 Pa in both scenes. Is the rise *per metre* also the same?
Then predict the slope when both hands read 2 Pa.

## Run the marks

```sh
bend bend/asymmetric-metric-tensor/lessons/08-differences.bend
bend bend/asymmetric-metric-tensor/PROOF.bend
```

The demo obtains its pressures from lesson 7's stress map, with `P_c = 2 Pa`.
The left sample has `q=1`, the right `q=1/2`, and both have zero slip and twist.
Thus `T_xx = P_c(1/q−1)` gives 0 and 2 Pa. These are supplied frozen samples,
not a solved flow connecting them.

The results have values **2, 1, −2, 0 N/m³**, respectively. The printer keeps
fractions unreduced. Equal pressure levels yield zero slope even when that
common level is not zero.

## Export the geometry

Let `h` be the positive separation. The implemented quotient is

$$
D_x f = \frac{f_R-f_L}{h}.
$$

The subscript `x` names the direction along which we sampled. It is not a
new row or column of the stored tensor. A field adds a **location argument**
to the local component lookup.

| Object | Programmer reading | Dimensions |
|---|---|---|
| `f_L`, `f_R` | Same property on two records | Pressure, `M L⁻¹ T⁻²` |
| `f_R−f_L` | Difference of values | Pressure |
| `h` | Distance between their locations | Length, `L` |
| `(f_R−f_L)/h` | Difference per unit distance | Force density, `M L⁻² T⁻²` |

Pressure is force/area. Dividing once more by length gives force/volume:
`Pa/m = N/m³`. A slope is not an acceleration; division by an appropriate
mass density and a chosen equation of motion would be another step.

For a straight-line field `f(x)=a+bx`, this quotient gives its slope `b`.
For a curved field it is a secant slope: it need not equal the derivative at
either endpoint. The current universal laws specify the quotient and constant
fields; they do not claim a convergence theorem or prove the linear-field
identity for every `a,b,h`.

## Bend: a domain restriction replaces a runtime trap

Read [`gradient`](../differences.bend#L7):

```text
Positive<Length> × Quantity<Pressure> × Quantity<Pressure>
    -> Quantity<ForceDensity>
```

`Positive{n,d}` means `(1+n)/(1+d)`. Its reciprocal is `(1+d)/(1+n)`;
zero spacing cannot be constructed. `Positive{0n,0n}` means **one metre**,
not zero. The type restricts the mathematical domain before arithmetic runs.

The function uses each input once. Unlike the lesson's shared demo readings,
its parameters need no `+`. It is pure: changing the spacing cannot mutate
either pressure sample. In TypeScript terms, this is a total transformation
over a deliberately narrowed input type, not a function that throws on zero.

## Read the law before its proof

[`quotient_contents`](../differences-laws.bend#L9) fixes the order `right−left`
and the reciprocal distance independently of the implementation. A function
that always returns zero cannot pass it.

[`constant_field`](../differences-laws.bend#L17) quantifies over every exact
rational value and positive spacing. Its proof has two moves:

1. Subtracting the same value from itself has zero value.
2. Multiplying a zero-valued fraction by the reciprocal spacing still has
   zero value.

Zero **value** matters: unreduced `2/2−2/2` need not be the canonical record
`Fraction{0n,0n,0n}`. `R.IsZero` checks the numerator balance.
The arithmetic support is in [`balance-proof.bend`](../balance-proof.bend);
the lesson proof reuses it rather than assuming a floating-point tolerance.

## Break the distance rule

```sh
bend bend/asymmetric-metric-tensor/lessons/counterexamples/08-no-spacing.bend
```

This must fail at `missing_distance`: it claims the 2 Pa change over 2 m
has value 2 N/m³. A parser/import error is not the expected learning result.
The false claim is outside the successful root proof gate.

Try a separate copy of the implementation without its reciprocal spacing.
Which law rejects it? Why would testing only one-metre spacing miss the bug?

## Return to the Condensed source

Read the distinction between body forces, surface forces and force densities
in [`RCCM-Condensed.tex`](../../../RCCM-Condensed.tex#L2306-L2334).
You can now read `−∇P` as “take the spatial pressure slope, then reverse its
direction,” with force-density units. The minus sign is **not** built into
our gradient function.

The focused source uses continuous derivatives in its
[motion argument](../../../RCCM-GfX-2.tex#L322-L344). Our two-point spacing,
endpoint selection and finite quotient are numerical choices. No field
interpolation, boundary padding or hidden periodic wrapping has been added.

## Leave a mark, then return

Sketch three marks reading `1, 3, 5 Pa` at one-metre intervals. Write each
adjacent difference and each slope. Now keep those readings and double the
separations. Which values change?

Then pick `T_xy` instead of `T_xx`. Reversing `b_z` reverses that signed
stress contribution; it does not change which direction separates the marks.
**Next:** put two cells between three faces. What must happen to the shared
face's contribution when you count it from both cells?

[Continue to lesson 9](09-flux.md).
