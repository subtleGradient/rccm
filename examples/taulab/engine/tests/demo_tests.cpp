#include "taulab/demo.hpp"

#include <cmath>
#include <cstdlib>
#include <iostream>
#include <string>

namespace {

int failures = 0;

void check(bool condition, const std::string& message) {
  if (!condition) {
    std::cerr << "FAIL: " << message << '\n';
    ++failures;
  }
}

const taulab::DemoReport& demo_report() {
  static const taulab::DemoReport report = taulab::run_demo_experiments();
  return report;
}

void test_live_acoustic_measurement() {
  const auto& report = demo_report();
  const auto& wave = report.acoustic;

  check(wave.cells >= 64, "demo wave must use a meaningful resolved grid");
  check(wave.expected_speed > 0.0, "expected wave speed must be physical");
  check(wave.measured_speed > 0.0, "wave speed must be measured from output");
  check(wave.relative_speed_error < 0.01,
        "measured wave speed must agree within one percent");
  check(wave.mass_residual < 1.0e-10,
        "demo must expose near-machine-precision mass conservation");
  check(wave.momentum_residual < 1.0e-10,
        "demo must expose near-machine-precision momentum conservation");
  check(wave.energy_residual < 1.0e-10,
        "demo must expose near-machine-precision energy conservation");
  check(wave.initial_density != wave.final_density,
        "the displayed field must come from actual evolution");
  check(wave.passed, "acoustic gate must pass");
}

void test_refinement_and_replay_gates() {
  const auto& report = demo_report();

  check(report.refinement.samples.size() == 3,
        "demo must report three grid resolutions");
  check(report.refinement.samples[1].l2_error <
            report.refinement.samples[0].l2_error,
        "first refinement must reduce numerical error");
  check(report.refinement.samples[2].l2_error <
            report.refinement.samples[1].l2_error,
        "second refinement must reduce numerical error");
  check(report.refinement.coarse_order > 1.5,
        "coarse refinement must show approaching second-order behavior");
  check(report.refinement.fine_order > 1.5,
        "fine refinement must show approaching second-order behavior");
  check(report.refinement.passed, "refinement gate must pass");

  check(report.replay.exact_replay,
        "identical universe branches must replay bit-for-bit");
  check(report.replay.first_digest == report.replay.replay_digest,
        "exact replay must expose identical state identities");
  check(report.replay.branch_diverged,
        "a ledgered intervention must create a distinct branch");
  check(report.replay.first_digest != report.replay.branch_digest,
        "intervened branch must expose a distinct state identity");
  check(report.replay.intervention_energy > 0.0,
        "branch must report its exogenous energy debt");
  check(report.replay.passed, "replay gate must pass");
}

void test_metal_oracle_boundary() {
  const auto& report = demo_report();
  if (!report.metal.available) return;

  check(!report.metal.device_name.empty(),
        "visible Metal device must identify itself");
  check(report.metal.unified_memory,
        "Apple Metal demo path must report unified memory");
  check(report.metal.deterministic,
        "identical Metal dispatches must replay bit-for-bit");
  check(report.metal.maximum_oracle_error <= report.metal.tolerance,
        "Metal result must remain inside the CPU-oracle tolerance");
  check(report.metal.passed, "available Metal gate must pass");
}

void test_reader_facing_claim_boundary() {
  const auto& report = demo_report();
  const std::string rendered = taulab::render_demo_report(report, false);

  check(rendered.contains("Create a universe"),
        "report needs an immediate, legible hook");
  check(rendered.contains(report.theory_hash),
        "report must show the immutable theory identity");
  check(rendered.contains("MEASURE THE WAVE"),
        "report must orient the reader around measurement");
  check(rendered.contains("SHARPEN THE MICROSCOPE"),
        "report must make convergence spatially legible");
  check(rendered.contains("BRANCH TIME"),
        "report must expose deterministic time control");
  check(rendered.contains("What this run demonstrates"),
        "report must state its bounded positive result");
  check(rendered.contains("What this run does NOT demonstrate"),
        "report must preserve the scientific claim boundary");
  check(rendered.contains("particles") && rendered.contains("gravity") &&
            rendered.contains("quantum"),
        "report must name the major unproven RCCM frontiers");
  check(report.theory_hash == taulab::kRccmV0TheoryHash,
        "report must be locked to the compiled RCCM-v0 identity");
  check(report.passed(), "complete demo certification must pass");
}

}  // namespace

int main() {
  test_live_acoustic_measurement();
  test_refinement_and_replay_gates();
  test_metal_oracle_boundary();
  test_reader_facing_claim_boundary();

  if (failures == 0) {
    std::cout << "All TauLab executable-demo tests passed\n";
    return EXIT_SUCCESS;
  }
  std::cerr << failures << " TauLab executable-demo test(s) failed\n";
  return EXIT_FAILURE;
}
