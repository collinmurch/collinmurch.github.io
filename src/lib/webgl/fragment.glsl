precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_transition;

const mat2 FBM_ROT = mat2(0.8, -0.6, 0.6, 0.8);

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

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y; // Correct aspect ratio

    // For bringing up the wave on transition
    float transitionOffset = u_transition * 0.9;

    // Fixed baseline wave intensity (75% of previous interactive range)
    float frequencyMultiplier = mix(1.0, 15.0, 0.75);
    float amplitudeMultiplier = mix(0.25, 0.05, 0.75) * 1.2;

    // Mouse-driven displacement field to push waves away rather than amplify
    vec2 mouse = vec2(u_mouse.x / u_resolution.x, 1.0 - (u_mouse.y / u_resolution.y));
    mouse.x *= u_resolution.x / u_resolution.y;
    vec2 diff = st - mouse;
    float dist = length(diff);
    float sigma = 0.18;
    float repelFalloff = exp(-(dist * dist) / (2.0 * sigma * sigma));
    float waterMask = 1.0 - smoothstep(0.45, 0.85, st.y);
    float repel = repelFalloff * waterMask;
    vec2 waveUv = st - diff * (repel * 0.35);

    // Create multiple wave layers with different frequencies and amplitudes
    float wave1 = wave(waveUv, frequencyMultiplier, amplitudeMultiplier * 0.05, 1.5, 0.0);
    float wave2 = wave(waveUv, frequencyMultiplier * 0.7, amplitudeMultiplier * 0.07, 2.0, 1.0);
    float wave3 = wave(waveUv, frequencyMultiplier * 0.5, amplitudeMultiplier * 0.1, 2.5, 2.0);

    // Combine the waves to create a more complex wave pattern
    float waveHeight = wave1 + wave2 + wave3;

    float attenuation = mix(1.0, 0.05, clamp(repel, 0.0, 1.0));
    float displacedWave = waveHeight * attenuation;
    float waterSurface = st.y + displacedWave + 0.75 - transitionOffset - repel * 0.05;

    vec3 color;
    float gradientFactor;
    float mediumSectionEnd = 0.9935; // Border of solid medium section between gradient and sky
    float gradientStart = 0.915; // Start of the gradient section
    float gradientEnd = mediumSectionEnd; // End of the gradient section

    if (waterSurface > 1.0) {
        vec3 skyBase = vec3(0.902, 0.957, 0.945); // #EEF7FF, lightest
        vec3 cloudHighlight = vec3(0.952, 0.978, 0.971);

        vec2 skyUv = st;
        skyUv.x *= u_resolution.x / u_resolution.y;
        vec2 cloudFlow = skyUv * 2.6;
        cloudFlow += vec2(u_time * 0.015, u_time * 0.006);

        float cloudMacro = fbm(cloudFlow);
        float cloudDetail = fbm(cloudFlow * 1.85 + vec2(12.7, -9.1));
        float clouds = clamp(cloudMacro * 0.65 + cloudDetail * 0.35, 0.0, 1.0);

        float cloudStructure = smoothstep(0.4, 0.8, clouds);
        float topFade = smoothstep(0.55, 0.72, st.y);
        float horizonFade = smoothstep(1.0, 1.18, waterSurface);
        float cloudAmount = cloudStructure * topFade * horizonFade;

        vec3 cloudColor = mix(skyBase, cloudHighlight, cloudAmount);
        color = mix(skyBase, cloudColor, topFade);
    } else if (waterSurface > mediumSectionEnd) {
        color = vec3(0.769, 0.867, 0.941); // #CDE8E5, medium
    } else if (waterSurface > gradientStart) {
        gradientFactor = (1.0 - (waterSurface - gradientStart) / (gradientEnd - gradientStart)); // Inverted gradient factor
        vec3 middleColor = vec3(0.769, 0.867, 0.941); // #CDE8E5, medium
        vec3 darkestColor = vec3(0.122, 0.216, 0.275); // #7AB2B2, darkest
        color = mix(middleColor, darkestColor, gradientFactor); // Gradient from medium to darkest (top to bottom)
    } else {
        color = vec3(0.122, 0.216, 0.275); // #7AB2B2, darkest
    }

    // Foam effect near wave crests
    float crest = max(0.0, 1.0 - waterSurface);
    float foamWidth = 0.04;
    float foamBand = smoothstep(foamWidth, 0.0, crest);
    foamBand = pow(foamBand, 1.65);

    vec2 foamFlow = vec2(st.x * (u_resolution.x / u_resolution.y) * 3.8, st.y * 7.2);
    foamFlow += vec2(u_time * 0.12, u_time * 0.18);
    foamFlow += displacedWave * 2.4;

    float foamField = fbm(foamFlow);
    float foamSoft = smoothstep(0.32, 0.68, foamField);
    float foamIslands = smoothstep(0.55, 0.83, foamField);
    float foamCrests = clamp((foamIslands - foamSoft) * 1.9, 0.0, 1.0);

    float foamBody = clamp(foamBand * foamSoft * 1.25, 0.0, 1.0);
    float foamHighlight = clamp(foamBand * (foamCrests + 0.25 * foamIslands), 0.0, 1.0);

    vec3 foamMidColor = vec3(0.769, 0.867, 0.941); // medium palette tone
    vec3 foamHighlightColor = vec3(0.914, 0.969, 0.957); // lightest foam

    color = mix(color, foamMidColor, foamBody * 0.6);
    color = mix(color, foamHighlightColor, foamHighlight);

    gl_FragColor = vec4(color, 1.0);
}
