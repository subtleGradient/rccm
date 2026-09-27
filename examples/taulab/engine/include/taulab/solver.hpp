#pragma once

#include <cstddef>
#include <cstdint>
#include <string>
#include <vector>

namespace taulab {

struct Vec3 {
  double x{};
  double y{};
  double z{};
};

struct GridShape {
  std::size_t nx{};
  std::size_t ny{};
  std::size_t nz{};
};

struct ConservedTotals {
  double mass{};
  Vec3 momentum{};
  double energy{};
  Vec3 angular_momentum{};
};

struct SolverParameters {
  double gamma{1.4};
  double density_floor{1.0e-9};
  double pressure_floor{1.0e-9};
  double cfl{0.35};

  double shear_modulus{1.0};
  double elastic_relaxation_time{1.0};
  double micro_inertia{1.0};
  double spin_relaxation_time{1.0};
  double spin_diffusivity{0.0};
  double kinematic_viscosity{0.0};

  double phase_mobility{0.01};
  double phase_interface_coefficient{0.01};
  double phase_barrier{1.0};
};

class TauGrid {
 public:
  TauGrid(GridShape shape, double spacing);

  [[nodiscard]] static TauGrid uniform(GridShape shape, double spacing,
                                       double density,
                                       double total_energy_density,
                                       double velocity_x);

  [[nodiscard]] GridShape shape() const noexcept { return shape_; }
  [[nodiscard]] double spacing() const noexcept { return spacing_; }
  [[nodiscard]] std::size_t cell_count() const noexcept;
  [[nodiscard]] std::size_t index(long i, long j, long k) const noexcept;

  [[nodiscard]] ConservedTotals totals() const;
  [[nodiscard]] std::string state_digest() const;
  [[nodiscard]] double minimum_density() const;
  [[nodiscard]] double minimum_pressure(double gamma) const;

  std::vector<double> rho;
  std::vector<double> momentum_x;
  std::vector<double> momentum_y;
  std::vector<double> momentum_z;
  std::vector<double> total_energy;

  std::vector<double> intrinsic_spin_x;
  std::vector<double> intrinsic_spin_y;
  std::vector<double> intrinsic_spin_z;

  std::vector<double> conformation_xx;
  std::vector<double> conformation_yy;
  std::vector<double> conformation_zz;
  std::vector<double> conformation_xy;
  std::vector<double> conformation_xz;
  std::vector<double> conformation_yz;

  std::vector<double> cavity_phase;

 private:
  GridShape shape_;
  double spacing_;
};

class ReferenceSolver {
 public:
  explicit ReferenceSolver(SolverParameters parameters = {});

  void step(TauGrid& grid, double timestep) const;
  void run(TauGrid& grid, double timestep, std::size_t steps) const;
  void apply_constitutive_response(TauGrid& grid, double timestep) const;

  [[nodiscard]] double maximum_stable_timestep(const TauGrid& grid) const;
  [[nodiscard]] const SolverParameters& parameters() const noexcept {
    return parameters_;
  }

 private:
  SolverParameters parameters_;
};

void seed_entropy_wave(TauGrid& grid, double amplitude, double velocity_x);
void seed_cavity(TauGrid& grid, Vec3 center, double radius,
                 double interface_width);
void seed_vortex(TauGrid& grid, Vec3 center, double circulation,
                 double core_radius);

[[nodiscard]] double relative_residual(double initial, double final);

}  // namespace taulab

