export class RegularOctahedron {
    constructor(gl, options = {}) {
        this.gl = gl;
        
        // Creating VAO and buffers
        this.vao = gl.createVertexArray();
        this.vbo = gl.createBuffer();
        this.ebo = gl.createBuffer();

        // Vertex positions (6 vertices for octahedron)
        this.vertices = new Float32Array([
            // Top vertex (0)
            0, Math.sqrt(2)/2, 0,
            // Bottom vertex (1)
            0, -Math.sqrt(2)/2, 0,
            // Front-right vertex (2)
            0.5, 0, 0.5,
            // Front-left vertex (3)
            -0.5, 0, 0.5,
            // Back-left vertex (4)
            -0.5, 0, -0.5,
            // Back-right vertex (5)
            0.5, 0, -0.5
        ]);

        // Normals (per vertex)
        this.normals = new Float32Array([
            // Top vertex normal - average of top faces
            0, 0.707, 0.707,
            
            // Bottom vertex normal - average of bottom faces
            0, -0.707, -0.707,
            
            // Front-right vertex normal
            0.707, 0, 0.707,
            
            // Front-left vertex normal
            -0.707, 0, 0.707,
            
            // Back-left vertex normal
            -0.707, 0, -0.707,
            
            // Back-right vertex normal
            0.707, 0, -0.707
        ]);

        // if color is provided, set all vertices' color to the given color
        if (options.color) {
            this.colors = new Float32Array(6 * 4);
            for (let i = 0; i < 6 * 4; i += 4) {
                this.colors[i] = options.color[0];
                this.colors[i+1] = options.color[1];
                this.colors[i+2] = options.color[2];
                this.colors[i+3] = options.color[3];
            }
        } else {
            this.colors = new Float32Array([
                // Top vertex - cyan
                0, 1, 1, 1,
                // Bottom vertex - purple
                1, 0, 1, 1,
                // Front-right - red
                1, 0, 0, 1,
                // Front-left - green
                0, 1, 0, 1,
                // Back-left - blue
                0, 0, 1, 1,
                // Back-right - yellow
                1, 1, 0, 1
            ]);
        }

        this.texCoords = new Float32Array([
            // Top vertex - center top of texture
            0.5, 1.0,
            // Bottom vertex - center bottom of texture
            0.5, 0.0,
            // Front-right - middle right
            1.0, 0.5,
            // Front-left - middle left
            0.0, 0.5,
            // Back-left - middle left
            0.0, 0.5,
            // Back-right - middle right
            1.0, 0.5
        ]);

        this.indices = new Uint16Array([
            // Top pyramid faces
            0, 2, 3,  // front
            0, 3, 4,   // left
            0, 4, 5,   // back
            0, 5, 2,   // right
            
            // Bottom pyramid faces
            1, 3, 2,   // front
            1, 4, 3,    // left
            1, 5, 4,    // back
            1, 2, 5     // right
        ]);

        this.initBuffers();
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

        // VBO에 데이터 복사사
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, totalSize, gl.STATIC_DRAW);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertices);
        gl.bufferSubData(gl.ARRAY_BUFFER, vSize, this.normals);
        gl.bufferSubData(gl.ARRAY_BUFFER, vSize + nSize, this.colors);
        gl.bufferSubData(gl.ARRAY_BUFFER, vSize + nSize + cSize, this.texCoords);

        // EBO에 인덱스 데이터 복사
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

        // vertex attributes 설정
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);  // position
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, vSize);  // normal
        gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 0, vSize + nSize);  // color
        gl.vertexAttribPointer(3, 2, gl.FLOAT, false, 0, vSize + nSize + cSize);  // texCoord

        // vertex attributes 활성화화
        gl.enableVertexAttribArray(0);
        gl.enableVertexAttribArray(1);
        gl.enableVertexAttribArray(2);
        gl.enableVertexAttribArray(3);

        // 버퍼 바인딩 해제제
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindVertexArray(null);
    }

    draw(shader) {
        const gl = this.gl;
        shader.use();
        gl.bindVertexArray(this.vao);
        gl.drawElements(gl.TRIANGLES, 24, gl.UNSIGNED_SHORT, 0); // 8 triangles * 3 vertices = 24
        gl.bindVertexArray(null);
    }

    delete() {
        const gl = this.gl;
        gl.deleteBuffer(this.vbo);
        gl.deleteBuffer(this.ebo);
        gl.deleteVertexArray(this.vao);
    }
}