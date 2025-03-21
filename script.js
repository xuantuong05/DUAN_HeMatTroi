// Khởi tạo Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  3000
);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Thêm điều khiển xoay và zoom
const controls = new THREE.OrbitControls(camera, renderer.domElement);
camera.position.set(0, 50, 600);
controls.update();

// Ánh sáng từ Mặt Trời
const light = new THREE.PointLight(0xffffff, 2, 3000);
light.position.set(0, 0, 0);
scene.add(light);

// Tạo nền vũ trụ
const textureLoader = new THREE.TextureLoader();
scene.background = textureLoader.load("assets/space.jpg");

// Hàm tạo hành tinh
function createPlanet(texture, size, distance, speed) {
  const planetTexture = textureLoader.load(texture);
  const planet = new THREE.Mesh(
    new THREE.SphereGeometry(size, 32, 32),
    new THREE.MeshStandardMaterial({ map: planetTexture })
  );
  planet.userData = { distance, angle: Math.random() * Math.PI * 2, speed };
  scene.add(planet);
  return planet;
}

// Tạo Mặt Trời
const sunTexture = textureLoader.load("assets/sun.jpg");
const sun = new THREE.Mesh(
  new THREE.SphereGeometry(20, 64, 64),
  new THREE.MeshBasicMaterial({ map: sunTexture })
);
scene.add(sun);

// Thêm các hành tinh
const planets = [
  createPlanet("assets/mercury.jpg", 2, 30, 0.02), // Sao Thủy
  createPlanet("assets/venus.jpg", 4, 50, 0.015), // Sao Kim
  createPlanet("assets/earth.jpg", 4.5, 70, 0.01), // Trái Đất
  createPlanet("assets/mars.jpg", 3.5, 100, 0.008), // Sao Hỏa
  createPlanet("assets/jupiter.jpg", 10, 200, 0.005), // Sao Mộc
  createPlanet("assets/saturn.jpg", 9, 300, 0.004), // Sao Thổ
  createPlanet("assets/uranus.jpg", 7, 400, 0.003), // Sao Thiên Vương
  createPlanet("assets/neptune.jpg", 6.5, 500, 0.0025), // Sao Hải Vương
];

// Vành đai tiểu hành tinh
const asteroids = [];
const asteroidMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
for (let i = 0; i < 500; i++) {
  const asteroid = new THREE.Mesh(
    new THREE.SphereGeometry(Math.random() * 1.5, 12, 12),
    asteroidMaterial
  );
  const angle = Math.random() * Math.PI * 2;
  const distance = 150 + Math.random() * 50;
  asteroid.position.set(
    Math.cos(angle) * distance,
    0,
    Math.sin(angle) * distance
  );
  scene.add(asteroid);
  asteroids.push({ asteroid, angle, distance, speed: 0.002 });
}

// Thêm các vì sao quay vòng
const stars = [];
for (let i = 0; i < 300; i++) {
  const star = new THREE.Mesh(
    new THREE.SphereGeometry(Math.random() * 0.5, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  const angle = Math.random() * Math.PI * 2;
  const distance = 600 + Math.random() * 400;
  star.position.set(
    Math.cos(angle) * distance,
    (Math.random() - 0.5) * 200,
    Math.sin(angle) * distance
  );
  scene.add(star);
  stars.push({ star, angle, distance, speed: 0.001 + Math.random() * 0.003 });
}

// Animation
function animate() {
  requestAnimationFrame(animate);

  // Xoay Mặt Trời
  sun.rotation.y += 0.002;

  // Quỹ đạo hành tinh
  planets.forEach((planet) => {
    planet.userData.angle += planet.userData.speed;
    planet.position.x =
      Math.cos(planet.userData.angle) * planet.userData.distance;
    planet.position.z =
      Math.sin(planet.userData.angle) * planet.userData.distance;
    planet.rotation.y += 0.01;
  });

  // Quỹ đạo tiểu hành tinh
  asteroids.forEach(({ asteroid, angle, distance, speed }) => {
    asteroid.position.x = Math.cos(angle + speed) * distance;
    asteroid.position.z = Math.sin(angle + speed) * distance;
  });

  // Quỹ đạo sao quay vòng
  stars.forEach(({ star, angle, distance, speed }) => {
    star.position.x = Math.cos(angle + speed) * distance;
    star.position.z = Math.sin(angle + speed) * distance;
  });

  controls.update();
  renderer.render(scene, camera);
}

animate();

// Responsive
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
