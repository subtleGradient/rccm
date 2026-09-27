import * as THREE from '../voxel-tank/vendor/three.module.js';

// A contiguous sampling domain. Its partition has no rendered internal faces.
// Glass, absorption and studio lights describe the drawing, not the tensor state.
const size = new THREE.Vector3(12, 6.4, 4);
const center = new THREE.Vector3(0, -.18, 0);
const bounds = new THREE.Box3(center.clone().addScaledVector(size, -.5), center.clone().addScaledVector(size, .5));

export function createTankView(canvas, marks) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#1b1b1d');
  scene.fog = new THREE.Fog('#1b1b1d', 35, 85);
  const camera = new THREE.OrthographicCamera(-10, 10, 7, -7, .1, 150);
  camera.position.set(10, 7.8, 21);
  camera.lookAt(0, -.1, 0);
  const tank = new THREE.Group();
  const selections = new THREE.Group();
  scene.add(tank, selections);
  const raycaster = new THREE.Raycaster();
  let viewport = { width: 1, height: 1 };
  let visible = true;

  // Broad studio lights reflected by the water surface and glass walls.
  const environment = new THREE.Scene();
  environment.background = new THREE.Color('#727779');
  function lightCard(width, height, position, intensity) {
    const card = new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({ color: new THREE.Color().setScalar(intensity), side: THREE.DoubleSide }));
    card.position.set(...position);
    card.lookAt(0, 0, 0);
    environment.add(card);
  }
  lightCard(12, 4, [-5, 8, 2], 4);
  lightCard(3, 8, [8, 2, -5], 2);
  const generator = new THREE.PMREMGenerator(renderer);
  const environmentMap = generator.fromScene(environment, .02);
  scene.environment = environmentMap.texture;
  generator.dispose();
  environment.traverse((object) => { object.geometry?.dispose(); object.material?.dispose(); });

  scene.add(new THREE.HemisphereLight('#e2eeee', '#34383d', 1.5));
  const key = new THREE.DirectionalLight('#e2f5fa', 2.5);
  key.position.set(-6, 12, 8);
  scene.add(key);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshStandardMaterial({ color: '#202124', roughness: .95, metalness: 0 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -3.72;
  scene.add(floor);

  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(18, 10), new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    vertexShader: 'varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader: 'varying vec2 vUv; void main(){vec2 d=abs(vUv-.5)*2.; float a=exp(-pow(d.x*1.45,6.)-pow(d.y*1.7,4.)); gl_FragColor=vec4(0.,0.,0.,a*.6);}',
  }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(.3, -3.71, -.2);
  tank.add(shadow);

  const plinth = new THREE.Mesh(new THREE.BoxGeometry(12.32, .22, 4.32), new THREE.MeshStandardMaterial({ color: '#20282a', roughness: .4, metalness: .35 }));
  plinth.position.y = -3.59;
  tank.add(plinth);

  const fluidMaterial = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { halfSize: { value: size.clone().multiplyScalar(.5) } },
    vertexShader: `
      varying vec3 localPosition; varying vec3 worldPosition; varying vec3 worldNormal;
      void main(){
        localPosition=position;
        worldPosition=(modelMatrix*vec4(position,1.)).xyz;
        worldNormal=normalize(mat3(modelMatrix)*normal);
        gl_Position=projectionMatrix*viewMatrix*vec4(worldPosition,1.);
      }`,
    fragmentShader: `
      uniform vec3 halfSize;
      varying vec3 localPosition; varying vec3 worldPosition; varying vec3 worldNormal;
      void main(){
        vec3 ray=normalize(worldPosition-cameraPosition);
        vec3 safeRay=sign(ray)*max(abs(ray),vec3(.0001));
        vec3 exitDistances=(sign(ray)*halfSize-localPosition)/safeRay;
        float path=max(0.,min(exitDistances.x,min(exitDistances.y,exitDistances.z)));
        float height=clamp((localPosition.y+halfSize.y)/(2.*halfSize.y),0.,1.);
        vec3 deep=vec3(.017,.14,.16);
        vec3 shallow=vec3(.10,.36,.38);
        vec3 water=mix(deep,shallow,pow(height,.7));
        float fresnel=pow(1.-max(dot(normalize(worldNormal),-ray),0.),4.);
        water+=vec3(.16,.23,.24)*fresnel;
        float opacity=clamp(1.-exp(-path*.28),.12,.86);
        gl_FragColor=vec4(water,opacity);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const fluid = new THREE.Mesh(new THREE.BoxGeometry(...size.toArray()), fluidMaterial);
  fluid.position.copy(center);
  fluid.renderOrder = 2;
  tank.add(fluid);

  const surface = new THREE.Mesh(new THREE.PlaneGeometry(size.x, size.z), new THREE.MeshPhysicalMaterial({
    color: '#72aaa8', roughness: .14, metalness: .18, transparent: true, opacity: .48,
    clearcoat: 1, clearcoatRoughness: .08, envMapIntensity: 1.1, side: THREE.DoubleSide, depthWrite: false,
  }));
  surface.rotation.x = -Math.PI / 2;
  surface.position.y = bounds.max.y + .002;
  surface.renderOrder = 3;
  tank.add(surface);

  const glass = new THREE.MeshPhysicalMaterial({ color: '#c0dedc', roughness: .08, metalness: .05, transparent: true, opacity: .065, clearcoat: 1, envMapIntensity: 1.2, side: THREE.DoubleSide, depthWrite: false });
  const panels = [
    { size: [12.16, 7.04], position: [0, .02, 2.08], turn: 0 },
    { size: [12.16, 7.04], position: [0, .02, -2.08], turn: 0 },
    { size: [4.16, 7.04], position: [-6.08, .02, 0], turn: Math.PI / 2 },
    { size: [4.16, 7.04], position: [6.08, .02, 0], turn: Math.PI / 2 },
  ];
  for (const item of panels) {
    const pane = new THREE.Mesh(new THREE.PlaneGeometry(...item.size), glass);
    pane.position.set(...item.position);
    pane.rotation.y = item.turn;
    pane.renderOrder = 4;
    tank.add(pane);
  }

  // Only the aquarium's outer seams are drawn. There are no voxel grid lines.
  function seam(points, color, opacity, order = 5) {
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points.map((p) => new THREE.Vector3(...p))), new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false }));
    line.renderOrder = order;
    tank.add(line);
  }
  for (const y of [-3.5, 3.54]) {
    seam([[-6.08, y, 2.08], [6.08, y, 2.08], [6.08, y, -2.08], [-6.08, y, -2.08], [-6.08, y, 2.08]], '#cee7e6', y > 0 ? .48 : .24);
  }
  for (const x of [-6.08, 6.08]) for (const z of [-2.08, 2.08]) seam([[x, -3.5, z], [x, 3.54, z]], '#b7d8d5', z > 0 ? .34 : .15);
  const waterline = bounds.max.y;
  seam([[-6, waterline, 2], [6, waterline, 2], [6, waterline, -2], [-6, waterline, -2], [-6, waterline, 2]], '#a2dfdb', .34);

  const selectionGeometry = new THREE.BoxGeometry(1, 1, 1);
  const selectionEdges = new THREE.EdgesGeometry(selectionGeometry);

  function render() { renderer.render(scene, camera); }
  function project(point) {
    const ndc = point.clone().project(camera);
    return { x: (ndc.x + 1) / 2 * viewport.width, y: (1 - ndc.y) / 2 * viewport.height };
  }
  function cellBounds(address, resolution) {
    const extent = new THREE.Vector3(size.x / resolution.x, size.y / resolution.y, size.z / resolution.z);
    const position = bounds.min.clone().add(new THREE.Vector3((address.x + .5) * extent.x, (address.y + .5) * extent.y, (address.z + .5) * extent.z));
    return { extent, position };
  }
  function paint(selection, hover, resolution) {
    selections.traverse((object) => object.material?.dispose());
    selections.clear();
    marks.replaceChildren();
    const same = (a, b) => a.x === b.x && a.y === b.y && a.z === b.z;
    const addresses = selection.map((address, index) => ({ address, slot: index ? 'B' : 'A' }));
    if (hover && !selection.some((address) => same(address, hover))) addresses.push({ address: hover, slot: null });
    for (const { address, slot } of addresses) {
      const { extent, position } = cellBounds(address, resolution);
      const color = slot === 'A' ? '#a8d2ff' : slot === 'B' ? '#e9bd86' : '#ccdfdf';
      const outline = new THREE.LineSegments(selectionEdges, new THREE.LineBasicMaterial({ color, transparent: true, opacity: slot ? .9 : .35, depthTest: false, depthWrite: false }));
      outline.position.copy(position);
      outline.scale.copy(extent);
      outline.renderOrder = 10;
      selections.add(outline);
      if (slot) {
        const fill = new THREE.Mesh(selectionGeometry, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .055, depthWrite: false, depthTest: false }));
        fill.position.copy(position);
        fill.scale.copy(extent);
        fill.renderOrder = 9;
        selections.add(fill);
        const at = project(position.clone().add(new THREE.Vector3(-extent.x / 2, extent.y / 2, extent.z / 2)));
        const mark = document.createElement('div');
        mark.className = 'selection-mark';
        mark.dataset.slot = slot;
        mark.textContent = slot;
        mark.style.left = `${at.x}px`;
        mark.style.top = `${at.y}px`;
        marks.append(mark);
      }
    }
    render();
  }
  return {
    paint,
    resize(width, height) {
      viewport = { width, height };
      renderer.setSize(width, height, false);
      const aspect = width / height;
      const panelWidth = 316;
      const span = Math.max(11.4, 14 * height / Math.max(400, width - panelWidth - 90));
      const offset = panelWidth / 2 / height * span;
      camera.left = -span * aspect / 2 + offset;
      camera.right = span * aspect / 2 + offset;
      camera.top = span / 2;
      camera.bottom = -span / 2;
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld();
    },
    pick(event, resolution) {
      if (!visible) return null;
      const rect = canvas.getBoundingClientRect();
      raycaster.setFromCamera(new THREE.Vector2((event.clientX - rect.left) / rect.width * 2 - 1, 1 - (event.clientY - rect.top) / rect.height * 2), camera);
      const point = raycaster.ray.intersectBox(bounds, new THREE.Vector3());
      if (!point) return null;
      const index = (axis) => Math.max(0, Math.min(resolution[axis] - 1, Math.floor((point[axis] - bounds.min[axis]) / size[axis] * resolution[axis])));
      return { x: index('x'), y: index('y'), z: index('z') };
    },
    setVisible(value) { visible = value; tank.visible = value; selections.visible = value; render(); },
  };
}
