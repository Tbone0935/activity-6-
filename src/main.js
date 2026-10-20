import * as THREE from "three";
import "./style.css";

const game = document.querySelector("#game");
const loading = document.querySelector("#loading");
const startScreen = document.querySelector("#start-screen");
const gameOverScreen = document.querySelector("#game-over-screen");
const startButton = document.querySelector("#start-button");
const restartButton = document.querySelector("#restart-button");
const scoreElement = document.querySelector("#score");
const coinElement = document.querySelector("#coins");
const bestElement = document.querySelector("#best-score");
const finalScoreElement = document.querySelector("#final-score");
const finalCoinsElement = document.querySelector("#final-coins");
const soundButton = document.querySelector("#sound-button");

const lanes = [-2.35, 0, 2.35];
const clock = new THREE.Clock();
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 34, 112);

const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 150);
camera.position.set(0, 5.1, 10.6);
camera.lookAt(0, 1.0, -10);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.35;
game.prepend(renderer.domElement);
renderer.domElement.id = "scene";
renderer.domElement.setAttribute("aria-label", "3D endless runner game");

scene.add(new THREE.HemisphereLight(0x8894d9, 0x11101c, 2.0));

const moonLight = new THREE.DirectionalLight(0xd7caff, 3.2);
moonLight.position.set(-5, 12, 5);
moonLight.castShadow = true;
moonLight.shadow.mapSize.set(1024, 1024);
moonLight.shadow.camera.left = -11;
moonLight.shadow.camera.right = 11;
moonLight.shadow.camera.top = 16;
moonLight.shadow.camera.bottom = -7;
scene.add(moonLight);

const pinkLight = new THREE.PointLight(0xd451ff, 26, 34, 2);
pinkLight.position.set(-4, 5, -15);
scene.add(pinkLight);

const tealLight = new THREE.PointLight(0x32f5d0, 24, 27, 2);
tealLight.position.set(5, 4, -25);
scene.add(tealLight);

const material = (color, roughness = 0.65, metalness = 0.1, extra = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
const roadMaterial = material(0x242438, 0.9);
const pavementMaterial = material(0x333048, 0.95);
const laneMaterial = new THREE.MeshBasicMaterial({ color: 0x7c70a9, transparent: true, opacity: 0.64 });

const road = new THREE.Mesh(new THREE.BoxGeometry(9.1, 0.3, 102), roadMaterial);
road.position.set(0, -0.2, -43);
road.receiveShadow = true;
scene.add(road);

const ground = new THREE.Mesh(new THREE.PlaneGeometry(240, 180), material(0x121322, 1));
ground.rotation.x = -Math.PI / 2;
ground.position.set(0, -0.37, -40);
ground.receiveShadow = true;
scene.add(ground);

const laneDashes = [];
for (let lane = 0; lane < 2; lane += 1) {
  const x = lanes[lane] + 1.175;
  for (let index = 0; index < 20; index += 1) {
    const dash = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.012, 1.65), laneMaterial);
    dash.position.set(x, -0.04, -89 + index * 5);
    scene.add(dash);
    laneDashes.push(dash);
  }
}

const edgeMaterial = new THREE.MeshBasicMaterial({ color: 0x4d3c81 });
for (const x of [-4.53, 4.53]) {
  const edge = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.02, 102), edgeMaterial);
  edge.position.set(x, -0.03, -43);
  scene.add(edge);
}

const skyline = new THREE.Group();
const buildingMaterials = [
  material(0x20233d, 0.85, 0.1, { emissive: 0x080b1a }),
  material(0x282239, 0.9, 0.1, { emissive: 0x10081b }),
  material(0x202b3f, 0.9, 0.1, { emissive: 0x07131b }),
];

for (const side of [-1, 1]) {
  for (let index = 0; index < 28; index += 1) {
    const width = 1.3 + Math.random() * 2;
    const height = 4 + Math.random() * 13;
    const building = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, 2.6 + Math.random() * 3),
      buildingMaterials[Math.floor(Math.random() * buildingMaterials.length)],
    );
    building.position.set(side * (7 + Math.random() * 10), height / 2 - 0.3, -90 + index * 4.8);
    building.rotation.y = (Math.random() - 0.5) * 0.15;
    skyline.add(building);

    const windowMaterial = new THREE.MeshBasicMaterial({
      color: Math.random() > 0.5 ? 0x67e9d4 : 0xed78d8,
      transparent: true,
      opacity: 0.5 + Math.random() * 0.35,
    });
    for (let row = 0; row < Math.floor(height / 1.3); row += 2) {
      const window = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.09, 0.025), windowMaterial);
      window.position.set(
        building.position.x - side * (width / 2 + 0.016),
        0.6 + row * 0.66,
        building.position.z + (Math.random() - 0.5) * 1.7,
      );
      skyline.add(window);
    }
  }
}
scene.add(skyline);

