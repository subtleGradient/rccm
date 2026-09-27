import { describe, expect, test } from "bun:test"
import {
  DIMENSIONLESS,
  LENGTH,
  TIME,
  addDimensions,
  curl,
  divideDimensions,
  equalDimensions,
  inferExpression,
  multiply,
  scaleDimension,
  symbol,
} from "../src/dimensions"

describe("dimension-space", () => {
  test("multiplication adds and division subtracts dimension coordinates", () => {
    const velocity = addDimensions(LENGTH, scaleDimension(TIME, -1))

    expect(equalDimensions(addDimensions(velocity, TIME), LENGTH)).toBe(true)
    expect(equalDimensions(divideDimensions(LENGTH, TIME), velocity)).toBe(true)
    expect(equalDimensions(scaleDimension(DIMENSIONLESS, 9), DIMENSIONLESS)).toBe(true)
  })

  test("rejects the RCCM curl-velocity versus c dimensional mismatch", () => {
    const symbols = new Map([
      ["velocity", { id: "velocity", dimension: [0, 1, -1, 0, 0] as const, shape: "vector" as const }],
      ["c", { id: "c", dimension: [0, 1, -1, 0, 0] as const, shape: "scalar" as const }],
    ])

    const vorticity = inferExpression(curl(symbol("velocity")), symbols)
    const c = inferExpression(symbol("c"), symbols)

    expect(vorticity.dimension).toEqual([0, 0, -1, 0, 0])
    expect(equalDimensions(vorticity.dimension, c.dimension)).toBe(false)
  })

  test("accepts the repaired rotational velocity ellRot * curl(v)", () => {
    const symbols = new Map([
      ["velocity", { id: "velocity", dimension: [0, 1, -1, 0, 0] as const, shape: "vector" as const }],
      ["ellRot", { id: "ellRot", dimension: LENGTH, shape: "scalar" as const }],
    ])

    const result = inferExpression(
      multiply(symbol("ellRot"), curl(symbol("velocity"))),
      symbols,
    )

    expect(result).toEqual({
      dimension: [0, 1, -1, 0, 0],
      shape: "vector",
    })
  })

  test("rejects addition of equal-dimension values with incompatible shapes", () => {
    const symbols = new Map([
      ["pressure", { id: "pressure", dimension: [1, -1, -2, 0, 0] as const, shape: "scalar" as const }],
      ["traction", { id: "traction", dimension: [1, -1, -2, 0, 0] as const, shape: "vector" as const }],
    ])

    expect(() =>
      inferExpression(
        { kind: "add", left: symbol("pressure"), right: symbol("traction") },
        symbols,
      ),
    ).toThrow(/shape/i)
  })
})

