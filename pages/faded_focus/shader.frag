uniform vec3 iResolution;
uniform float iTime;
uniform float sound1;
uniform float sound2;

//rgb(255, 229, 229)
vec3 backgroundColor = vec3(1.0, 0.898, 0.898);
// rgb(117, 106, 182)
vec3 shapeColor = vec3(0.459, 0.416, 0.714);
// rgb(172, 135, 197)
vec3 shapeColor1 = vec3(0.674, 0.529, 0.773);

float rand(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

vec3 palette(float t) {
    //    vec3 a = vec3(0.698, 0.468, 0.848);
    //    vec3 b = vec3(0.428, -0.092, 0.500);
    //    vec3 c = vec3(0.608, 2.898, 0.667);
    //    vec3 d = vec3(0.628, -0.362, 0.333);
    vec3 a = vec3(0.630, -0.362, 0.630);
    vec3 b = vec3(0.248, 0.440, 0.176);
    vec3 c = vec3(0.690, 1.331, 0.690);
    vec3 d = vec3(1.348, 1.858, 1.208);
    return a + b * cos(6.28318 * (c * t + d));
}

vec4 circle(vec2 uv, vec2 pos, float r, float blur, vec3 color) {
    float d = length(uv - pos);
    float c = smoothstep(r, r - blur, d);
    return vec4(color, c);
}

vec4 blob(vec2 uv, vec2 pos, float s, float blur, vec3 color) {
    vec2 i = uv - pos;

    float r = length(i) * 2.0;
    float a = atan(i.y, i.x);

    vec3 color1 = palette(r + 1.2);

    float v = floor(r);
    r = fract(r);

    float c = cos(a * 21.0 + iTime) * sin(a * 3.0 + iTime * v);
    c *= sin(a) - 0.5;
    c += sin(a) - 0.5;
    c *= s / 2.0;

    c = smoothstep(c, c - blur, r);

    return vec4(color1, c);
}

vec4 blob2(vec2 uv, vec2 pos, float s, float blur, vec3 color) {
    vec2 i = uv - pos;

    float r = length(i) * 2.0;
    float a = atan(i.y, i.x);

    vec3 color1 = palette(r + 3.14);

    float v = floor(r);
    r = fract(r);

    float c = abs(cos(a * 21.0 + iTime)) * sin(a * 3.0 + iTime * v);
    c *= sin(a) - 0.5;
    c += sin(a + 3.14) - 0.5;
    c *= s / 2.0;

    c = smoothstep(c, c - blur, r);

    return vec4(color1, c);
}


void main() {
    // move origin to center
    vec2 uv = gl_FragCoord.xy / iResolution.xy * 2.0 - 1.0;
    // apply aspect ratio
    uv *= vec2(iResolution.x / iResolution.y, 1);

    float r = length(uv) * 2.0;
    float a = atan(uv.y, uv.x);
    float fr = fract(r);
    vec3 color1 = palette(r + iTime * .4 + fr * 0.4);

    float s1 = pow(sound1, 4.0);
    float s2 = pow(sound2, 4.0);
    vec4 c1 = blob(uv, vec2(0.0), 0.7 + s1, 0.01, shapeColor);
    //    c1 = vec4(vec3(0.0), 0.0);
    vec4 c2 = blob2(uv, vec2(0.0), 0.7 + s2, 0.01, shapeColor);
    vec4 c3 = circle(uv, vec2(0.0), 0.1, 0.0, color1);
    //    c3 = vec4(vec3(0.0), 0.0);

    vec4 finalColor = mix(vec4(color1, 1.0), c1, c1.a);
    finalColor = mix(finalColor, c2, c2.a);
    finalColor = mix(finalColor, c3, c3.a);

    gl_FragColor = vec4(finalColor);
}
