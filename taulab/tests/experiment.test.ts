import { describe, expect, test } from "bun:test"
import {
  branchCheckpoint,
  certifyTrajectory,
  createCheckpoint,
  validateExperiment,
  type ExperimentManifest,
} from "../src/experiment"

const baseManifest = (): ExperimentManifest => ({
  schemaVersion: 1,
  id: "experiment",
  theoryHash: "a".repeat(64),
  mode: "closed-universe",
  evidenceUse: "calibration",
  frozenBeforeHoldout: true,
  initialCondition: { kind: "uniform", stateDigest: "initial" },
  boundaries: [{ axis: "all", kind: "periodic" }],
  declaredInterventionIds: [],
  interventions: [],
  solver: {
    backend: "cpu-reference",
    solverHash: "b".repeat(64),
    grid: [16, 16, 16],
    spacing: 0.0625,
    timestep: 0.001,
    steps: 10,
    precision: "float64",
  },
  seed: 42,
})

describe("experiment causation boundary", () => {
  test("closed-universe mode rejects post-initialization intervention", () => {
    const manifest = baseManifest()
    manifest.interventions.push({
      id: "god-push",
      atTime: 0.1,
      kind: "state-edit",
      disposition: "unconstrained",
      delta: {
        mass: 0,
        momentum: [1, 0, 0],
        energy: 1,
        angularMomentum: [0, 0, 0],
        topology: 0,
        boundaryWork: 0,
      },
      provenance: "operator",
    })

    expect(validateExperiment(manifest).valid).toBe(false)
    expect(validateExperiment(manifest).errors.join(" ")).toMatch(/closed-universe/i)
  })

  test("controlled mode accepts only declared, valid or projected interventions", () => {
    const manifest = baseManifest()
    manifest.mode = "controlled-experiment"
    manifest.declaredInterventionIds = ["pulse"]
    manifest.interventions = [{
      id: "pulse",
      atTime: 0.1,
      kind: "source",
      disposition: "projected",
      delta: {
        mass: 0,
        momentum: [0, 0, 0],
        energy: 1,
        angularMomentum: [0, 0, 0],
        topology: 0,
        boundaryWork: 1,
      },
      provenance: "manifest",
    }]

    expect(validateExperiment(manifest)).toMatchObject({
      valid: true,
      interventionDependent: true,
    })

    manifest.interventions[0]!.id = "undeclared"
    expect(validateExperiment(manifest).valid).toBe(false)
  })

  test("sandbox accepts unconstrained edits but marks the result intervention-dependent", () => {
    const manifest = baseManifest()
    manifest.mode = "god-sandbox"
    manifest.interventions = [{
      id: "rewrite",
      atTime: 0.5,
      kind: "state-edit",
      disposition: "unconstrained",
      delta: {
        mass: 100,
        momentum: [0, 0, 0],
        energy: 0,
        angularMomentum: [0, 0, 0],
        topology: 1,
        boundaryWork: 0,
      },
      provenance: "operator",
    }]

    expect(validateExperiment(manifest)).toMatchObject({
      valid: true,
      interventionDependent: true,
    })
  })
})

describe("checkpoint DAG and scientific authority", () => {
  test("checkpoint identity is deterministic and branches preserve lineage", () => {
    const input = {
      schemaVersion: 1 as const,
      parentId: null,
      theoryHash: "a".repeat(64),
      solverHash: "b".repeat(64),
      time: 1,
      step: 100,
      timestep: 0.01,
      seed: 42,
      stateDigest: "c".repeat(64),
      branchReason: "root",
    }
    const first = createCheckpoint(input)
    const second = createCheckpoint(input)
    const branch = branchCheckpoint(first, {
      branchReason: "altered boundary",
      stateDigest: "d".repeat(64),
    })

    expect(first.id).toBe(second.id)
    expect(branch.parentId).toBe(first.id)
    expect(branch.id).not.toBe(first.id)
    expect(branch.time).toBe(first.time)
  })

  test("surrogate use requires exact verification or replay", () => {
    const rejected = certifyTrajectory({
      experimentMode: "controlled-experiment",
      evidenceUse: "holdout",
      frozenBeforeHoldout: true,
      backend: "cpu-reference",
      converged: true,
      cpuParityVerified: true,
      invariantResiduals: { mass: 1e-12, energy: 1e-10 },
      invariantTolerances: { mass: 1e-9, energy: 1e-8 },
      surrogate: {
        used: true,
        withinDomain: true,
        exactResidualVerified: false,
        exactReplayCompleted: false,
      },
    })

    expect(rejected.accepted).toBe(false)
    expect(rejected.reasons.join(" ")).toMatch(/surrogate/i)

    const accepted = certifyTrajectory({
      ...rejected.input,
      surrogate: {
        ...rejected.input.surrogate,
        exactReplayCompleted: true,
      },
    })
    expect(accepted.accepted).toBe(true)
    expect(accepted.authority).toBe("reference-verified")
  })

  test("god-sandbox trajectories cannot receive scientific acceptance", () => {
    const result = certifyTrajectory({
      experimentMode: "god-sandbox",
      evidenceUse: "calibration",
      frozenBeforeHoldout: true,
      backend: "cpu-reference",
      converged: true,
      cpuParityVerified: true,
      invariantResiduals: { mass: 0 },
      invariantTolerances: { mass: 1e-9 },
      surrogate: {
        used: false,
        withinDomain: true,
        exactResidualVerified: true,
        exactReplayCompleted: true,
      },
    })

    expect(result.accepted).toBe(false)
    expect(result.interventionDependent).toBe(true)
  })
})

