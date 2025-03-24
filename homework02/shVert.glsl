#version 300 es
in vec2 a_position;
uniform vec2 u_translation;

void main() {
    vec2 translatedPosition = a_position + u_translation;
    gl_Position = vec4(translatedPosition, 0.0, 1.0);
}