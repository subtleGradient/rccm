.PHONY: demo demo-build demo-test

TAULAB_DEMO_BUILD := taulab/build/demo

demo: demo-build
	@$(TAULAB_DEMO_BUILD)/taulab-demo

demo-build:
	@command -v cmake >/dev/null || { \
		echo "TauLab needs CMake 3.25 or newer to build the demo."; \
		exit 1; \
	}
	@echo "Building a small RCCM-v0 universe..."
	@cmake -S taulab/engine -B $(TAULAB_DEMO_BUILD) \
		-DCMAKE_BUILD_TYPE=Release >/dev/null
	@cmake --build $(TAULAB_DEMO_BUILD) --parallel \
		--target taulab-demo >/dev/null

demo-test:
	@cmake -S taulab/engine -B $(TAULAB_DEMO_BUILD) \
		-DCMAKE_BUILD_TYPE=Release >/dev/null
	@cmake --build $(TAULAB_DEMO_BUILD) --parallel >/dev/null
	@ctest --test-dir $(TAULAB_DEMO_BUILD) --output-on-failure

