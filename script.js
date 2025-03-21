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

// 🎮 Điều khiển xoay và zoom
const controls = new THREE.OrbitControls(camera, renderer.domElement);
camera.position.set(0, 50, 1000);
controls.enableDamping = true;

// 🌞 Ánh sáng Mặt Trời
const sunLight = new THREE.PointLight(0xffcc66, 2, 5000);
sunLight.position.set(0, 0, 0);
scene.add(sunLight);
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

// 🌟 Hiệu ứng phát sáng từ Mặt Trời
const sunGlowTexture = new THREE.TextureLoader().load("assets/sun-glow.png");
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

// ☄️ Sao chổi bay ngang
const cometGeometry = new THREE.SphereGeometry(2, 16, 16);
const cometMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffcc,
  emissive: 0xffffaa,
});
const comet = new THREE.Mesh(cometGeometry, cometMaterial);
scene.add(comet);

let cometAngle = 0;
function updateComet() {
  cometAngle += 0.002;
  comet.position.x = Math.cos(cometAngle) * 1200;
  comet.position.z = Math.sin(cometAngle) * 800;
  comet.position.y = Math.sin(cometAngle * 2) * 300;
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

// 🎞 Vòng lặp Animation
function animate() {
  requestAnimationFrame(animate);
  // Xoay vòng quỹ đạo để giữ nguyên góc nhìn
  scene.children.forEach((child) => {
    if (child instanceof THREE.Mesh && child.geometry.type === "RingGeometry") {
      child.rotation.x = Math.PI / 2;
    }
  });

  // Quỹ đạo hành tinh
  planets.forEach((planet) => {
    planet.userData.angle += planet.userData.speed;
    planet.position.x =
      Math.cos(planet.userData.angle) * planet.userData.distance;
    planet.position.z =
      Math.sin(planet.userData.angle) * planet.userData.distance;
    planet.rotation.y += 0.01;
  });
  // 🌌 Thêm vòng quỹ đạo cho mỗi hành tinh
  function createOrbit(distance) {
    const orbitGeometry = new THREE.RingGeometry(
      distance - 0.5,
      distance + 0.5,
      64
    );
    const orbitMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true, // Cho phép điều chỉnh độ trong suốt
      opacity: 0.3, // Làm mờ vòng quỹ đạo
    });
    const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
    orbit.rotation.x = Math.PI / 2;
    scene.add(orbit);
  }
  // 🌀 Tạo vòng quỹ đạo cho mỗi hành tinh
  planets.forEach((planet) => {
    const orbitGeometry = new THREE.RingGeometry(
      planet.userData.distance - 0.5,
      planet.userData.distance + 0.5,
      64
    );
    const orbitMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.3,
    });
    const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
    orbit.rotation.x = Math.PI / 2;
    scene.add(orbit);
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
const cometTail = new THREE.Sprite(
  new THREE.SpriteMaterial({
    map: cometTailTexture,
    color: 0xffffaa,
    transparent: true,
    opacity: 0.7,
  })
);
cometTail.scale.set(10, 30, 1);
scene.add(cometTail);

// Cập nhật sao chổi với đuôi
function updateComet() {
  cometAngle += 0.002;
  comet.position.x = Math.cos(cometAngle) * 1200;
  comet.position.z = Math.sin(cometAngle) * 800;
  comet.position.y = Math.sin(cometAngle * 2) * 300;

  // Cập nhật vị trí đuôi sao chổi
  cometTail.position.copy(comet.position);
  cometTail.position.x -= 5;
}

animate();
