uniform vec3 u_resolution;
uniform float u_time;
uniform vec2 u_sound;

mat2 rot2D(float angle) {
    float s = sin(angle);
    float c = cos(angle);

    return mat2(c, -s, s, c);
}

float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (a-b) / k, 0.0, 1.0);
    return mix(a, b, h) - k * h *(1.0-h);
}

float sdSphere(vec3 p, float s) {
    return length(p) - s;
}

float sdBox(vec3 p, vec3 b)  {
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float map(vec3 p) {
    //    vec3 pos = vec3(sin(u_time) * 3.0, 0.0, 0.0);
    float sphere = sdSphere(p, 0.3);

    vec3 q = p;
    vec2 k = vec2(0.0, abs(sin(u_time * .5 - floor(p) + trunc(p))));
    k = vec2(0.0);
    q.xy = mod(q.xy + k, 0.4) - 0.2;
    q.xy *= rot2D(2.0 * u_time);
    float box = sdBox(q, vec3(0.1));

    return smin(box, sphere, 0.1);
}

vec3 palete(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
    return a + b * cos(6.28318 * (c * t + d));
}

vec3 palete1(float t) {
    return palete(t, vec3(0.8, 0.5, 0.4), vec3(0.2, 0.4, 0.2), vec3(2.0, 1.0, 1.0), vec3(0.0, 0.25, 0.25));
}


void main() {
    // move origin to center
    vec2 uv = gl_FragCoord.xy / u_resolution.xy * 2.0 - 1.0;
    // apply aspect ratio
    uv *= vec2(u_resolution.x / u_resolution.y, 1);

    vec3 color = vec3(0.0);

    vec3 ro = vec3(0, 0, -3);
    vec3 rd = normalize(vec3(uv, 2.5));

    float td = 0.0;

    int i;
    for (i = 0; i < 80; i++) {
        vec3 p = ro + rd * td;
        p.xy *= 1.0 / cos(u_sound[0]);

        p.z += sin(td);

        float d = map(p);

        td += d;

        if (d < 0.001) break;
        if (td > 100.0) break;
    }

    color = palete1(td * 0.2 + u_time * .2);

    gl_FragColor = vec4(color, 1.0);
}
