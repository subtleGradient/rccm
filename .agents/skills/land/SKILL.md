---
name: land
description: >-
  Lands completed RCCM repository changes onto the local remote's main branch
  by rebasing, running applicable verification, pushing, and verifying the
  destination. Invoke only when the user has explicitly requested landing,
  such as choosing Land Changes or calling /land—not for review, preparation,
  passing checks, or skill installation alone.
metadata:
  delta-action: land
---

# Land RCCM changes

## Intent and destination

An invocation of this skill is already an explicit request to land the current
thread's changes. Do not ask for merge permission again.

Land only to `main` on the Git remote named `local`. Do not push to `origin`,
open a pull request, publish a Bend package, or modify branch protection.

The repository requires small focused commits (`AGENTS.md`, “Git Commit
Cadence”). Preserve that history through a rebase rather than squashing it.

Resolve clear conflicts automatically. Preserve both the thread's intended
change and compatible destination updates. Stop when intent is ambiguous,
resolution would discard unrelated work, or a required check fails.

## 1. Establish the landing scope

1. Read the applicable `AGENTS.md` files at `HEAD` and at the current
   destination before altering history. After fetching, read any newly
   introduced instructions that apply to changed paths.
2. Inspect:

   ```sh
   git --no-optional-locks status --short --branch
   git remote -v
   git log --format='%h %s' --decorate -12
   ```

3. Identify the commits and uncommitted files produced for the current thread.
   Keep unrelated user state out of the landing commits. In particular, never
   stage an absent or locally dirty `Refractive_Cosmology` gitlink unless this
   thread deliberately changed that submodule. Any deliberate submodule source
   change must already be committed and pushed inside the submodule before the
   parent gitlink is committed (`AGENTS.md`, “Redistribution or modification”).
4. If intended files are uncommitted, review their diff, run
   `git diff --check`, stage only those explicit paths, and create focused
   non-interactive commits. Do not stage with `git add .` or `git add -A`.
   Do not amend or rewrite user-authored commits merely for style.
5. Stop if the intended scope cannot be separated safely from unrelated work.

## 2. Fetch and rebase onto local main

Fetch the exact destination into a private integration ref so verification and
comparison do not depend on a pre-existing `local/main` tracking ref:

```sh
git fetch local refs/heads/main:refs/remotes/local-land/main
destination_before="$(git rev-parse refs/remotes/local-land/main)"
git rebase refs/remotes/local-land/main
```

If the rebase conflicts:

- resolve clear conflicts automatically;
- stage only the resolved files and continue non-interactively with
  `GIT_EDITOR=true git rebase --continue`;
- reread an `AGENTS.md` file if the destination introduced or changed it;
- abort with `git rebase --abort` and report the blocker when intent is
  ambiguous or preserving unrelated work is uncertain.

Never force-push. Never use `--ours` or `--theirs` across a conflict set
without inspecting each intended result.

## 3. Verify the rebased change

Required for every landing:

```sh
git diff --check refs/remotes/local-land/main..HEAD
git status --short
```

The status may show unrelated pre-existing state, but no unresolved conflict or
uncommitted intended landing change may remain.

Select additional checks from the rebased changed paths. Run every applicable
check below; do not substitute an earlier pre-rebase result.

### Bend changes

When any file under `bend/` changed:

1. Read the installed language guide, as required by `bend/AGENTS.md`:

   ```sh
   BEND_NO_TELEMETRY=1 bend guide
   ```

2. Run each changed package's `PROOF.bend`. For the asymmetric tensor package:

   ```sh
   BEND_NO_TELEMETRY=1 bend bend/asymmetric-metric-tensor/PROOF.bend
   ```

   `bend/AGENTS.md` requires `bend PROOF.bend` before committing; the concrete
   package entrypoint above is `bend/asymmetric-metric-tensor/PROOF.bend`,
   which imports its actual `LAWS.bend`.

