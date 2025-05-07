export class Cone {
    constructor(gl, segments = 32, options = {}) {
        this.gl = gl;

        // Creating VAO and buffers
        this.vao = gl.createVertexArray();
        this.vbo = gl.createBuffer();
        this.ebo = gl.createBuffer();

        // Set parameters
        const radius = 0.5;
        const halfH = 0.5;
        this.segments = segments;

        // Angle step for each segment
        const angleStep = (2 * Math.PI) / segments;

        // Vertex, normal, color, texture coordinate, index arrays
        const positions = [];
        const normals   = [];
        const colors    = [];
        const texCoords = [];
        const indices   = [];

        const defaultColor = [0.8, 0.8, 0.8, 1.0];
        const colorOption = options.color || defaultColor;

        // Apex vertex (top of the cone)
        const apex = [0, halfH, 0];
        
        for (let i = 0; i < segments; i++) {
            const angle0 = i * angleStep;
            const angle1 = (i + 1) * angleStep;

            const x0_bot = radius * Math.cos(angle0);
            const z0_bot = radius * Math.sin(angle0);
            const x1_bot = radius * Math.cos(angle1);
            const z1_bot = radius * Math.sin(angle1);

            positions.push(
                apex[0], apex[1], apex[2],
                x1_bot, -halfH, z1_bot,
                x0_bot, -halfH, z0_bot
            );

            // calculate normals
            const v1 = [x1_bot - apex[0], -halfH - apex[1], z1_bot - apex[2]];
            const v2 = [x0_bot - apex[0], -halfH - apex[1], z0_bot - apex[2]];
            const normal = [
                v1[1] * v2[2] - v1[2] * v2[1],
                v1[2] * v2[0] - v1[0] * v2[2],
                v1[0] * v2[1] - v1[1] * v2[0]
            ];
            const len = Math.sqrt(normal[0]*normal[0] + normal[1]*normal[1] + normal[2]*normal[2]);
            const normalizedNormal = [
                normal[0]/len,
                normal[1]/len,
                normal[2]/len
            ];

            // flat shading
            for (let k = 0; k < 3; k++) {
                normals.push(...normalizedNormal);
            }

            for (let k = 0; k < 3; k++) {
                colors.push(
                    colorOption[0],
                    colorOption[1],
                    colorOption[2],
                    colorOption[3]
                );
            }

            texCoords.push(
                0.5, 1,
                1, 0,
                0, 0
            );

            const base = i * 3;
            indices.push(
                base, base + 1, base + 2
            );
        }

        this.vertices = new Float32Array(positions);
        this.normals  = new Float32Array(normals);
        this.colors   = new Float32Array(colors);
        this.texCoords= new Float32Array(texCoords);
        this.indices  = new Uint16Array(indices);

        // backup normals (for flat/smooth shading)
        this.faceNormals = new Float32Array(this.normals);
        this.vertexNormals = new Float32Array(this.normals.length);
        this.computeVertexNormals();

        this.initBuffers();
    }

    // Compute vertex normals by averaging face normals
    computeVertexNormals() {
        const vertCount = this.vertices.length / 3;
        const vertexNormals = new Array(vertCount).fill(0).map(() => [0, 0, 0]);
    
        const getPos = (i) => [
            this.vertices[i * 3],
            this.vertices[i * 3 + 1],
            this.vertices[i * 3 + 2]
        ];
    
        const samePos = (a, b) =>
            Math.abs(a[0] - b[0]) < 1e-5 &&
            Math.abs(a[1] - b[1]) < 1e-5 &&
            Math.abs(a[2] - b[2]) < 1e-5;
    
        // For each vertex, find others at same position and average normals
        for (let i = 0; i < vertCount; i++) {
            const pi = getPos(i);
            const sum = [0, 0, 0];
            let count = 0;
    
            for (let j = 0; j < vertCount; j++) {
                const pj = getPos(j);
                if (samePos(pi, pj)) {
                    sum[0] += this.faceNormals[j * 3];
                    sum[1] += this.faceNormals[j * 3 + 1];
                    sum[2] += this.faceNormals[j * 3 + 2];
                    count++;
                }
            }
    
            // Normalize the result
            const len = Math.hypot(sum[0], sum[1], sum[2]);
            this.vertexNormals[i * 3]     = sum[0] / len;
            this.vertexNormals[i * 3 + 1] = sum[1] / len;
            this.vertexNormals[i * 3 + 2] = sum[2] / len;
        }
    }
    
    copyFaceNormalsToNormals() {
        this.normals.set(this.faceNormals);
    }

    copyVertexNormalsToNormals() {
        this.normals.set(this.vertexNormals);
    }

    initBuffers() {
        const gl = this.gl;

        // 버퍼 크기 계산
        const vSize = this.vertices.byteLength;
        const nSize = this.normals.byteLength;
        const cSize = this.colors.byteLength;
        const tSize = this.texCoords.byteLength;
        const totalSize = vSize + nSize + cSize + tSize;

        gl.bindVertexArray(this.vao);

        // VBO에 데이터 복사
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, totalSize, gl.STATIC_DRAW);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertices);
        gl.bufferSubData(gl.ARRAY_BUFFER, vSize, this.normals);
        gl.bufferSubData(gl.ARRAY_BUFFER, vSize + nSize, this.colors);
        gl.bufferSubData(gl.ARRAY_BUFFER, vSize + nSize + cSize, this.texCoords);

        // EBO에 인덱스 데이터 복사
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

        // vertexAttribPointer 설정
        // (shader의 layout: 0->pos, 1->normal, 2->color, 3->texCoord)
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);  // positions
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, vSize); // normals
        gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 0, vSize + nSize); // colors
        gl.vertexAttribPointer(3, 2, gl.FLOAT, false, 0, vSize + nSize + cSize); // texCoords

        // vertex attributes 활성화
        gl.enableVertexAttribArray(0);
        gl.enableVertexAttribArray(1);
        gl.enableVertexAttribArray(2);
        gl.enableVertexAttribArray(3);

        // 버퍼 바인딩 해제
        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    updateNormals() {
        const gl = this.gl;
        gl.bindVertexArray(this.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);

        const vSize = this.vertices.byteLength;
        
        // normals 데이터만 업데이트
        gl.bufferSubData(gl.ARRAY_BUFFER, vSize, this.normals);

        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindVertexArray(null);
    }

    draw(shader) {
        const gl = this.gl;
        shader.use();
        gl.bindVertexArray(this.vao);
        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
        gl.bindVertexArray(null);
    }

    delete() {
        const gl = this.gl;
        gl.deleteBuffer(this.vbo);
        gl.deleteBuffer(this.ebo);
        gl.deleteVertexArray(this.vao);
    }
}