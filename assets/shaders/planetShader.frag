#version 300 es
precision mediump float;

uniform sampler2D uTexture;

in highp vec3 vLighting;
in highp vec2 vTexCoord;

out vec4 fragColor;

void main() {
    vec4 texel = texture(uTexture, vTexCoord);
    fragColor = vec4(texel.rgb * vLighting, texel.a);
}