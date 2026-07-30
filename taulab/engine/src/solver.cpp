#include "taulab/solver.hpp"

#include <algorithm>
#include <array>
#include <bit>
#include <cmath>
#include <iomanip>
#include <limits>
#include <numbers>
#include <sstream>
#include <stdexcept>

namespace taulab {
namespace {

using HydroState = std::array<double, 5>;
using Primitive = std::array<double, 5>;

struct HydroRhs {
  explicit HydroRhs(std::size_t size)
      : rho(size), mx(size), my(size), mz(size), energy(size) {}

  std::vector<double> rho;
  std::vector<double> mx;
  std::vector<double> my;
  std::vector<double> mz;
  std::vector<double> energy;
};

long wrap(long value, std::size_t extent) noexcept {
  const auto signed_extent = static_cast<long>(extent);
  const long remainder = value % signed_extent;
  return remainder < 0 ? remainder + signed_extent : remainder;
}

double minmod(double left, double right) noexcept {
  if (left * right <= 0.0) return 0.0;
  return std::copysign(std::min(std::abs(left), std::abs(right)), left);
}

Primitive primitive_at(const TauGrid& grid, std::size_t cell,
                       const SolverParameters& parameters) {
  const double density = std::max(grid.rho[cell], parameters.density_floor);
  const double velocity_x = grid.momentum_x[cell] / density;
  const double velocity_y = grid.momentum_y[cell] / density;
  const double velocity_z = grid.momentum_z[cell] / density;
  const double kinetic =
      0.5 * density *
      (velocity_x * velocity_x + velocity_y * velocity_y +
       velocity_z * velocity_z);
  const double pressure =
      std::max((parameters.gamma - 1.0) *
                   (grid.total_energy[cell] - kinetic),
               parameters.pressure_floor);
  return {density, velocity_x, velocity_y, velocity_z, pressure};
}

HydroState conserved_from_primitive(const Primitive& primitive,
                                    double gamma) {
  const double density = primitive[0];
  const double velocity_squared =
      primitive[1] * primitive[1] + primitive[2] * primitive[2] +
      primitive[3] * primitive[3];
  return {
      density,
      density * primitive[1],
      density * primitive[2],
      density * primitive[3],
      primitive[4] / (gamma - 1.0) + 0.5 * density * velocity_squared,
  };
}

HydroState physical_flux(const Primitive& primitive, std::size_t axis,
                         double gamma) {
  const auto conserved = conserved_from_primitive(primitive, gamma);
  const double normal_velocity = primitive[axis + 1];
  HydroState flux{
      conserved[0] * normal_velocity,
      conserved[1] * normal_velocity,
      conserved[2] * normal_velocity,
      conserved[3] * normal_velocity,
      (conserved[4] + primitive[4]) * normal_velocity,
  };
  flux[axis + 1] += primitive[4];
  return flux;
}

double sound_speed(const Primitive& primitive, double gamma) {
  return std::sqrt(gamma * primitive[4] / primitive[0]);
}

Primitive limited_slope(const TauGrid& grid, long i, long j, long k,
                        std::size_t axis,
                        const SolverParameters& parameters) {
  const std::array<long, 3> coordinate{i, j, k};
  auto previous = coordinate;
  auto next = coordinate;
  --previous[axis];
  ++next[axis];

  const auto center_value =
      primitive_at(grid, grid.index(i, j, k), parameters);
  const auto previous_value =
      primitive_at(grid,
                   grid.index(previous[0], previous[1], previous[2]),
                   parameters);
  const auto next_value =
      primitive_at(grid, grid.index(next[0], next[1], next[2]), parameters);

  Primitive slope{};
  for (std::size_t component = 0; component < slope.size(); ++component) {
    slope[component] =
        minmod(center_value[component] - previous_value[component],
               next_value[component] - center_value[component]);
  }
  return slope;
}

Primitive reconstruct(const Primitive& center, const Primitive& slope,
                      double direction,
                      const SolverParameters& parameters) {
  Primitive result{};
  for (std::size_t component = 0; component < result.size(); ++component) {
    result[component] = center[component] + direction * 0.5 * slope[component];
  }
  result[0] = std::max(result[0], parameters.density_floor);
  result[4] = std::max(result[4], parameters.pressure_floor);
  return result;
}

HydroState rusanov_flux(const Primitive& left, const Primitive& right,
                        std::size_t axis,
                        const SolverParameters& parameters) {
  const auto left_conserved =
      conserved_from_primitive(left, parameters.gamma);
  const auto right_conserved =
      conserved_from_primitive(right, parameters.gamma);
  const auto left_flux = physical_flux(left, axis, parameters.gamma);
  const auto right_flux = physical_flux(right, axis, parameters.gamma);
  const double speed =
      std::max(std::abs(left[axis + 1]) +
                   sound_speed(left, parameters.gamma),
               std::abs(right[axis + 1]) +
                   sound_speed(right, parameters.gamma));

  HydroState result{};
  for (std::size_t component = 0; component < result.size(); ++component) {
    result[component] =
        0.5 * (left_flux[component] + right_flux[component]) -
        0.5 * speed * (right_conserved[component] - left_conserved[component]);
  }
  return result;
}

HydroRhs compute_hydro_rhs(const TauGrid& grid,
                           const SolverParameters& parameters) {
  HydroRhs rhs(grid.cell_count());
  const auto shape = grid.shape();
  const double inverse_spacing = 1.0 / grid.spacing();

  for (std::size_t axis = 0; axis < 3; ++axis) {
    const std::array<std::size_t, 3> extents{shape.nx, shape.ny, shape.nz};
    if (extents[axis] == 1) continue;

    for (std::size_t k = 0; k < shape.nz; ++k) {
      for (std::size_t j = 0; j < shape.ny; ++j) {
        for (std::size_t i = 0; i < shape.nx; ++i) {
          std::array<long, 3> left_coordinate{
              static_cast<long>(i),
              static_cast<long>(j),
              static_cast<long>(k),
          };
          auto right_coordinate = left_coordinate;
          ++right_coordinate[axis];

          const auto left_cell =
              grid.index(left_coordinate[0], left_coordinate[1],
                         left_coordinate[2]);
          const auto right_cell =
              grid.index(right_coordinate[0], right_coordinate[1],
                         right_coordinate[2]);
          const auto left_center =
              primitive_at(grid, left_cell, parameters);
          const auto right_center =
              primitive_at(grid, right_cell, parameters);
          const auto left_slope =
              limited_slope(grid, left_coordinate[0], left_coordinate[1],
                            left_coordinate[2], axis, parameters);
          const auto right_slope =
              limited_slope(grid, right_coordinate[0], right_coordinate[1],
                            right_coordinate[2], axis, parameters);
          const auto left =
              reconstruct(left_center, left_slope, 1.0, parameters);
          const auto right =
              reconstruct(right_center, right_slope, -1.0, parameters);
          const auto flux = rusanov_flux(left, right, axis, parameters);

          const double scale = inverse_spacing;
          rhs.rho[left_cell] -= scale * flux[0];
          rhs.mx[left_cell] -= scale * flux[1];
          rhs.my[left_cell] -= scale * flux[2];
          rhs.mz[left_cell] -= scale * flux[3];
          rhs.energy[left_cell] -= scale * flux[4];

          rhs.rho[right_cell] += scale * flux[0];
          rhs.mx[right_cell] += scale * flux[1];
          rhs.my[right_cell] += scale * flux[2];
          rhs.mz[right_cell] += scale * flux[3];
          rhs.energy[right_cell] += scale * flux[4];
        }
      }
    }
  }
  return rhs;
}

void enforce_hydro_admissibility(TauGrid& grid,
                                 const SolverParameters& parameters) {
  for (std::size_t cell = 0; cell < grid.cell_count(); ++cell) {
    grid.rho[cell] = std::max(grid.rho[cell], parameters.density_floor);
    const double inverse_density = 1.0 / grid.rho[cell];
    const double kinetic =
        0.5 * inverse_density *
        (grid.momentum_x[cell] * grid.momentum_x[cell] +
         grid.momentum_y[cell] * grid.momentum_y[cell] +
         grid.momentum_z[cell] * grid.momentum_z[cell]);
    const double minimum_energy =
        kinetic + parameters.pressure_floor / (parameters.gamma - 1.0);
    grid.total_energy[cell] =
        std::max(grid.total_energy[cell], minimum_energy);
  }
}

TauGrid hydro_euler_stage(const TauGrid& source, const HydroRhs& rhs,
                          double timestep,
                          const SolverParameters& parameters) {
  TauGrid result = source;
  for (std::size_t cell = 0; cell < source.cell_count(); ++cell) {
    result.rho[cell] += timestep * rhs.rho[cell];
    result.momentum_x[cell] += timestep * rhs.mx[cell];
    result.momentum_y[cell] += timestep * rhs.my[cell];
    result.momentum_z[cell] += timestep * rhs.mz[cell];
    result.total_energy[cell] += timestep * rhs.energy[cell];
  }
  enforce_hydro_admissibility(result, parameters);
  return result;
}

void hydro_ssp_rk2(TauGrid& grid, double timestep,
                   const SolverParameters& parameters) {
  const TauGrid initial = grid;
  const auto first_rhs = compute_hydro_rhs(initial, parameters);
  const TauGrid stage =
      hydro_euler_stage(initial, first_rhs, timestep, parameters);
  const auto second_rhs = compute_hydro_rhs(stage, parameters);
  const TauGrid advanced =
      hydro_euler_stage(stage, second_rhs, timestep, parameters);

  for (std::size_t cell = 0; cell < grid.cell_count(); ++cell) {
    grid.rho[cell] = 0.5 * (initial.rho[cell] + advanced.rho[cell]);
    grid.momentum_x[cell] =
        0.5 * (initial.momentum_x[cell] + advanced.momentum_x[cell]);
    grid.momentum_y[cell] =
        0.5 * (initial.momentum_y[cell] + advanced.momentum_y[cell]);
    grid.momentum_z[cell] =
        0.5 * (initial.momentum_z[cell] + advanced.momentum_z[cell]);
    grid.total_energy[cell] =
        0.5 * (initial.total_energy[cell] + advanced.total_energy[cell]);
  }
  enforce_hydro_admissibility(grid, parameters);
}

Vec3 velocity_at(const TauGrid& grid, long i, long j, long k,
                 double density_floor) {
  const auto cell = grid.index(i, j, k);
  const double density = std::max(grid.rho[cell], density_floor);
  return {
      grid.momentum_x[cell] / density,
      grid.momentum_y[cell] / density,
      grid.momentum_z[cell] / density,
  };
}

Vec3 curl_velocity(const TauGrid& grid, long i, long j, long k,
                   double density_floor) {
  const double inverse_two_spacing = 0.5 / grid.spacing();
  const auto x_minus = velocity_at(grid, i - 1, j, k, density_floor);
  const auto x_plus = velocity_at(grid, i + 1, j, k, density_floor);
  const auto y_minus = velocity_at(grid, i, j - 1, k, density_floor);
  const auto y_plus = velocity_at(grid, i, j + 1, k, density_floor);
  const auto z_minus = velocity_at(grid, i, j, k - 1, density_floor);
  const auto z_plus = velocity_at(grid, i, j, k + 1, density_floor);

  return {
      (y_plus.z - y_minus.z - (z_plus.y - z_minus.y)) *
          inverse_two_spacing,
      (z_plus.x - z_minus.x - (x_plus.z - x_minus.z)) *
          inverse_two_spacing,
      (x_plus.y - x_minus.y - (y_plus.x - y_minus.x)) *
          inverse_two_spacing,
  };
}

double laplacian_scalar(const TauGrid& grid,
                        const std::vector<double>& field, long i, long j,
                        long k) {
  const auto shape = grid.shape();
  const auto center = grid.index(i, j, k);
  double sum = 0.0;
  double neighbors = 0.0;

  if (shape.nx > 1) {
    sum += field[grid.index(i - 1, j, k)] + field[grid.index(i + 1, j, k)];
    neighbors += 2.0;
  }
  if (shape.ny > 1) {
    sum += field[grid.index(i, j - 1, k)] + field[grid.index(i, j + 1, k)];
    neighbors += 2.0;
  }
  if (shape.nz > 1) {
    sum += field[grid.index(i, j, k - 1)] + field[grid.index(i, j, k + 1)];
    neighbors += 2.0;
  }

  return (sum - neighbors * field[center]) /
         (grid.spacing() * grid.spacing());
}

void fnv_mix(std::uint64_t& hash, std::uint64_t value) noexcept {
  constexpr std::uint64_t prime = 1099511628211ULL;
  for (int byte = 0; byte < 8; ++byte) {
    hash ^= value & 0xffULL;
    hash *= prime;
    value >>= 8U;
  }
}

}  // namespace

TauGrid::TauGrid(GridShape shape, double spacing)
    : shape_(shape), spacing_(spacing) {
  if (shape.nx == 0 || shape.ny == 0 || shape.nz == 0) {
    throw std::invalid_argument("TauGrid extents must be positive");
  }
  if (!(spacing > 0.0) || !std::isfinite(spacing)) {
    throw std::invalid_argument("TauGrid spacing must be finite and positive");
  }

  const auto size = cell_count();
  rho.resize(size);
  momentum_x.resize(size);
  momentum_y.resize(size);
  momentum_z.resize(size);
  total_energy.resize(size);
  intrinsic_spin_x.resize(size);
  intrinsic_spin_y.resize(size);
  intrinsic_spin_z.resize(size);
  conformation_xx.resize(size, 1.0);
  conformation_yy.resize(size, 1.0);
  conformation_zz.resize(size, 1.0);
  conformation_xy.resize(size);
  conformation_xz.resize(size);
  conformation_yz.resize(size);
  cavity_phase.resize(size);
}

TauGrid TauGrid::uniform(GridShape shape, double spacing, double density,
                         double total_energy_density, double velocity_x) {
  TauGrid grid(shape, spacing);
  std::ranges::fill(grid.rho, density);
  std::ranges::fill(grid.momentum_x, density * velocity_x);
  std::ranges::fill(grid.total_energy, total_energy_density);
  return grid;
}

std::size_t TauGrid::cell_count() const noexcept {
  return shape_.nx * shape_.ny * shape_.nz;
}

std::size_t TauGrid::index(long i, long j, long k) const noexcept {
  const auto x = static_cast<std::size_t>(wrap(i, shape_.nx));
  const auto y = static_cast<std::size_t>(wrap(j, shape_.ny));
  const auto z = static_cast<std::size_t>(wrap(k, shape_.nz));
  return x + shape_.nx * (y + shape_.ny * z);
}

ConservedTotals TauGrid::totals() const {
  ConservedTotals result;
  const double cell_volume = spacing_ * spacing_ * spacing_;

  for (std::size_t k = 0; k < shape_.nz; ++k) {
    for (std::size_t j = 0; j < shape_.ny; ++j) {
      for (std::size_t i = 0; i < shape_.nx; ++i) {
        const auto cell =
            index(static_cast<long>(i), static_cast<long>(j),
                  static_cast<long>(k));
        const Vec3 position{
            (static_cast<double>(i) + 0.5) * spacing_,
            (static_cast<double>(j) + 0.5) * spacing_,
            (static_cast<double>(k) + 0.5) * spacing_,
        };
        result.mass += rho[cell] * cell_volume;
        result.momentum.x += momentum_x[cell] * cell_volume;
        result.momentum.y += momentum_y[cell] * cell_volume;
        result.momentum.z += momentum_z[cell] * cell_volume;
        result.energy += total_energy[cell] * cell_volume;

        result.angular_momentum.x +=
            (position.y * momentum_z[cell] -
             position.z * momentum_y[cell] + intrinsic_spin_x[cell]) *
            cell_volume;
        result.angular_momentum.y +=
            (position.z * momentum_x[cell] -
             position.x * momentum_z[cell] + intrinsic_spin_y[cell]) *
            cell_volume;
        result.angular_momentum.z +=
            (position.x * momentum_y[cell] -
             position.y * momentum_x[cell] + intrinsic_spin_z[cell]) *
            cell_volume;
      }
    }
  }
  return result;
}

std::string TauGrid::state_digest() const {
  std::uint64_t hash = 1469598103934665603ULL;
  fnv_mix(hash, static_cast<std::uint64_t>(shape_.nx));
  fnv_mix(hash, static_cast<std::uint64_t>(shape_.ny));
  fnv_mix(hash, static_cast<std::uint64_t>(shape_.nz));
  fnv_mix(hash, std::bit_cast<std::uint64_t>(spacing_));

  const std::array<const std::vector<double>*, 15> fields{
      &rho,
      &momentum_x,
      &momentum_y,
      &momentum_z,
      &total_energy,
      &intrinsic_spin_x,
      &intrinsic_spin_y,
      &intrinsic_spin_z,
      &conformation_xx,
      &conformation_yy,
      &conformation_zz,
      &conformation_xy,
      &conformation_xz,
      &conformation_yz,
      &cavity_phase,
  };
  for (const auto* field : fields) {
    for (const double value : *field) {
      fnv_mix(hash, std::bit_cast<std::uint64_t>(value));
    }
  }

  std::ostringstream stream;
  stream << std::hex << std::setfill('0') << std::setw(16) << hash;
  return stream.str();
}

double TauGrid::minimum_density() const {
  return *std::ranges::min_element(rho);
}

double TauGrid::minimum_pressure(double gamma) const {
  double result = std::numeric_limits<double>::infinity();
  for (std::size_t cell = 0; cell < cell_count(); ++cell) {
    const double density = rho[cell];
    const double kinetic =
        0.5 *
        (momentum_x[cell] * momentum_x[cell] +
         momentum_y[cell] * momentum_y[cell] +
         momentum_z[cell] * momentum_z[cell]) /
        density;
    result = std::min(result, (gamma - 1.0) * (total_energy[cell] - kinetic));
  }
  return result;
}

ReferenceSolver::ReferenceSolver(SolverParameters parameters)
    : parameters_(parameters) {
  if (!(parameters_.gamma > 1.0)) {
    throw std::invalid_argument("gamma must exceed one");
  }
}

void ReferenceSolver::step(TauGrid& grid, double timestep) const {
  if (!(timestep > 0.0) || !std::isfinite(timestep)) {
    throw std::invalid_argument("timestep must be finite and positive");
  }
  const double stable = maximum_stable_timestep(grid);
  if (timestep > stable * (1.0 + 1.0e-12)) {
    throw std::invalid_argument("timestep exceeds the declared CFL bound");
  }

  apply_constitutive_response(grid, 0.5 * timestep);
  hydro_ssp_rk2(grid, timestep, parameters_);
  apply_constitutive_response(grid, 0.5 * timestep);
}

void ReferenceSolver::run(TauGrid& grid, double timestep,
                          std::size_t steps) const {
  for (std::size_t step_number = 0; step_number < steps; ++step_number) {
    step(grid, timestep);
  }
}

void ReferenceSolver::apply_constitutive_response(TauGrid& grid,
                                                   double timestep) const {
  if (timestep < 0.0 || !std::isfinite(timestep)) {
    throw std::invalid_argument(
        "constitutive timestep must be finite and nonnegative");
  }

  const double elastic_factor =
      parameters_.elastic_relaxation_time > 0.0
          ? std::exp(-timestep / parameters_.elastic_relaxation_time)
          : 1.0;
  const double spin_factor =
      parameters_.spin_relaxation_time > 0.0
          ? std::exp(-timestep / parameters_.spin_relaxation_time)
          : 1.0;
  const auto old_phase = grid.cavity_phase;
  const auto shape = grid.shape();

  for (std::size_t k = 0; k < shape.nz; ++k) {
    for (std::size_t j = 0; j < shape.ny; ++j) {
      for (std::size_t i = 0; i < shape.nx; ++i) {
        const auto cell =
            grid.index(static_cast<long>(i), static_cast<long>(j),
                       static_cast<long>(k));

        grid.conformation_xx[cell] =
            1.0 + (grid.conformation_xx[cell] - 1.0) * elastic_factor;
        grid.conformation_yy[cell] =
            1.0 + (grid.conformation_yy[cell] - 1.0) * elastic_factor;
        grid.conformation_zz[cell] =
            1.0 + (grid.conformation_zz[cell] - 1.0) * elastic_factor;
        grid.conformation_xy[cell] *= elastic_factor;
        grid.conformation_xz[cell] *= elastic_factor;
        grid.conformation_yz[cell] *= elastic_factor;

        if (parameters_.spin_relaxation_time > 0.0) {
          const auto vorticity =
              curl_velocity(grid, static_cast<long>(i),
                            static_cast<long>(j), static_cast<long>(k),
                            parameters_.density_floor);
          const double inertia_density =
              grid.rho[cell] * parameters_.micro_inertia;
          const Vec3 target{
              0.5 * inertia_density * vorticity.x,
              0.5 * inertia_density * vorticity.y,
              0.5 * inertia_density * vorticity.z,
          };
          grid.intrinsic_spin_x[cell] =
              target.x +
              (grid.intrinsic_spin_x[cell] - target.x) * spin_factor;
          grid.intrinsic_spin_y[cell] =
              target.y +
              (grid.intrinsic_spin_y[cell] - target.y) * spin_factor;
          grid.intrinsic_spin_z[cell] =
              target.z +
              (grid.intrinsic_spin_z[cell] - target.z) * spin_factor;
        }

        if (parameters_.phase_mobility > 0.0) {
          const double phase = old_phase[cell];
          const double double_well_derivative =
              2.0 * phase * (1.0 - phase) * (1.0 - 2.0 * phase);
          const double laplacian =
              laplacian_scalar(grid, old_phase, static_cast<long>(i),
                               static_cast<long>(j), static_cast<long>(k));
          const double rate =
              parameters_.phase_mobility *
              (parameters_.phase_interface_coefficient * laplacian -
               parameters_.phase_barrier * double_well_derivative);
          grid.cavity_phase[cell] =
              std::clamp(phase + timestep * rate, 0.0, 1.0);
        }
      }
    }
  }
}

double ReferenceSolver::maximum_stable_timestep(const TauGrid& grid) const {
  double maximum_speed = 0.0;
  for (std::size_t cell = 0; cell < grid.cell_count(); ++cell) {
    const auto primitive = primitive_at(grid, cell, parameters_);
    const double velocity =
        std::sqrt(primitive[1] * primitive[1] +
                  primitive[2] * primitive[2] +
                  primitive[3] * primitive[3]);
    maximum_speed =
        std::max(maximum_speed,
                 velocity + sound_speed(primitive, parameters_.gamma));
  }
  if (maximum_speed == 0.0) {
    return std::numeric_limits<double>::infinity();
  }
  return parameters_.cfl * grid.spacing() / maximum_speed;
}

void seed_entropy_wave(TauGrid& grid, double amplitude, double velocity_x) {
  const auto shape = grid.shape();
  constexpr double gamma = 1.4;
  constexpr double pressure = 1.0;
  for (std::size_t k = 0; k < shape.nz; ++k) {
    for (std::size_t j = 0; j < shape.ny; ++j) {
      for (std::size_t i = 0; i < shape.nx; ++i) {
        const auto cell =
            grid.index(static_cast<long>(i), static_cast<long>(j),
                       static_cast<long>(k));
        const double x = (static_cast<double>(i) + 0.5) * grid.spacing();
        const double density =
            1.0 + amplitude * std::sin(2.0 * std::numbers::pi * x);
        grid.rho[cell] = density;
        grid.momentum_x[cell] = density * velocity_x;
        grid.momentum_y[cell] = 0.0;
        grid.momentum_z[cell] = 0.0;
        grid.total_energy[cell] =
            pressure / (gamma - 1.0) +
            0.5 * density * velocity_x * velocity_x;
      }
    }
  }
}

void seed_cavity(TauGrid& grid, Vec3 center, double radius,
                 double interface_width) {
  if (!(radius > 0.0) || !(interface_width > 0.0)) {
    throw std::invalid_argument(
        "cavity radius and interface width must be positive");
  }
  const auto shape = grid.shape();
  for (std::size_t k = 0; k < shape.nz; ++k) {
    for (std::size_t j = 0; j < shape.ny; ++j) {
      for (std::size_t i = 0; i < shape.nx; ++i) {
        const auto cell =
            grid.index(static_cast<long>(i), static_cast<long>(j),
                       static_cast<long>(k));
        const double x = (static_cast<double>(i) + 0.5) * grid.spacing();
        const double y = (static_cast<double>(j) + 0.5) * grid.spacing();
        const double z = (static_cast<double>(k) + 0.5) * grid.spacing();
        const double distance =
            std::sqrt((x - center.x) * (x - center.x) +
                      (y - center.y) * (y - center.y) +
                      (z - center.z) * (z - center.z));
        grid.cavity_phase[cell] =
            0.5 * (1.0 - std::tanh((distance - radius) / interface_width));
      }
    }
  }
}

void seed_vortex(TauGrid& grid, Vec3 center, double circulation,
                 double core_radius) {
  if (!(core_radius > 0.0)) {
    throw std::invalid_argument("vortex core radius must be positive");
  }
  const auto shape = grid.shape();
  for (std::size_t k = 0; k < shape.nz; ++k) {
    for (std::size_t j = 0; j < shape.ny; ++j) {
      for (std::size_t i = 0; i < shape.nx; ++i) {
        const auto cell =
            grid.index(static_cast<long>(i), static_cast<long>(j),
                       static_cast<long>(k));
        const double x =
            (static_cast<double>(i) + 0.5) * grid.spacing() - center.x;
        const double y =
            (static_cast<double>(j) + 0.5) * grid.spacing() - center.y;
        const double radius_squared = x * x + y * y;
        const double radius_value = std::sqrt(radius_squared);
        const double tangential_speed =
            circulation * radius_value /
            (2.0 * std::numbers::pi *
             (radius_squared + core_radius * core_radius));
        const double inverse_radius =
            radius_value > 1.0e-14 ? 1.0 / radius_value : 0.0;
        const double velocity_x = -y * inverse_radius * tangential_speed;
        const double velocity_y = x * inverse_radius * tangential_speed;
        grid.momentum_x[cell] = grid.rho[cell] * velocity_x;
        grid.momentum_y[cell] = grid.rho[cell] * velocity_y;
        grid.total_energy[cell] +=
            0.5 * grid.rho[cell] *
            (velocity_x * velocity_x + velocity_y * velocity_y);
      }
    }
  }
}

double relative_residual(double initial, double final) {
  const double scale = std::max(std::abs(initial), 1.0e-30);
  return std::abs(final - initial) / scale;
}

}  // namespace taulab

