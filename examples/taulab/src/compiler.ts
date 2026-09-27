import { createHash } from "node:crypto"
import {
  equalDimensions,
  formatDimension,
  inferExpression,
  type SymbolShape,
} from "./dimensions"
import type {
  CompiledTheory,
  ParameterSpec,
  TheoryBundle,
} from "./types"

export class TheoryCompilationError extends Error {
  constructor(readonly diagnostics: readonly string[]) {
    super(`Theory compilation failed:\n- ${diagnostics.join("\n- ")}`)
    this.name = "TheoryCompilationError"
  }
}

export const canonicalStringify = (value: unknown): string => {
  if (value === null || typeof value === "number" || typeof value === "boolean") {
    return JSON.stringify(value)
  }
  if (typeof value === "string") return JSON.stringify(value)
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalStringify(item)).join(",")}]`
  }
  if (typeof value === "object") {
    const record = value as Record<string, unknown>
    const entries = Object.keys(record)
      .filter((key) => record[key] !== undefined)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalStringify(record[key])}`)
    return `{${entries.join(",")}}`
  }
  throw new Error(`cannot canonicalize ${typeof value}`)
}

export const contentHash = (value: unknown): string =>
  createHash("sha256").update(canonicalStringify(value)).digest("hex")

const deepFreeze = <T>(value: T): T => {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value)
    for (const child of Object.values(value as Record<string, unknown>)) {
      deepFreeze(child)
    }
  }
  return value
}

const duplicates = (ids: readonly string[]): string[] => {
  const seen = new Set<string>()
  const repeated = new Set<string>()
  for (const id of ids) {
    if (seen.has(id)) repeated.add(id)
    seen.add(id)
  }
  return [...repeated].sort()
}

const validateParameterGraph = (
  parameters: readonly ParameterSpec[],
  diagnostics: string[],
): void => {
  const byId = new Map(parameters.map((parameter) => [parameter.id, parameter]))

  for (const parameter of parameters) {
    for (const dependency of parameter.dependsOn) {
      if (!byId.has(dependency)) {
        diagnostics.push(`parameter ${parameter.id} has undefined dependency ${dependency}`)
      }
    }
    if (
      parameter.role !== "holdout" &&
      parameter.fittedFrom.some((evidence) => evidence.use === "holdout")
    ) {
      diagnostics.push(`holdout leakage: parameter ${parameter.id} is fitted from protected evidence`)
    }
  }

  const state = new Map<string, "visiting" | "visited">()
  const reachesHoldoutMemo = new Map<string, boolean>()

  const visitCycle = (id: string, path: readonly string[]): void => {
    const status = state.get(id)
    if (status === "visited") return
    if (status === "visiting") {
      diagnostics.push(`parameter dependency cycle: ${[...path, id].join(" -> ")}`)
      return
    }

    state.set(id, "visiting")
    const parameter = byId.get(id)
    if (parameter) {
      for (const dependency of parameter.dependsOn) {
        visitCycle(dependency, [...path, id])
      }
    }
    state.set(id, "visited")
  }

  const reachesHoldout = (id: string, active = new Set<string>()): boolean => {
    const memo = reachesHoldoutMemo.get(id)
    if (memo !== undefined) return memo
    if (active.has(id)) return false

    const parameter = byId.get(id)
    if (!parameter) return false
    active.add(id)
    const result =
      parameter.role === "holdout" ||
      parameter.fittedFrom.some((evidence) => evidence.use === "holdout") ||
      parameter.dependsOn.some((dependency) => reachesHoldout(dependency, active))
    active.delete(id)
    reachesHoldoutMemo.set(id, result)
    return result
  }

  for (const parameter of parameters) visitCycle(parameter.id, [])

  for (const parameter of parameters) {
    if (parameter.role !== "holdout" && reachesHoldout(parameter.id)) {
      diagnostics.push(
        `holdout leakage: parameter ${parameter.id} transitively depends on protected evidence`,
      )
    }
  }
}

