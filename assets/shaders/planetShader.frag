#version 300 es
precision mediump float;

uniform sampler2D uTexture; // Texture sampler uniform

in highp vec3 vLighting;
in highp vec2 vTexCoord; // Received from vertex shader

out vec4 fragColor;

void main() {
    vec4 texel = texture(uTexture, vTexCoord); // Sample the texture
    fragColor = vec4(texel.rgb * vLighting, texel.a); // Apply lighting to texture color
}