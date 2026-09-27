#include "taulab/metal_solver.hpp"

#import <Foundation/Foundation.h>
#import <Metal/Metal.h>

#include <algorithm>
#include <array>
#include <cmath>
#include <cstring>
#include <stdexcept>
#include <utility>

namespace taulab {
namespace {

constexpr std::size_t kFieldCount = 9;

constexpr char kRelaxationKernel[] = R"METAL(
#include <metal_stdlib>
using namespace metal;

struct RelaxationParameters {
  float elasticFactor;
  float spinFactor;
  uint cellCount;
  uint padding;
};

kernel void relaxLocalState(
    device float* fields [[buffer(0)]],
    constant RelaxationParameters& parameters [[buffer(1)]],
    uint cell [[thread_position_in_grid]]) {
  if (cell >= parameters.cellCount) {
    return;
  }

  const uint count = parameters.cellCount;
  fields[0 * count + cell] =
      1.0f + (fields[0 * count + cell] - 1.0f) * parameters.elasticFactor;
  fields[1 * count + cell] =
      1.0f + (fields[1 * count + cell] - 1.0f) * parameters.elasticFactor;
  fields[2 * count + cell] =
      1.0f + (fields[2 * count + cell] - 1.0f) * parameters.elasticFactor;
  fields[3 * count + cell] *= parameters.elasticFactor;
  fields[4 * count + cell] *= parameters.elasticFactor;
  fields[5 * count + cell] *= parameters.elasticFactor;
  fields[6 * count + cell] *= parameters.spinFactor;
  fields[7 * count + cell] *= parameters.spinFactor;
  fields[8 * count + cell] *= parameters.spinFactor;
}
)METAL";

std::string error_message(NSString* context, NSError* error) {
  const NSString* detail =
      error == nil ? @"unknown Metal error" : error.localizedDescription;
  return std::string(context.UTF8String) + ": " +
         std::string(detail.UTF8String);
}

void validate_state(const MetalLocalState& state) {
  const std::size_t cells = state.cell_count();
  const std::array<const std::vector<float>*, kFieldCount> fields{
      &state.conformation_xx,  &state.conformation_yy,
      &state.conformation_zz,  &state.conformation_xy,
      &state.conformation_xz,  &state.conformation_yz,
      &state.intrinsic_spin_x, &state.intrinsic_spin_y,
      &state.intrinsic_spin_z,
  };
  if (!std::ranges::all_of(
          fields, [cells](const auto* field) { return field->size() == cells; })) {
    throw std::invalid_argument(
        "MetalLocalState fields must have identical cell counts");
  }
}

struct alignas(16) RelaxationParameters {
  float elastic_factor;
  float spin_factor;
  std::uint32_t cell_count;
  std::uint32_t padding{};
};

static_assert(sizeof(RelaxationParameters) == 16);

}  // namespace

MetalLocalState::MetalLocalState(std::size_t cells)
    : conformation_xx(cells, 1.0F),
      conformation_yy(cells, 1.0F),
      conformation_zz(cells, 1.0F),
      conformation_xy(cells),
      conformation_xz(cells),
      conformation_yz(cells),
      intrinsic_spin_x(cells),
      intrinsic_spin_y(cells),
      intrinsic_spin_z(cells) {}

std::size_t MetalLocalState::cell_count() const noexcept {
  return conformation_xx.size();
}

class MetalConstitutiveSolver::Impl {
 public:
  Impl() {
    @autoreleasepool {
      device_ = MTLCreateSystemDefaultDevice();
      if (device_ == nil) {
        throw std::runtime_error("no Metal device is visible");
      }

      MTLCompileOptions* options = [[MTLCompileOptions alloc] init];
      options.languageVersion = MTLLanguageVersion3_0;
      NSError* library_error = nil;
      NSString* source = [NSString stringWithUTF8String:kRelaxationKernel];
      id<MTLLibrary> library =
          [device_ newLibraryWithSource:source
                                options:options
                                  error:&library_error];
      if (library == nil) {
        throw std::runtime_error(
            error_message(@"could not compile relaxation kernel",
                          library_error));
      }

      id<MTLFunction> function =
          [library newFunctionWithName:@"relaxLocalState"];
      if (function == nil) {
        throw std::runtime_error(
            "compiled Metal library does not contain relaxLocalState");
      }

      NSError* pipeline_error = nil;
      pipeline_ = [device_ newComputePipelineStateWithFunction:function
                                                         error:&pipeline_error];
      if (pipeline_ == nil) {
        throw std::runtime_error(
            error_message(@"could not create relaxation pipeline",
                          pipeline_error));
      }

      queue_ = [device_ newCommandQueue];
      if (queue_ == nil) {
        throw std::runtime_error("could not create Metal command queue");
      }

      info_.name = std::string(device_.name.UTF8String);
      info_.recommended_working_set_bytes =
          static_cast<std::uint64_t>(device_.recommendedMaxWorkingSetSize);
      info_.has_unified_memory = device_.hasUnifiedMemory;
      info_.supports_apple7 = [device_ supportsFamily:MTLGPUFamilyApple7];
    }
  }

  [[nodiscard]] const MetalDeviceInfo& device_info() const noexcept {
    return info_;
  }

