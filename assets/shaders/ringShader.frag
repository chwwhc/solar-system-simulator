#version 300 es
precision mediump float;

uniform sampler2D uTexture;
uniform vec3 uSunColor;
uniform vec3 uSunPosition;

in vec3 vNormal;
in vec3 vFragPos;
in vec2 vTexCoord;

out vec4 fragColor;

void main() {
    vec3 normal = normalize(vNormal);
    vec3 sunDir = normalize(uSunPosition - vFragPos);
    float diffuse = max(dot(normal, sunDir), 0.0f);
    vec4 texel = texture(uTexture, vTexCoord);
    vec3 ambient = 0.1f * texel.rgb;
    vec3 color = texel.rgb * uSunColor * diffuse + ambient;
    fragColor = vec4(color, texel.a);
}