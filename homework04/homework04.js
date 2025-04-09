import { resizeAspectRatio, Axes } from './util/util.js';
import { Shader, readShaderFile } from './util/shader.js';

// Global variables
let gl, canvas;
let shader, axes;
let squareVAO;
let time = 0, lastTime = 0, deltaTime = 0;

// Uniform locations
let uModelLoc, uViewLoc, uProjectionLoc, uColorLoc;

function initWebGL() {
    canvas = document.createElement('canvas');
    canvas.width = 700;
    canvas.height = 700;
    document.body.appendChild(canvas);
    
    canvas.style.position = 'fixed';
    canvas.style.left = '0';
    canvas.style.top = '0';
    canvas.style.margin = '0';

    gl = canvas.getContext('webgl2');
    if (!gl) {
        alert('WebGL2 not supported in your browser');
        return false;
    }
    
    resizeAspectRatio(gl, canvas);
    
    return true;
}

function setupAxesBuffers() {
    axes = new Axes(gl);
}

function setupSquareBuffers() {
    // Vertex data for a base square
    const vertices = new Float32Array([
        -0.5, -0.5, 0.0,  // bottom-left
         0.5, -0.5, 0.0,  // bottom-right
         0.5,  0.5, 0.0,  // top-right
        -0.5,  0.5, 0.0   // top-left
    ]);
    
    const indices = new Uint16Array([
        0, 1, 2,  // first triangle
        0, 2, 3   // second triangle
    ]);
    
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);
    
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    
    gl.bindVertexArray(null);
    
    squareVAO = {
        vao: vao,
        count: indices.length
    };
}

function getSunTransform() {
    const model = mat4.create();
    mat4.rotateZ(model, model, time * 45 * Math.PI / 180); // Rotation
    mat4.scale(model, model, [0.2, 0.2, 0.2]); // Scale
    return model;
}

function getEarthTransform() {
    const orbitModel = mat4.create();
    mat4.rotateZ(orbitModel, orbitModel, time * 30 * Math.PI / 180); // Orbit around sun
    mat4.translate(orbitModel, orbitModel, [0.7, 0.0, 0.0]); // Distance from sun
    
    const model = mat4.clone(orbitModel);
    mat4.rotateZ(model, model, time * 180 * Math.PI / 180); // Rotation
    mat4.scale(model, model, [0.1, 0.1, 0.1]); // Scale
    return model;
}

function getMoonTransform() {
    const earthOrbitModel = mat4.create();
    mat4.rotateZ(earthOrbitModel, earthOrbitModel, time * 30 * Math.PI / 180);
    mat4.translate(earthOrbitModel, earthOrbitModel, [0.7, 0.0, 0.0]);
    
    const orbitModel = mat4.clone(earthOrbitModel);
    mat4.rotateZ(orbitModel, orbitModel, time * 360 * Math.PI / 180); // Orbit around earth
    mat4.translate(orbitModel, orbitModel, [0.2, 0.0, 0.0]); // Distance from earth
    
    const model = mat4.clone(orbitModel);
    mat4.rotateZ(model, model, time * 180 * Math.PI / 180); // Rotation
    mat4.scale(model, model, [0.05, 0.05, 0.05]); // Scale
    return model;
}

function applyTransform(modelMatrix, color) {
    gl.uniformMatrix4fv(uModelLoc, false, modelMatrix);
    gl.uniform4fv(uColorLoc, color);
}

function drawSquare() {
    gl.bindVertexArray(squareVAO.vao);
    gl.drawElements(gl.TRIANGLES, squareVAO.count, gl.UNSIGNED_SHORT, 0);
    gl.bindVertexArray(null);
}

function render() {
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    
    const aspect = gl.canvas.width / gl.canvas.height;
    const viewMatrix = mat4.create();
    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, 45 * Math.PI / 180, aspect, 0.1, 100.0);
    mat4.lookAt(viewMatrix, [0, 0, 3], [0, 0, 0], [0, 1, 0]);
    
    // Draw axes
    axes.draw(viewMatrix, projectionMatrix);
    
    shader.use();
    gl.uniformMatrix4fv(uViewLoc, false, viewMatrix);
    gl.uniformMatrix4fv(uProjectionLoc, false, projectionMatrix);
    
    // Draw Sun
    applyTransform(getSunTransform(), [1.0, 0.0, 0.0, 1.0]);
    drawSquare();
    
    // Draw Earth
    applyTransform(getEarthTransform(), [0.0, 1.0, 1.0, 1.0]);
    drawSquare();
    
    // Draw Moon
    applyTransform(getMoonTransform(), [1.0, 1.0, 0.0, 1.0]);
    drawSquare();
}

function animate(currentTime = 0) {
    deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;
    time += deltaTime;
    
    render();
    requestAnimationFrame((t) => animate(t));
}

async function initShader() {
    const vertexShaderSource = await readShaderFile('shVert.glsl');
    const fragmentShaderSource = await readShaderFile('shFrag.glsl');
    shader = new Shader(gl, vertexShaderSource, fragmentShaderSource);
    
    // Get uniform locations
    uModelLoc = gl.getUniformLocation(shader.program, 'u_model');
    uViewLoc = gl.getUniformLocation(shader.program, 'u_view');
    uProjectionLoc = gl.getUniformLocation(shader.program, 'u_projection');
    uColorLoc = gl.getUniformLocation(shader.program, 'u_color');
}

async function main() {
    if (!initWebGL()) return;
    
    await initShader();
    setupAxesBuffers();
    setupSquareBuffers();
    
    animate();
}

window.addEventListener('load', main);