const starPositions = [];
for (let index = 0; index < 450; index += 1) {
  starPositions.push((Math.random() - 0.5) * 140, 8 + Math.random() * 45, -110 + Math.random() * 100);
}
const starGeometry = new THREE.BufferGeometry();
starGeometry.setAttribute("position", new THREE.Float32BufferAttribute(starPositions, 3));
const stars = new THREE.Points(
  starGeometry,
  new THREE.PointsMaterial({ color: 0xd7d4ff, size: 0.13, transparent: true, opacity: 0.8 }),
);
scene.add(stars);

const runner = new THREE.Group();
const runnerSuit = material(0x17192b, 0.4, 0.3);
const runnerGlow = material(0x62f5cf, 0.25, 0.25, { emissive: 0x0b664d, emissiveIntensity: 1.4 });
const runnerPurple = material(0xc179ff, 0.3, 0.3, { emissive: 0x531a8e, emissiveIntensity: 0.7 });
const skin = material(0xd9a482, 0.75);
const head = new THREE.Mesh(new THREE.SphereGeometry(0.235, 18, 14), skin);
head.position.y = 1.8;
head.castShadow = true;
runner.add(head);

const torso = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.76, 0.4), runnerSuit);
torso.position.y = 1.14;
torso.castShadow = true;
runner.add(torso);

const chestStripe = new THREE.Mesh(new THREE.BoxGeometry(0.57, 0.075, 0.415), runnerGlow);
chestStripe.position.set(0, 1.29, 0);
runner.add(chestStripe);

const visor = new THREE.Mesh(
  new THREE.BoxGeometry(0.34, 0.105, 0.045),
  new THREE.MeshBasicMaterial({ color: 0x9dffeb }),
);
visor.position.set(0, 1.83, -0.185);
runner.add(visor);

const leftArm = new THREE.Group();
leftArm.position.set(-0.39, 1.37, 0);
const rightArm = new THREE.Group();
rightArm.position.set(0.39, 1.37, 0);
for (const arm of [leftArm, rightArm]) {
  const upperArm = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.57, 0.22), runnerSuit);
  upperArm.position.y = -0.26;
  upperArm.castShadow = true;
  arm.add(upperArm);
  runner.add(arm);
}

const legs = [];
for (const x of [-0.19, 0.19]) {
  const leg = new THREE.Group();
  leg.position.set(x, 0.78, 0);
  const pants = new THREE.Mesh(new THREE.BoxGeometry(0.23, 0.65, 0.27), runnerPurple);
  pants.position.y = -0.27;
  pants.castShadow = true;
  leg.add(pants);
  const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.15, 0.43), runnerGlow);
  shoe.position.set(0, -0.58, -0.06);
  shoe.castShadow = true;
  leg.add(shoe);
  runner.add(leg);
  legs.push(leg);
}

const shadow = new THREE.Mesh(
  new THREE.CircleGeometry(0.63, 22),
  new THREE.MeshBasicMaterial({ color: 0x090914, transparent: true, opacity: 0.56 }),
);
shadow.rotation.x = -Math.PI / 2;
shadow.scale.set(1.25, 0.58, 1);
shadow.position.set(0, -0.035, 1);
scene.add(shadow);
runner.position.set(0, 0, 1);
scene.add(runner);

const obstacleMeshes = [];
const coinMeshes = [];
const objects = [];
const obstacleMaterials = {
  shell: material(0xe05668, 0.44, 0.2, { emissive: 0x52111c, emissiveIntensity: 0.5 }),
  dark: material(0x272b3b, 0.55, 0.5),
  warning: new THREE.MeshStandardMaterial({
    color: 0xffd16a,
    emissive: 0x734516,
    emissiveIntensity: 0.65,
    roughness: 0.38,
  }),
  coin: new THREE.MeshStandardMaterial({
    color: 0xffd84d,
    emissive: 0xc98500,
    emissiveIntensity: 1.4,
    metalness: 0.7,
    roughness: 0.22,
  }),
};

