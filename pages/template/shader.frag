uniform vec3 u_resolution;
uniform float u_time;
uniform float u_param;

float sdCircle(vec2 uv, vec2 pos, float r) {
    return length(uv - pos) - r;
}

void main() {
    // move origin to center
    vec2 uv = gl_FragCoord.xy / u_resolution.xy * 2.0 - 1.0;
    // apply aspect ratio
    uv *= vec2(u_resolution.x / u_resolution.y, 1);

    float d = abs(sin(length(uv) + u_time * u_param));
    vec3 color = vec3(1.0) * d;

    gl_FragColor = vec4(color, 1.0);
}