3. Run relevant executable regressions and examples. For the current Bend
   pressure/tensor course:

   ```sh
   BEND_NO_TELEMETRY=1 bend bend/tests.bend
   BEND_NO_TELEMETRY=1 bend bend/asymmetric-metric-tensor/lessons/01-slots.bend
   BEND_NO_TELEMETRY=1 bend bend/asymmetric-metric-tensor/lessons/01-noop.bend
   ```

   These are executable entrypoints defined respectively by
   `bend/tests.bend`, `bend/asymmetric-metric-tensor/lessons/01-slots.bend`,
   and `bend/asymmetric-metric-tensor/lessons/01-noop.bend`.

4. If a changed lesson documents an expected-failure fixture, run it separately
   and require both a nonzero exit and the documented diagnostic. For lesson 1,
   `bend/asymmetric-metric-tensor/lessons/counterexamples/01-noop-row.bend`
   documents an expected `T{}` versus `X{}` equality mismatch. A parse, import,
   timeout, or unrelated failure does not satisfy this check.

### TauLab changes

When files under `taulab/`, its build definitions, or the root `Makefile`
changed, run:

```sh
cd taulab && bun run validate
```

This exact command is defined by `taulab/package.json` (`scripts.validate`),
which calls `taulab/scripts/validate.sh`. That script runs Bun tests,
TypeScript checking, theory validation, CMake build, CPU tests, the Metal
parity gate when available, and a deterministic smoke run. Respect its exit
status, including a required-Metal exit when the environment requests it.

### Canonical TeX changes

When `RCCM-Condensed.tex` or `RCCM-GfX-2.tex` changed, regenerate only its
paired HTML with the command documented in root `README.md`, “Formal Sources
and Executable Reading Route”:

```sh
nix shell nixpkgs#pandoc --command node convert-rccm.mjs RCCM-Condensed.tex RCCM-Condensed.html
nix shell nixpkgs#pandoc --command node convert-rccm.mjs RCCM-GfX-2.tex RCCM-GfX-2.html
```

Run only the command for each changed TeX file. Require the generated HTML to
be included in the landing scope and keep its canonical-source notice intact.
`convert-rccm.mjs` accepts the input and output paths used above.

### Other changes

For paths not covered above, inspect their actual build/test definitions and
run the narrowest check that exercises the changed behavior. Do not invent a
command from prose alone. If no executable check exists, review the rendered
or source diff and state that limitation in the final result.

There are currently no GitHub Actions workflows, required status checks,
branch protection, mandatory reviews, signing policy, CLA, or DCO gate.
Do not fabricate remote CI. If those destination settings change, honor the
new requirements and require all applicable checks for the exact rebased
commit to pass before pushing.

## 4. Push and verify the destination

Immediately before pushing, ensure the destination has not moved:

```sh
current_local_main="$(git ls-remote local refs/heads/main | awk '{print $1}')"
test "$current_local_main" = "$destination_before"
```

If it moved, fetch it, rebase again, and rerun all applicable verification.

Push without force:

```sh
git push local HEAD:main
```

If the local remote refuses an update to its checked-out branch or any other
push error occurs, stop and report that the change was not landed. Do not
silently replace the requested push with direct ref or worktree mutation.

Verify success against the actual remote:

```sh
landed="$(git rev-parse HEAD)"
remote_main="$(git ls-remote local refs/heads/main | awk '{print $1}')"
test "$remote_main" = "$landed"
```

Also inspect the primary checkout status read-only when its path is available.
Do not delete, stage, or overwrite unrelated primary-checkout files.

## 5. Report the outcome

Success means the requested commit is verified at `local` `main`, not merely
rebased, committed, or passing tests.

When running in a subthread and `report_subthread_status` is available:

- on verified success, report `status: success`, title `Landed on local main`,
  and a one-line description with the short commit SHA and the checks that
  passed;
- on a blocker or failed attempt, report `status: failure`, a short
  sentence-case title, and one line explaining why it was not landed.

The `local` remote has no verified web commit or CI URLs, so do not invent
links. If a safe recovery later succeeds, report the updated successful
outcome. Otherwise report directly in the current conversation with the same
facts.