function createBlocker(type) {
  const group = new THREE.Group();
  const post = (x, y, z, width, height, depth, mat) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
  };

  if (type === "wall") {
    post(0, 0.59, 0, 1.48, 1.18, 0.48, obstacleMaterials.shell);
    post(0, 0.38, -0.26, 1.58, 0.14, 0.06, obstacleMaterials.warning);
    post(0, 0.77, -0.26, 1.58, 0.14, 0.06, obstacleMaterials.warning);
    post(-0.58, 1.29, 0, 0.13, 0.12, 0.57, obstacleMaterials.warning);
    post(0.58, 1.29, 0, 0.13, 0.12, 0.57, obstacleMaterials.warning);
  } else if (type === "crate") {
    post(0, 0.52, 0, 1.15, 1.04, 1.05, obstacleMaterials.shell);
    post(0, 0.53, -0.545, 1.03, 0.12, 0.035, obstacleMaterials.warning);
    post(0, 0.53, 0.545, 1.03, 0.12, 0.035, obstacleMaterials.warning);
    post(0, 0, 0, 0.11, 1.15, 1.08, obstacleMaterials.dark).rotation.z = Math.PI / 4;
    post(0, 0, 0, 0.11, 1.15, 1.08, obstacleMaterials.dark).rotation.z = -Math.PI / 4;
  } else {
    post(-0.66, 1.03, 0, 0.18, 2.06, 0.2, obstacleMaterials.dark);
    post(0.66, 1.03, 0, 0.18, 2.06, 0.2, obstacleMaterials.dark);
    post(0, 1.82, 0, 1.5, 0.3, 0.25, obstacleMaterials.shell);
    post(0, 1.82, -0.14, 1.3, 0.08, 0.03, obstacleMaterials.warning);
  }

  group.position.y = 0;
  group.traverse((child) => {
    if (child.isMesh) child.castShadow = true;
  });
  scene.add(group);
  return group;
}

function createCoin() {
  const group = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.09, 10, 20), obstacleMaterials.coin);
  ring.castShadow = true;
  group.add(ring);
  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.12, 1),
    new THREE.MeshBasicMaterial({ color: 0xf1e9ff }),
  );
  group.add(core);
  scene.add(group);
  return group;
}

const state = {
  mode: "ready",
  lane: 1,
  lanePosition: 0,
  jumpVelocity: 0,
  grounded: true,
  sliding: false,
  slideTimer: 0,
  elapsed: 0,
  score: 0,
  coins: 0,
  speed: 19,
  spawnTimer: 1.4,
  soundEnabled: false,
  audio: null,
  best: Number(localStorage.getItem("neon-dash-best") || 0),
};

function updateScore() {
  scoreElement.innerHTML = `${String(Math.floor(state.score)).padStart(5, "0")}<span class="stat-unit">m</span>`;
  coinElement.textContent = String(state.coins);
}

function updateBest() {
  bestElement.textContent = String(state.best).padStart(5, "0");
}

function beginRun() {
  if (state.mode === "running") return;
  state.mode = "running";
  state.lane = 1;
  state.lanePosition = 0;
  state.jumpVelocity = 0;
  state.grounded = true;
  state.sliding = false;
  state.slideTimer = 0;
  state.elapsed = 0;
  state.score = 0;
  state.coins = 0;
  state.speed = 19;
  state.spawnTimer = 1.1;
  runner.position.set(0, 0, 1);
  runner.scale.set(1, 1, 1);
  startScreen.classList.add("is-hidden");
  gameOverScreen.classList.add("is-hidden");
  updateScore();
  clock.getDelta();
}

function endRun() {
  if (state.mode !== "running") return;
  state.mode = "over";
  const distance = Math.floor(state.score);
  if (distance > state.best) {
    state.best = distance;
    localStorage.setItem("neon-dash-best", String(state.best));
    updateBest();
  }
  finalScoreElement.innerHTML = `${distance}<span>m</span>`;
  finalCoinsElement.innerHTML = `${state.coins}<span> ✦</span>`;
  gameOverScreen.classList.remove("is-hidden");
}

function chooseLane(direction) {
  state.lane = THREE.MathUtils.clamp(state.lane + direction, 0, 2);
}

function jump() {
  if (state.mode !== "running" || !state.grounded || state.sliding) return;
  state.grounded = false;
  state.jumpVelocity = 10.6;
  playTone(440, 0.06, "sine");
}

function slide() {
  if (state.mode !== "running" || !state.grounded) return;
  state.sliding = true;
  state.slideTimer = 0.72;
}

