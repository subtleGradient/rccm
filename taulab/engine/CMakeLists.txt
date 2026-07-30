cmake_minimum_required(VERSION 3.25)

project(TauLabEngine VERSION 0.1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 23)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

add_library(taulab_reference
  src/solver.cpp
)

target_include_directories(taulab_reference
  PUBLIC
    ${CMAKE_CURRENT_SOURCE_DIR}/include
)

target_compile_options(taulab_reference
  PRIVATE
    -Wall
    -Wextra
    -Wpedantic
    -Wconversion
    -Wshadow
)

add_executable(taulab-cli
  src/main.cpp
)
target_link_libraries(taulab-cli PRIVATE taulab_reference)

include(CTest)
if(BUILD_TESTING)
  add_executable(taulab_solver_tests
    tests/solver_tests.cpp
  )
  target_link_libraries(taulab_solver_tests PRIVATE taulab_reference)
  add_test(NAME taulab_solver_tests COMMAND taulab_solver_tests)
endif()

if(APPLE)
  enable_language(OBJCXX)
  find_library(FOUNDATION_FRAMEWORK Foundation REQUIRED)
  find_library(METAL_FRAMEWORK Metal REQUIRED)

  add_library(taulab_metal
    src/metal_solver.mm
  )
  target_include_directories(taulab_metal
    PUBLIC
      ${CMAKE_CURRENT_SOURCE_DIR}/include
  )
  target_compile_options(taulab_metal
    PRIVATE
      -fobjc-arc
      -Wall
      -Wextra
      -Wpedantic
  )
  target_link_libraries(taulab_metal
    PUBLIC
      ${FOUNDATION_FRAMEWORK}
      ${METAL_FRAMEWORK}
  )

  if(BUILD_TESTING)
    add_executable(taulab_metal_tests
      tests/metal_solver_tests.cpp
    )
    target_link_libraries(taulab_metal_tests
      PRIVATE
        taulab_reference
        taulab_metal
    )
    add_test(NAME taulab_metal_tests COMMAND taulab_metal_tests)
    set_tests_properties(taulab_metal_tests PROPERTIES SKIP_RETURN_CODE 77)
  endif()
endif()
