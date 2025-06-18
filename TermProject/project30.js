import * as THREE from 'three';

let scene, camera, renderer;
let phones = {};
let modelData = {};

document.addEventListener('DOMContentLoaded', () => {
  fetch('./app_data.json')
    .then(res => res.json())
    .then(data => {
      modelData = processModelData(data.competitors);
      init();
      populateDropdowns();
      animate();
    });

  window.addEventListener('resize', onWindowResize);
});

function processModelData(competitors) {
  const data = { Apple: [], Samsung: [], Other: [] };
  competitors.forEach(phone => {
    const { brand, model } = phone;
    if (brand === 'Apple') data.Apple.push(model);
    else if (brand === 'Samsung') data.Samsung.push(model);
    else data.Other.push(model);
  });
  return data;
}

function init() {
  scene = new THREE.Scene();
  /* scene.background = new THREE.Color(0xeeeeee); */
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  const aspect = window.innerWidth / window.innerHeight;
  const frustumSize = 20;
  camera = new THREE.OrthographicCamera(
    -frustumSize * aspect / 2, frustumSize * aspect / 2,
    frustumSize / 2, -frustumSize / 2,
    0.1, 100
  );
  camera.position.set(0, 5, 20);
  camera.lookAt(0, 4, 0);

  const ambient = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambient);

  const dirLight = new THREE.DirectionalLight(0xffffff, 2.5);
  dirLight.position.set(10, 15, 10);
  dirLight.castShadow = true;
  scene.add(dirLight);

  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshPhongMaterial({ color: 0xeeeeee })
  );
  plane.rotation.x = -Math.PI / 2;
  scene.add(plane);

  const loader = new window.GLTFLoader();

  // Apple 모델
  loader.load('./assets/apple.glb', (gltf) => {
    const model = gltf.scene;
    scaleModelToFixedWidth(model, 4); // 원하는 가로폭
    model.position.set(-12.5, 4.5, 0);
    model.userData.rotateSpeed = 0;
    phones.apple = model;
    scene.add(model);
    addHover('.section[data-brand="Apple"]', model);
  });

  // Samsung 모델
  loader.load('./assets/samsung.glb', (gltf) => {
    const model = gltf.scene;
    scaleModelToFixedWidth(model, 4); // Samsung용 크기 조절
    model.position.set(0, 5, 0);
    model.userData.rotateSpeed = 0;
    phones.samsung = model;
    scene.add(model);
    addHover('.section[data-brand="Samsung"]', model);
  });

  // Other 모델
  loader.load('./assets/other.glb', (gltf) => {
    const model = gltf.scene;
    scaleModelToFixedWidth(model, 4); // Other용 크기 조절
    model.position.set(12.5, 4.5, 0);
    model.userData.rotateSpeed = 0;
    phones.other = model;
    scene.add(model);
    addHover('.section[data-brand="Other"]', model);
  });
}

function scaleModelToFixedWidth(model, targetWidth = 4) {
  const box = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  box.getSize(size);

  if (size.x === 0) return; // 방어 코드
  const currentWidth = size.x;
  const scaleFactor = targetWidth / currentWidth;

  model.scale.set(scaleFactor, scaleFactor, scaleFactor);
}

function animate() {
  requestAnimationFrame(animate);
  Object.values(phones).forEach(phone => {
    if (phone.userData.rotateSpeed > 0) {
      phone.rotation.y += phone.userData.rotateSpeed;
    }
  });
  renderer.render(scene, camera);
}

function onWindowResize() {
  const aspect = window.innerWidth / window.innerHeight;
  const frustumSize = 20;
  camera.left = -frustumSize * aspect / 2;
  camera.right = frustumSize * aspect / 2;
  camera.top = frustumSize / 2;
  camera.bottom = -frustumSize / 2;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function addHover(selector, model) {
  const el = document.querySelector(selector);
  if (!el) return;
  el.addEventListener('mouseenter', () => {
    model.userData.rotateSpeed = 0.01;
  });
  el.addEventListener('mouseleave', () => {
    model.userData.rotateSpeed = 0;
  });
}

function populateDropdowns() {
  Object.keys(modelData).forEach(brand => {
    const select = document.getElementById(`${brand.toLowerCase()}-select`);
    if (!select) return;
    modelData[brand].forEach(model => {
      const option = document.createElement('option');
      option.value = model;
      option.innerText = model;
      select.appendChild(option);
    });

    select.addEventListener('change', () => {
      const model = select.value;
      if (model && model !== '모델 선택') {
        localStorage.setItem('selectedPhoneModel', model);
        window.location.href = './step2.html';
      }
    });
  });
}
