uniform vec3 u_resolution;
uniform float u_time;
uniform vec2 sound;
uniform vec3 aColor;
uniform vec3 bColor;
uniform vec3 cColor;
uniform vec3 dColor;
uniform float param;

vec3 palette(float t) {
    return aColor + bColor * cos(6.28318 * (cColor * t + dColor));
}

vec4 circle(vec2 r_uv, float radius, float blur) {
    vec3 color = palette(r_uv.x - u_time / 4.0);
    float c = smoothstep(radius, radius - blur, r_uv.x);
    return vec4(color, c);
}

vec4 blob(vec2 uv, vec2 r_uv, float s, float blur) {
    vec3 color = palette(uv.x + 1.2);

    float v = floor(r_uv.x);
    r_uv.x = fract(r_uv.x);

    float c = cos(r_uv.y * 21.0 + u_time);
    c *= sin(r_uv.y * 3.0 + u_time * v);
    c *= sin(r_uv.y) - 0.5;
    c += sin(r_uv.y) - 0.5;
    c *= s / 2.0;

    c = smoothstep(c, c - blur, r_uv.x);

    return vec4(color, c);
}

vec4 blob2(vec2 r_uv, float s, float blur) {
    vec3 color = palette(r_uv.x + 3.14);

    float v = floor(r_uv.x);
    r_uv.x = fract(r_uv.x);

    float c = abs(cos(r_uv.y * 21.0 + u_time));
    c *= sin(r_uv.y * 3.0 + u_time * v);
    c *= sin(r_uv.y) - 0.5;
    c += sin(r_uv.y + 3.14) - 0.5;
    c *= s / 2.0;

    c = smoothstep(c, c - blur, r_uv.x);

    return vec4(color, c);
}


void main() {
    // move origin to center
    vec2 uv = gl_FragCoord.xy / u_resolution.xy * 2.0 - 1.0;
    // apply aspect ratio
    uv *= vec2(u_resolution.x / u_resolution.y, 1);

    float r = length(uv) * 2.0;
    float a = atan(uv.y, uv.x);
    vec2 r_uv = vec2(r, a);

    float fr = fract(r);
    vec3 color = palette(floor(uv.y) + u_time * .4 + fr * 0.4);

    float s1 = pow(sound[0], 4.0);
    float s2 = pow(sound[1], 4.0);
    vec4 c1 = blob(uv, r_uv, 0.7 + s1, 0.01);
    vec4 c2 = blob2(r_uv, 0.7 + s2, 0.01);
    vec4 c3 = circle(r_uv, 0.2 + param, 0.0);

    vec4 finalColor = mix(vec4(color, 1.0), c1, c1.a);
    finalColor = mix(finalColor, c2, c2.a);
    finalColor = mix(finalColor, c3, c3.a);

    gl_FragColor = vec4(finalColor);
}
