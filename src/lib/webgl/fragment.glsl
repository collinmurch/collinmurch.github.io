precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_transition;

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

    // Create multiple wave layers with different frequencies and amplitudes
    float wave1 = wave(st, frequencyMultiplier, amplitudeMultiplier * 0.05, 1.5, 0.0);
    float wave2 = wave(st, frequencyMultiplier * 0.7, amplitudeMultiplier * 0.07, 2.0, 1.0);
    float wave3 = wave(st, frequencyMultiplier * 0.5, amplitudeMultiplier * 0.1, 2.5, 2.0);

    // Combine the waves to create a more complex wave pattern
    float waveHeight = wave1 + wave2 + wave3;

    // Mouse repels the surface softly instead of driving intensity
    vec2 mouse = vec2(u_mouse.x / u_resolution.x, 1.0 - (u_mouse.y / u_resolution.y));
    mouse.x *= u_resolution.x / u_resolution.y;
    vec2 diff = st - mouse;
    float dist = length(diff);
    float sigma = 0.18;
    float repel = exp(-(dist * dist) / (2.0 * sigma * sigma));
    float waterMask = 1.0 - smoothstep(0.45, 0.85, st.y);
    repel *= waterMask;
    float attenuation = mix(1.0, 0.25, clamp(repel, 0.0, 1.0));
    waveHeight *= attenuation;
    float waterSurface = st.y + waveHeight + 0.75 - transitionOffset - repel * 0.08;

    vec3 color;
    float gradientFactor;
    float mediumSectionEnd = 0.995; // Border of solid medium section between gradient and sky
    float gradientStart = 0.95; // Start of the gradient section
    float gradientEnd = mediumSectionEnd; // End of the gradient section

    if (waterSurface > 1.0) {
        color = vec3(0.902, 0.957, 0.945); // #EEF7FF, lightest
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
    float crest = 1.0 - waterSurface;
    float foamWidth = 0.035;
    float foamBand = smoothstep(foamWidth, 0.0, crest);
    foamBand = pow(foamBand, 1.8);

    vec2 foamUv = vec2(st.x * (u_resolution.x / u_resolution.y) * 6.0, u_time * 0.45 + st.y * 3.5);
    float foamNoise = 0.58 * noise(foamUv);
    foamNoise += 0.28 * noise(foamUv * 2.3 + vec2(12.5, -4.2));
    foamNoise += 0.14 * noise(foamUv * 4.7 + vec2(-8.3, 7.9));
    float foamTexture = smoothstep(0.52, 0.78, foamNoise);

    float foam = clamp(foamBand * foamTexture * 1.35, 0.0, 1.0);
    vec3 foamColor = vec3(0.914, 0.969, 0.957); // Lightened version of existing palette
    color = mix(color, foamColor, foam);

    gl_FragColor = vec4(color, 1.0);
}
