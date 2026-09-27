import { contentHash } from "./compiler"

export type ExecutionMode =
  | "closed-universe"
  | "controlled-experiment"
  | "god-sandbox"

export type ExperimentEvidenceUse = "calibration" | "holdout" | "exploration"

export interface ConservationDelta {
  mass: number
  momentum: readonly [number, number, number]
  energy: number
  angularMomentum: readonly [number, number, number]
  topology: number
  boundaryWork: number
}

export interface Intervention {
  id: string
  atTime: number
  kind: "source" | "boundary-change" | "state-edit" | "parameter-branch"
  disposition: "valid" | "projected" | "unconstrained"
  delta: ConservationDelta
  provenance: string
}

export interface ExperimentManifest {
  schemaVersion: 1
  id: string
  theoryHash: string
  mode: ExecutionMode
  evidenceUse: ExperimentEvidenceUse
  frozenBeforeHoldout: boolean
  initialCondition: {
    kind: string
    stateDigest: string
  }
  boundaries: Array<{
    axis: "x" | "y" | "z" | "all"
    kind: "periodic" | "reflecting" | "driven" | "absorbing"
  }>
  declaredInterventionIds: string[]
  interventions: Intervention[]
  solver: {
    backend: "cpu-reference" | "metal"
    solverHash: string
    grid: readonly [number, number, number]
    spacing: number
    timestep: number
    steps: number
    precision: "float64" | "float32"
  }
  seed: number
}

export interface ExperimentValidation {
  valid: boolean
  errors: string[]
  interventionDependent: boolean
}

const allFinite = (delta: ConservationDelta): boolean =>
  [
    delta.mass,
    ...delta.momentum,
    delta.energy,
    ...delta.angularMomentum,
    delta.topology,
    delta.boundaryWork,
  ].every(Number.isFinite)

export const validateExperiment = (
  manifest: ExperimentManifest,
): ExperimentValidation => {
  const errors: string[] = []
  const declared = new Set(manifest.declaredInterventionIds)

  if (!/^[a-f0-9]{64}$/.test(manifest.theoryHash)) {
    errors.push("theoryHash must be a 64-character lowercase SHA-256 digest")
  }
  if (!/^[a-f0-9]{64}$/.test(manifest.solver.solverHash)) {
    errors.push("solverHash must be a 64-character lowercase SHA-256 digest")
  }
  if (
    manifest.solver.spacing <= 0 ||
    manifest.solver.timestep <= 0 ||
    manifest.solver.steps < 0 ||
    manifest.solver.grid.some((size) => !Number.isInteger(size) || size <= 0)
  ) {
    errors.push("solver grid, spacing, timestep, and steps must be positive")
  }
  if (manifest.evidenceUse === "holdout" && !manifest.frozenBeforeHoldout) {
    errors.push("holdout experiment requires a theory frozen before holdout reveal")
  }

  for (const intervention of manifest.interventions) {
    if (!Number.isFinite(intervention.atTime) || intervention.atTime < 0) {
      errors.push(`intervention ${intervention.id} has invalid time`)
    }
    if (!allFinite(intervention.delta)) {
      errors.push(`intervention ${intervention.id} has a non-finite conservation delta`)
    }

    if (manifest.mode === "closed-universe" && intervention.atTime > 0) {
      errors.push(
        `closed-universe mode rejects post-initialization intervention ${intervention.id}`,
      )
    }
    if (manifest.mode === "controlled-experiment") {
      if (!declared.has(intervention.id)) {
        errors.push(`controlled-experiment intervention ${intervention.id} is undeclared`)
      }
      if (intervention.disposition === "unconstrained") {
        errors.push(
          `controlled-experiment intervention ${intervention.id} must be valid or projected`,
        )
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    interventionDependent: manifest.interventions.length > 0,
  }
}

export interface CheckpointInput {
  schemaVersion: 1
  parentId: string | null
  theoryHash: string
  solverHash: string
  time: number
  step: number
  timestep: number
  seed: number
  stateDigest: string
  branchReason: string
}

export interface Checkpoint extends CheckpointInput {
  id: string
}

export const createCheckpoint = (input: CheckpointInput): Checkpoint => ({
  ...input,
  id: contentHash(input),
})

export const branchCheckpoint = (
  parent: Checkpoint,
  changes: Partial<Omit<CheckpointInput, "schemaVersion" | "parentId">> & {
    branchReason: string
  },
): Checkpoint =>
  createCheckpoint({
    schemaVersion: 1,
    parentId: parent.id,
    theoryHash: changes.theoryHash ?? parent.theoryHash,
    solverHash: changes.solverHash ?? parent.solverHash,
    time: changes.time ?? parent.time,
    step: changes.step ?? parent.step,
    timestep: changes.timestep ?? parent.timestep,
    seed: changes.seed ?? parent.seed,
    stateDigest: changes.stateDigest ?? parent.stateDigest,
    branchReason: changes.branchReason,
  })

export interface CertificationInput {
  experimentMode: ExecutionMode
  evidenceUse: ExperimentEvidenceUse
  frozenBeforeHoldout: boolean
  backend: "cpu-reference" | "metal"
  converged: boolean
  cpuParityVerified: boolean
  invariantResiduals: Record<string, number>
  invariantTolerances: Record<string, number>
  surrogate: {
    used: boolean
    withinDomain: boolean
    exactResidualVerified: boolean
    exactReplayCompleted: boolean
  }
}

export interface TrajectoryCertification {
  accepted: boolean
  authority: "reference-verified" | "rejected"
  interventionDependent: boolean
  reasons: string[]
  input: CertificationInput
}

export const certifyTrajectory = (
  input: CertificationInput,
): TrajectoryCertification => {
  const reasons: string[] = []
  const interventionDependent = input.experimentMode === "god-sandbox"

  if (interventionDependent) {
    reasons.push("god-sandbox trajectories are intervention-dependent")
  }
  if (!input.converged) reasons.push("trajectory lacks numerical convergence")
  if (input.backend === "metal" && !input.cpuParityVerified) {
    reasons.push("Metal trajectory lacks CPU parity verification")
  }
  if (input.evidenceUse === "holdout" && !input.frozenBeforeHoldout) {
    reasons.push("theory was not frozen before holdout reveal")
  }

  for (const [invariant, residual] of Object.entries(input.invariantResiduals)) {
    const tolerance = input.invariantTolerances[invariant]
    if (tolerance === undefined) {
      reasons.push(`invariant ${invariant} has no declared tolerance`)
    } else if (!Number.isFinite(residual) || Math.abs(residual) > tolerance) {
      reasons.push(
        `invariant ${invariant} residual ${residual} exceeds tolerance ${tolerance}`,
      )
    }
  }

  if (input.surrogate.used) {
    if (!input.surrogate.withinDomain) {
      reasons.push("surrogate operated outside its validated domain")
    }
    if (
      !input.surrogate.exactResidualVerified &&
      !input.surrogate.exactReplayCompleted
    ) {
      reasons.push("surrogate result lacks exact residual verification or replay")
    }
  }

  const accepted = reasons.length === 0
  return {
    accepted,
    authority: accepted ? "reference-verified" : "rejected",
    interventionDependent,
    reasons,
    input,
  }
}

