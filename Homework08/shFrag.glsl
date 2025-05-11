#version 300 es
precision highp float;

out vec4 FragColor;
in vec3 fragPos;  
in vec3 normal;  
in vec2 texCoord;

struct Material {
    vec3 diffuse;    // Diffuse color (now using solid color)
    vec3 specular;   // Specular color
    float shininess; // Specular shininess
};

struct Light {
    vec3 direction;
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};

uniform Material material;
uniform Light light;
uniform vec3 u_viewPos;
uniform int u_toonLevels;

void main() {
    // Ambient
    vec3 ambient = light.ambient * material.diffuse;
    
    // Diffuse 
    vec3 norm = normalize(normal);
    vec3 lightDir = normalize(light.direction);
    float dotNormLight = dot(norm, lightDir);
    
    // Toon shading - quantize diffuse component
    float diff = max(dotNormLight, 0.0);
    diff = floor(diff * float(u_toonLevels)) / float(u_toonLevels);
    vec3 diffuse = light.diffuse * diff * material.diffuse;
    
    // Specular
    vec3 viewDir = normalize(u_viewPos - fragPos);
    vec3 reflectDir = reflect(-lightDir, norm);
    float spec = 0.0;
    if (dotNormLight > 0.0) {
        spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
        // Toon shading - quantize specular component
        spec = floor(spec * float(u_toonLevels)) / float(u_toonLevels);
    }
    vec3 specular = light.specular * spec * material.specular;
    
    vec3 result = ambient + diffuse + specular;
    FragColor = vec4(result, 1.0);
}