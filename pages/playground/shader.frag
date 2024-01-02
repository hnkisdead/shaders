uniform vec3 u_resolution;
uniform float u_time;

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
    vec3 pos = vec3(sin(u_time) * 2.0, 0.0, 0.0);
    float sphere = sdSphere(p - pos, 0.4);

    vec3 boxP = p;
    boxP.xy = mod(boxP.xy, 2.0) - 1.0;
    boxP.yz *= rot2D(u_time);
    boxP.zx *= rot2D(u_time);
    float box = sdBox(boxP, vec3(0.3));
    box -= .1; //* sin(3.0 * u_time + 10.0);

    float ground = p.y + 10.5;

    return min(smin(box, sphere, 0.1), ground);
}

float rayMarch(vec3 ro, vec3 rd) {
    float td = 0.0;

    for (int i = 0; i < 80; i++) {
        vec3 p = ro + rd * td;

        float d = map(p);

        td += d;

        if (d < 0.001 || td > 100.0) break;
    }

    return td;
}

vec3 calcNormal(in vec3 p) {
    const float h = 0.005;
    const vec2 k = vec2(1, -1);
    return normalize(k.xyy * map(p + k.xyy * h) + k.yyx * map(p + k.yyx * h) + k.yxy * map(p + k.yxy*h) + k.xxx * map(p + k.xxx * h));
}

float calcLight(vec3 p, vec3 light) {
    vec3 l = normalize(light - p);
    vec3 n = calcNormal(p);
    float dif = clamp(dot(n, l), 0.0, 1.0);
    return dif;
}

void main() {
    // move origin to center
    vec2 uv = gl_FragCoord.xy / u_resolution.xy * 2.0 - 1.0;
    // apply aspect ratio
    uv *= vec2(u_resolution.x / u_resolution.y, 1);

    vec3 color = vec3(0.0);

    vec3 ro = vec3(0, 0, -3);
    vec3 rd = normalize(vec3(uv, 1));

    float d = rayMarch(ro, rd);

    vec3 p = ro + rd * d;

    float dif = calcLight(p, vec3(0.0, 5.0, -6.0));
    float dif2 = calcLight(p, vec3(0.0, -5.0, -6.0));

    color = vec3(1.0, 0.5, 0.0) * dif + vec3(0.0, 0.5, 1.0) * dif2;

    gl_FragColor = vec4(color, 1.0);
}
