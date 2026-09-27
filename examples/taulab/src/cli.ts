import { mkdir, writeFile } from "node:fs/promises"
import { resolve } from "node:path"
import { compileTheory } from "./compiler"
import { rccmV0 } from "./theory/rccm-v0"

const command = process.argv[2] ?? "validate"
const compiled = compileTheory(rccmV0)

if (command === "validate") {
  console.log(
    JSON.stringify(
      {
        valid: true,
        theory: compiled.bundle.id,
        version: compiled.bundle.version,
        hash: compiled.hash,
        stateVariables: compiled.bundle.stateVariableIds.length,
        equations: compiled.bundle.equations.length,
        constitutiveLaws: compiled.bundle.constitutiveLaws.length,
        observables: compiled.bundle.observableExtractors.length,
      },
      null,
      2,
    ),
  )
} else if (command === "compile") {
  const outputDirectory = resolve(import.meta.dir, "../dist")
  await mkdir(outputDirectory, { recursive: true })
  const outputPath = resolve(
    outputDirectory,
    `${compiled.bundle.id}-${compiled.hash}.json`,
  )
  await writeFile(
    outputPath,
    `${JSON.stringify({ hash: compiled.hash, bundle: compiled.bundle }, null, 2)}\n`,
  )
  console.log(outputPath)
} else {
  console.error(`Unknown command: ${command}`)
  console.error("Usage: bun run src/cli.ts [validate|compile]")
  process.exitCode = 2
}

