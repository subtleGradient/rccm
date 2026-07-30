import type { Dimension, Expression, ValueShape } from "./dimensions"

export type ParameterRole =
  | "axiom"
  | "closure"
  | "calibrated"
  | "derived"
  | "nuisance"
  | "holdout"

export type EvidenceUse = "none" | "calibration" | "holdout"

export type ProvenanceClass =
  | "rccm-source-claim"
  | "implementation-hypothesis"
  | "reference-physics"
  | "normalization"
  | "numerical-method"

export interface Provenance {
  class: ProvenanceClass
  source: string
}

export interface SymbolSpec {
  id: string
  description: string
  dimension: Dimension
  shape: ValueShape
  kind: "state" | "derived" | "flux" | "source" | "observable"
}

export interface EvidenceReference {
  evidenceId: string
  use: EvidenceUse
}

export interface ParameterSpec {
  id: string
  role: ParameterRole
  value: number
  dimension: Dimension
  dependsOn: string[]
  fittedFrom: EvidenceReference[]
  description?: string
}

export interface EquationSpec {
  id: string
  lhs: Expression
  rhs: Expression
  domain: string
  boundaryAssumptions: string[]
  provenance: Provenance
}

export interface ConstitutiveLawSpec {
  id: string
  formula: string
  inputs: string[]
  outputs: string[]
  provenance: Provenance
}

export interface InvariantSpec {
  id: string
  description: string
  dimension: Dimension
  scope: "closed-universe" | "controlled-ledger"
}

export interface ObservableExtractorSpec {
  id: string
  description: string
  inputs: string[]
  outputDimension: Dimension
  outputShape: ValueShape
  status: "candidate"
  referenceTarget: string
  feedsBackIntoEvolution: false
}

export interface TheoryBundle {
  schemaVersion: 1
  id: string
  version: string
  title: string
  status: "implementation-hypothesis"
  description: string
  normalization: {
    c: number
    rho0: number
    referenceLength: number
    siAdapterRequired: true
  }
  symbols: SymbolSpec[]
  stateVariableIds: string[]
  parameters: ParameterSpec[]
  equations: EquationSpec[]
  constitutiveLaws: ConstitutiveLawSpec[]
  invariants: InvariantSpec[]
  observableExtractors: ObservableExtractorSpec[]
  provenance: Provenance[]
}

export interface CompiledTheory {
  readonly hash: string
  readonly bundle: TheoryBundle
  readonly diagnostics: readonly string[]
}

export interface TauStateLayout {
  readonly density: "rho"
  readonly momentum: "momentumDensity"
  readonly totalEnergy: "totalEnergyDensity"
  readonly intrinsicAngularMomentum: "intrinsicAngularMomentumDensity"
  readonly elasticMemory: "conformation"
  readonly cavityPhase: "cavityPhase"
}

