#include "taulab/metal_solver.hpp"
#include "taulab/solver.hpp"

#include <algorithm>
#include <bit>
#include <cmath>
#include <cstdlib>
#include <iostream>
#include <random>
#include <string>

namespace {

int failures = 0;

void check(bool condition, const std::string& message) {
  if (!condition) {
    std::cerr << "FAIL: " << message << '\n';
    ++failures;
  }
}

void compare_field(const std::vector<float>& metal,
                   const std::vector<double>& reference, float tolerance,
                   const std::string& name) {
  float maximum_error = 0.0F;
  for (std::size_t cell = 0; cell < metal.size(); ++cell) {
    maximum_error =
        std::max(maximum_error,
                 std::abs(metal[cell] - static_cast<float>(reference[cell])));
  }
  check(maximum_error <= tolerance,
        name + " CPU/Metal maximum error exceeded tolerance: " +
            std::to_string(maximum_error));
}

bool bitwise_equal(const taulab::MetalLocalState& left,
                   const taulab::MetalLocalState& right) {
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

}  // namespace

int main() {
  if (!taulab::MetalConstitutiveSolver::is_available()) {
    std::cout << "SKIP: no Metal device is visible in this process\n";
    return 77;
  }

  constexpr std::size_t cells = 4096;
  constexpr float timestep = 0.0375F;
  constexpr float elastic_time = 0.41F;
  constexpr float spin_time = 0.23F;

  taulab::MetalLocalState initial(cells);
  std::mt19937 generator(0x544155U);
  std::uniform_real_distribution<float> conformation(-0.5F, 2.0F);
  std::uniform_real_distribution<float> spin(-1.0F, 1.0F);
  for (std::size_t cell = 0; cell < cells; ++cell) {
    initial.conformation_xx[cell] = conformation(generator);
    initial.conformation_yy[cell] = conformation(generator);
    initial.conformation_zz[cell] = conformation(generator);
    initial.conformation_xy[cell] = conformation(generator);
    initial.conformation_xz[cell] = conformation(generator);
    initial.conformation_yz[cell] = conformation(generator);
    initial.intrinsic_spin_x[cell] = spin(generator);
    initial.intrinsic_spin_y[cell] = spin(generator);
    initial.intrinsic_spin_z[cell] = spin(generator);
  }

  auto metal = initial;
  auto replay = initial;
  taulab::MetalConstitutiveSolver solver;
  const auto& device = solver.device_info();
  check(!device.name.empty(), "Metal device must report a name");
  check(device.has_unified_memory,
        "the selected Apple-silicon device must report unified memory");
  check(device.recommended_working_set_bytes > 0,
        "Metal device must report a recommended working-set size");

  solver.apply_local_relaxation(metal, timestep, elastic_time, spin_time);
  solver.apply_local_relaxation(replay, timestep, elastic_time, spin_time);
  check(bitwise_equal(metal, replay),
        "identical Metal dispatches must produce identical fields");

  auto reference =
      taulab::TauGrid::uniform({cells, 1, 1}, 1.0 / cells, 1.0, 2.5, 0.0);
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

  taulab::SolverParameters parameters;
  parameters.elastic_relaxation_time = elastic_time;
  parameters.spin_relaxation_time = spin_time;
  taulab::ReferenceSolver reference_solver(parameters);
  reference_solver.apply_constitutive_response(reference, timestep);

  constexpr float tolerance = 2.0e-6F;
  compare_field(metal.conformation_xx, reference.conformation_xx, tolerance,
                "conformation_xx");
  compare_field(metal.conformation_yy, reference.conformation_yy, tolerance,
                "conformation_yy");
  compare_field(metal.conformation_zz, reference.conformation_zz, tolerance,
                "conformation_zz");
  compare_field(metal.conformation_xy, reference.conformation_xy, tolerance,
                "conformation_xy");
  compare_field(metal.conformation_xz, reference.conformation_xz, tolerance,
                "conformation_xz");
  compare_field(metal.conformation_yz, reference.conformation_yz, tolerance,
                "conformation_yz");
  compare_field(metal.intrinsic_spin_x, reference.intrinsic_spin_x, tolerance,
                "intrinsic_spin_x");
  compare_field(metal.intrinsic_spin_y, reference.intrinsic_spin_y, tolerance,
                "intrinsic_spin_y");
  compare_field(metal.intrinsic_spin_z, reference.intrinsic_spin_z, tolerance,
                "intrinsic_spin_z");

  if (failures == 0) {
    std::cout << "Metal parity passed on " << device.name << " (Apple7="
              << (device.supports_apple7 ? "true" : "false")
              << ", recommendedWorkingSetBytes="
              << device.recommended_working_set_bytes << ")\n";
    return EXIT_SUCCESS;
  }
  return EXIT_FAILURE;
}
