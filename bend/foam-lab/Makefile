BEND ?= bend
PYTHON ?= python3
SOURCES := $(wildcard *.bend)
ENV := BEND_NO_TELEMETRY=1

.PHONY: all run test smoke screenshots benchmark

all: .build/foam

.build:
	mkdir -p .build

.build/foam: $(SOURCES) | .build
	$(ENV) $(BEND) main.bend -o $@

.build/capture: $(SOURCES) | .build
	$(ENV) $(BEND) capture.bend -o $@

.build/smoke: $(SOURCES) | .build
	$(ENV) $(BEND) smoke.bend -o $@

.build/benchmark: $(SOURCES) | .build
	$(ENV) $(BEND) benchmark.bend -o $@

.build/backend-frame: $(SOURCES) | .build
	$(ENV) $(BEND) backend-frame.bend -o $@

run: .build/foam
	./.build/foam $(ARGS)

test: .build/backend-frame | .build
	$(ENV) $(BEND) PROOF.bend
	$(ENV) $(BEND) ../asymmetric-metric-tensor/PROOF.bend
	$(ENV) $(BEND) field-tests.bend -o .build/field-tests
	./.build/field-tests --threads 1
	./.build/field-tests --threads 4
	$(ENV) $(BEND) ink-tests.bend
	$(ENV) $(BEND) render-tests.bend
	$(ENV) $(BEND) session-tests.bend
	$(PYTHON) parity.py
	$(ENV) $(BEND) main.bend --check-only
	$(ENV) $(BEND) capture.bend --check-only

smoke: .build/smoke
	./.build/smoke

screenshots: .build/capture
	$(ENV) $(PYTHON) capture.py --bend "$(BEND)"

benchmark: .build/benchmark
	@echo "CPU 1 thread: render plus full image checksum, milliseconds"
	./.build/benchmark --gpu off --threads 1
	@echo "CPU 4 threads: same workload"
	./.build/benchmark --gpu off --threads 4
	@echo "Default GPU path, if available: same workload"
	./.build/benchmark