function playTone(frequency, duration, shape = "sine") {
  if (!state.soundEnabled) return;
  try {
    state.audio ??= new AudioContext();
    const oscillator = state.audio.createOscillator();
    const gain = state.audio.createGain();
    oscillator.type = shape;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.035, state.audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, state.audio.currentTime + duration);
    oscillator.connect(gain);
    gain.connect(state.audio.destination);
    oscillator.start();
    oscillator.stop(state.audio.currentTime + duration);
  } catch (error) {
    console.warn("Audio feedback could not be played.", error);
  }
}

function spawnWave() {
  const availableLanes = [0, 1, 2].sort(() => Math.random() - 0.5);
  const obstacleCount = state.elapsed > 15 && Math.random() > 0.54 ? 2 : 1;
  const obstacleLaneSet = availableLanes.slice(0, obstacleCount);

  for (const lane of obstacleLaneSet) {
    const roll = Math.random();
    const type = roll < 0.56 ? "wall" : roll < 0.82 ? "crate" : "overhead";
    const mesh = createBlocker(type);
    mesh.position.set(lanes[lane], 0, -67);
    obstacles.push({ mesh, lane, type, hit: false });
  }

  const safeLane = availableLanes.find((lane) => !obstacleLaneSet.includes(lane)) ?? availableLanes[2];
  const coinLane = Math.random() > 0.32 ? safeLane : availableLanes[Math.floor(Math.random() * 3)];
  const coinCount = 4 + Math.floor(Math.random() * 3);
  for (let index = 0; index < coinCount; index += 1) {
    const mesh = createCoin();
    mesh.position.set(lanes[coinLane], 1.15 + Math.sin(index * 0.6) * 0.12, -69 - index * 1.8);
    coinsOnTrack.push({ mesh, lane: coinLane, collected: false });
  }
}

const obstacles = [];
const coinsOnTrack = [];

function removeObstacle(index) {
  const [obstacle] = obstacles.splice(index, 1);
  scene.remove(obstacle.mesh);
  obstacle.mesh.traverse((child) => {
    if (child.isMesh) child.geometry.dispose();
  });
}

function removeCoin(index) {
  const [coin] = coinsOnTrack.splice(index, 1);
  scene.remove(coin.mesh);
  coin.mesh.traverse((child) => {
    if (child.isMesh) child.geometry.dispose();
  });
}

function updateRunner(delta) {
  state.lanePosition = THREE.MathUtils.damp(state.lanePosition, lanes[state.lane], 13, delta);
  runner.position.x = state.lanePosition;

  if (!state.grounded) {
    state.jumpVelocity -= 26 * delta;
    runner.position.y += state.jumpVelocity * delta;
    if (runner.position.y <= 0) {
      runner.position.y = 0;
      state.jumpVelocity = 0;
      state.grounded = true;
    }
  }

  if (state.sliding) {
    state.slideTimer -= delta;
    if (state.slideTimer <= 0) state.sliding = false;
  }

  const slidingScale = state.sliding ? 0.47 : 1;
  runner.scale.y = THREE.MathUtils.damp(runner.scale.y, slidingScale, 20, delta);
  runner.position.y = Math.max(0, runner.position.y);
  runner.rotation.z = THREE.MathUtils.damp(
    runner.rotation.z,
    (lanes[state.lane] - state.lanePosition) * -0.08,
    8,
    delta,
  );

  const runningMotion = state.mode === "running" && state.grounded && !state.sliding;
  const stride = runningMotion ? Math.sin(state.elapsed * 15) : 0;
  legs[0].rotation.x = stride * 0.64;
  legs[1].rotation.x = -stride * 0.64;
  leftArm.rotation.x = -stride * 0.67 + (state.sliding ? -0.8 : 0);
  rightArm.rotation.x = stride * 0.67 + (state.sliding ? -0.8 : 0);
  if (state.mode !== "running") {
    runner.rotation.y = THREE.MathUtils.damp(runner.rotation.y, -0.1, 2, delta);
  } else {
    runner.rotation.y = THREE.MathUtils.damp(runner.rotation.y, 0, 5, delta);
  }
  shadow.position.x = state.lanePosition;
  shadow.material.opacity = 0.52 - Math.min(runner.position.y * 0.1, 0.3);
  shadow.scale.set(1.25 + runner.position.y * 0.15, 0.58 + runner.position.y * 0.1, 1);
}

