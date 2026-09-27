#include "taulab/solver.hpp"

#include <algorithm>
#include <cstdlib>
#include <exception>
#include <iomanip>
#include <iostream>
#include <stdexcept>
#include <string>
#include <string_view>

namespace {

std::size_t parse_size(const char* value, std::string_view option) {
  const auto parsed = std::stoull(value);
  if (parsed == 0) throw std::invalid_argument(std::string(option) + " must be positive");
  return static_cast<std::size_t>(parsed);
}

double parse_double(const char* value, std::string_view option) {
  const double parsed = std::stod(value);
  if (!(parsed > 0.0)) throw std::invalid_argument(std::string(option) + " must be positive");
  return parsed;
}

}  // namespace

int main(int argc, char** argv) {
  try {
    std::string scenario = "entropy-wave";
    std::size_t cells = 32;
    std::size_t steps = 20;
    double timestep = 0.0;

    for (int argument = 1; argument < argc; ++argument) {
      const std::string_view option = argv[argument];
      if (option == "--scenario" && argument + 1 < argc) {
        scenario = argv[++argument];
      } else if (option == "--grid" && argument + 1 < argc) {
        cells = parse_size(argv[++argument], option);
      } else if (option == "--steps" && argument + 1 < argc) {
        steps = parse_size(argv[++argument], option);
      } else if (option == "--dt" && argument + 1 < argc) {
        timestep = parse_double(argv[++argument], option);
      } else if (option == "--help") {
        std::cout
            << "Usage: taulab-cli [--scenario entropy-wave|cavity|vortex]"
               " [--grid N] [--steps N] [--dt value]\n";
        return EXIT_SUCCESS;
      } else {
        throw std::invalid_argument("unknown or incomplete option: " +
                                    std::string(option));
      }
    }

    const double spacing = 1.0 / static_cast<double>(cells);
    auto grid =
        taulab::TauGrid::uniform({cells, cells, cells}, spacing, 1.0, 2.5, 0.0);
    taulab::SolverParameters parameters;

    if (scenario == "entropy-wave") {
      parameters.elastic_relaxation_time = 0.0;
      parameters.spin_relaxation_time = 0.0;
      parameters.phase_mobility = 0.0;
      taulab::seed_entropy_wave(grid, 0.01, 0.2);
    } else if (scenario == "cavity") {
      taulab::seed_cavity(grid, {0.5, 0.5, 0.5}, 0.15, 2.0 * spacing);
    } else if (scenario == "vortex") {
      parameters.elastic_relaxation_time = 0.0;
      parameters.phase_mobility = 0.0;
      taulab::seed_vortex(grid, {0.5, 0.5, 0.5}, 0.1, 3.0 * spacing);
    } else {
      throw std::invalid_argument("unknown scenario: " + scenario);
    }

    taulab::ReferenceSolver solver(parameters);
    if (timestep == 0.0) {
      timestep = 0.8 * solver.maximum_stable_timestep(grid);
    }

    const auto initial = grid.totals();
    solver.run(grid, timestep, steps);
    const auto final = grid.totals();

    std::cout << std::setprecision(17)
              << "{\n"
              << "  \"backend\": \"cpu-reference\",\n"
              << "  \"scenario\": \"" << scenario << "\",\n"
              << "  \"grid\": [" << cells << ", " << cells << ", " << cells
              << "],\n"
              << "  \"steps\": " << steps << ",\n"
              << "  \"timestep\": " << timestep << ",\n"
              << "  \"initialMass\": " << initial.mass << ",\n"
              << "  \"finalMass\": " << final.mass << ",\n"
              << "  \"massResidual\": "
              << taulab::relative_residual(initial.mass, final.mass) << ",\n"
              << "  \"initialEnergy\": " << initial.energy << ",\n"
              << "  \"finalEnergy\": " << final.energy << ",\n"
              << "  \"energyResidual\": "
              << taulab::relative_residual(initial.energy, final.energy)
              << ",\n"
              << "  \"minimumDensity\": " << grid.minimum_density() << ",\n"
              << "  \"minimumPressure\": "
              << grid.minimum_pressure(parameters.gamma) << ",\n"
              << "  \"stateDigest\": \"" << grid.state_digest() << "\"\n"
              << "}\n";
    return EXIT_SUCCESS;
  } catch (const std::exception& error) {
    std::cerr << "TauLab error: " << error.what() << '\n';
    return EXIT_FAILURE;
  }
}

