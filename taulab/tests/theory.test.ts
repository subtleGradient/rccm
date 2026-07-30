import { describe, expect, test } from "bun:test"
import { compileTheory, TheoryCompilationError } from "../src/compiler"
import { rccmV0 } from "../src/theory/rccm-v0"
import type { TheoryBundle } from "../src/types"

const cloneTheory = (): TheoryBundle => structuredClone(rccmV0)

describe("theory compiler", () => {
  test("compiles RCCM-v0 into an immutable stable content hash", () => {
    const first = compileTheory(cloneTheory())
    const second = compileTheory(cloneTheory())

    expect(first.hash).toMatch(/^[a-f0-9]{64}$/)
    expect(first.hash).toBe(second.hash)
    expect(Object.isFrozen(first.bundle)).toBe(true)
    expect(Object.isFrozen(first.bundle.equations)).toBe(true)
    expect(() => {
      ;(first.bundle as { title: string }).title = "mutated"
    }).toThrow()
  })

  test("changes identity when a closure changes", () => {
    const baseline = compileTheory(cloneTheory())
    const changed = cloneTheory()
    changed.constitutiveLaws[0]!.formula += " + explicit_new_term"

    expect(compileTheory(changed).hash).not.toBe(baseline.hash)
  })

  test("rejects cyclic parameter dependencies", () => {
    const theory = cloneTheory()
    theory.parameters.push(
      {
        id: "cycleA",
        role: "derived",
        value: 1,
        dimension: [0, 0, 0, 0, 0],
        dependsOn: ["cycleB"],
        fittedFrom: [],
      },
      {
        id: "cycleB",
        role: "derived",
        value: 1,
        dimension: [0, 0, 0, 0, 0],
        dependsOn: ["cycleA"],
        fittedFrom: [],
      },
    )

    expect(() => compileTheory(theory)).toThrow(TheoryCompilationError)
    expect(() => compileTheory(theory)).toThrow(/cycle/i)
  })

  test("rejects direct and transitive holdout leakage", () => {
    const theory = cloneTheory()
    theory.parameters.push(
      {
        id: "protectedMass",
        role: "holdout",
        value: 1,
        dimension: [1, 0, 0, 0, 0],
        dependsOn: [],
        fittedFrom: [{ evidenceId: "electron-mass", use: "holdout" }],
      },
      {
        id: "leakedRadius",
        role: "derived",
        value: 1,
        dimension: [0, 1, 0, 0, 0],
        dependsOn: ["protectedMass"],
        fittedFrom: [],
      },
      {
        id: "leakedClosure",
        role: "closure",
        value: 1,
        dimension: [0, 1, 0, 0, 0],
        dependsOn: ["leakedRadius"],
        fittedFrom: [],
      },
    )

    expect(() => compileTheory(theory)).toThrow(/holdout leakage/i)
  })

  test("rejects dimensionally invalid equations", () => {
    const theory = cloneTheory()
    theory.equations.push({
      id: "invalid-vorticity-saturation",
      lhs: { kind: "curl", value: { kind: "symbol", id: "velocity" } },
      rhs: { kind: "symbol", id: "c" },
      domain: "all resolved cells",
      boundaryAssumptions: [],
      provenance: {
        class: "implementation-hypothesis",
        source: "adversarial test",
      },
    })

    expect(() => compileTheory(theory)).toThrow(/dimension/i)
  })
})