function updateWorld(delta) {
  for (const dash of laneDashes) {
    dash.position.z += state.speed * delta;
    if (dash.position.z > 12) dash.position.z -= 100;
  }

  skyline.position.z += state.speed * delta * 0.055;
  if (skyline.position.z > 7) skyline.position.z = 0;

  if (state.mode !== "running") return;

  state.elapsed += delta;
  state.speed = Math.min(19 + state.elapsed * 0.34, 34);
  state.score += state.speed * delta * 0.6;
  state.spawnTimer -= delta;
  if (state.spawnTimer <= 0) {
    spawnWave();
    state.spawnTimer = Math.max(0.78, 1.36 - state.elapsed * 0.007) + Math.random() * 0.24;
  }

  updateRunner(delta);

  for (let index = obstacles.length - 1; index >= 0; index -= 1) {
    const obstacle = obstacles[index];
    obstacle.mesh.position.z += state.speed * delta;
    if (!obstacle.hit && Math.abs(obstacle.mesh.position.z - runner.position.z) < 0.83) {
      const inSameLane = Math.abs(state.lanePosition - lanes[obstacle.lane]) < 0.92;
      const jumpedOver = obstacle.type === "crate" && runner.position.y > 0.82;
      const slidUnder = obstacle.type === "overhead" && state.sliding;
      if (inSameLane && !jumpedOver && !slidUnder) {
        endRun();
        break;
      }
      obstacle.hit = true;
    }
    if (obstacle.mesh.position.z > 12) removeObstacle(index);
  }

  for (let index = coinsOnTrack.length - 1; index >= 0; index -= 1) {
    const coin = coinsOnTrack[index];
    coin.mesh.position.z += state.speed * delta;
    coin.mesh.rotation.y += delta * 3.5;
    coin.mesh.position.y = 1.15 + Math.sin(state.elapsed * 4 + index) * 0.08;
    if (
      !coin.collected &&
      Math.abs(coin.mesh.position.z - runner.position.z) < 1 &&
      Math.abs(state.lanePosition - lanes[coin.lane]) < 0.95
    ) {
      coin.collected = true;
      state.coins += 1;
      playTone(740, 0.08, "triangle");
      removeCoin(index);
      continue;
    }
    if (coin.mesh.position.z > 12) removeCoin(index);
  }

  updateScore();
  camera.position.x = THREE.MathUtils.damp(camera.position.x, state.lanePosition * 0.12, 2, delta);
  camera.lookAt(state.lanePosition * 0.08, 1.05, -10);
}

function resize() {
  const width = game.clientWidth;
  const height = game.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
}

const resizeObserver = new ResizeObserver(resize);
resizeObserver.observe(game);
resize();
loading.classList.add("is-hidden");

function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.05);
  if (state.mode === "running") updateWorld(delta);
  else updateRunner(delta);
  stars.rotation.y += delta * 0.0014;
  renderer.render(scene, camera);
}
animate();
updateBest();

startButton.addEventListener("click", beginRun);
restartButton.addEventListener("click", beginRun);
soundButton.addEventListener("click", () => {
  state.soundEnabled = !state.soundEnabled;
  soundButton.classList.toggle("is-muted", !state.soundEnabled);
  soundButton.setAttribute("aria-label", state.soundEnabled ? "Mute sound" : "Enable sound");
  if (state.soundEnabled) playTone(550, 0.08);
});

window.addEventListener("keydown", (event) => {
  const handled = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " ", "Enter", "a", "A", "d", "D", "w", "W", "s", "S"];
  if (handled.includes(event.key)) event.preventDefault();

  if (state.mode === "ready" && (event.key === "Enter" || event.key === " ")) {
    beginRun();
    return;
  }
  if (state.mode === "over" && (event.key === "Enter" || event.key === " ")) {
    beginRun();
    return;
  }
  if (state.mode !== "running") return;

  if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") chooseLane(-1);
  else if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") chooseLane(1);
  else if (event.key === "ArrowUp" || event.key === " " || event.key.toLowerCase() === "w") jump();
  else if (event.key === "ArrowDown" || event.key.toLowerCase() === "s") slide();
});

let touchStartX = 0;
let touchStartY = 0;
game.addEventListener("touchstart", (event) => {
  const touch = event.changedTouches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
}, { passive: true });

game.addEventListener("touchend", (event) => {
  if (state.mode === "ready") {
    beginRun();
    return;
  }
  if (state.mode !== "running") return;
  const touch = event.changedTouches[0];
  const deltaX = touch.clientX - touchStartX;
  const deltaY = touch.clientY - touchStartY;
  if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 28) {
    jump();
  } else if (Math.abs(deltaX) > Math.abs(deltaY)) {
    chooseLane(deltaX > 0 ? 1 : -1);
  } else if (deltaY > 0) {
    slide();
  } else {
    jump();
  }
}, { passive: true });

window.addEventListener("contextmenu", (event) => {
  if (event.target === renderer.domElement) event.preventDefault();
});
