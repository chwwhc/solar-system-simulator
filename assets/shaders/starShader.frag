#version 300 es
precision mediump float;

uniform sampler2D uTexture;
uniform vec3 uSunColor;
uniform vec3 uSunPosition;

in vec2 vTexCoord;

out vec4 fragColor;

void main() {
    vec4 texel = texture(uTexture, vTexCoord);

    fragColor = vec4(texel.rgb, texel.a);
}
