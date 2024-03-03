#version 300 es
precision mediump float;

uniform sampler2D uTexture;

in highp vec2 vTexCoord;

out vec4 fragColor;

void main() {
    vec4 texel = texture(uTexture, vTexCoord); 

    // Simple lighting effect based on texture alpha
    float lighting = 0.5f + 0.5f * texel.a; 

    // Apply a simple lighting model directly and allow for texture alpha to control transparency
    fragColor = vec4(texel.rgb * lighting, texel.a);
}
