#version 300 es
precision mediump float;

layout(location = 0) in vec3 position;
layout(location = 1) in vec3 normal;
layout(location = 2) in vec2 texCoord;

uniform mat4 uModelMat;
uniform mat4 uViewMat;
uniform mat4 uProjMat;

out vec3 vNormal;
out vec3 vFragPos;
out vec2 vTexCoord;

void main() {
    vTexCoord = texCoord;
    vFragPos = vec3(uModelMat * vec4(position, 1.0f));
    vNormal = mat3(transpose(inverse(uModelMat))) * normal;
    gl_Position = uProjMat * uViewMat * vec4(vFragPos, 1.0f);
}