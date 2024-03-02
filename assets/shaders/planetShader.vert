#version 300 es

layout(location = 0) in vec4 position;
layout(location = 1) in vec3 normal;
layout(location = 2) in vec2 texCoord;

uniform mat4 uModelMat;
uniform mat4 uViewMat;
uniform mat4 uProjMat;

out highp vec3 vLighting;
out highp vec2 vTexCoord;

void main() {
    gl_Position = uProjMat * uViewMat * uModelMat * position;
    vLighting = vec3(1.0f, 1.0f, 1.0f);
    vTexCoord = texCoord;
}