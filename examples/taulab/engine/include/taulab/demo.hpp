#pragma once

#include <cstddef>
#include <string>
#include <vector>

namespace taulab {

inline constexpr const char* kRccmV0TheoryHash =
    "0159d804fc8b186e3707f1264a56f56abffa395ebc8ae0bcfacf7858d432f503";

struct AcousticMeasurement {
  std::size_t cells{};
  double expected_speed{};
  double measured_speed{};
  double relative_speed_error{};
  double l2_error{};
  double mass_residual{};
  double momentum_residual{};
  double energy_residual{};
  std::vector<double> initial_density;
  std::vector<double> final_density;
  bool passed{};
};

struct RefinementSample {
  std::size_t cells{};
  double l2_error{};
};

struct RefinementMeasurement {
  std::vector<RefinementSample> samples;
  double coarse_order{};
  double fine_order{};
  bool passed{};
};

struct ReplayMeasurement {
  std::string first_digest;
  std::string replay_digest;
  std::string branch_digest;
  double intervention_energy{};
  bool exact_replay{};
  bool branch_diverged{};
  bool passed{};
};

struct MetalMeasurement {
  bool available{};
  bool passed{};
  bool deterministic{};
  std::string device_name;
  bool unified_memory{};
  bool supports_apple7{};
  std::size_t cells{};
  double maximum_oracle_error{};
  double tolerance{};
};

struct DemoReport {
  std::string theory_hash;
  AcousticMeasurement acoustic;
  RefinementMeasurement refinement;
  ReplayMeasurement replay;
  MetalMeasurement metal;

  [[nodiscard]] bool passed() const noexcept;
};

[[nodiscard]] DemoReport run_demo_experiments();
[[nodiscard]] std::string render_demo_report(const DemoReport& report,
                                             bool use_color);

}  // namespace taulab

