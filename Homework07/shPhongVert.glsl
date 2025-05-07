#version 300 es
precision mediump float;

layout(location = 0) in vec3 a_position;
layout(location = 1) in vec3 a_normal;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;

out vec3 FragPos;
out vec3 Normal;

void main() {
    vec4 worldPos = u_model * vec4(a_position, 1.0);
    FragPos = vec3(u_view * worldPos);     // position in view space
    Normal = mat3(transpose(inverse(u_view * u_model))) * a_normal; // normal in view space
    gl_Position = u_projection * vec4(FragPos, 1.0);
}
