import { resizeAspectRatio, setupText } from './util/util.js';
import { Shader, readShaderFile } from './util/shader.js';

const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2');
let shader;
let vao;
let translation = [0, 0]; // Translation vector to track/move the square

function initWebGL() {
    if (!gl) {
        console.error('WebGL 2 is not supported by your browser.');
        return false;
    }

    canvas.width = 600;
    canvas.height = 600;

    resizeAspectRatio(gl, canvas);

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    return true;
}

async function initShader() {
    const vertexShaderSource = await readShaderFile('shVert.glsl');
    const fragmentShaderSource = await readShaderFile('shFrag.glsl');
    const shader = new Shader(gl, vertexShaderSource, fragmentShaderSource);

    gl.useProgram(shader.program);
    return shader;
}

function setupKeyboardEvents() {
    window.addEventListener('keydown', (event) => {
        switch (event.key) {
            case 'ArrowUp':
                translation[1] += 0.01;
                break;
            case 'ArrowDown':
                translation[1] -= 0.01;
                break;
            case 'ArrowLeft':
                translation[0] -= 0.01;
                break;
            case 'ArrowRight':
                translation[0] += 0.01;
                break;
        }

        // Clamp translation to keep the square within the canvas
        translation[0] = Math.max(-0.9, Math.min(0.9, translation[0]));
        translation[1] = Math.max(-0.9, Math.min(0.9, translation[1]));

        // Update the translation uniform
        const translationUniformLocation = gl.getUniformLocation(shader.program, 'u_translation');
        gl.uniform2f(translationUniformLocation, translation[0], translation[1]);

        render();
    });
}

function setupBuffers(shader) {
    const vertices = new Float32Array([
        0.0, 0.0, // Center
        -0.1, -0.1, // Bottom-left
        0.1, -0.1, // Bottom-right
        0.1, 0.1, // Top-right
        -0.1, 0.1, // Top-left
        -0.1, -0.1, // Bottom-left (finish)
    ]);

    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const positionAttributeLocation = gl.getAttribLocation(shader.program, 'a_position');
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    return vao;
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindVertexArray(vao);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}

async function main() {
    if (!initWebGL()) return;

    shader = await initShader();
    if (!shader) return;
    
    setupText(canvas, "Use arrow keys to move the rectangle", 1);

    gl.useProgram(shader.program);

    vao = setupBuffers(shader);
    setupKeyboardEvents();

    // Set the initial translation uniform
    const translationUniformLocation = gl.getUniformLocation(shader.program, 'u_translation');
    gl.uniform2f(translationUniformLocation, translation[0], translation[1]);

    // Initial render
    render();
}

main();

// Window resizing while maintaining ratio
window.addEventListener('resize', () => {
    resizeAspectRatio(gl, canvas);
    gl.viewport(0, 0, canvas.width, canvas.height);
    render();
});
