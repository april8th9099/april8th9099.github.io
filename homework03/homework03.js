import { resizeAspectRatio, setupText } from './util/util.js';
import { Shader, readShaderFile } from './util/shader.js';

// Global variables
let gl;
const canvas = document.getElementById('glCanvas');
let shaderProgram;
let circle = null;
let line = null;
let isDrawingCircle = false;
let isDrawingLine = false;
let circleRadius = 0;
let circleCenter = [0, 0];
let lineStart = [0, 0];
let lineEnd = [0, 0];
let intersections = [];

// Initialize WebGL
async function initWebGL() {
    canvas.width = 700;
    canvas.height = 700;
    
    try {
        gl = canvas.getContext('webgl2');
        if (!gl) {
            alert('Unable to initialize WebGL 2.0. Your browser may not support it.');
            return;
        }
        
        // Set clear color to black and clear the color buffer
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        // Initialize shaders
        const vertexShaderSource = await readShaderFile('shVert.glsl');
        const fragmentShaderSource = await readShaderFile('shFrag.glsl');
        
        shaderProgram = new Shader(gl, vertexShaderSource, fragmentShaderSource);
        shaderProgram.use();
        
        // Set up event listeners
        setupEventListeners();
        
    } catch (e) {
        console.error('Error initializing WebGL:', e);
    }
}

// Set up event listeners
function setupEventListeners() {
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('resize', resizeAspectRatio);
}

// Mouse down handler
function handleMouseDown(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const normalizedCoords = normalizeCoords(x, y);
    
    if (!circle) {
        // Start drawing circle
        isDrawingCircle = true;
        circleCenter = normalizedCoords;
        circleRadius = 0;
    } else if (!line) {
        // Start drawing line
        isDrawingLine = true;
        lineStart = normalizedCoords;
        lineEnd = normalizedCoords;
    }
    
    render();
}

// Mouse move handler
function handleMouseMove(event) {
    if (!isDrawingCircle && !isDrawingLine) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const normalizedCoords = normalizeCoords(x, y);
    
    if (isDrawingCircle) {
        // Update circle radius
        const dx = normalizedCoords[0] - circleCenter[0];
        const dy = normalizedCoords[1] - circleCenter[1];
        circleRadius = Math.sqrt(dx * dx + dy * dy);
    } else if (isDrawingLine) {
        // Update line end point
        lineEnd = normalizedCoords;
    }
    
    render();
}

// Mouse up handler
function handleMouseUp(event) {
    if (isDrawingCircle) {
        isDrawingCircle = false;
        circle = {
            center: circleCenter,
            radius: circleRadius
        };
        updateCircleInfo();
    } else if (isDrawingLine) {
        isDrawingLine = false;
        line = {
            start: lineStart,
            end: lineEnd
        };
        updateLineInfo();
        calculateIntersections();
    }
    
    render();
}

// Normalize canvas coordinates to WebGL coordinates (-1 to 1)
function normalizeCoords(x, y) {
    return [
        (x / canvas.width) * 2 - 1,
        -((y / canvas.height) * 2 - 1)
    ];
}

// Update circle information display
function updateCircleInfo() {
    setupText(canvas, `Circle: center (${circle.center[0].toFixed(2)}, ${circle.center[1].toFixed(2)}) radius = ${circle.radius.toFixed(2)}`, 1);
}

// Update line information display
function updateLineInfo() {
    setupText(canvas, `Line segment: (${line.start[0].toFixed(2)}, ${line.start[1].toFixed(2)}) ~ (${line.end[0].toFixed(2)}, ${line.end[1].toFixed(2)})`, 2);
}

// Update intersection information display
function updateIntersectionInfo() {
    if (intersections.length === 0) {
        setupText(canvas, 'No intersection', 3);
    } else if (intersections.length === 1) {
        setupText(canvas, `Intersection Points: 1 Point 1: (${intersections[0][0].toFixed(2)}, ${intersections[0][1].toFixed(2)})`, 3);
    } else {
        setupText(canvas, `Intersection Points: 2 Point 1: (${intersections[0][0].toFixed(2)}, ${intersections[0][1].toFixed(2)}) 
        Point 2: (${intersections[1][0].toFixed(2)}, ${intersections[1][1].toFixed(2)})`, 3);
    }
}

