precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_transition;
uniform float u_pointer;

const mat2 FBM_ROT = mat2(0.8, -0.6, 0.6, 0.8);

const vec3 SKY_BOTTOM = vec3(0.769, 0.867, 0.941); // #CDE8E5
const vec3 SKY_TOP = vec3(0.902, 0.957, 0.945); // #EEF7FF
const vec3 SKY_HIGHLIGHT = vec3(0.952, 0.978, 0.971); // ~#F3F9F7
const vec3 WATER_MEDIUM = vec3(0.769, 0.867, 0.941); // #CDE8E5
const vec3 WATER_DARK = vec3(0.122, 0.216, 0.275); // #1F3746
const vec3 FOAM_MID = vec3(0.769, 0.867, 0.941); // #CDE8E5
const vec3 FOAM_HIGHLIGHT = vec3(0.914, 0.969, 0.957); // ~#E9F7F4

const float TRANSITION_SCALE = 0.9;
const float WATER_BASELINE = 0.75;
const float CURSOR_PUSH_SCALE = 0.06;
const float CURSOR_SIGMA = 0.18;
const float CURSOR_OFFSET_STRENGTH = 0.42;
const float CLOUD_CURSOR_SIGMA = 0.075;
const float CLOUD_ATTRACTION = 0.4;
const float CLOUD_DENSITY_BOOST = 0.38;
const float FOAM_WIDTH = 0.04;
const float MEDIUM_SECTION_END = 0.9935;
const float GRADIENT_START = 0.915;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);

    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 5; i++) {
        value += (noise(p) - 0.5) * amplitude;
        p = FBM_ROT * p * 1.9 + vec2(0.37, -0.21);
        amplitude *= 0.5;
    }
    return clamp(0.5 + value, 0.0, 1.0);
}

float wave(vec2 p, float frequency, float amplitude, float speed, float offset) {
    return sin(p.x * frequency + u_time * speed + offset) * amplitude;
}

vec2 normalizeCoords(vec2 fragCoord, float aspect) {
    vec2 st = fragCoord / u_resolution.xy;
    st.x *= aspect;
    return st;
}

vec2 normalizeMouse(float aspect) {
    vec2 mouse = vec2(u_mouse.x / u_resolution.x, 1.0 - (u_mouse.y / u_resolution.y));
    mouse.x *= aspect;
    return mouse;
}

float cursorField(vec2 st, vec2 diff) {
    float dist = length(diff);
    float repelFalloff = exp(-(dist * dist) / (2.0 * CURSOR_SIGMA * CURSOR_SIGMA));
    float waterMask = 1.0 - smoothstep(0.45, 0.85, st.y);
    return pow(repelFalloff * waterMask, 0.8);
}

vec2 displacedUv(vec2 st, vec2 diff, float influence) {
    return st - diff * (influence * CURSOR_OFFSET_STRENGTH);
}

float layeredWaves(vec2 uv, float frequencyMultiplier, float amplitudeMultiplier) {
    float wave1 = wave(uv, frequencyMultiplier, amplitudeMultiplier * 0.05, 1.5, 0.0);
    float wave2 = wave(uv, frequencyMultiplier * 0.7, amplitudeMultiplier * 0.07, 2.0, 1.0);
    float wave3 = wave(uv, frequencyMultiplier * 0.5, amplitudeMultiplier * 0.1, 2.5, 2.0);
    return wave1 + wave2 + wave3;
}

