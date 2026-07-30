#include "taulab/solver.hpp"

#include <algorithm>
#include <cmath>
#include <cstdlib>
#include <iostream>
#include <numbers>
#include <string>

namespace {

int failures = 0;

void check(bool condition, const std::string& message) {
  if (!condition) {
    std::cerr << "FAIL: " << message << '\n';
    ++failures;
  }
}

void check_near(double actual, double expected, double tolerance,
                const std::string& message) {
  if (std::abs(actual - expected) > tolerance) {
    std::cerr << "FAIL: " << message << " expected=" << expected
              << " actual=" << actual << " tolerance=" << tolerance << '\n';
    ++failures;
  }
}

taulab::SolverParameters conservative_parameters() {
  taulab::SolverParameters parameters;
  parameters.elastic_relaxation_time = 0.0;
  parameters.spin_relaxation_time = 0.0;
  parameters.phase_mobility = 0.0;
  parameters.phase_interface_coefficient = 0.0;
  parameters.shear_modulus = 0.0;
  parameters.spin_diffusivity = 0.0;
  parameters.kinematic_viscosity = 0.0;
  return parameters;
}

void test_uniform_state_is_fixed() {
  auto grid = taulab::TauGrid::uniform({8, 8, 8}, 1.0 / 8.0, 1.0, 1.0, 0.0);
  const auto before = grid.state_digest();

  taulab::ReferenceSolver solver(conservative_parameters());
  solver.step(grid, 1.0e-3);

  check(grid.state_digest() == before, "uniform state must remain unchanged");
}

void test_periodic_conservation_and_determinism() {
  auto first = taulab::TauGrid::uniform({32, 4, 4}, 1.0 / 32.0, 1.0, 2.5, 0.0);
  taulab::seed_entropy_wave(first, 0.01, 0.35);
  auto second = first;

  const auto initial = first.totals();
  taulab::ReferenceSolver solver(conservative_parameters());
  solver.run(first, 2.0e-3, 40);
  solver.run(second, 2.0e-3, 40);
  const auto final = first.totals();

  check_near(final.mass, initial.mass, 1.0e-12, "periodic mass conservation");
  check_near(final.momentum.x, initial.momentum.x, 1.0e-12,
             "periodic x momentum conservation");
  check_near(final.momentum.y, initial.momentum.y, 1.0e-12,
             "periodic y momentum conservation");
  check_near(final.momentum.z, initial.momentum.z, 1.0e-12,
             "periodic z momentum conservation");
  check_near(final.energy, initial.energy, 1.0e-12,
             "periodic total energy conservation");
  check(first.state_digest() == second.state_digest(),
        "identical runs must produce identical state digests");
}

double entropy_wave_error(std::size_t cells) {
  const double velocity = 0.35;
  const double end_time = 1.0 / velocity;
  auto grid = taulab::TauGrid::uniform({cells, 1, 1}, 1.0 / static_cast<double>(cells),
                                      1.0, 2.5, velocity);
  taulab::seed_entropy_wave(grid, 0.05, velocity);

  taulab::ReferenceSolver solver(conservative_parameters());
  const double nominal_dt = 0.2 * grid.spacing() / (velocity + std::sqrt(1.4));
  const auto steps = static_cast<std::size_t>(std::ceil(end_time / nominal_dt));
  const double dt = end_time / static_cast<double>(steps);
  solver.run(grid, dt, steps);

  double squared_error = 0.0;
  for (std::size_t i = 0; i < cells; ++i) {
    const double x = (static_cast<double>(i) + 0.5) / static_cast<double>(cells);
    const double expected =
        1.0 + 0.05 * std::sin(2.0 * std::numbers::pi * x);
    const double difference = grid.rho[i] - expected;
    squared_error += difference * difference;
  }
  return std::sqrt(squared_error / static_cast<double>(cells));
}

void test_second_order_smooth_convergence() {
  const double coarse = entropy_wave_error(32);
  const double fine = entropy_wave_error(64);
  check(coarse / fine > 2.5,
        "smooth finite-volume transport must approach second-order convergence");
}

double acoustic_wave_error(std::size_t cells) {
  constexpr double gamma = 1.4;
  constexpr double background_pressure = 1.0;
  constexpr double amplitude = 1.0e-4;
  const double wave_speed = std::sqrt(gamma * background_pressure);
  const double end_time = 1.0 / wave_speed;
  const double spacing = 1.0 / static_cast<double>(cells);
  auto grid = taulab::TauGrid::uniform({cells, 1, 1}, spacing, 1.0,
                                      background_pressure / (gamma - 1.0),
                                      0.0);

  for (std::size_t i = 0; i < cells; ++i) {
    const double x = (static_cast<double>(i) + 0.5) * spacing;
    const double perturbation =
        amplitude * std::sin(2.0 * std::numbers::pi * x);
    const double density = 1.0 + perturbation;
    const double velocity = wave_speed * perturbation;
    const double pressure =
        background_pressure + wave_speed * wave_speed * perturbation;
    grid.rho[i] = density;
    grid.momentum_x[i] = density * velocity;
    grid.total_energy[i] =
        pressure / (gamma - 1.0) + 0.5 * density * velocity * velocity;
  }

  taulab::ReferenceSolver solver(conservative_parameters());
  const double nominal_dt = 0.2 * spacing / wave_speed;
  const auto steps = static_cast<std::size_t>(std::ceil(end_time / nominal_dt));
  const double dt = end_time / static_cast<double>(steps);
  solver.run(grid, dt, steps);

  double squared_error = 0.0;
  for (std::size_t i = 0; i < cells; ++i) {
    const double x = (static_cast<double>(i) + 0.5) * spacing;
    const double expected =
        1.0 + amplitude * std::sin(2.0 * std::numbers::pi * x);
    const double difference = grid.rho[i] - expected;
    squared_error += difference * difference;
  }
  return std::sqrt(squared_error / static_cast<double>(cells));
}

void test_acoustic_speed_and_convergence() {
  const double coarse = acoustic_wave_error(32);
  const double fine = acoustic_wave_error(64);
  check(coarse / fine > 2.5,
        "linear acoustic mode must return after one measured sound-crossing "
        "time with second-order convergence");
}

void test_shock_state_remains_admissible() {
  constexpr std::size_t cells = 128;
  auto grid =
      taulab::TauGrid::uniform({cells, 1, 1}, 1.0 / cells, 1.0, 2.5, 0.0);
  for (std::size_t i = cells / 2; i < cells; ++i) {
    grid.rho[i] = 0.125;
    grid.total_energy[i] = 0.25;
  }

  taulab::ReferenceSolver solver(conservative_parameters());
  const double dt = 0.25 * solver.maximum_stable_timestep(grid);
  solver.run(grid, dt, 40);

  check(grid.minimum_density() > 0.0,
        "shock transport must preserve positive density");
  check(grid.minimum_pressure(1.4) > 0.0,
        "shock transport must preserve positive pressure");
}

void test_exact_local_relaxation() {
  auto grid = taulab::TauGrid::uniform({4, 4, 4}, 0.25, 1.0, 5.0, 0.0);
  for (std::size_t cell = 0; cell < grid.cell_count(); ++cell) {
    grid.conformation_xx[cell] = 2.0;
    grid.conformation_yy[cell] = 0.5;
    grid.intrinsic_spin_x[cell] = 1.0;
  }

  taulab::SolverParameters parameters = conservative_parameters();
  parameters.elastic_relaxation_time = 0.5;
  parameters.spin_relaxation_time = 0.25;
  taulab::ReferenceSolver solver(parameters);
  solver.apply_constitutive_response(grid, 0.1);

  const double elastic_factor = std::exp(-0.1 / 0.5);
  const double spin_factor = std::exp(-0.1 / 0.25);
  check_near(grid.conformation_xx[0], 1.0 + elastic_factor, 1.0e-12,
             "Cxx exact Maxwell relaxation");
  check_near(grid.conformation_yy[0], 1.0 - 0.5 * elastic_factor, 1.0e-12,
             "Cyy exact Maxwell relaxation");
  check_near(grid.intrinsic_spin_x[0], spin_factor, 1.0e-12,
             "microrotation exact local relaxation");
}

void test_phase_admissibility() {
  auto grid = taulab::TauGrid::uniform({8, 8, 8}, 0.125, 1.0, 3.0, 0.0);
  for (std::size_t cell = 0; cell < grid.cell_count(); ++cell) {
    grid.cavity_phase[cell] = cell % 2 == 0 ? 0.2 : 0.8;
  }

  auto parameters = conservative_parameters();
  parameters.phase_mobility = 0.02;
  parameters.phase_interface_coefficient = 0.01;
  taulab::ReferenceSolver solver(parameters);
  solver.apply_constitutive_response(grid, 1.0e-3);

  check(
      std::ranges::all_of(grid.cavity_phase,
                          [](double value) { return value >= 0.0 && value <= 1.0; }),
      "phase-field update must preserve [0,1]");
}

}  // namespace

int main() {
  test_uniform_state_is_fixed();
  test_periodic_conservation_and_determinism();
  test_second_order_smooth_convergence();
  test_acoustic_speed_and_convergence();
  test_shock_state_remains_admissible();
  test_exact_local_relaxation();
  test_phase_admissibility();

  if (failures == 0) {
    std::cout << "All TauLab reference-solver tests passed\n";
    return EXIT_SUCCESS;
  }
  std::cerr << failures << " TauLab reference-solver test(s) failed\n";
  return EXIT_FAILURE;
}
