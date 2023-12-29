uniform vec3 u_resolution;
uniform float u_time;

float sdCircle(vec2 uv, vec2 pos, float r) {
    return length(uv - pos) - r;
}

void main() {
    // move origin to center
    vec2 uv = gl_FragCoord.xy / u_resolution.xy * 2.0 - 1.0;
    // apply aspect ratio
    uv *= vec2(u_resolution.x / u_resolution.y, 1);

    float param = 1.0;
//    float d = fract(cos(uv.y + abs(sin(u_time))) * sin(uv.x + cos(u_time))*100.0 * param);
    vec3 color = vec3(1.0) * d;

    gl_FragColor = vec4(color, 1.0);
}