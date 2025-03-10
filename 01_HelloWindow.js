// Global constants
const canvas = document.getElementById('glCanvas'); // Get the canvas element 
const gl = canvas.getContext('webgl2'); // Get the WebGL2 context

if (!gl) {
    console.error('WebGL 2 is not supported by your browser.');
}

// Set canvas size: 현재 window 전체를 canvas로 사용
// 처음 실행 시 canvas 크기를 500 x 500으로 고정.
canvas.width = 500;
canvas.height = 500;

// Initialize WebGL settings: viewport and clear color
gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0.1, 0.2, 0.3, 1.0);

// 1:1 비율 유지하며 캔버스 크기 조정하는 함수
function setCanvasSize() {
    //window의 가로/세로 중 짧은 쪽을 canvas의 가로 및 세로 길이로 설정
    const size = Math.min(window.innerWidth, window.innerHeight);
    canvas.width = size;
    canvas.height = size;
    gl.viewport(0, 0, canvas.width, canvas.height);
}

// canvas를 4개의 사분면으로 나눠서 색을 칠하는 함수
function drawQuadrants() {
    const halfWidth = canvas.width / 2;
    const halfHeight = canvas.height / 2;

    gl.enable(gl.SCISSOR_TEST);

    // 빨강 (top-left)
    gl.scissor(0, halfHeight, halfWidth, halfHeight);
    gl.clearColor(1.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // 초록 (top-right)
    gl.scissor(halfWidth, halfHeight, halfWidth, halfHeight);
    gl.clearColor(0.0, 1.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // 파랑 (bottom-left)
    gl.scissor(0, 0, halfWidth, halfHeight);
    gl.clearColor(0.0, 0.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // 노랑 (bottom-right)
    gl.scissor(halfWidth, 0, halfWidth, halfHeight);
    gl.clearColor(1.0, 1.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.disable(gl.SCISSOR_TEST);
}

// Start rendering
render();

// Render loop
function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);    
    drawQuadrants();
}

// Resize viewport when window size changes
window.addEventListener('resize', () => {
    setCanvasSize();
    render();
});