vec3 paintSky(vec2 st, float waterSurface, float aspect) {
    float skyBlend = smoothstep(0.26, 0.95, st.y);
    vec3 skyBase = mix(SKY_BOTTOM, SKY_TOP, skyBlend);

    vec2 cloudFlow = st * 2.0;
    cloudFlow += vec2(u_time * 0.015, u_time * 0.006);

    vec2 screenUv = vec2(st.x / aspect, st.y);
    vec2 mouseUv = vec2(u_mouse.x / u_resolution.x, 1.0 - (u_mouse.y / u_resolution.y));
    vec2 cloudDiff = screenUv - mouseUv;
    float cloudInfluence = u_pointer *
        exp(-(dot(cloudDiff, cloudDiff)) / (2.0 * CLOUD_CURSOR_SIGMA * CLOUD_CURSOR_SIGMA));
    cloudInfluence = clamp(cloudInfluence * 1.35, 0.0, 1.0);
    cloudInfluence *= smoothstep(0.52, 0.82, st.y);
    cloudFlow -= vec2(cloudDiff.x * aspect, cloudDiff.y) * (CLOUD_ATTRACTION * cloudInfluence);

    float cloudMacro = fbm(cloudFlow * 0.85);
    float cloudDetail = fbm(cloudFlow * 2.4 + vec2(12.7, -9.1));
    float clouds = clamp(cloudMacro * 0.8 + cloudDetail * 0.2 + cloudInfluence * 0.12, 0.0, 1.0);

    float cloudStructure = smoothstep(0.26, 0.68, clouds);
    cloudStructure = pow(cloudStructure, 1.05);
    cloudStructure = clamp(cloudStructure * (1.15 + cloudInfluence * CLOUD_DENSITY_BOOST), 0.0, 1.0);
    float topFade = smoothstep(0.45, 0.78, st.y);
    float horizonFade = smoothstep(1.02, 1.2, waterSurface);
    float cloudAmount = clamp(cloudStructure * topFade * horizonFade * 1.6, 0.0, 1.0);

    float cursorDetail = fbm(cloudFlow * 5.1 + vec2(4.7, -13.2));
    float cursorHighlight = max(0.0, cursorDetail - 0.5);
    float cursorContrast = cursorHighlight * cloudInfluence * 0.9;
    float cursorShade = cursorHighlight * cloudInfluence * 1.0;
    cloudStructure = clamp(cloudStructure + cursorContrast, 0.0, 1.0);
    cloudAmount = clamp(cloudAmount + cloudInfluence * 0.08, 0.0, 1.0);

    float veilNoise = fbm(cloudFlow * 3.6 + vec2(-6.4, 8.1));
    float cloudVeil = smoothstep(0.18, 0.55, veilNoise);
    cloudVeil = pow(cloudVeil, 1.05);
    cloudVeil = clamp(cloudVeil + cursorContrast * 0.65, 0.0, 1.0);
    float veilAmount =
        clamp(cloudVeil * topFade * horizonFade * 0.5 + cloudInfluence * 0.18, 0.0, 0.72);

    float cloudShadow = smoothstep(0.12, 0.55, clouds) * 0.28;
    vec3 cloudBase = skyBase * (1.0 - cloudShadow);
    vec3 cloudColor = mix(cloudBase, SKY_HIGHLIGHT, clamp(cloudStructure * 1.25, 0.0, 1.0));
    vec3 veilColor = mix(skyBase, SKY_HIGHLIGHT, 0.55);
    vec3 skyWithVeil = mix(skyBase, veilColor, veilAmount);
    skyWithVeil = clamp(skyWithVeil + vec3(cursorShade * 0.5), 0.0, 1.0);
    cloudColor = clamp(cloudColor + vec3(cursorShade), 0.0, 1.0);
    return mix(skyWithVeil, cloudColor, cloudAmount);
}

vec3 baseColor(vec2 st, float waterSurface, float aspect) {
    if (waterSurface > 1.0) {
        return paintSky(st, waterSurface, aspect);
    }
    if (waterSurface > MEDIUM_SECTION_END) {
        return WATER_MEDIUM;
    }
    if (waterSurface > GRADIENT_START) {
        float gradientFactor = 1.0 - (waterSurface - GRADIENT_START) / (MEDIUM_SECTION_END - GRADIENT_START);
        return mix(WATER_MEDIUM, WATER_DARK, clamp(gradientFactor, 0.0, 1.0));
    }
    return WATER_DARK;
}

vec3 applyFoam(vec3 color, vec2 st, float displacedWave, float waterSurface, float aspect) {
    float crest = max(0.0, 1.0 - waterSurface);
    float foamBand = smoothstep(FOAM_WIDTH, 0.0, crest);
    foamBand = pow(foamBand, 1.65);

    vec2 foamFlow = vec2(st.x * aspect * 3.8, st.y * 7.2);
    foamFlow += vec2(u_time * 0.12, u_time * 0.18);
    foamFlow += displacedWave * 2.4;

    float foamField = fbm(foamFlow);
    float foamSoft = smoothstep(0.32, 0.68, foamField);
    float foamIslands = smoothstep(0.55, 0.83, foamField);
    float foamCrests = clamp((foamIslands - foamSoft) * 1.9, 0.0, 1.0);

    float foamBody = clamp(foamBand * foamSoft * 1.25, 0.0, 1.0);
    float foamHighlight = clamp(foamBand * (foamCrests + 0.25 * foamIslands), 0.0, 1.0);

    color = mix(color, FOAM_MID, foamBody * 0.6);
    color = mix(color, FOAM_HIGHLIGHT, foamHighlight);
    return color;
}

void main() {
    float aspect = u_resolution.x / u_resolution.y;
    vec2 st = normalizeCoords(gl_FragCoord.xy, aspect);
    vec2 mouse = normalizeMouse(aspect);
    vec2 diff = st - mouse;

    float cursorInfluence = cursorField(st, diff);
    vec2 waveUv = displacedUv(st, diff, cursorInfluence);

    float frequencyMultiplier = mix(1.0, 15.0, 0.75);
    float amplitudeMultiplier = mix(0.25, 0.05, 0.75) * 1.2;

    float waveHeight = layeredWaves(waveUv, frequencyMultiplier, amplitudeMultiplier);
    float attenuation = mix(1.0, 0.03, cursorInfluence);
    float displacedWave = waveHeight * attenuation;

    float transitionOffset = u_transition * TRANSITION_SCALE;
    float waterSurface = st.y + displacedWave + WATER_BASELINE - transitionOffset - cursorInfluence * CURSOR_PUSH_SCALE;

    vec3 color = baseColor(st, waterSurface, aspect);
    color = applyFoam(color, st, displacedWave, waterSurface, aspect);

    gl_FragColor = vec4(color, 1.0);
}
