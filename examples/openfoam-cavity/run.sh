#!/usr/bin/env bash
# Run from any directory. Every invocation preserves previous results.
set -euo pipefail
example_dir=$(cd -- "$(dirname -- "$0")" && pwd)
foam_launcher=${OPENFOAM_LAUNCHER:-"$HOME/bin/openfoam"}
if [[ ! -x "$foam_launcher" ]]; then
    echo "Set OPENFOAM_LAUNCHER to your OpenFOAM v2512 launcher." >&2
    exit 1
fi
# OpenFOAM fileName paths cannot safely contain spaces. Work in a fresh
# space-free directory, then copy the complete case back into this repository.
run_dir=$(mktemp -d /private/tmp/openfoam-hello.XXXXXX)
echo "Solving in $run_dir"
cp -R "$example_dir/case/." "$run_dir/"
cd "$run_dir"
"$foam_launcher" -c 'echo "OpenFOAM $WM_PROJECT_VERSION $WM_OPTIONS"; command -v icoFoam' > environment.txt
"$foam_launcher" blockMesh > log.blockMesh 2>&1
"$foam_launcher" checkMesh > log.checkMesh 2>&1
"$foam_launcher" icoFoam > log.icoFoam 2>&1
"$foam_launcher" postProcess -func 'grad(U)' > log.grad 2>&1
"$foam_launcher" postProcess -func vorticity > log.vorticity 2>&1
touch cavity.foam
python3 "$example_dir/verify.py" "$run_dir" | tee verification.json
mkdir -p "$example_dir/runs"
result_dir="$example_dir/runs/$(basename "$run_dir")"
cp -R "$run_dir" "$result_dir"
echo "Results: $result_dir"
echo "Open cavity.foam in ParaView, or build a ready-made view:"
echo "pvpython \"$example_dir/view.py\" \"$result_dir\""
echo "Scratch run retained at $run_dir (including logs if any step fails)."
