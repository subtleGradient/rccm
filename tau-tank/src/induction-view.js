import * as THREE from "three";
import {
  COIL,
  BULB,
  LEADS,
  magnetField,
  reaction,
  axisAngle,
  multiply,
} from "./induction.js";
const color = { spin: 0xbca2ff, coil: 0x6be3c5, slip: 0xffde85 };
const v = (a) => new THREE.Vector3(...a);
export class InductionVisuals {
  constructor(tank, shaders) {
    this.tank = tank;
    this.shaders = shaders;
    this.root = new THREE.Group();
    tank.scene.add(this.root);
    this.labels = [];
    this.channels = {};
    this.makeRig();
    this.makeGlyphs();
    this.makeSheet();
    this.makeElectricTraces();
    this.force = new THREE.ArrowHelper(
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(),
      0.5,
      0xffc67f,
      0.12,
      0.065,
    );
    this.torque = new THREE.ArrowHelper(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(),
      0.5,
      0x75ddc3,
      0.12,
      0.065,
    );
    this.root.add(this.force, this.torque);
  }
  rim(c, opacity) {
    return new THREE.ShaderMaterial({
      vertexShader: this.shaders.bubbleVertex,
      fragmentShader: this.shaders.bubbleFragment,
      uniforms: {
        uColor: { value: new THREE.Color(c) },
        uSelected: { value: opacity ?? 0 },
      },
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
  }
  tube(points, radius, c, segments = 100) {
    const curve = new THREE.CatmullRomCurve3(points.map(v)),
      mesh = new THREE.Mesh(
        new THREE.TubeGeometry(curve, segments, radius, 8, false),
        this.rim(c),
      );
    mesh.renderOrder = 5;
    this.root.add(mesh);
    return curve;
  }
  label(text, position, cls = "") {
    const el = document.createElement("span");
    el.className = "rig-label " + cls;
    el.textContent = text;
    this.tank.labels.appendChild(el);
    this.labels.push({ el, position: v(position) });
  }
  makeRig() {
    const points = Array.from({ length: 481 }, (_, i) => {
      const t = i / 480,
        a = -Math.PI / 2 + t * Math.PI * 2 * COIL.turns;
      return [
        -0.12 + t * 0.24,
        COIL.radius * Math.cos(a),
        COIL.radius * Math.sin(a),
      ];
    });
    this.tube(points, 0.026, 0xc0a7ff, 480);
    this.tube([[0.12, -0.72, 0], LEADS[0][0]], 0.021, 0xb4d4c3, 8);
    this.tube([LEADS[1][0], [-0.12, -0.72, 0]], 0.021, 0xb4d4c3, 8);
    this.tube(LEADS[0], 0.021, 0xb4d4c3, 48);
    this.tube(
      [LEADS[1][0], LEADS[1][1], [0.68, -1.52, 0.06]],
      0.021,
      0xb4d4c3,
      32,
    );
    this.tube([[0.89, -1.52, 0.06], ...LEADS[1].slice(2)], 0.021, 0xb4d4c3, 24);
    this.switchArm = new THREE.Group();
    this.switchArm.position.set(0.68, -1.52, 0.06);
    this.root.add(this.switchArm);
    const arm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.022, 0.21, 12),
      this.rim(0xf2d792),
    );
    arm.rotation.z = -Math.PI / 2;
    arm.position.x = 0.105;
    this.switchArm.add(arm);
    for (const x of [0.68, 0.89]) {
      const contact = new THREE.Mesh(
        new THREE.SphereGeometry(0.031, 12, 8),
        new THREE.MeshBasicMaterial({ color: 0xbed2bf }),
      );
      contact.position.set(x, -1.52, 0.06);
      this.root.add(contact);
    }
    this.label("CIRCUIT CLOSED", [0.75, -1.84, 0.34], "switch-label");
    const glass = new THREE.Mesh(
      new THREE.SphereGeometry(BULB.radius, 40, 28),
      this.rim(0xf5d6a2),
    );
    glass.position.fromArray(BULB.position);
    glass.renderOrder = 5;
    this.root.add(glass);
    const socket = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.12, 24),
      this.rim(0xb7cbbf),
    );
    socket.position.set(1.05, -1.43, 0);
    this.root.add(socket);
    const filament = Array.from({ length: 120 }, (_, i) => {
      const t = i / 119;
      return [
        1.05 + 0.045 * Math.cos(t * Math.PI * 16),
        -1.12 + 0.045 * Math.sin(t * Math.PI * 16),
        -0.17 + t * 0.34,
      ];
    });
    this.tube([LEADS[0].at(-1), filament[0]], 0.01, 0xcfb990, 12);
    this.tube([filament.at(-1), LEADS[1].at(-1)], 0.01, 0xcfb990, 12);
    const fc = new THREE.CatmullRomCurve3(filament.map(v));
    this.filament = new THREE.Mesh(
      new THREE.TubeGeometry(fc, 160, 0.012, 6, false),
      new THREE.MeshBasicMaterial({
        color: 0x594434,
        transparent: true,
        depthWrite: false,
      }),
    );
    this.filament.renderOrder = 7;
    this.root.add(this.filament);
    const glowMaterial = new THREE.ShaderMaterial({
      uniforms: { uHeat: { value: 0 } },
      vertexShader:
        "varying vec2 vUv;void main(){vUv=uv;vec4 p=modelViewMatrix*vec4(0.,0.,0.,1.);p.xy+=position.xy;gl_Position=projectionMatrix*p;}",
      fragmentShader:
        "varying vec2 vUv;uniform float uHeat;void main(){float d=length(vUv-.5)*2.;gl_FragColor=vec4(1.,.63+.3*uHeat,.2+.65*uHeat,exp(-d*d*7.)*uHeat*.8);}",
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.glow = new THREE.Mesh(
      new THREE.PlaneGeometry(1.15, 1.15),
      glowMaterial,
    );
    this.glow.position.fromArray(BULB.position);
    this.glow.renderOrder = 8;
    this.root.add(this.glow);
    for (const [p, size] of [
      [
        [0, -1.83, 0],
        [2.96, 0.13, 0.48],
      ],
      [
        [0, -1.28, 0],
        [0.11, 1, 0.11],
      ],
    ]) {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(...size),
        this.rim(0xaccbbb),
      );
      mesh.position.fromArray(p);
      this.root.add(mesh);
      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(mesh.geometry),
        new THREE.LineBasicMaterial({
          color: 0xa2bdb0,
          transparent: true,
          opacity: 0.2,
        }),
      );
      edges.position.copy(mesh.position);
      this.root.add(edges);
    }
    this.rail = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        v([-1.65, 0, 0]),
        v([1.65, 0, 0]),
      ]),
      new THREE.LineDashedMaterial({
        color: 0xadbdcb,
        dashSize: 0.035,
        gapSize: 0.06,
        transparent: true,
        opacity: 0.35,
      }),
    );
    this.rail.computeLineDistances();
    this.root.add(this.rail);
    this.label("FIXED COIL · 5 TURNS", [0, 0.95, 0]);
    this.label("FILAMENT", [1.05, -0.77, 0], "bulb-label");
    const loop = [
      ...points,
      ...LEADS[0],
      ...filament,
      ...LEADS[1].slice().reverse(),
      points[0],
    ];
    // These arrows are a circuit reading; they do not claim microscopic carrier trajectories.
    this.currentPath = new THREE.CatmullRomCurve3(
      loop.map(v),
      true,
      "centripetal",
    );
    this.currentPositions = new Float32Array(90 * 12);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.BufferAttribute(this.currentPositions, 3).setUsage(
        THREE.DynamicDrawUsage,
      ),
    );
    this.currentMarks = new THREE.LineSegments(
      geo,
      new THREE.LineBasicMaterial({
        color: 0xffe5a2,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    );
    this.currentMarks.renderOrder = 7;
    this.currentMarks.frustumCulled = false;
    this.root.add(this.currentMarks);
  }
  makeGlyphs() {
    const t = this.tank,
      n = t.state.resolution,
      stride = Math.max(1, Math.ceil(n / 13)),
      h = 4 / n;
    this.samples = t.samples.filter(
      (s) => s.x % stride === 0 && s.y % stride === 0 && s.z % stride === 0,
    );
    for (const [key, kind] of [
      ["slip", 1],
      ["spin", 2],
      ["coil", 2],
    ]) {
      const g = new THREE.BufferGeometry(),
        positions = new Float32Array(this.samples.flatMap((s) => s.p)),
        directions = new Float32Array(positions.length),
        strength = new Float32Array(this.samples.length),
        seeds = new Float32Array(
          this.samples.map((s, i) => ((i * 73) % 997) / 997),
        );
      g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      g.setAttribute(
        "aDirection",
        new THREE.BufferAttribute(directions, 3).setUsage(
          THREE.DynamicDrawUsage,
        ),
      );
      g.setAttribute(
        "aStrength",
        new THREE.BufferAttribute(strength, 1).setUsage(THREE.DynamicDrawUsage),
      );
      g.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
      const mat = new THREE.ShaderMaterial({
        uniforms: {
          ...t.uniforms,
          uTime: { value: 0 },
          uCell: { value: h },
          uKind: { value: kind },
          uPixelRatio: { value: t.renderer.getPixelRatio() },
          uGain: { value: 0.7 },
          uColor: { value: new THREE.Color(color[key]) },
        },
        vertexShader: this.shaders.particleVertex,
        fragmentShader: this.shaders.particleFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.NormalBlending,
      });
      const mesh = new THREE.Points(g, mat);
      mesh.frustumCulled = false;
      mesh.renderOrder = 4;
      t.fieldGroup.add(mesh);
      t.particles[key] = mesh;
      this.channels[key] = { mesh, directions, strength };
      if (kind === 2) {
        const ringSamples = this.samples.filter(
            (s) =>
              s.x % (stride * 3) === 0 &&
              s.y % (stride * 3) === 0 &&
              s.z % (stride * 3) === 0,
          ),
          rp = [],
          angles = [];
        for (const s of ringSamples)
          for (let j = 0; j < 16; j++) {
            rp.push(...s.p, ...s.p);
            angles.push((j / 16) * Math.PI * 2, ((j + 1) / 16) * Math.PI * 2);
          }
        const rg = new THREE.BufferGeometry();
        rg.setAttribute("position", new THREE.Float32BufferAttribute(rp, 3));
        rg.setAttribute("aAngle", new THREE.Float32BufferAttribute(angles, 1));
        rg.setAttribute(
          "aDirection",
          new THREE.BufferAttribute(new Float32Array(rp.length), 3).setUsage(
            THREE.DynamicDrawUsage,
          ),
        );
        rg.setAttribute(
          "aStrength",
          new THREE.BufferAttribute(
            new Float32Array(angles.length),
            1,
          ).setUsage(THREE.DynamicDrawUsage),
        );
        const rm = new THREE.ShaderMaterial({
          uniforms: {
            ...t.uniforms,
            uCell: { value: h },
            uColor: { value: new THREE.Color(color[key]) },
            uGain: { value: 0.2 },
          },
          vertexShader: `attribute float aAngle;attribute vec3 aDirection;attribute float aStrength;uniform float uCell;varying float strength;varying vec3 point;void main(){vec3 d=aDirection;vec3 ref=abs(d.y)>.9?vec3(1.,0.,0.):vec3(0.,1.,0.);vec3 a=normalize(cross(d,ref)),b=cross(d,a);point=position+uCell*.28*(cos(aAngle)*a+sin(aAngle)*b);strength=aStrength;gl_Position=projectionMatrix*modelViewMatrix*vec4(point,1.);}`,
          fragmentShader: `uniform vec3 uColor;uniform float uGain;varying float strength;varying vec3 point;${this.shaders.common}void main(){gl_FragColor=vec4(uColor,clamp(uGain*min(strength*3.,1.),0.,1.)*focus(point)*step(0.,cavity(point)));}`,
          transparent: true,
          depthWrite: false,
        });
        const rings = new THREE.LineSegments(rg, rm);
        rings.frustumCulled = false;
        rings.renderOrder = 3;
        t.fieldGroup.add(rings);
        this.channels[key].rings = rings;
        this.channels[key].ringSamples = ringSamples;
      }
    }
  }
  makeElectricTraces() {
    const count = 6 * 150 * 2,
      g = new THREE.BufferGeometry();
    g.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(count * 3), 3).setUsage(
        THREE.DynamicDrawUsage,
      ),
    );
    g.setAttribute(
      "aStrength",
      new THREE.BufferAttribute(new Float32Array(count), 1).setUsage(
        THREE.DynamicDrawUsage,
      ),
    );
    this.electricTraces = new THREE.LineSegments(
      g,
      new THREE.ShaderMaterial({
        uniforms: { ...this.tank.uniforms, uGain: { value: 0.3 } },
        vertexShader:
          "attribute float aStrength;varying float strength;varying vec3 point;void main(){strength=aStrength;point=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
        fragmentShader: `uniform float uGain;varying float strength;varying vec3 point;${this.shaders.common}void main(){gl_FragColor=vec4(1.,.84,.46,clamp(uGain*min(strength*4.,1.),0.,1.)*focus(point)*step(0.,cavity(point)));}`,
        transparent: true,
        depthWrite: false,
      }),
    );
    this.electricTraces.frustumCulled = false;
    this.electricTraces.renderOrder = 4;
    this.root.add(this.electricTraces);
  }
  updateElectricTraces() {
    const t = this.tank,
      n = t.state.resolution,
      h = 4 / n,
      samples = t.samples,
      positions = this.electricTraces.geometry.attributes.position,
      strengths = this.electricTraces.geometry.attributes.aStrength;
    let cursor = 0;
    const interpolate = (p) => {
      const a = p.map((x) => (x + 2) / h - 0.5),
        lo = a.map((x) => Math.max(0, Math.min(n - 2, Math.floor(x)))),
        f = a.map((x, i) => Math.max(0, Math.min(1, x - lo[i]))),
        out = [0, 0, 0];
      for (let z = 0; z < 2; z++)
        for (let y = 0; y < 2; y++)
          for (let x = 0; x < 2; x++) {
            const w =
                (x ? f[0] : 1 - f[0]) *
                (y ? f[1] : 1 - f[1]) *
                (z ? f[2] : 1 - f[2]),
              e = samples[lo[0] + x + n * (lo[1] + y + n * (lo[2] + z))].r.E;
            for (let k = 0; k < 3; k++) out[k] += e[k] * w;
          }
      return out;
    };
    for (const x of [-0.4, 0, 0.4])
      for (const r of [0.48, 0.96]) {
        let p = [x, 0, r];
        for (let j = 0; j < 150; j++) {
          const e = interpolate(p),
            mag = Math.hypot(...e);
          if (mag < 0.00001 || p.some((x) => Math.abs(x) > 1.93)) break;
          const end = p.map((x, i) => x + (e[i] / mag) * 0.038);
          positions.array.set([...p, ...end], cursor * 3);
          strengths.array[cursor++] = mag;
          strengths.array[cursor++] = mag;
          p = end;
        }
      }
    this.electricTraces.geometry.setDrawRange(0, cursor);
    positions.needsUpdate = true;
    strengths.needsUpdate = true;
  }
  makeSheet() {
    const g = new THREE.CircleGeometry(COIL.radius * 0.985, 48, 0, Math.PI * 2);
    g.rotateY(Math.PI / 2);
    // Subdivide in rings so the field map shows local patches rather than a single average.
    const pos = [],
      values = [];
    for (let j = 0; j < 48; j++)
      for (let r = 0; r < 12; r++) {
        const a = (j / 48) * Math.PI * 2,
          b = ((j + 1) / 48) * Math.PI * 2,
          lo = (r / 12) * COIL.radius,
          hi = ((r + 1) / 12) * COIL.radius;
        for (const [rad, ang] of [
          [lo, a],
          [hi, a],
          [hi, b],
          [lo, a],
          [hi, b],
          [lo, b],
        ]) {
          pos.push(0.002, rad * Math.cos(ang), rad * Math.sin(ang));
          values.push(0);
        }
      }
    g.dispose();
    const grid = new THREE.BufferGeometry();
    grid.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    grid.setAttribute("aValue", new THREE.Float32BufferAttribute(values, 1));
    this.sheet = new THREE.Mesh(
      grid,
      new THREE.ShaderMaterial({
        uniforms: { ...this.tank.uniforms },
        vertexShader:
          "attribute float aValue;varying float value;varying vec3 point;void main(){value=aValue;point=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
        fragmentShader: `varying float value;varying vec3 point;${this.shaders.common}void main(){if(cavity(point)<0.)discard;vec3 col=value>=0.?vec3(.72,.62,1.):vec3(.35,.8,.92);float a=.025+min(abs(value)*.23,.36);gl_FragColor=vec4(col,a*focus(point));}`,
        side: THREE.DoubleSide,
        transparent: true,
        depthWrite: false,
      }),
    );
    this.sheet.renderOrder = 3;
    this.root.add(this.sheet);
    const unique = new Map();
    for (let i = 0; i < pos.length / 3; i++) {
      const p = pos.slice(i * 3, i * 3 + 3),
        key = p.join(",");
      let cell = unique.get(key);
      if (!cell) {
        cell = { p, indices: [] };
        unique.set(key, cell);
      }
      cell.indices.push(i);
    }
    this.sheetSamples = [...unique.values()];
  }
  update() {
    const t = this.tank,
      s = t.state.induction;
    for (const [key, c] of Object.entries(this.channels)) {
      const field = (r) =>
          key === "slip" ? r.E : key === "spin" ? r.magnetB : r.coilB,
        gain = key === "slip" ? 2.5 : 3;
      this.samples.forEach((sample, i) => {
        const vec = field(sample.r),
          mag = Math.hypot(...vec);
        c.directions.set(
          mag > 1e-10 ? vec.map((x) => x / mag) : [1, 0, 0],
          i * 3,
        );
        c.strength[i] = sample.r.inside ? 0 : mag * gain;
      });
      c.mesh.geometry.attributes.aDirection.needsUpdate = true;
      c.mesh.geometry.attributes.aStrength.needsUpdate = true;
      if (c.rings) {
        const dir = c.rings.geometry.attributes.aDirection,
          st = c.rings.geometry.attributes.aStrength;
        c.ringSamples.forEach((sample, i) => {
          const vec = field(sample.r),
            mag = Math.hypot(...vec),
            d = mag > 1e-10 ? vec.map((x) => x / mag) : [1, 0, 0];
          for (let j = 0; j < 32; j++) {
            dir.array.set(d, (i * 32 + j) * 3);
            st.array[i * 32 + j] = sample.r.inside ? 0 : mag * gain;
          }
        });
        dir.needsUpdate = true;
        st.needsUpdate = true;
      }
    }
    this.updateElectricTraces();
    if (t.state.inductionDisplay.sheet !== "off") {
      const a = this.sheet.geometry.attributes.aValue,
        changing = t.state.inductionDisplay.sheet === "change",
        still =
          Math.hypot(...s.velocity, ...s.angular) < 1e-12 &&
          Math.abs(s.currentDerivative) < 1e-12;
      if (changing && still) a.array.fill(0);
      else
        for (const { p, indices } of this.sheetSamples) {
          const value = changing
            ? magneticRate(p, s, 0.001)
            : magnetField(p, s.pose).B[0];
          for (const i of indices) a.array[i] = value;
        }
      a.needsUpdate = true;
    }
    this.switchArm.rotation.z = s.closed ? 0 : 0.85;
    this.labels.find((l) =>
      l.el.classList.contains("switch-label"),
    ).el.textContent = s.closed ? "CIRCUIT CLOSED" : "CIRCUIT OPEN";
    const hot = 1 - Math.exp(-s.temperature * 5),
      warm = Math.min(1, s.temperature * 9);
    this.filament.material.color.setRGB(
      0.25 + 0.75 * warm,
      0.07 + 0.87 * hot,
      0.025 + 0.66 * hot,
    );
    this.glow.material.uniforms.uHeat.value = hot;
    if (t.state.inductionDisplay.reaction) {
      const r = reaction(s);
      for (const [arrow, vec] of [
        [this.force, r.force],
        [this.torque, r.torque],
      ]) {
        const mag = Math.hypot(...vec);
        arrow.visible = mag > 1e-5;
        arrow.position.fromArray(s.pose.position);
        if (mag > 1e-5) {
          arrow.setDirection(v(vec).normalize());
          arrow.setLength(Math.min(0.8, Math.sqrt(mag) * 1.2), 0.1, 0.06);
        }
      }
    }
    this.sync();
  }
  sync() {
    const s = this.tank.state,
      d = s.inductionDisplay;
    this.electricTraces.visible = s.layers.slip;
    this.electricTraces.material.uniforms.uGain.value =
      s.grain * (s.lens === "slip" ? 0.8 : s.lens === "combined" ? 0.42 : 0.1);
    this.rail.visible = !d.free;
    this.sheet.visible = d.sheet !== "off";
    if (!d.reaction) {
      this.force.visible = false;
      this.torque.visible = false;
    }
    for (const [key, c] of Object.entries(this.channels)) {
      const visible = key === "coil" ? d.coil : s.layers[key],
        focus =
          s.lens === "combined"
            ? 1
            : s.lens === "slip"
              ? key === "slip"
                ? 1
                : 0.1
              : s.lens === "spin"
                ? key !== "slip"
                  ? 1
                  : 0.12
                : 0.3;
      c.mesh.visible = visible;
      c.mesh.material.uniforms.uGain.value = s.grain * focus;
      if (c.rings) {
        c.rings.visible = visible;
        c.rings.material.uniforms.uGain.value = s.grain * focus * 0.32;
      }
    }
  }
  animate(time) {
    const s = this.tank.state.induction,
      I = s.current,
      intensity = Math.min(1, Math.abs(I) * 12);
    this.currentMarks.visible = intensity > 0.0001;
    this.currentMarks.material.opacity = intensity * 0.95;
    if (this.currentMarks.visible)
      for (let i = 0; i < 90; i++) {
        const sign = Math.sign(I),
          u = (((i / 90 + time * 0.055 * sign) % 1) + 1) % 1,
          p = this.currentPath.getPointAt(u),
          d = this.currentPath.getTangentAt(u).multiplyScalar(sign),
          eye = this.tank.camera.position.clone().sub(p).normalize(),
          side = new THREE.Vector3().crossVectors(d, eye).normalize(),
          tip = p.clone().addScaledVector(d, 0.024),
          base = p.clone().addScaledVector(d, -0.024);
        this.currentPositions.set(
          [
            ...base.clone().addScaledVector(side, 0.015).toArray(),
            ...tip.toArray(),
            ...tip.toArray(),
            ...base.clone().addScaledVector(side, -0.015).toArray(),
          ],
          i * 12,
        );
      }
    this.currentMarks.geometry.attributes.position.needsUpdate = true;
    const rect = this.tank.canvas.getBoundingClientRect();
    for (const label of this.labels) {
      const p = label.position.clone().project(this.tank.camera);
      label.el.style.left = (p.x * 0.5 + 0.5) * rect.width + "px";
      label.el.style.top = (-p.y * 0.5 + 0.5) * rect.height + "px";
      label.el.hidden = p.z > 1;
    }
  }
  dispose() {
    for (const { el } of this.labels) el.remove();
    this.tank.scene.remove(this.root);
    this.root.traverse((o) => {
      o.geometry?.dispose();
      o.material?.dispose();
    });
  }
}
function magneticRate(p, s, h) {
  const plus = {
      ...s.pose,
      position: s.pose.position.map((x, i) => x + s.velocity[i] * h),
      quaternion: multiply(axisAngle(s.angular, h), s.pose.quaternion),
    },
    minus = {
      ...s.pose,
      position: s.pose.position.map((x, i) => x - s.velocity[i] * h),
      quaternion: multiply(axisAngle(s.angular, -h), s.pose.quaternion),
    };
  return (magnetField(p, plus).B[0] - magnetField(p, minus).B[0]) / (2 * h);
}
