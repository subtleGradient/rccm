#pragma once

#include <cstddef>
#include <cstdint>
#include <memory>
#include <string>
#include <vector>

namespace taulab {

struct MetalDeviceInfo {
  std::string name;
  std::uint64_t recommended_working_set_bytes{};
  bool has_unified_memory{};
  bool supports_apple7{};
};

struct MetalLocalState {
  explicit MetalLocalState(std::size_t cells = 0);

  [[nodiscard]] std::size_t cell_count() const noexcept;

  std::vector<float> conformation_xx;
  std::vector<float> conformation_yy;
  std::vector<float> conformation_zz;
  std::vector<float> conformation_xy;
  std::vector<float> conformation_xz;
  std::vector<float> conformation_yz;
  std::vector<float> intrinsic_spin_x;
  std::vector<float> intrinsic_spin_y;
  std::vector<float> intrinsic_spin_z;
};

class MetalConstitutiveSolver {
 public:
  MetalConstitutiveSolver();
  ~MetalConstitutiveSolver();
  MetalConstitutiveSolver(MetalConstitutiveSolver&&) noexcept;
  MetalConstitutiveSolver& operator=(MetalConstitutiveSolver&&) noexcept;

  MetalConstitutiveSolver(const MetalConstitutiveSolver&) = delete;
  MetalConstitutiveSolver& operator=(const MetalConstitutiveSolver&) = delete;

  [[nodiscard]] static bool is_available() noexcept;
  [[nodiscard]] const MetalDeviceInfo& device_info() const noexcept;

  void apply_local_relaxation(MetalLocalState& state, float timestep,
                              float elastic_relaxation_time,
                              float spin_relaxation_time) const;

 private:
  class Impl;
  std::unique_ptr<Impl> impl_;
};

}  // namespace taulab