export const compileTheory = (input: TheoryBundle): CompiledTheory => {
  const bundle = structuredClone(input)
  const diagnostics: string[] = []

  for (const [kind, ids] of [
    ["symbol", bundle.symbols.map(({ id }) => id)],
    ["parameter", bundle.parameters.map(({ id }) => id)],
    ["equation", bundle.equations.map(({ id }) => id)],
    ["constitutive law", bundle.constitutiveLaws.map(({ id }) => id)],
    ["invariant", bundle.invariants.map(({ id }) => id)],
    ["observable", bundle.observableExtractors.map(({ id }) => id)],
  ] as const) {
    for (const repeated of duplicates(ids)) {
      diagnostics.push(`duplicate ${kind} id: ${repeated}`)
    }
  }

  const symbolTable = new Map<string, SymbolShape>()
  for (const value of bundle.symbols) {
    symbolTable.set(value.id, {
      id: value.id,
      dimension: value.dimension,
      shape: value.shape,
    })
  }
  for (const value of bundle.parameters) {
    if (symbolTable.has(value.id)) {
      diagnostics.push(`id is both a symbol and parameter: ${value.id}`)
    }
    symbolTable.set(value.id, {
      id: value.id,
      dimension: value.dimension,
      shape: "scalar",
    })
  }

  for (const stateVariable of bundle.stateVariableIds) {
    const symbol = bundle.symbols.find(({ id }) => id === stateVariable)
    if (!symbol) diagnostics.push(`undefined state variable: ${stateVariable}`)
    else if (symbol.kind !== "state") {
      diagnostics.push(`state variable ${stateVariable} is classified as ${symbol.kind}`)
    }
  }

  validateParameterGraph(bundle.parameters, diagnostics)

  for (const equation of bundle.equations) {
    try {
      const left = inferExpression(equation.lhs, symbolTable)
      const right = inferExpression(equation.rhs, symbolTable)
      if (!equalDimensions(left.dimension, right.dimension)) {
        diagnostics.push(
          `equation ${equation.id} dimension mismatch: ${formatDimension(left.dimension)} versus ${formatDimension(right.dimension)}`,
        )
      }
      if (left.shape !== right.shape) {
        diagnostics.push(
          `equation ${equation.id} shape mismatch: ${left.shape} versus ${right.shape}`,
        )
      }
      if (equation.domain.trim().length === 0) {
        diagnostics.push(`equation ${equation.id} has no declared domain`)
      }
    } catch (error) {
      diagnostics.push(
        `equation ${equation.id}: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  const knownInputs = new Set(symbolTable.keys())
  for (const law of bundle.constitutiveLaws) {
    if (law.formula.trim().length === 0) {
      diagnostics.push(`constitutive law ${law.id} has no formula`)
    }
    for (const inputId of law.inputs) {
      if (!knownInputs.has(inputId)) {
        diagnostics.push(`constitutive law ${law.id} has undefined input ${inputId}`)
      }
    }
    for (const outputId of law.outputs) {
      if (!knownInputs.has(outputId)) {
        diagnostics.push(`constitutive law ${law.id} has undefined output ${outputId}`)
      }
    }
  }

  for (const observable of bundle.observableExtractors) {
    if (observable.feedsBackIntoEvolution !== false) {
      diagnostics.push(`observable ${observable.id} may not feed back into evolution`)
    }
    for (const inputId of observable.inputs) {
      if (!knownInputs.has(inputId)) {
        diagnostics.push(`observable ${observable.id} has undefined input ${inputId}`)
      }
    }
  }

  if (diagnostics.length > 0) throw new TheoryCompilationError(diagnostics)

  const immutable = deepFreeze(bundle)
  return deepFreeze({
    hash: contentHash(immutable),
    bundle: immutable,
    diagnostics: [],
  })
}

