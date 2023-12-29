uniform vec3 u_resolution;
uniform float u_time;

float circle(vec2 uv, vec2 pos, float r) {
    float d = length(uv - pos);
    return smoothstep(r, r - 0.001, d);
}

float rand(float v){
    return (fract(sin(v)*100000.0) - 0.5) * 2.0;
}

void main() {
    // move origin to center
    vec2 uv = gl_FragCoord.xy / u_resolution.xy * 2.0 - 1.0;
    // apply aspect ratio
    uv *= vec2(u_resolution.x / u_resolution.y, 1);

    vec3 finalColor = vec3(1.0);

//    for (int i = 0; i < 10; i++) {
//        float fi = float(i);
//        vec2 dir = vec2(0.0, -mod(-0.5 + u_time * 0.4 + u_time * 0.3 * abs(floor(fi * rand(10.0 * fi) - 1.33)), 2.0));
//        vec2 pos = vec2(0.0 + sin(float(i)), 1.0) + dir;
//        float d = circle(uv, pos, 0.03);
//        vec3 color = vec3(1.0) * d;
//
//        finalColor *= color;
//    }

    finalColor = vec3(0.0) * circle(uv, vec2(0.0), 0.3);

    gl_FragColor = vec4(finalColor, 1.0);
}