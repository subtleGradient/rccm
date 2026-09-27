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

add_library(taulab_demo
  src/demo.cpp
)
target_include_directories(taulab_demo
  PUBLIC
    ${CMAKE_CURRENT_SOURCE_DIR}/include
)
target_link_libraries(taulab_demo PUBLIC taulab_reference)
target_compile_options(taulab_demo
  PRIVATE
    -Wall
    -Wextra
    -Wpedantic
    -Wconversion
    -Wshadow
)

add_executable(taulab-demo
  src/demo_main.cpp
)
target_link_libraries(taulab-demo PRIVATE taulab_demo)

include(CTest)
if(BUILD_TESTING)
  add_executable(taulab_solver_tests
    tests/solver_tests.cpp
  )
  target_link_libraries(taulab_solver_tests PRIVATE taulab_reference)
  add_test(NAME taulab_solver_tests COMMAND taulab_solver_tests)

  add_executable(taulab_demo_tests
    tests/demo_tests.cpp
  )
  target_link_libraries(taulab_demo_tests PRIVATE taulab_demo)
  add_test(NAME taulab_demo_tests COMMAND taulab_demo_tests)
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
  target_link_libraries(taulab_demo PUBLIC taulab_metal)
  target_compile_definitions(taulab_demo PRIVATE TAULAB_HAS_METAL=1)

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
else()
  target_compile_definitions(taulab_demo PRIVATE TAULAB_HAS_METAL=0)
endif()
