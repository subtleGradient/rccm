import * as THREE from "three";
import {
  ExperimentClock,
  createExperiment,
  MAGNET,
  COIL,
  DT,
  axisAngle,
  multiply,
} from "./induction.js";
const $ = (id) => document.getElementById(id),
  fmt = (x, n = 3) =>
    (Math.abs(x) < 0.5 * 10 ** -n ? 0 : x).toFixed(n).replace("-", "−");
const slider = (id, label, min, max, step, value) =>
  `<label class="range-label" for="${id}"><span>${label}</span><output id="${id}-value">${value}</output></label><input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${value}">`;
export class InductionUI {
  constructor(state, view, hooks) {
    this.state = state;
    this.view = view;
    this.hooks = hooks;
    this.clock = new ExperimentClock();
    this.renderAge = 0;
    this.uiAge = 0;
    state.inductionDisplay = {
      coil: true,
      sheet: "change",
      reaction: false,
      free: false,
    };
    document
      .querySelector(".presets")
      .insertAdjacentHTML(
        "afterbegin",
        '<button type="button" class="preset" id="induction-preset" data-preset="induction"><span class="preset-number">06</span><span><strong>Induction</strong><small>Motion into light</small></span></button>',
      );
    document
      .querySelector(".lens-strip")
      .insertAdjacentHTML(
        "afterend",
        `<div class="induction-tools induction-only"><button class="button primary" id="ind-demo" type="button">▷ Demo sweep</button><button class="button" id="ind-hold" type="button">Hold magnet</button><button class="button" id="ind-pause" type="button">Ⅱ Pause event</button><button class="button" id="ind-free" type="button" aria-pressed="false">Explore freely</button></div>`,
      );
    document
      .querySelector(".scene-foot")
      .insertAdjacentHTML(
        "afterend",
        `<div class="induction-timeline induction-only"><div class="time-heading"><span id="ind-event-status">Waiting for motion · 0.00 s</span><div><button class="button quiet" id="ind-live" type="button">Return live</button><button class="button quiet" id="ind-replay" type="button">Play recording</button><select id="ind-speed" aria-label="Recording playback speed"><option value=".25">Replay ¼×</option><option value=".5">Replay ½×</option><option value="1" selected>Replay 1×</option></select></div></div><input id="ind-history" type="range" min="0" max="0" value="0" step="1" aria-label="Scrub last 30 recorded seconds"><div class="history-labels"><span id="ind-history-start">0.00 s</span><span>Recorded time · idle gaps skipped</span><span id="ind-history-end">0.00 s</span></div></div>`,
      );
    document
      .querySelector(".layer-list")
      .insertAdjacentHTML(
        "afterend",
        `<section class="induction-only induction-layers"><label class="layer" for="ind-coil"><span class="layer-symbol coil-symbol">⟳</span><span><strong>Coil response</strong><small>Twist created by the current</small></span><input id="ind-coil" type="checkbox" checked></label><label class="select-label" for="ind-sheet">Magnet through the opening<select id="ind-sheet"><option value="change">Change in threading</option><option value="flux">Magnet threading</option><option value="off">Hide inspection sheet</option></select></label><label class="toggle-row reaction-toggle" for="ind-reaction"><span>Reaction force & torque axis</span><input id="ind-reaction" type="checkbox"></label></section><section class="control-section induction-only"><div class="section-heading"><h3>Move the magnet</h3><span class="quiet-label">Relative units</span></div>${slider("ind-x", "Along the coil axis", -1.35, 1.35, 0.01, -1.25)}<div id="ind-free-controls" hidden>${slider("ind-y", "Y position", -1.3, 1.3, 0.01, 0)}${slider("ind-z", "Z position", -1.3, 1.3, 0.01, 0)}${slider("ind-rx", "Roll", -180, 180, 1, 0)}${slider("ind-ry", "Pitch", -180, 180, 1, 0)}${slider("ind-rz", "Yaw", -180, 180, 1, 0)}</div><div class="ind-config"><button type="button" class="button" id="ind-poles">Reverse poles</button><label class="select-label" for="ind-circuit">Circuit configuration<select id="ind-circuit"><option value="closed">Closed · bulb connected</option><option value="open">Open · no loop current</option></select></label></div><p class="aside-note">Changing the circuit or reversing poles starts a fresh recording. In free mode: arrows move X/Y, W/S move depth; Shift + arrows rotate.</p></section>`,
      );
    document
      .querySelector(".inspector-tabs")
      .insertAdjacentHTML(
        "afterbegin",
        '<button type="button" id="ind-inspect" class="induction-only" data-inspector="induction">Experiment</button>',
      );
    $("voxel-inspector").insertAdjacentHTML(
      "beforebegin",
      `<div id="ind-inspector" class="induction-only"><div class="experiment-caption"><span class="eyebrow">Magnet → medium → circuit</span><p id="ind-caption">Move the magnet through the opening.</p></div><div class="causal-chain"><div><i class="swatch twist"></i><span>Magnet threading</span><strong id="ind-flux">0.000</strong></div><div><i class="swatch positive"></i><span>Induced drive · magnet</span><strong id="ind-emf">0.000</strong></div><div><i class="swatch current"></i><span>Conventional current</span><strong id="ind-current">0.000</strong></div><div><i class="swatch heat"></i><span>Filament temperature</span><strong id="ind-temperature">0.000</strong></div></div><p class="aside-note">Signed readings show direction. Either current direction heats the filament. All values use relative units.</p><section class="control-section"><div class="section-heading"><h3>Work into warmth</h3><span class="quiet-label">Since reset</span></div><dl class="ledger energy-ledger"><div><dt>Work supplied</dt><dd id="ind-work"></dd></div><div><dt>Stored magnetic energy</dt><dd id="ind-storage"></dd></div><div><dt>Dissipated heat</dt><dd id="ind-heat"></dd></div><div><dt>Balance error</dt><dd id="ind-balance"></dd></div></dl></section><details class="ind-equations"><summary>Model & readings</summary><p>EMF = −dΦmagnet / dt<br>L dI/dt + RI = EMF<br>Filament heating = I²Rbulb</p><p>The drive reading comes from the moving magnet. Gold trails show the total electric response, including the coil’s self-induction. Their circulation around the conductor equals RI. The medium uses a fixed background capacity. Conductor surface charges and microscopic conduction are outside this model.</p><p>Tensor adapter: e = E, b = −B, c = 1. Twist rings here follow conventional B; the tensor inspector preserves its signed convention.</p></details></div>`,
    );
    $("guide")
      .querySelector("dl")
      .insertAdjacentHTML(
        "afterbegin",
        "<dt>Induction: movement into light</dt><dd>Move the magnet through the coil opening, then hold it still nearby. Violet rings read the magnet’s twist; teal rings read the coil’s response. Gold trails show the electric push on positive charge, including outside the wire. Circuit chevrons show conventional current. The filament warms with either current direction.</dd><dt>Hold, pause, replay</dt><dd>Hold stops the magnet while the circuit and filament settle. Pause event preserves velocity, electric response, current and heat at that instant. Animated readout marks keep illustrating that saved state. Recording starts with motion and keeps the circuit response and afterglow. After two quiet seconds it pauses automatically; moving again resumes it. The simulation keeps settling while recording waits. Scrub the last 30 recorded seconds, with idle gaps skipped, then return live to edit. Playback speed changes viewing time only.</dd>",
      );
    this.original = {
      note: document.querySelector(".mode-note").innerHTML,
      hint: $("stage-hint").textContent,
      legend: $("field-legend").innerHTML,
    };
    $("induction-preset").addEventListener("click", () => this.activate());
    document
      .querySelectorAll("[data-preset]:not(#induction-preset)")
      .forEach((b) => b.addEventListener("click", () => this.leave()));
    $("ind-inspect").addEventListener("click", () => this.selectInspector());
    document
      .querySelectorAll("[data-inspector]:not(#ind-inspect)")
      .forEach((b) =>
        b.addEventListener("click", () => {
          $("ind-inspector").hidden = true;
        }),
      );
    $("ind-demo").addEventListener("click", () => {
      const polarity = this.clock.current.pose.polarity;
      this.clock.reset(this.clock.current.closed, {
        position: [-1.25, 0, 0],
        quaternion: [0, 0, 0, 1],
        polarity,
      });
      this.setFree(false);
      this.clock.demo = true;
      this.clock.demoStart = 0;
      this.refresh();
    });
    $("ind-hold").addEventListener("click", () => {
      this.clock.hold();
      this.refresh();
    });
    $("ind-pause").addEventListener("click", () => {
      if (this.clock.playback) {
        this.clock.playback = false;
        this.clock.paused = true;
      } else if (this.clock.paused) this.clock.live();
      else this.clock.pause();
      this.refresh();
    });
    $("ind-live").addEventListener("click", () => {
      this.clock.live();
      this.refresh();
    });
    $("ind-replay").addEventListener("click", () => {
      const c = this.clock;
      if (!c.paused || c.cursor >= c.history.length - 1) c.scrub(0);
      c.playback = true;
      c.paused = true;
      this.refresh();
    });
    $("ind-history").addEventListener("input", (e) => {
      this.clock.scrub(+e.target.value);
      this.refresh();
    });
    $("ind-speed").addEventListener(
      "change",
      (e) => (this.clock.speed = +e.target.value),
    );
    $("ind-free").addEventListener("click", () =>
      this.setFree(!state.inductionDisplay.free),
    );
    $("ind-poles").addEventListener("click", () => {
      const pose = structuredClone(this.clock.current.pose),
        closed = this.clock.current.closed,
        free = state.inductionDisplay.free;
      pose.polarity *= -1;
      this.clock.reset(closed);
      this.clock.current = createExperiment(pose, closed);
      this.clock.target = structuredClone(pose);
      this.clock.history = [this.clock.current];
      this.setFree(free);
      this.refresh();
    });
    $("ind-circuit").addEventListener("change", (e) => {
      this.clock.reset(e.target.value === "closed", this.clock.current.pose);
      this.refresh();
    });
    $("ind-coil").addEventListener("change", (e) => {
      state.inductionDisplay.coil = e.target.checked;
      view.sync();
    });
    $("ind-sheet").addEventListener("change", (e) => {
      state.inductionDisplay.sheet = e.target.value;
      view.inductionVisuals?.update();
      view.dirty = true;
    });
    $("ind-reaction").addEventListener("change", (e) => {
      state.inductionDisplay.reaction = e.target.checked;
      view.inductionVisuals?.update();
      view.dirty = true;
    });
    for (const [i, axis] of ["x", "y", "z"].entries())
      $("ind-" + axis).addEventListener("input", (e) => {
        if (!this.canMove()) return;
        const pose = structuredClone(this.clock.target);
        pose.position[i] = +e.target.value;
        this.clock.setTarget(pose);
      });
    for (const axis of ["x", "y", "z"])
      $("ind-r" + axis).addEventListener("input", () => {
        if (!this.canMove()) return;
        const e = new THREE.Euler(
            ...["x", "y", "z"].map(
              (a) => (+$("ind-r" + a).value * Math.PI) / 180,
            ),
            "XYZ",
          ),
          pose = structuredClone(this.clock.target);
        pose.quaternion = new THREE.Quaternion().setFromEuler(e).toArray();
        this.clock.setTarget(pose);
      });
    $("tank").tabIndex = 0;
    $("tank").setAttribute(
      "aria-label",
      "Tau tank. Drag magnet, or use arrow keys to move. In free mode W/S change depth and Shift plus arrows rotate.",
    );
    $("tank").addEventListener("keydown", (e) => this.key(e));
  }
  canMove() {
    return (
      this.state.preset === "induction" &&
      !this.clock.paused &&
      !this.clock.playback
    );
  }
  setFree(free) {
    if (!this.canMove() && this.state.preset === "induction") return;
    const wasFree = this.state.inductionDisplay.free;
    this.state.inductionDisplay.free = free;
    this.clock.free = free;
    this.clock.demo = false;
    if (!free && wasFree) {
      const polarity = this.clock.current.pose.polarity;
      this.clock.reset(this.clock.current.closed);
      this.clock.current = createExperiment(
        { ...this.clock.current.pose, polarity },
        this.clock.current.closed,
      );
      this.clock.target = structuredClone(this.clock.current.pose);
      this.clock.history = [this.clock.current];
    }
    this.view.inductionVisuals?.sync();
    this.updateUI();
  }
  target(position) {
    if (!this.canMove()) return;
    const pose = structuredClone(this.clock.target);
    pose.position = this.state.inductionDisplay.free
      ? position.slice()
      : [position[0], 0, 0];
    pose.position = pose.position.map((x) =>
      Math.max(-1.35, Math.min(1.35, x)),
    );
    this.clock.setTarget(pose);
  }
  key(e) {
    if (
      !this.canMove() ||
      ![
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "w",
        "s",
        "W",
        "S",
      ].includes(e.key)
    )
      return;
    e.preventDefault();
    const free = this.state.inductionDisplay.free,
      p = structuredClone(this.clock.target),
      sign = ["ArrowLeft", "ArrowDown", "s", "S"].includes(e.key) ? -1 : 1;
    if (free && e.shiftKey) {
      const axis =
        e.key.includes("Left") || e.key.includes("Right")
          ? [0, 1, 0]
          : [0, 0, 1];
      p.quaternion = multiply(axisAngle(axis, sign * 0.15), p.quaternion);
    } else {
      const axis = free
        ? ["w", "s", "W", "S"].includes(e.key)
          ? 2
          : e.key.includes("Up") || e.key.includes("Down")
            ? 1
            : 0
        : 0;
      p.position[axis] = Math.max(
        -1.35,
        Math.min(1.35, p.position[axis] + sign * 0.12),
      );
    }
    this.clock.setTarget(p);
  }
  activate() {
    const s = this.state;
    if (s.preset !== "induction")
      this.studioDisplay = { opacity: s.opacity, layers: { ...s.layers } };
    s.preset = "induction";
    s.induction = this.clock.snapshot;
    s.sources = [
      {
        id: "induction-magnet",
        name: "Magnet",
        shape: "magnet",
        size: MAGNET.size,
        position: s.induction.pose.position.slice(),
        quaternion: s.induction.pose.quaternion.slice(),
        charge: 0,
        mass: 0,
        moment: 1,
        angle: 0,
      },
    ];
    s.selected = 0;
    s.opacity = 0.23;
    s.layers = { flow: false, slip: true, spin: true };
    document.body.classList.add("induction-scene");
    $("scene-title").textContent = "Motion into light";
    document.querySelector(".eyebrow").textContent = "Induction laboratory";
    document
      .querySelector("#budget-bar")
      .previousElementSibling.querySelector("h3").textContent =
      "Fixed reference budget";
    document.querySelector(".stage-scale").lastChild.textContent =
      " relative scale";
    document
      .querySelectorAll("[data-preset]")
      .forEach((b) =>
        b.setAttribute(
          "aria-pressed",
          String(b.dataset.preset === "induction"),
        ),
      );
    document.querySelector(".mode-note").innerHTML =
      '<span class="mono">Induction model</span><p>Fixed background medium. Move the magnet to supply work; inspect how the response reaches the filament.</p>';
    document.querySelector('label[for="spin"] strong').textContent =
      "Magnet twist";
    document.querySelector('label[for="slip"] strong').textContent =
      "Electric response";
    $("field-legend").innerHTML =
      '<span><i class="swatch twist"></i>Magnet</span><span><i class="swatch coil"></i>Coil</span><span><i class="swatch positive"></i>Electric push</span>';
    this.view.rebuild();
    this.hooks.syncDisplay();
    this.selectInspector();
    this.updateUI();
  }
  leave() {
    if (this.studioDisplay) {
      this.state.opacity = this.studioDisplay.opacity;
      this.state.layers = { ...this.studioDisplay.layers };
      this.hooks.syncDisplay();
      this.view.sync();
    }
    document.body.classList.remove("induction-scene");
    document
      .querySelector("#budget-bar")
      .previousElementSibling.querySelector("h3").textContent =
      "Pressure budget";
    $("ind-inspector").hidden = true;
    this.hooks.setInspector("voxel");
    document.querySelector(".frozen-label").innerHTML =
      '<span class="pause-symbol">Ⅱ</span> State frozen';
    document.querySelector(".mode-note").innerHTML = this.original.note;
    $("stage-hint").textContent = this.original.hint;
    document.querySelector('label[for="spin"] strong').textContent =
      "Vorticity";
    document.querySelector('label[for="slip"] strong').textContent =
      "Transverse slip";
    document.querySelector(".stage-scale").lastChild.textContent = " 1 m";
    document.querySelector(".eyebrow").textContent = "Observation volume";
    $("field-legend").innerHTML = this.original.legend;
  }
  selectInspector() {
    this.hooks.setInspector("induction");
    $("ind-inspector").hidden = false;
  }
  frame(dt) {
    if (this.state.preset !== "induction") return;
    const old = this.clock.snapshot;
    this.clock.advance(dt);
    this.state.induction = this.clock.snapshot;
    this.renderAge += dt;
    this.uiAge += dt;
    if (this.renderAge >= 1 / 30 && old !== this.clock.snapshot) {
      this.view.refreshInduction();
      this.renderAge = 0;
    }
    if (this.uiAge > 0.12) {
      this.updateUI();
      this.hooks.inspect();
      this.uiAge = 0;
    }
  }
  refresh() {
    this.state.induction = this.clock.snapshot;
    this.view.refreshInduction();
    this.updateUI();
    this.hooks.inspect();
  }
  updateUI() {
    if (this.state.preset !== "induction") return;
    const c = this.clock,
      s = c.snapshot,
      free = this.state.inductionDisplay.free,
      frozen = c.paused || c.playback;
    $("ind-free").setAttribute("aria-pressed", String(free));
    $("ind-free").textContent = free ? "Return to guide" : "Explore freely";
    $("ind-free-controls").hidden = !free;
    for (const id of [
      "ind-x",
      "ind-y",
      "ind-z",
      "ind-rx",
      "ind-ry",
      "ind-rz",
      "ind-poles",
      "ind-circuit",
      "ind-free",
      "ind-hold",
    ])
      $(id).disabled = frozen;
    for (const [i, a] of ["x", "y", "z"].entries()) {
      if (document.activeElement !== $("ind-" + a))
        $("ind-" + a).value = s.pose.position[i];
      $("ind-" + a + "-value").textContent = fmt(s.pose.position[i], 2);
    }
    const e = new THREE.Euler().setFromQuaternion(
      new THREE.Quaternion(...s.pose.quaternion),
      "XYZ",
    );
    for (const [i, a] of ["x", "y", "z"].entries()) {
      const degrees = (e.toArray()[i] * 180) / Math.PI;
      if (document.activeElement !== $("ind-r" + a))
        $("ind-r" + a).value = degrees;
      $("ind-r" + a + "-value").textContent = fmt(degrees, 0) + "°";
    }
    $("ind-circuit").value = s.closed ? "closed" : "open";
    $("ind-pause").textContent = c.playback
      ? "Ⅱ Pause replay"
      : c.paused
        ? "Resume live"
        : "Ⅱ Pause event";
    $("ind-live").disabled = !frozen;
    $("ind-replay").disabled = c.history.length < 2;
    $("ind-speed").disabled = !frozen;
    $("ind-history").max = c.history.length - 1;
    $("ind-history").value = c.cursor;
    $("ind-history-start").textContent = fmt(c.historyStartTime, 2) + " s";
    $("ind-history-end").textContent = fmt(c.recordedTime, 2) + " s";
    $("ind-event-status").textContent =
      (c.playback
        ? "Replay"
        : c.paused
          ? "Paused snapshot"
          : c.recording
            ? "Recording"
            : c.recordedSteps
              ? "Recording paused"
              : "Waiting for motion") +
      " · " +
      fmt(frozen ? c.historyStartTime + c.cursor * DT : c.recordedTime, 2) +
      " s";
    document.querySelector(".frozen-label").textContent = c.playback
      ? "Recording playback"
      : c.paused
        ? "Event paused"
        : c.recording
          ? "Event recording"
          : "Recorder waiting";
    const moving = Math.hypot(...s.velocity, ...s.angular) > 0.015,
      lit = s.temperature > 0.015;
    $("ind-caption").textContent =
      c.blocked && !frozen
        ? "The apparatus blocks that path. Move around it."
        : !s.closed
          ? moving
            ? "Electric circulation persists outside the open circuit. Loop current stays zero."
            : "Circuit open. Move the magnet to see electric circulation without loop current."
          : moving
            ? Math.abs(s.emf) < 0.005
              ? "The magnet is moving, but threading is momentarily unchanged."
              : "Changing magnetic threading drives electric circulation."
            : lit
              ? "The magnet is still. Current settles; the filament cools."
              : "Move the magnet through the opening. Then hold it still while it is still close.";
    $("stage-hint").textContent = c.playback
      ? "Replaying recorded state · markers have their own clock"
      : frozen
        ? "Snapshot held · field markers still read this moment"
        : free
          ? "Drag magnet · arrows X/Y · W/S depth · Shift + arrows rotate"
          : "Drag magnet through the opening · arrows move it · drag fluid to orbit";
    for (const [id, value] of [
      ["flux", s.linkage],
      ["emf", s.emf],
      ["current", s.current],
      ["temperature", s.temperature],
      ["work", s.work],
      ["storage", s.magneticEnergy],
      ["heat", s.heat],
      ["balance", s.work - s.magneticEnergy - s.heat],
    ])
      $("ind-" + id).textContent = fmt(value);
  }
}
