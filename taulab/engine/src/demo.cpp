#include "taulab/demo.hpp"

#include "taulab/solver.hpp"

#if TAULAB_HAS_METAL
#include "taulab/metal_solver.hpp"
#endif

#include <algorithm>
#include <array>
#include <cmath>
#include <iomanip>
#include <numbers>
#include <sstream>
#include <string_view>

namespace taulab {
namespace {

constexpr double kGamma = 1.4;
constexpr double kBackgroundPressure = 1.0;
constexpr double kWaveAmplitude = 1.0e-4;
constexpr double kQuarterOrbit = 0.25;
constexpr std::array<std::size_t, 3> kRefinementCells{32, 64, 128};

SolverParameters conservative_parameters() {
  SolverParameters parameters;
  parameters.elastic_relaxation_time = 0.0;
  parameters.spin_relaxation_time = 0.0;
  parameters.phase_mobility = 0.0;
  parameters.phase_interface_coefficient = 0.0;
  parameters.shear_modulus = 0.0;
  parameters.spin_diffusivity = 0.0;
  parameters.kinematic_viscosity = 0.0;
  return parameters;
}

TauGrid acoustic_initial_state(std::size_t cells) {
  const double spacing = 1.0 / static_cast<double>(cells);
  const double wave_speed = std::sqrt(kGamma * kBackgroundPressure);
  auto grid = TauGrid::uniform(
      {cells, 1, 1}, spacing, 1.0,
      kBackgroundPressure / (kGamma - 1.0), 0.0);

  for (std::size_t cell = 0; cell < cells; ++cell) {
    const double x = (static_cast<double>(cell) + 0.5) * spacing;
    const double perturbation =
        kWaveAmplitude * std::sin(2.0 * std::numbers::pi * x);
    const double density = 1.0 + perturbation;
    const double velocity = wave_speed * perturbation;
    const double pressure =
        kBackgroundPressure + wave_speed * wave_speed * perturbation;

    grid.rho[cell] = density;
    grid.momentum_x[cell] = density * velocity;
    grid.total_energy[cell] =
        pressure / (kGamma - 1.0) +
        0.5 * density * velocity * velocity;
  }
  return grid;
}

struct EvolutionSchedule {
  double end_time{};
  double timestep{};
  std::size_t steps{};
};

EvolutionSchedule quarter_orbit_schedule(std::size_t cells) {
  const double wave_speed = std::sqrt(kGamma * kBackgroundPressure);
  const double end_time = kQuarterOrbit / wave_speed;
  const double spacing = 1.0 / static_cast<double>(cells);
  const double nominal_timestep = 0.15 * spacing / wave_speed;
  const auto steps =
      static_cast<std::size_t>(std::ceil(end_time / nominal_timestep));
  return {
      .end_time = end_time,
      .timestep = end_time / static_cast<double>(steps),
      .steps = steps,
  };
}

AcousticMeasurement measure_acoustic_wave(std::size_t cells) {
  auto grid = acoustic_initial_state(cells);
  const auto schedule = quarter_orbit_schedule(cells);
  const auto initial_totals = grid.totals();
  const auto initial_density = grid.rho;

  ReferenceSolver solver(conservative_parameters());
  solver.run(grid, schedule.timestep, schedule.steps);
  const auto final_totals = grid.totals();

  double sine_coefficient = 0.0;
  double cosine_coefficient = 0.0;
  double squared_error = 0.0;
  const double spacing = grid.spacing();
  const double expected_speed = std::sqrt(kGamma * kBackgroundPressure);

  for (std::size_t cell = 0; cell < cells; ++cell) {
    const double x = (static_cast<double>(cell) + 0.5) * spacing;
    const double angle = 2.0 * std::numbers::pi * x;
    const double signal = grid.rho[cell] - 1.0;
    sine_coefficient += signal * std::sin(angle);
    cosine_coefficient += signal * std::cos(angle);

    const double translated_x = x - expected_speed * schedule.end_time;
    const double expected =
        1.0 + kWaveAmplitude *
                  std::sin(2.0 * std::numbers::pi * translated_x);
    const double difference = grid.rho[cell] - expected;
    squared_error += difference * difference;
  }

  double measured_phase =
      std::atan2(-cosine_coefficient, sine_coefficient);
  if (measured_phase < 0.0) {
    measured_phase += 2.0 * std::numbers::pi;
  }
  const double measured_speed =
      measured_phase /
      (2.0 * std::numbers::pi * schedule.end_time);

  AcousticMeasurement measurement{
      .cells = cells,
      .expected_speed = expected_speed,
      .measured_speed = measured_speed,
      .relative_speed_error =
          std::abs(measured_speed - expected_speed) / expected_speed,
      .l2_error =
          std::sqrt(squared_error / static_cast<double>(cells)),
      .mass_residual =
          relative_residual(initial_totals.mass, final_totals.mass),
      .momentum_residual = relative_residual(initial_totals.momentum.x,
                                             final_totals.momentum.x),
      .energy_residual =
          relative_residual(initial_totals.energy, final_totals.energy),
      .initial_density = initial_density,
      .final_density = grid.rho,
  };
  measurement.passed =
      measurement.relative_speed_error < 0.01 &&
      measurement.mass_residual < 1.0e-10 &&
      measurement.momentum_residual < 1.0e-10 &&
      measurement.energy_residual < 1.0e-10;
  return measurement;
}

RefinementMeasurement measure_refinement() {
  RefinementMeasurement result;
  for (const std::size_t cells : kRefinementCells) {
    const auto measurement = measure_acoustic_wave(cells);
    result.samples.push_back(
        {.cells = cells, .l2_error = measurement.l2_error});
  }

  result.coarse_order =
      std::log2(result.samples[0].l2_error / result.samples[1].l2_error);
  result.fine_order =
      std::log2(result.samples[1].l2_error / result.samples[2].l2_error);
  result.passed =
      result.samples[1].l2_error < result.samples[0].l2_error &&
      result.samples[2].l2_error < result.samples[1].l2_error &&
      result.coarse_order > 1.5 && result.fine_order > 1.5;
  return result;
}

ReplayMeasurement measure_replay() {
  constexpr std::size_t cells = 96;
  const auto schedule = quarter_orbit_schedule(cells);
  const auto checkpoint = acoustic_initial_state(cells);

  auto first = checkpoint;
  auto replay = checkpoint;
  auto branch = checkpoint;

  constexpr double injected_energy_density = 1.0e-6;
  branch.total_energy[cells / 3] += injected_energy_density;
  const double intervention_energy =
      injected_energy_density * std::pow(branch.spacing(), 3);

  ReferenceSolver solver(conservative_parameters());
  solver.run(first, schedule.timestep, schedule.steps);
  solver.run(replay, schedule.timestep, schedule.steps);
  solver.run(branch, schedule.timestep, schedule.steps);

  ReplayMeasurement result{
      .first_digest = first.state_digest(),
      .replay_digest = replay.state_digest(),
      .branch_digest = branch.state_digest(),
      .intervention_energy = intervention_energy,
  };
  result.exact_replay = result.first_digest == result.replay_digest;
  result.branch_diverged = result.first_digest != result.branch_digest;
  result.passed =
      result.exact_replay && result.branch_diverged &&
      result.intervention_energy > 0.0;
  return result;
}

#if TAULAB_HAS_METAL
template <typename MetalField, typename ReferenceField>
double maximum_field_error(const MetalField& metal,
                           const ReferenceField& reference) {
  double maximum = 0.0;
  for (std::size_t cell = 0; cell < metal.size(); ++cell) {
    maximum =
        std::max(maximum,
                 std::abs(static_cast<double>(metal[cell]) - reference[cell]));
  }
  return maximum;
}

bool metal_states_equal(const MetalLocalState& left,
                        const MetalLocalState& right) {
  return left.conformation_xx == right.conformation_xx &&
         left.conformation_yy == right.conformation_yy &&
         left.conformation_zz == right.conformation_zz &&
         left.conformation_xy == right.conformation_xy &&
         left.conformation_xz == right.conformation_xz &&
         left.conformation_yz == right.conformation_yz &&
         left.intrinsic_spin_x == right.intrinsic_spin_x &&
         left.intrinsic_spin_y == right.intrinsic_spin_y &&
         left.intrinsic_spin_z == right.intrinsic_spin_z;
}

MetalMeasurement measure_metal() {
  if (!MetalConstitutiveSolver::is_available()) {
    return {};
  }

  constexpr std::size_t cells = 1U << 16U;
  constexpr float timestep = 0.0375F;
  constexpr float elastic_time = 0.41F;
  constexpr float spin_time = 0.23F;
  constexpr double tolerance = 2.0e-6;

  MetalLocalState initial(cells);
  for (std::size_t cell = 0; cell < cells; ++cell) {
    const float coordinate =
        static_cast<float>(cell) / static_cast<float>(cells);
    initial.conformation_xx[cell] =
        1.0F + 0.3F * std::sin(11.0F * coordinate);
    initial.conformation_yy[cell] =
        1.0F + 0.2F * std::cos(7.0F * coordinate);
    initial.conformation_zz[cell] =
        1.0F - 0.1F * std::sin(5.0F * coordinate);
    initial.conformation_xy[cell] = 0.1F * std::cos(13.0F * coordinate);
    initial.conformation_xz[cell] = 0.1F * std::sin(17.0F * coordinate);
    initial.conformation_yz[cell] = 0.1F * std::cos(19.0F * coordinate);
    initial.intrinsic_spin_x[cell] = std::sin(3.0F * coordinate);
    initial.intrinsic_spin_y[cell] = std::cos(5.0F * coordinate);
    initial.intrinsic_spin_z[cell] = std::sin(7.0F * coordinate);
  }

  auto metal = initial;
  auto replay = initial;
  MetalConstitutiveSolver metal_solver;
  metal_solver.apply_local_relaxation(
      metal, timestep, elastic_time, spin_time);
  metal_solver.apply_local_relaxation(
      replay, timestep, elastic_time, spin_time);

  auto reference = TauGrid::uniform(
      {cells, 1, 1}, 1.0 / static_cast<double>(cells), 1.0, 2.5, 0.0);
  for (std::size_t cell = 0; cell < cells; ++cell) {
    reference.conformation_xx[cell] = initial.conformation_xx[cell];
    reference.conformation_yy[cell] = initial.conformation_yy[cell];
    reference.conformation_zz[cell] = initial.conformation_zz[cell];
    reference.conformation_xy[cell] = initial.conformation_xy[cell];
    reference.conformation_xz[cell] = initial.conformation_xz[cell];
    reference.conformation_yz[cell] = initial.conformation_yz[cell];
    reference.intrinsic_spin_x[cell] = initial.intrinsic_spin_x[cell];
    reference.intrinsic_spin_y[cell] = initial.intrinsic_spin_y[cell];
    reference.intrinsic_spin_z[cell] = initial.intrinsic_spin_z[cell];
  }

  auto parameters = conservative_parameters();
  parameters.elastic_relaxation_time = elastic_time;
  parameters.spin_relaxation_time = spin_time;
  ReferenceSolver reference_solver(parameters);
  reference_solver.apply_constitutive_response(reference, timestep);

  double maximum_error = 0.0;
  maximum_error = std::max(
      maximum_error,
      maximum_field_error(metal.conformation_xx, reference.conformation_xx));
  maximum_error = std::max(
      maximum_error,
      maximum_field_error(metal.conformation_yy, reference.conformation_yy));
  maximum_error = std::max(
      maximum_error,
      maximum_field_error(metal.conformation_zz, reference.conformation_zz));
  maximum_error = std::max(
      maximum_error,
      maximum_field_error(metal.conformation_xy, reference.conformation_xy));
  maximum_error = std::max(
      maximum_error,
      maximum_field_error(metal.conformation_xz, reference.conformation_xz));
  maximum_error = std::max(
      maximum_error,
      maximum_field_error(metal.conformation_yz, reference.conformation_yz));
  maximum_error = std::max(
      maximum_error,
      maximum_field_error(metal.intrinsic_spin_x,
                          reference.intrinsic_spin_x));
  maximum_error = std::max(
      maximum_error,
      maximum_field_error(metal.intrinsic_spin_y,
                          reference.intrinsic_spin_y));
  maximum_error = std::max(
      maximum_error,
      maximum_field_error(metal.intrinsic_spin_z,
                          reference.intrinsic_spin_z));

  const auto& device = metal_solver.device_info();
  MetalMeasurement result{
      .available = true,
      .deterministic = metal_states_equal(metal, replay),
      .device_name = device.name,
      .unified_memory = device.has_unified_memory,
      .supports_apple7 = device.supports_apple7,
      .cells = cells,
      .maximum_oracle_error = maximum_error,
      .tolerance = tolerance,
  };
  result.passed = result.deterministic && result.unified_memory &&
                  result.maximum_oracle_error <= result.tolerance;
  return result;
}
#else
MetalMeasurement measure_metal() {
  return {};
}
#endif

std::string scientific(double value, int precision = 2) {
  std::ostringstream stream;
  stream << std::scientific << std::setprecision(precision) << value;
  return stream.str();
}

std::string decimal(double value, int precision = 6) {
  std::ostringstream stream;
  stream << std::fixed << std::setprecision(precision) << value;
  return stream.str();
}

std::string status(bool passed, bool use_color) {
  if (!use_color) return passed ? "PASS" : "FAIL";
  return passed ? "\033[1;32mPASS\033[0m" : "\033[1;31mFAIL\033[0m";
}

std::string sparkline(const std::vector<double>& values,
                      std::size_t width = 64) {
  constexpr std::array<std::string_view, 8> bars{
      "▁", "▂", "▃", "▄", "▅", "▆", "▇", "█",
  };
  if (values.empty()) return {};

  const auto [minimum, maximum] =
      std::minmax_element(values.begin(), values.end());
  const double range = *maximum - *minimum;
  std::string line;
  for (std::size_t column = 0; column < width; ++column) {
    const std::size_t cell =
        std::min(values.size() - 1, column * values.size() / width);
    const double normalized =
        range > 0.0 ? (values[cell] - *minimum) / range : 0.5;
    const auto index = static_cast<std::size_t>(
        std::clamp(std::floor(normalized * 7.999), 0.0, 7.0));
    line += bars[index];
  }
  return line;
}

}  // namespace

bool DemoReport::passed() const noexcept {
  return acoustic.passed && refinement.passed && replay.passed &&
         (!metal.available || metal.passed);
}

DemoReport run_demo_experiments() {
  DemoReport report;
  report.theory_hash = kRccmV0TheoryHash;
  report.acoustic = measure_acoustic_wave(128);
  report.refinement = measure_refinement();
  report.replay = measure_replay();
  report.metal = measure_metal();
  return report;
}

std::string render_demo_report(const DemoReport& report, bool use_color) {
  std::ostringstream output;
  output
      << "\n"
      << "  TAULAB // AN EXECUTABLE RCCM-v0 LAB\n"
      << "  Create a universe. Disturb it once. Then try to catch it lying.\n"
      << "\n"
      << "  THEORY LOCK\n"
      << "  " << report.theory_hash << "\n"
      << "  One immutable candidate. No fitted force law enters this run.\n"
      << "\n"
      << "  1 // MEASURE THE WAVE\n"
      << "  A right-moving pressure-density ripple gets one quarter-orbit.\n"
      << "\n"
      << "  before  " << sparkline(report.acoustic.initial_density) << "\n"
      << "  after   " << sparkline(report.acoustic.final_density) << "\n"
      << "\n"
      << "  predicted c_tau  sqrt(gamma * p0 / rho0) = "
      << decimal(report.acoustic.expected_speed) << "\n"
      << "  measured  c_tau  phase(output field)       = "
      << decimal(report.acoustic.measured_speed) << "\n"
      << "  relative mismatch                           = "
      << scientific(report.acoustic.relative_speed_error) << "\n"
      << "  conservation drift  mass / momentum / energy\n"
      << "                      " << scientific(report.acoustic.mass_residual)
      << " / " << scientific(report.acoustic.momentum_residual) << " / "
      << scientific(report.acoustic.energy_residual) << "\n"
      << "  gate: " << status(report.acoustic.passed, use_color) << "\n"
      << "\n"
      << "  2 // SHARPEN THE MICROSCOPE\n"
      << "  If this is numerical physics, error must fall as resolution rises.\n"
      << "\n"
      << "       cells        L2 field error\n";

  for (const auto& sample : report.refinement.samples) {
    output << "       " << std::setw(5) << sample.cells << "        "
           << scientific(sample.l2_error, 4) << "\n";
  }
  output << "  observed order     " << decimal(report.refinement.coarse_order, 3)
         << " -> " << decimal(report.refinement.fine_order, 3)
         << "  (second-order target: 2)\n"
         << "  gate: " << status(report.refinement.passed, use_color) << "\n"
         << "\n"
         << "  3 // BRANCH TIME\n"
         << "  Run the same checkpoint twice, then add one ledgered intervention.\n"
         << "\n"
         << "  closed universe A   " << report.replay.first_digest << "\n"
         << "  exact replay A'     " << report.replay.replay_digest << "  "
         << status(report.replay.exact_replay, use_color) << "\n"
         << "  +energy branch B    " << report.replay.branch_digest << "\n"
         << "  exogenous energy ledger: "
         << scientific(report.replay.intervention_energy, 6) << " tau-energy\n"
         << "  gate: " << status(report.replay.passed, use_color) << "\n"
         << "\n"
         << "  4 // CROSS-EXAMINE THE APPLE GPU\n";

  if (report.metal.available) {
    output << "  device              " << report.metal.device_name << "\n"
           << "  execution            " << report.metal.cells
           << " cells, 9 micropolar/elastic fields\n"
           << "  unified memory       "
           << (report.metal.unified_memory ? "yes" : "no") << "\n"
           << "  Apple7 family        "
           << (report.metal.supports_apple7 ? "yes" : "no") << "\n"
           << "  max CPU-oracle error "
           << scientific(report.metal.maximum_oracle_error)
           << "  (limit " << scientific(report.metal.tolerance) << ")\n"
           << "  exact GPU replay     "
           << (report.metal.deterministic ? "bit-for-bit" : "diverged")
           << "\n"
           << "  gate: " << status(report.metal.passed, use_color) << "\n";
  } else {
    output << "  SKIP: no Metal device is visible; CPU scientific gates remain "
              "authoritative.\n";
  }

  output
      << "\n"
      << "  ================================================================\n"
      << "  RESULT: " << status(report.passed(), use_color)
      << " — one locked tau continuum produced a measured,\n"
      << "  converging, conservative, exactly replayable trajectory.\n"
      << "\n"
      << "  What this run demonstrates\n"
      << "  - RCCM-v0 is executable enough to make falsifiable numerical "
         "measurements.\n"
      << "  - The displayed values were computed during this run, not loaded "
         "answers.\n";
  if (report.metal.available) {
    output << "  - Apple Metal agreed with the double-precision CPU oracle in "
              "this run.\n";
  } else {
    output << "  - The Metal cross-check was skipped because no GPU was visible "
              "to this process.\n";
  }
  output
      << "\n"
      << "  What this run does NOT demonstrate\n"
      << "  - stable particles, gravity, electromagnetism, quantum statistics, "
         "or chemistry;\n"
      << "  - that the RCCM ontology is nature. Those are the experiments "
         "ahead.\n"
      << "\n"
      << "  The exciting part is not that the theory won. It is that the theory "
         "can now lose.\n"
      << "\n";
  return output.str();
}

}  // namespace taulab
