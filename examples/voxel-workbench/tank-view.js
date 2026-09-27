import * as THREE from '../voxel-tank/vendor/three.module.js';
import { OrbitControls } from '../voxel-tank/vendor/OrbitControls.js';
import { TransformControls } from './vendor/TransformControls.js';
import { domainFor } from './fields.mjs';

export function createTankView(canvas, marks, { onElementMove = () => {} } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#1b1b1d');
  scene.fog = new THREE.Fog('#1b1b1d', 45, 140);
  const camera = new THREE.PerspectiveCamera(62, 1, .05, 300);
  camera.position.set(12, 8, 20);
  const orbit = new OrbitControls(camera, canvas);
  orbit.enableDamping = false;
  orbit.minDistance = 1;
  orbit.maxDistance = 100;
  orbit.maxPolarAngle = Math.PI * .94;
  orbit.mouseButtons = { LEFT: -1, MIDDLE: THREE.MOUSE.PAN, RIGHT: THREE.MOUSE.ROTATE };
  const transform = new TransformControls(camera, canvas);
  transform.setMode('translate');
  transform.setSpace('world');
  transform.setSize(.85);
  const transformHelper = transform.getHelper();
  scene.add(transformHelper);
  const tank = new THREE.Group(), selections = new THREE.Group(), outlines = new THREE.Group(), seams = new THREE.Group();
  tank.add(seams);
  scene.add(tank, selections, outlines);
  const tankSize = new THREE.Vector3(12, 8, 4);
  const size = new THREE.Vector3(12, 8, 1);
  const bounds = new THREE.Box3(size.clone().multiplyScalar(-.5), size.clone().multiplyScalar(.5));
  const raycaster = new THREE.Raycaster();
  const sourceGroups = new Map();
  let viewport = { width: 1, height: 1 }, visible = true, stateTexture, activeTool = 'pointer', selectedId = null;
  let domainKey = '', framed = false, directDragging = false, lastPaint = [[], null, { x: 12, y: 8, z: 1, cellSize: 1 }];

  const environment = new THREE.Scene();
  environment.background = new THREE.Color('#727779');
  for (const [width, height, position, intensity] of [[12, 4, [-5, 8, 2], 4], [3, 8, [8, 2, -5], 2]]) {
    const card = new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({ color: new THREE.Color().setScalar(intensity), side: THREE.DoubleSide }));
    card.position.set(...position); card.lookAt(0, 0, 0); environment.add(card);
  }
  const generator = new THREE.PMREMGenerator(renderer);
  const environmentMap = generator.fromScene(environment, .02);
  scene.environment = environmentMap.texture;
  generator.dispose();
  environment.traverse((object) => { object.geometry?.dispose(); object.material?.dispose(); });
  scene.add(new THREE.HemisphereLight('#e2eeee', '#34383d', 1.5));
  const key = new THREE.DirectionalLight('#e2f5fa', 2.5);
  key.position.set(-6, 12, 8); scene.add(key);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(250, 250), new THREE.MeshStandardMaterial({ color: '#202124', roughness: .95 }));
  floor.rotation.x = -Math.PI / 2; scene.add(floor);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    vertexShader: 'varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader: 'varying vec2 vUv; void main(){vec2 d=abs(vUv-.5)*2.; float a=exp(-pow(d.x*1.45,6.)-pow(d.y*1.7,4.)); gl_FragColor=vec4(0.,0.,0.,a*.6);}',
  }));
  shadow.rotation.x = -Math.PI / 2; tank.add(shadow);
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: '#20282a', roughness: .4, metalness: .35 }));
  tank.add(plinth);

  // Ray/box integration supports perspective and viewpoints inside the fluid.
  const fluidMaterial = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.BackSide,
    uniforms: { halfSize: { value: size.clone().multiplyScalar(.5) }, stateTexture: { value: null } },
    vertexShader: `varying vec3 worldPosition; varying vec3 worldNormal;
      void main(){worldPosition=(modelMatrix*vec4(position,1.)).xyz; worldNormal=normalize(mat3(modelMatrix)*normal);
      gl_Position=projectionMatrix*viewMatrix*vec4(worldPosition,1.);}`,
    fragmentShader: `uniform vec3 halfSize; uniform highp sampler3D stateTexture;
      varying vec3 worldPosition; varying vec3 worldNormal;
      void main(){
        vec3 ray=normalize(worldPosition-cameraPosition);
        vec3 direction=mix(vec3(1.),vec3(-1.),lessThan(ray,vec3(0.)))*max(abs(ray),vec3(.00001));
        vec3 t0=(-halfSize-cameraPosition)/direction, t1=(halfSize-cameraPosition)/direction;
        vec3 nearT=min(t0,t1), farT=max(t0,t1);
        float entry=max(0.,max(nearT.x,max(nearT.y,nearT.z)));
        float exitT=min(farT.x,min(farT.y,farT.z));
        float path=max(0.,exitT-entry), stepLength=path/48.;
        vec3 accumulated=vec3(0.); float remaining=1.;
        for(int i=0;i<48;i++){
          vec3 position=cameraPosition+ray*(entry+(float(i)+.5)*stepLength);
          vec3 uvw=clamp((position+halfSize)/(2.*halfSize),vec3(.0001),vec3(.9999));
          float q=texture(stateTexture,uvw).r;
          float depletion=clamp((1.-q)/.12,0.,1.);
          vec3 water=mix(vec3(.017,.14,.16),vec3(.10,.36,.38),pow(uvw.y,.7));
          water=mix(water,vec3(.001,.018,.032),pow(depletion,.8)*.96);
          float opacity=1.-exp(-stepLength*(.38+depletion*.8));
          accumulated+=remaining*opacity*water; remaining*=1.-opacity;
        }
        float opacity=1.-remaining;
        vec3 water=accumulated/max(opacity,.0001);
        float fresnel=pow(1.-abs(dot(normalize(worldNormal),ray)),4.);
        water+=vec3(.08,.12,.13)*fresnel;
        gl_FragColor=vec4(water,opacity);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const fluid = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), fluidMaterial);
  fluid.renderOrder = 2; tank.add(fluid);
  const surface = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshPhysicalMaterial({
    color: '#72aaa8', roughness: .14, metalness: .18, transparent: true, opacity: .35,
    clearcoat: 1, clearcoatRoughness: .08, envMapIntensity: 1.1, side: THREE.DoubleSide, depthWrite: false,
  }));
  surface.rotation.x = -Math.PI / 2; surface.renderOrder = 3; tank.add(surface);
  const glassMaterial = new THREE.MeshPhysicalMaterial({ color: '#c0dedc', roughness: .08, metalness: .05, transparent: true, opacity: .05, clearcoat: 1, envMapIntensity: 1.2, side: THREE.DoubleSide, depthWrite: false });
  const panes = Array.from({ length: 4 }, () => {
    const pane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), glassMaterial);
    pane.renderOrder = 4; tank.add(pane); return pane;
  });
  const selectionGeometry = new THREE.BoxGeometry(1, 1, 1), selectionEdges = new THREE.EdgesGeometry(selectionGeometry);

  function seam(points, opacity) {
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points.map((p) => new THREE.Vector3(...p))), new THREE.LineBasicMaterial({ color: '#c5e3df', transparent: true, opacity, depthWrite: false }));
    line.renderOrder = 5; seams.add(line);
  }
  function setDomain(resolution) {
    const nextKey = `${resolution.x},${resolution.y},${resolution.z},${resolution.cellSize ?? 1}`;
    if (domainKey === nextKey) return;
    domainKey = nextKey;
    size.set(...domainFor(resolution).size);
    bounds.min.copy(size).multiplyScalar(-.5); bounds.max.copy(size).multiplyScalar(.5);
    fluid.scale.copy(size); fluidMaterial.uniforms.halfSize.value.copy(size).multiplyScalar(.5);
    const x = tankSize.x / 2 + .08, z = tankSize.z / 2 + .08, bottom = -tankSize.y / 2 - .1, top = tankSize.y / 2 + .42;
    floor.position.y = bottom - .23;
    shadow.position.set(.2, bottom - .22, -.15); shadow.scale.set(tankSize.x + 5, tankSize.z + 5, 1);
    plinth.scale.set(tankSize.x + .32, .2, tankSize.z + .32); plinth.position.y = bottom - .1;
    surface.scale.set(size.x, size.z, 1); surface.position.y = size.y / 2 + .002;
    panes.forEach((pane, i) => {
      pane.scale.set(i < 2 ? x * 2 : z * 2, top - bottom, 1);
      pane.rotation.y = i < 2 ? 0 : Math.PI / 2;
      pane.position.set(i < 2 ? 0 : (i === 2 ? -x : x), (top + bottom) / 2, i < 2 ? (i === 0 ? z : -z) : 0);
    });
    seams.traverse((object) => { object.geometry?.dispose(); object.material?.dispose(); }); seams.clear();
    for (const y of [bottom, top]) seam([[-x, y, z], [x, y, z], [x, y, -z], [-x, y, -z], [-x, y, z]], y === top ? .48 : .24);
    for (const xx of [-x, x]) for (const zz of [-z, z]) seam([[xx, bottom, zz], [xx, top, zz]], .25);
    seam([[-size.x / 2, size.y / 2, size.z / 2], [size.x / 2, size.y / 2, size.z / 2], [size.x / 2, size.y / 2, -size.z / 2], [-size.x / 2, size.y / 2, -size.z / 2], [-size.x / 2, size.y / 2, size.z / 2]], .32);
    for (const { material } of sourceGroups.values()) material.uniforms.halfSize.value.copy(size).multiplyScalar(.5);
  }
  function frame(home = true) {
    const direction = home ? new THREE.Vector3(12, 8, 20).normalize() : camera.position.clone().sub(orbit.target).normalize();
    const usableAspect = Math.max(.55, (viewport.width - 365) / viewport.height);
    const halfAngle = Math.min(THREE.MathUtils.degToRad(camera.fov / 2), Math.atan(Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * usableAspect));
    const distance = tankSize.length() / 2 / Math.sin(halfAngle) * 1.08;
    orbit.target.set(0, 0, 0); camera.position.copy(direction.multiplyScalar(distance)); orbit.update();
    framed = true; repaint();
  }
  function render() { if (stateTexture) renderer.render(scene, camera); }
  function setRay(event) {
    const rect = canvas.getBoundingClientRect();
    raycaster.setFromCamera(new THREE.Vector2((event.clientX - rect.left) / rect.width * 2 - 1, 1 - (event.clientY - rect.top) / rect.height * 2), camera);
  }
  function sourceOutline(element) {
    const group = new THREE.Group(); group.userData.elementId = element.id;
    // Attenuate only the fluid between the viewer and this line fragment.
    // Front outlines remain clear; rear outlines show through the fluid.
    const material = new THREE.ShaderMaterial({
      transparent: true, depthTest: true, depthWrite: false,
      uniforms: { color: { value: new THREE.Color('#e0e4e4') }, opacity: { value: .12 }, halfSize: { value: size.clone().multiplyScalar(.5) }, stateTexture: { value: stateTexture }, tankShown: { value: visible ? 1 : 0 } },
      vertexShader: 'varying vec3 worldPosition; void main(){worldPosition=(modelMatrix*vec4(position,1.)).xyz; gl_Position=projectionMatrix*viewMatrix*vec4(worldPosition,1.);}',
      fragmentShader: `uniform vec3 color; uniform float opacity; uniform vec3 halfSize; uniform float tankShown; uniform highp sampler3D stateTexture; varying vec3 worldPosition;
        void main(){
          vec3 delta=worldPosition-cameraPosition; float distanceToLine=length(delta); vec3 ray=normalize(delta);
          vec3 direction=mix(vec3(1.),vec3(-1.),lessThan(ray,vec3(0.)))*max(abs(ray),vec3(.00001));
          vec3 t0=(-halfSize-cameraPosition)/direction, t1=(halfSize-cameraPosition)/direction;
          vec3 a=min(t0,t1), b=max(t0,t1);
          float entry=max(0.,max(a.x,max(a.y,a.z))), exitT=min(distanceToLine,min(b.x,min(b.y,b.z)));
          float path=max(0.,exitT-entry)*tankShown, attenuation=1.;
          for(int i=0;i<12;i++){
            vec3 p=cameraPosition+ray*(entry+(float(i)+.5)*path/12.);
            float q=texture(stateTexture,clamp((p+halfSize)/(2.*halfSize),vec3(.0001),vec3(.9999))).r;
            attenuation*=exp(-(path/12.)*(.22+clamp((1.-q)/.12,0.,1.)*.6));
          }
          gl_FragColor=vec4(color,opacity*attenuation);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    });
    const rings = [(a) => [Math.cos(a), Math.sin(a), 0], (a) => [0, Math.sin(a), Math.cos(a)], (a) => [Math.cos(a), 0, Math.sin(a)], (a) => [.866 * Math.cos(a), .5, .866 * Math.sin(a)], (a) => [.866 * Math.cos(a), -.5, .866 * Math.sin(a)]];
    for (const ring of rings) {
      const points = Array.from({ length: 96 }, (_, i) => new THREE.Vector3(...ring(i / 96 * Math.PI * 2)));
      const line = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points), material);
      line.renderOrder = 12; group.add(line);
    }
    outlines.add(group); sourceGroups.set(element.id, { group, material }); return { group, material };
  }
  function syncTransform() {
    const source = sourceGroups.get(selectedId);
    const canEdit = activeTool === 'pointer' && source?.group.visible;
    if (canEdit && transform.object !== source.group) transform.attach(source.group);
    if (!canEdit && transform.object) transform.detach();
    transform.enabled = Boolean(canEdit) && !directDragging; transformHelper.visible = Boolean(canEdit);
  }
  function paint(selection, hover, resolution) {
    lastPaint = [selection, hover, resolution];
    selections.traverse((object) => object.material?.dispose()); selections.clear(); marks.replaceChildren();
    const same = (a, b) => a.x === b.x && a.y === b.y && a.z === b.z;
    const addresses = selection.map((address, index) => ({ address, slot: index ? 'B' : 'A' }));
    if (hover && !selection.some((address) => same(address, hover))) addresses.push({ address: hover, slot: null });
    const cellSize = resolution.cellSize ?? 1;
    for (const { address, slot } of addresses) {
      const position = bounds.min.clone().add(new THREE.Vector3(address.x + .5, address.y + .5, address.z + .5).multiplyScalar(cellSize));
      const color = slot === 'A' ? '#a8d2ff' : slot === 'B' ? '#e9bd86' : '#ccdfdf';
      const outline = new THREE.LineSegments(selectionEdges, new THREE.LineBasicMaterial({ color, transparent: true, opacity: slot ? .9 : .35, depthTest: false, depthWrite: false }));
      outline.position.copy(position); outline.scale.setScalar(cellSize); outline.renderOrder = 10; selections.add(outline);
      if (slot) {
        const fill = new THREE.Mesh(selectionGeometry, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .045, depthWrite: false, depthTest: false }));
        fill.position.copy(position); fill.scale.setScalar(cellSize); fill.renderOrder = 9; selections.add(fill);
        const ndc = position.clone().add(new THREE.Vector3(-.5, .5, .5).multiplyScalar(cellSize)).project(camera);
        const mark = document.createElement('div'); mark.className = 'selection-mark'; mark.dataset.slot = slot; mark.textContent = slot;
        mark.style.left = `${(ndc.x + 1) / 2 * viewport.width}px`; mark.style.top = `${(1 - ndc.y) / 2 * viewport.height}px`;
        mark.hidden = ndc.z < -1 || ndc.z > 1; marks.append(mark);
      }
    }
    render();
  }
  function repaint() { paint(...lastPaint); }
  orbit.addEventListener('change', repaint);
  transform.addEventListener('change', render);
  transform.addEventListener('dragging-changed', (event) => { orbit.enabled = !event.value; });
  transform.addEventListener('objectChange', () => {
    if (transform.object) onElementMove(transform.object.userData.elementId, transform.object.position.toArray());
  });
  setDomain({ x: 12, y: 8, z: 1 });

  return {
    paint, frame,
    updateRaster(raster) {
      setDomain(raster.resolution);
      stateTexture?.dispose();
      stateTexture = new THREE.Data3DTexture(raster.texture, raster.resolution.x, raster.resolution.y, raster.resolution.z);
      stateTexture.format = THREE.RGBAFormat; stateTexture.type = THREE.FloatType;
      stateTexture.minFilter = THREE.NearestFilter; stateTexture.magFilter = THREE.NearestFilter;
      stateTexture.unpackAlignment = 1; stateTexture.needsUpdate = true;
      fluidMaterial.uniforms.stateTexture.value = stateTexture;
      for (const { material } of sourceGroups.values()) material.uniforms.stateTexture.value = stateTexture;
    },
    updateElements(elements, selectionId) {
      selectedId = selectionId;
      for (const element of elements) {
        const { group, material } = sourceGroups.get(element.id) ?? sourceOutline(element);
        group.position.set(...element.center); group.scale.setScalar(element.radius); group.visible = element.enabled;
        material.uniforms.opacity.value = element.id === selectedId ? .92 : .12;
        material.uniforms.color.value.set(element.id === selectedId ? '#f0d8af' : '#d2dddd');
      }
      syncTransform();
    },
    setTool(name) {
      activeTool = name;
      orbit.mouseButtons.LEFT = name === 'orbit' ? THREE.MOUSE.ROTATE : name === 'pan' ? THREE.MOUSE.PAN : -1;
      syncTransform(); render();
    },
    gizmoBusy() { return transform.enabled && (transform.dragging || transform.axis !== null); },
    beginDirectDrag() { directDragging = true; orbit.enabled = false; transform.enabled = false; },
    endDirectDrag() { directDragging = false; orbit.enabled = true; syncTransform(); },
    pickElement(event, elements) {
      setRay(event); let nearest = null, distance = Infinity;
      for (const element of elements) {
        if (!element.enabled) continue;
        const point = raycaster.ray.intersectSphere(new THREE.Sphere(new THREE.Vector3(...element.center), element.radius), new THREE.Vector3());
        if (point && point.distanceTo(raycaster.ray.origin) < distance) { nearest = element.id; distance = point.distanceTo(raycaster.ray.origin); }
      }
      return nearest;
    },
    pointInViewPlane(event, origin) {
      setRay(event);
      const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(camera.getWorldDirection(new THREE.Vector3()), new THREE.Vector3(...origin));
      return raycaster.ray.intersectPlane(plane, new THREE.Vector3())?.toArray() ?? null;
    },
    resize(width, height) {
      viewport = { width, height }; renderer.setSize(width, height, false);
      camera.aspect = width / height; camera.setViewOffset(width, height, 158, 0, width, height); camera.updateProjectionMatrix();
      if (!framed) frame(); else repaint();
    },
    pick(event, resolution) {
      if (!visible) return null;
      setRay(event); const point = raycaster.ray.intersectBox(bounds, new THREE.Vector3());
      if (!point) return null;
      const index = (axis) => Math.max(0, Math.min(resolution[axis] - 1, Math.floor((point[axis] - bounds.min[axis]) / (resolution.cellSize ?? 1))));
      return { x: index('x'), y: index('y'), z: index('z') };
    },
    setVisible(value) {
      visible = value; tank.visible = value; selections.visible = value;
      for (const { material } of sourceGroups.values()) material.uniforms.tankShown.value = value ? 1 : 0;
      render();
    },
  };
}
