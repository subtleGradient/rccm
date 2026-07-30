#include "taulab/demo.hpp"

#include <cstdlib>
#include <exception>
#include <iostream>
#include <string_view>

#if defined(__unix__) || defined(__APPLE__)
#include <unistd.h>
#endif

namespace {

bool terminal_supports_color() {
  if (std::getenv("NO_COLOR") != nullptr) return false;
#if defined(__unix__) || defined(__APPLE__)
  return isatty(STDOUT_FILENO) != 0;
#else
  return false;
#endif
}

}  // namespace

int main(int argc, char** argv) {
  try {
    bool use_color = terminal_supports_color();
    for (int argument = 1; argument < argc; ++argument) {
      const std::string_view option = argv[argument];
      if (option == "--no-color") {
        use_color = false;
      } else if (option == "--help") {
        std::cout << "Usage: taulab-demo [--no-color]\n";
        return EXIT_SUCCESS;
      } else {
        std::cerr << "TauLab demo error: unknown option " << option << '\n';
        return EXIT_FAILURE;
      }
    }

    const auto report = taulab::run_demo_experiments();
    std::cout << taulab::render_demo_report(report, use_color);
    return report.passed() ? EXIT_SUCCESS : EXIT_FAILURE;
  } catch (const std::exception& error) {
    std::cerr << "TauLab demo error: " << error.what() << '\n';
    return EXIT_FAILURE;
  }
}