  void apply(MetalLocalState& state, float timestep,
             float elastic_relaxation_time,
             float spin_relaxation_time) const {
    validate_state(state);
    if (!(timestep >= 0.0F) || !std::isfinite(timestep)) {
      throw std::invalid_argument(
          "Metal constitutive timestep must be finite and nonnegative");
    }
    if (!(elastic_relaxation_time > 0.0F) ||
        !(spin_relaxation_time > 0.0F)) {
      throw std::invalid_argument(
          "Metal relaxation times must be finite and positive");
    }
    if (!std::isfinite(elastic_relaxation_time) ||
        !std::isfinite(spin_relaxation_time)) {
      throw std::invalid_argument(
          "Metal relaxation times must be finite and positive");
    }

    const std::size_t cells = state.cell_count();
    if (cells == 0) return;
    if (cells > std::numeric_limits<std::uint32_t>::max()) {
      throw std::length_error("Metal local state exceeds uint32 cell indexing");
    }

    std::vector<float> packed(kFieldCount * cells);
    const std::array<const std::vector<float>*, kFieldCount> source_fields{
        &state.conformation_xx,  &state.conformation_yy,
        &state.conformation_zz,  &state.conformation_xy,
        &state.conformation_xz,  &state.conformation_yz,
        &state.intrinsic_spin_x, &state.intrinsic_spin_y,
        &state.intrinsic_spin_z,
    };
    for (std::size_t field = 0; field < source_fields.size(); ++field) {
      std::ranges::copy(*source_fields[field],
                        packed.begin() +
                            static_cast<std::ptrdiff_t>(field * cells));
    }

    @autoreleasepool {
      const NSUInteger byte_count = packed.size() * sizeof(float);
      id<MTLBuffer> buffer =
          [device_ newBufferWithBytes:packed.data()
                              length:byte_count
                             options:MTLResourceStorageModeShared];
      if (buffer == nil) {
        throw std::runtime_error(
            "Metal could not allocate the local-state buffer");
      }

      const RelaxationParameters parameters{
          .elastic_factor =
              std::exp(-timestep / elastic_relaxation_time),
          .spin_factor = std::exp(-timestep / spin_relaxation_time),
          .cell_count = static_cast<std::uint32_t>(cells),
      };

      id<MTLCommandBuffer> command_buffer = [queue_ commandBuffer];
      id<MTLComputeCommandEncoder> encoder =
          [command_buffer computeCommandEncoder];
      if (command_buffer == nil || encoder == nil) {
        throw std::runtime_error("Metal could not create a compute command");
      }

      [encoder setComputePipelineState:pipeline_];
      [encoder setBuffer:buffer offset:0 atIndex:0];
      [encoder setBytes:&parameters
                 length:sizeof(parameters)
                atIndex:1];
      const NSUInteger width =
          std::min<NSUInteger>(pipeline_.maxTotalThreadsPerThreadgroup, 256);
      [encoder dispatchThreads:MTLSizeMake(cells, 1, 1)
          threadsPerThreadgroup:MTLSizeMake(width, 1, 1)];
      [encoder endEncoding];
      [command_buffer commit];
      [command_buffer waitUntilCompleted];

      if (command_buffer.status == MTLCommandBufferStatusError) {
        throw std::runtime_error(
            error_message(@"Metal relaxation dispatch failed",
                          command_buffer.error));
      }
      std::memcpy(packed.data(), buffer.contents, byte_count);
    }

    const std::array<std::vector<float>*, kFieldCount> destination_fields{
        &state.conformation_xx,  &state.conformation_yy,
        &state.conformation_zz,  &state.conformation_xy,
        &state.conformation_xz,  &state.conformation_yz,
        &state.intrinsic_spin_x, &state.intrinsic_spin_y,
        &state.intrinsic_spin_z,
    };
    for (std::size_t field = 0; field < destination_fields.size(); ++field) {
      std::copy_n(packed.begin() +
                      static_cast<std::ptrdiff_t>(field * cells),
                  cells, destination_fields[field]->begin());
    }
  }

 private:
  id<MTLDevice> device_;
  id<MTLComputePipelineState> pipeline_;
  id<MTLCommandQueue> queue_;
  MetalDeviceInfo info_;
};

MetalConstitutiveSolver::MetalConstitutiveSolver()
    : impl_(std::make_unique<Impl>()) {}

MetalConstitutiveSolver::~MetalConstitutiveSolver() = default;
MetalConstitutiveSolver::MetalConstitutiveSolver(
    MetalConstitutiveSolver&&) noexcept = default;
MetalConstitutiveSolver& MetalConstitutiveSolver::operator=(
    MetalConstitutiveSolver&&) noexcept = default;

bool MetalConstitutiveSolver::is_available() noexcept {
  @autoreleasepool {
    return MTLCreateSystemDefaultDevice() != nil;
  }
}

const MetalDeviceInfo& MetalConstitutiveSolver::device_info() const noexcept {
  return impl_->device_info();
}

void MetalConstitutiveSolver::apply_local_relaxation(
    MetalLocalState& state, float timestep, float elastic_relaxation_time,
    float spin_relaxation_time) const {
  impl_->apply(state, timestep, elastic_relaxation_time,
               spin_relaxation_time);
}

}  // namespace taulab
