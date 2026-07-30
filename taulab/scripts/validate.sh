#!/usr/bin/env bash

set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
taulab_root="$(cd "${script_dir}/.." && pwd)"
cd "${taulab_root}"

echo "== Formal theory gates =="
bun test
bun run typecheck
bun run theory:validate

echo "== CPU and Metal build =="
cmake -S engine -B build/engine -DCMAKE_BUILD_TYPE=RelWithDebInfo
cmake --build build/engine --parallel

echo "== CPU oracle gates =="
ctest --test-dir build/engine --output-on-failure -R taulab_solver_tests

echo "== Metal parity gate =="
metal_status=0
./build/engine/taulab_metal_tests || metal_status=$?
if [[ ${metal_status} -eq 77 ]]; then
  echo "Metal device is hidden from this process; GPU certification was not run."
  if [[ "${TAULAB_REQUIRE_METAL:-0}" == "1" ]]; then
    exit 77
  fi
elif [[ ${metal_status} -ne 0 ]]; then
  exit "${metal_status}"
fi

echo "== Deterministic research-engine smoke =="
./build/engine/taulab-cli \
  --scenario entropy-wave \
  --grid 32 \
  --steps 40 \
  --dt 0.0005

echo "TauLab foundation validation completed."
