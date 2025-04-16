import { resizeAspectRatio, Axes } from './util/util.js';
import { Shader, readShaderFile } from './util/shader.js';
import { SquarePyramid } from 'squarePyramid.js';

const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2');
let shader;
let startTime;
let lastFrameTime;

let isInitialized = false;

let viewMatrix = mat4.create();
let projMatrix = mat4.create();
let modelMatrix = mat4.create(); 
const pyramid = new SquarePyramid(gl);
const axes = new Axes(gl, 1.8);

document.addEventListener('DOMContentLoaded', () => {
    if (isInitialized) {
        console.log("Already initialized");
        return;
    }

    main().then(success => {
        if (!success) {
            console.log('program terminated');
            return;
        }
        isInitialized = true;
    }).catch(error => {
        console.error('program terminated with error:', error);
    });
});

function initWebGL() {
    if (!gl) {
        console.error('WebGL 2 is not supported by your browser.');
        return false;
    }

    canvas.width = 700;
    canvas.height = 700;
    resizeAspectRatio(gl, canvas);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.7, 0.8, 0.9, 1.0);
    
    return true;
}

async function initShader() {
    const vertexShaderSource = await readShaderFile('shVert.glsl');
    const fragmentShaderSource = await readShaderFile('shFrag.glsl');
    return new Shader(gl, vertexShaderSource, fragmentShaderSource);
}

function render() {
    const currentTime = Date.now();
    const deltaTime = (currentTime - lastFrameTime) / 1000.0;
    const elapsedTime = (currentTime - startTime) / 1000.0;
    lastFrameTime = currentTime;

    // Clear canvas
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    // Model transformation matrix
    mat4.identity(modelMatrix);

    // Viewing transformation matrix
    const horizontalAngle = glMatrix.toRadian(90 * elapsedTime); // 90 deg/sec for x/z
    const verticalAngle = glMatrix.toRadian(45 * elapsedTime);   // 45 deg/sec for y
    
    // Circular movement in xz plane (radius 3)
    let camX = 3.0 * Math.sin(horizontalAngle);
    let camZ = 3.0 * Math.cos(horizontalAngle);
    
    // Vertical movement (y) varies between 0 to 10 using sine
    let camY = 5.0 * Math.sin(verticalAngle) + 5.0;
    
    mat4.lookAt(viewMatrix, 
        vec3.fromValues(camX, camY, camZ),
        vec3.fromValues(0, 0.5, 0),
        vec3.fromValues(0, 1, 0));

    // drawing the square pyramid
    shader.use();
    shader.setMat4('u_model', modelMatrix);
    shader.setMat4('u_view', viewMatrix);
    shader.setMat4('u_projection', projMatrix);
    pyramid.draw(shader);

    // drawing the axes
    axes.draw(viewMatrix, projMatrix);

    requestAnimationFrame(render);
}

async function main() {
    try {
        if (!initWebGL()) {
            throw new Error('WebGL initialization failed');
        }
        
        shader = await initShader();

        // Projection transformation matrix
        mat4.perspective(
            projMatrix,
            glMatrix.toRadian(60),
            canvas.width / canvas.height,
            0.1,
            100.0
        );

        // starting time for animation
        startTime = lastFrameTime = Date.now();

        // Start rendering
        requestAnimationFrame(render);

        return true;
    } catch (error) {
        console.error('Failed to initialize program:', error);
        alert('Failed to initialize program');
        return false;
    }
}