// Calculate intersections between circle and line
function calculateIntersections() {
    intersections = [];
    
    if (!circle || !line) return;
    
    const [x1, y1] = line.start;
    const [x2, y2] = line.end;
    const [cx, cy] = circle.center;
    const r = circle.radius;
    
    // Line segment as parametric equations: x = x1 + t(x2-x1), y = y1 + t(y2-y1), 0 <= t <= 1
    const dx = x2 - x1;
    const dy = y2 - y1;
    
    // Quadratic equation coefficients: at² + bt + c = 0
    const a = dx * dx + dy * dy;
    const b = 2 * (dx * (x1 - cx) + dy * (y1 - cy));
    const c = (x1 - cx) * (x1 - cx) + (y1 - cy) * (y1 - cy) - r * r;
    
    const discriminant = b * b - 4 * a * c;
    
    if (discriminant < 0) {
        // No real roots, no intersection
        updateIntersectionInfo();
        return;
    }
    
    const sqrtDiscriminant = Math.sqrt(discriminant);
    const t1 = (-b + sqrtDiscriminant) / (2 * a);
    const t2 = (-b - sqrtDiscriminant) / (2 * a);
    
    // Check if t values are within the line segment (0 <= t <= 1)
    if (t1 >= 0 && t1 <= 1) {
        intersections.push([x1 + t1 * dx, y1 + t1 * dy]);
    }
    
    if (t2 >= 0 && t2 <= 1 && Math.abs(t1 - t2) > 1e-6) {
        intersections.push([x1 + t2 * dx, y1 + t2 * dy]);
    }
    
    updateIntersectionInfo();
}

// Draw the axes
function drawAxis() {
    const vertices = [
        -0.8, 0,
        0.8, 0,
        0, -0.8,
        0, 0.8
    ];
    
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    
    const positionLocation = gl.getAttribLocation(shaderProgram.program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    
    const colorLocation = gl.getUniformLocation(shaderProgram.program, 'u_color');
    gl.uniform4fv(colorLocation, [1.0, 1.0, 1.0, 1.0]);
    
    gl.drawArrays(gl.LINES, 0, vertices.length / 2);
    gl.deleteBuffer(vertexBuffer);
}

// Draw a circle
function drawCircle(center, radius, color = [1.0, 0.0, 0.0, 1.0]) {
    const segments = 100;
    const vertices = [];
    
    for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        vertices.push(
            center[0] + Math.cos(angle) * radius,
            center[1] + Math.sin(angle) * radius
        );
    }
    
    drawShape(vertices, gl.LINE_LOOP, color);
}

// Draw a line segment
function drawLine(start, end, color = [0.0, 1.0, 0.0, 1.0]) {
    const vertices = [
        start[0], start[1],
        end[0], end[1]
    ];
    
    drawShape(vertices, gl.LINES, color);
}

// Draw intersection points
function drawIntersections() {
    if (intersections.length === 0) return;
    
    const vertices = [];
    intersections.forEach(point => {
        vertices.push(point[0], point[1]);
    });
    
    // Set point size before drawing
    const pointSizeLocation = gl.getUniformLocation(shaderProgram.program, 'gl_PointSize');
    if (pointSizeLocation) {
        gl.uniform1f(pointSizeLocation, 10.0);
    }
    
    drawShape(vertices, gl.POINTS, [1.0, 1.0, 0.0, 1.0]);
}

// Generic function to draw a shape
function drawShape(vertices, mode, color) {
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    
    const positionLocation = gl.getAttribLocation(shaderProgram.program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    
    const colorLocation = gl.getUniformLocation(shaderProgram.program, 'u_color');
    gl.uniform4fv(colorLocation, color);
    
    gl.drawArrays(mode, 0, vertices.length / 2);
    gl.deleteBuffer(vertexBuffer);
}

// Main render function
function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Draw axes
    drawAxis();
    
    // Draw circle (either being drawn or final)
    if (isDrawingCircle || circle) {
        const center = isDrawingCircle ? circleCenter : circle.center;
        const radius = isDrawingCircle ? circleRadius : circle.radius;
        drawCircle(center, radius);
    }
    
    // Draw line (either being drawn or final)
    if (isDrawingLine || line) {
        const start = isDrawingLine ? lineStart : line.start;
        const end = isDrawingLine ? lineEnd : line.end;
        drawLine(start, end);
    }
    
    // Draw intersections if they exist
    if (intersections.length > 0) {
        drawIntersections();
    }
}

// Initialize the application when the module loads
document.addEventListener('DOMContentLoaded', async () => {
    await initWebGL();
    resizeAspectRatio();
    render();
});
