import * as THREE from 'three';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { initRenderer, initCamera, initDefaultLighting, initOrbitControls, initStats } from './util.js';

const scene = new THREE.Scene();
const renderer = initRenderer();
let cameraPerspective = true;

let camera = initCamera();
initDefaultLighting(scene);
const controls = initOrbitControls(camera, renderer);
const stats = initStats();

// GUI
const gui = new GUI();
const cameraFolder = gui.addFolder('Camera');
cameraFolder.add({ perspective: true }, 'perspective').name("Toggle Camera").onChange(toggleCamera);

function toggleCamera() {
    cameraPerspective = !cameraPerspective;
    const pos = camera.position.clone();
    if (cameraPerspective) {
        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100000);
    } else {
        const aspect = window.innerWidth / window.innerHeight;
        camera = new THREE.OrthographicCamera(-50 * aspect, 50 * aspect, 50, -50, 0.1, 100000);
    }
    camera.position.copy(pos);
    camera.lookAt(scene.position);
    controls.object = camera;
}

// Sun
const sunGeometry = new THREE.SphereGeometry(10, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 'yellow' });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Planets
const planetData = [
    { name: 'Mercury', radius: 1.5, distance: 20, color: '#a6a6a6', rotationSpeed: 0.02, orbitSpeed: 0.02 },
    { name: 'Venus', radius: 3, distance: 35, color: '#e39e1c', rotationSpeed: 0.015, orbitSpeed: 0.015 },
    { name: 'Earth', radius: 3.5, distance: 50, color: '#3498db', rotationSpeed: 0.01, orbitSpeed: 0.01 },
    { name: 'Mars', radius: 2.5, distance: 65, color: '#c0392b', rotationSpeed: 0.008, orbitSpeed: 0.008 }
];

const textureLoader = new THREE.TextureLoader();
const planets = [];

planetData.forEach(data => {
    const planetGroup = new THREE.Object3D();
    const texture = textureLoader.load(`${data.name}.jpg`); // load texture using the name of the planet
    const material = new THREE.MeshStandardMaterial({ map: texture });
    const geometry = new THREE.SphereGeometry(data.radius, 32, 32);
    const planet = new THREE.Mesh(geometry, material);
    planet.position.x = data.distance;
    planet.castShadow = true;

    planetGroup.add(planet);
    scene.add(planetGroup);

    planets.push({ ...data, mesh: planet, group: planetGroup });

    // GUI
    const folder = gui.addFolder(data.name + ' UI');
    folder.add(data, 'rotationSpeed', 0, 0.05, 0.001);
    folder.add(data, 'orbitSpeed', 0, 0.05, 0.001);
});

// Animate
function animate() {
    stats.update();

    planets.forEach(p => {
        p.group.rotation.y += p.orbitSpeed;
        p.mesh.rotation.y += p.rotationSpeed;
    });

    controls.update();
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();

// Resize
window.addEventListener('resize', () => {
    const aspect = window.innerWidth / window.innerHeight;
    if (camera instanceof THREE.PerspectiveCamera) {
        camera.aspect = aspect;
    } else {
        camera.left = -50 * aspect;
        camera.right = 50 * aspect;
        camera.top = 50;
        camera.bottom = -50;
    }
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
