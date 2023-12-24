uniform vec3 iResolution;
uniform float iTime;

vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
    return a + b * cos(6.28318 * (c * t + d));
}

vec3 palette1(float t) {
    vec3 a = vec3(0.230, 0.584, 0.753);
    vec3 b = vec3(0.110, 0.467, 0.150);
    vec3 c = vec3(1.026, 1.474, 1.312);
    vec3 d = vec3(4.698, 4.985, 0.293);
    return palette(t, a, b, c, d);
}

void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - iResolution.xy) / iResolution.y;
    vec2 uv0 = uv;

    vec3 finalColor = vec3(0.0);

    for (float i = 0.0; i < 3.0; i++) {
        uv = fract(uv * 1.5) - 0.5;

        float d = length(uv) * exp(-length(uv0));

        vec3 col = palette1(length(uv0) + iTime * 0.4 + i * 0.4);

        d = sin(d * 8.0 + iTime) / 8.0;
        d = abs(d);
        d = pow(0.01 / d, 1.2);

        finalColor += col * d;
    }

    gl_FragColor = vec4(finalColor, 1.0);
}