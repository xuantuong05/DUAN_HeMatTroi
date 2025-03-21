// 🌍 Khởi tạo Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  10000
);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// 🎮 Điều khiển xoay và zoom
const controls = new THREE.OrbitControls(camera, renderer.domElement);
camera.position.set(0, 50, 1000);
controls.enableDamping = true;

const sunLight = new THREE.PointLight(0xffcc66, 3, 5000);
sunLight.position.set(0, 0, 0);
sunLight.castShadow = true;
scene.add(sunLight);

// Ánh sáng môi trường
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

// 🌟 Hiệu ứng phát sáng từ Mặt Trời
const sunGlowTexture = new THREE.TextureLoader().load("assets/sun.png");
const sunGlow = new THREE.Sprite(
  new THREE.SpriteMaterial({
    map: sunGlowTexture,
    color: 0xffcc66,
    transparent: true,
    opacity: 0.8,
  })
);
sunGlow.scale.set(300, 300, 1);
scene.add(sunGlow);
const sunTexture = new THREE.TextureLoader().load("assets/sun.jpg");
const sunMaterial = new THREE.MeshStandardMaterial({
  map: sunTexture,
  emissive: 0xffcc66,
  emissiveIntensity: 1.5,
});
const sun = new THREE.Mesh(new THREE.SphereGeometry(20, 64, 64), sunMaterial);
sun.receiveShadow = true;
scene.add(sun);

const cometTailMaterial = new THREE.PointsMaterial({
  color: 0xffffcc,
  size: 2,
  transparent: true,
  opacity: 0.8,
  depthWrite: false,
});

const cometTailGeometry = new THREE.BufferGeometry();
const tailPositions = new Float32Array(50 * 3);
cometTailGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(tailPositions, 3)
);

const cometTail = new THREE.Points(cometTailGeometry, cometTailMaterial);
scene.add(cometTail);

// Cập nhật sao chổi với đuôi động
function updateComet() {
  cometAngle += 0.002;
  comet.position.x = Math.cos(cometAngle) * 1200;
  comet.position.z = Math.sin(cometAngle) * 800;
  comet.position.y = Math.sin(cometAngle * 2) * 300;

  // Cập nhật vị trí đuôi sao chổi
  for (let i = 49; i > 0; i--) {
    tailPositions[i * 3] = tailPositions[(i - 1) * 3];
    tailPositions[i * 3 + 1] = tailPositions[(i - 1) * 3 + 1];
    tailPositions[i * 3 + 2] = tailPositions[(i - 1) * 3 + 2];
  }
  tailPositions[0] = comet.position.x;
  tailPositions[1] = comet.position.y;
  tailPositions[2] = comet.position.z;

  cometTailGeometry.attributes.position.needsUpdate = true;
}

// 🪐 Hàm tạo hành tinh
function createPlanet(texture, size, distance, speed, name) {
  const planetTexture = new THREE.TextureLoader().load(texture);
  const planet = new THREE.Mesh(
    new THREE.SphereGeometry(size, 32, 32),
    new THREE.MeshStandardMaterial({ map: planetTexture })
  );
  planet.castShadow = true;
  planet.receiveShadow = true;
  planet.userData = {
    distance,
    angle: Math.random() * Math.PI * 2,
    speed,
    name,
  };
  scene.add(planet);
  return planet;
}

// 🪐 Thêm các hành tinh
const planets = [
  createPlanet("assets/mercury.jpg", 2, 50, 0.02, "Sao Thủy"),
  createPlanet("assets/venus.jpg", 4, 100, 0.015, "Sao Kim"),
  createPlanet("assets/earth.jpg", 4.5, 150, 0.01, "Trái Đất"),
  createPlanet("assets/mars.jpg", 3.5, 200, 0.008, "Sao Hỏa"),
  createPlanet("assets/jupiter.jpg", 10, 400, 0.005, "Sao Mộc"),
  createPlanet("assets/saturn.jpg", 9, 600, 0.004, "Sao Thổ"),
  createPlanet("assets/uranus.jpg", 7, 800, 0.003, "Sao Thiên Vương"),
  createPlanet("assets/neptune.jpg", 6.5, 1000, 0.0025, "Sao Hải Vương"),
];

// 🌙 Mặt Trăng quay quanh Trái Đất
const moon = createPlanet("assets/moon.jpg", 1.2, 10, 0.05, "Mặt Trăng");

// 🪨 Tạo vành đai tiểu hành tinh với `InstancedMesh`
const asteroidCount = 1000;
const asteroidGeometry = new THREE.DodecahedronGeometry(1);
const asteroidMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
const asteroidBelt = new THREE.InstancedMesh(
  asteroidGeometry,
  asteroidMaterial,
  asteroidCount
);
scene.add(asteroidBelt);

const asteroidMatrix = new THREE.Matrix4();
for (let i = 0; i < asteroidCount; i++) {
  const angle = Math.random() * Math.PI * 2;
  const distance = 300 + Math.random() * 400;
  const x = Math.cos(angle) * distance;
  const z = Math.sin(angle) * distance;
  const y = (Math.random() - 0.5) * 50;
  asteroidMatrix.setPosition(x, y, z);
  asteroidBelt.setMatrixAt(i, asteroidMatrix);
}

// ✨ Hiển thị thông tin hành tinh khi di chuột vào
const infoPanel = document.createElement("div");
infoPanel.style.position = "absolute";
infoPanel.style.top = "20px";
infoPanel.style.left = "20px";
infoPanel.style.padding = "10px";
infoPanel.style.background = "rgba(0, 0, 0, 0.7)";
infoPanel.style.color = "white";
infoPanel.style.display = "none";
document.body.appendChild(infoPanel);

document.addEventListener("mousemove", (event) => {
  const mouse = new THREE.Vector2(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(planets);

  if (intersects.length > 0) {
    const planet = intersects[0].object;
    infoPanel.innerHTML = `
        <strong>🌍 ${planet.userData.name}</strong><br>
        🌎 Khoảng cách: ${planet.userData.distance} đơn vị<br>
        🔄 Tốc độ quay: ${(planet.userData.speed * 1000).toFixed(2)} rad/s
      `;
    infoPanel.style.display = "block";
    infoPanel.style.left = event.clientX + 10 + "px";
    infoPanel.style.top = event.clientY + 10 + "px";
  } else {
    infoPanel.style.display = "none";
  }
});

let asteroidSpeed = 0.0005; // Tốc độ quay của vành đai tiểu hành tinh

function animate() {
  requestAnimationFrame(animate);

  // Quay vành đai tiểu hành tinh
  asteroidBelt.rotation.y += asteroidSpeed;

  // Quỹ đạo hành tinh
  planets.forEach((planet) => {
    planet.userData.angle += planet.userData.speed;
    planet.position.x =
      Math.cos(planet.userData.angle) * planet.userData.distance;
    planet.position.z =
      Math.sin(planet.userData.angle) * planet.userData.distance;
    planet.rotation.y += 0.01;
  });

  // Quỹ đạo Mặt Trăng
  moon.userData.angle += moon.userData.speed;
  moon.position.x =
    planets[2].position.x +
    Math.cos(moon.userData.angle) * moon.userData.distance;
  moon.position.z =
    planets[2].position.z +
    Math.sin(moon.userData.angle) * moon.userData.distance;

  // Cập nhật sao chổi
  updateComet();

  controls.update();
  renderer.render(scene, camera);
}

const cometTailTexture = new THREE.TextureLoader().load(
  "assets/comet-tail.png"
);
animate();
