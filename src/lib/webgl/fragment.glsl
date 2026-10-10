#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

#define SPLASH_COUNT 6

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_quality;
uniform float u_transition;
uniform vec2 u_pointer;
uniform vec2 u_pointerTrail;
uniform float u_pointerPresence;
uniform vec4 u_splashes[SPLASH_COUNT];
uniform vec2 u_bulge;

const mat2 FBM_ROT = mat2(0.8, -0.6, 0.6, 0.8);

const vec3 SKY_HORIZON = vec3(0.835, 0.912, 0.943); // ~#D5E9F0
const vec3 SKY_ZENITH = vec3(0.627, 0.745, 0.843); // ~#A0BED7
const vec3 SKY_HIGHLIGHT = vec3(0.952, 0.978, 0.971); // ~#F3F9F7
const vec3 WATER_MEDIUM = vec3(0.769, 0.867, 0.941); // #C4DDF0
const vec3 WATER_DARK = vec3(0.122, 0.216, 0.275); // #1F3746
const vec3 WATER_DEEP = vec3(0.071, 0.173, 0.239); // #122C3D
const vec3 CLOUD_SHADOW = vec3(0.596, 0.682, 0.757); // ~#98AEC1
const vec3 FOAM_HIGHLIGHT = vec3(0.914, 0.969, 0.957); // ~#E9F7F4

const float TRANSITION_SCALE = 0.9;
const float WATER_LEVEL = 0.25;
const float CLOUD_CURSOR_SIGMA = 0.095;
const float CLOUD_PARTING = 0.18;
const float CLOUD_EROSION = 0.11;

const float OCEAN_SCALE = 3.6;
const float OCEAN_SPEED = 0.45;
const float OCEAN_DRAG = 0.38;
const float OCEAN_MEAN = 0.466;
const float OCEAN_WEIGHT_DECAY = 0.82;
const float OCEAN_FREQUENCY_GROWTH = 1.28;
const float OCEAN_SPEED_GROWTH = 1.08;
const float OCEAN_DIRECTION_STEP = 1232.399963;
const float SWELL_AMPLITUDE = 0.15;
const float CREST_REACH = SWELL_AMPLITUDE * (1.0 - OCEAN_MEAN);
const float DEEP_WATER_DEPTH = SWELL_AMPLITUDE + 0.2;
const float SURFACE_BAND_HEIGHT = 0.24;
const float MID_RIDGE_OFFSET = 0.03;
const float FAR_RIDGE_OFFSET = 0.056;
const float FACE_DEPTH = 0.085;
const float FOAM_WIDTH = 0.03;

const float BULGE_WIDTH = 0.14;
const float SPLASH_LIFETIME = 2.6;
const float DROPLET_LIFETIME = 1.2;
const float RIPPLE_SPEED = 0.32;
const float DROPLET_GRAVITY = 2.4;

const float CAUSTIC_SPEED = 0.07;

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

    vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);

    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float byQuality(float high, float medium, float low) {
    return u_quality > 0.5 ? high : (u_quality > -0.5 ? medium : low);
}

float fbmOctaves(vec2 p, float octaves) {
    float value = 0.0;
    float amplitude = 0.5;
    p = FBM_ROT * p;
    for (int i = 0; i < 5; i++) {
        if (float(i) >= octaves) {
            break;
        }
        value += (noise(p) - 0.5) * amplitude;
        p = FBM_ROT * p * 1.9 + vec2(0.37, -0.21);
        amplitude *= 0.5;
    }
    return clamp(0.5 + value, 0.0, 1.0);
}

float fbm(vec2 p) {
    return fbmOctaves(p, byQuality(5.0, 3.0, 2.0));
}

vec2 normalizeCoords(vec2 fragCoord, float aspect) {
    vec2 st = fragCoord / u_resolution.xy;
    st.x *= aspect;
    return st;
}

// Combines the surface-tension bulge above an underwater pointer with every
// live splash. Each splash dips into a broad crater, then the displaced water
// heaves up into a wide hump with a short jet at its center before settling,
// while a ripple packet runs outward in both directions and fades.
float surfaceDisturbance(float x) {
    float spread = (x - u_bulge.x) / BULGE_WIDTH;
    float height = u_bulge.y / pow(1.0 + spread * spread, 1.5);

    for (int i = 0; i < SPLASH_COUNT; i++) {
        vec4 splash = u_splashes[i];
        float age = u_time - splash.y;
        if (age < 0.0 || age > SPLASH_LIFETIME) {
            continue;
        }
        float dist = abs(x - splash.x);
        float energy = splash.z * exp(-age * 1.1);

        float front = 0.04 + age * RIPPLE_SPEED;
        float packetWidth = 0.07 + age * 0.05;
        float offset = (dist - front) / packetWidth;
        float ripple = cos((dist - front) * 36.0) * exp(-offset * offset) / (1.0 + dist * 3.0);

        float craterShape = dist / 0.075;
        float crater = exp(-craterShape * craterShape) * exp(-age * 5.0);

        float heave = sin(clamp((age - 0.05) / 0.85, 0.0, 1.0) * 3.14159265);
        float humpShape = dist / 0.05;
        float hump = exp(-humpShape * humpShape) * heave;

        float jetPhase = clamp((age - 0.08) / 0.5, 0.0, 1.0);
        float jetShape = dist / 0.022;
        float jet = exp(-jetShape * jetShape) * sin(jetPhase * 3.14159265);

        height += energy * (ripple * 0.024 - crater * 0.024)
            + splash.z * (hump * 0.03 + jet * 0.022);
    }
    return height;
}

vec3 paintDroplets(vec3 color, vec2 st, float level, float pixel) {
    float coverage = 0.0;
    float glint = 0.0;
    float dropletCount = byQuality(5.0, 5.0, 3.0);

    for (int i = 0; i < SPLASH_COUNT; i++) {
        vec4 splash = u_splashes[i];
        float age = u_time - splash.y;
        if (age < 0.0 || age > DROPLET_LIFETIME) {
            continue;
        }
        for (int k = 0; k < 5; k++) {
            if (float(k) >= dropletCount) {
                break;
            }
            float seed = fract(splash.y * 0.137) * 97.0 + float(k) * 7.3 + float(i) * 1.7;
            float spreadHash = hash(vec2(seed, 1.3));
            float liftHash = hash(vec2(seed, 4.1));
            float sizeHash = hash(vec2(seed, 8.9));

            float velocityX = (spreadHash - 0.5) * 0.45 + splash.w * 0.22;
            float velocityY = (0.35 + 0.45 * liftHash) * (0.55 + 0.45 * splash.z);
            vec2 position = vec2(
                splash.x + velocityX * age,
                level + velocityY * age - 0.5 * DROPLET_GRAVITY * age * age
            );
            if (position.y < level - 0.01) {
                continue;
            }

            float radius = (0.002 + 0.003 * sizeHash) * (0.6 + 0.4 * splash.z);
            vec2 offset = st - position;
            float dist = length(offset);
            float visible = smoothstep(level - 0.01, level + 0.01, position.y);
            float drop = (1.0 - smoothstep(radius - pixel, radius + pixel, dist)) * visible;
            vec2 shine = offset - vec2(-0.3, 0.35) * radius;
            coverage = max(coverage, drop);
            glint = max(glint, drop * exp(-dot(shine, shine) / (radius * radius * 0.12)));
        }
    }

    if (coverage <= 0.0) {
        return color;
    }
    vec3 droplet = mix(WATER_MEDIUM, WATER_DARK, 0.45);
    droplet = mix(droplet, FOAM_HIGHLIGHT, glint * 0.8);
    return mix(color, droplet, coverage * 0.75);
}

// Sums sharp-crested exp(sin) waves whose sample positions are dragged by the
// previous wave's slope, producing peaked crests with broad troughs. Each ridge
// is a horizontal slice of the same 2D ocean field taken at a different depth z.
float oceanHeight(vec2 position, float iterations) {
    float phaseShift = length(position) * 0.1;
    float seed = 0.0;
    float frequency = 1.0;
    float timeMultiplier = 2.0;
    float weight = 1.0;
    float total = 0.0;
    float totalWeight = 0.0;
    float time = u_time * OCEAN_SPEED;

    for (int i = 0; i < 12; i++) {
        if (float(i) >= iterations) {
            break;
        }
        vec2 direction = vec2(sin(seed), cos(seed));
        float x = dot(direction, position) * frequency + time * timeMultiplier + phaseShift;
        float crest = exp(sin(x) - 1.0);
        float slope = crest * cos(x);
        position -= direction * slope * weight * OCEAN_DRAG;
        total += crest * weight;
        totalWeight += weight;
        weight *= OCEAN_WEIGHT_DECAY;
        frequency *= OCEAN_FREQUENCY_GROWTH;
        timeMultiplier *= OCEAN_SPEED_GROWTH;
        seed += OCEAN_DIRECTION_STEP;
    }
    return total / totalWeight;
}

float ridgeHeight(float x, float depth, float compression, float iterations) {
    return oceanHeight(vec2(x * OCEAN_SCALE * compression, depth), iterations) - OCEAN_MEAN;
}

// Measures how strongly the pointer's recent path thins the clouds at this
// point. The path is the segment from the pointer back to its lagging trail;
// `push` points away from it and fades to zero on the path itself.
float cursorDispersal(vec2 screenUv, float aspect, out vec2 push) {
    vec2 scale = vec2(aspect, 1.0);
    vec2 pa = (screenUv - u_pointer) * scale;
    vec2 ba = (u_pointerTrail - u_pointer) * scale;
    float along = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-5), 0.0, 1.0);
    vec2 offset = pa - ba * along;
    float dist2 = dot(offset, offset);
    push = offset / CLOUD_CURSOR_SIGMA;
    float falloff = exp(-dist2 / (2.0 * CLOUD_CURSOR_SIGMA * CLOUD_CURSOR_SIGMA));
    return u_pointerPresence * falloff * mix(1.0, 0.55, along);
}

vec3 paintSky(vec2 st, float heightAboveWater, float aspect) {
    float skyBlend = smoothstep(0.2, 1.0, st.y);
    vec3 skyBase = mix(SKY_HORIZON, SKY_ZENITH, skyBlend);

    vec2 cloudFlow = st * 2.0;
    cloudFlow += vec2(u_time * 0.015, u_time * 0.006);

    vec2 screenUv = vec2(st.x / aspect, st.y);
    vec2 push;
    float dispersal = cursorDispersal(screenUv, aspect, push);
    dispersal *= smoothstep(0.4, 0.65, st.y);
    cloudFlow -= push * dispersal * CLOUD_PARTING;

    float macro = fbm(cloudFlow * 0.85);
    float detail = macro;
    if (u_quality > 0.5) {
        detail = fbm(cloudFlow * 2.6 + vec2(12.7, -9.1) + macro * 0.9);
    }
    float density = macro * 0.7 + detail * 0.3;

    if (dispersal > 0.002 && u_quality > -0.5) {
        float wisps = fbm(cloudFlow * 2.8 + vec2(4.7, -13.2));
        density -= dispersal * CLOUD_EROSION * (0.6 + wisps * 0.8);
    }

    float topFade = smoothstep(0.34, 0.58, st.y);
    float horizonFade = smoothstep(0.02, 0.2, heightAboveWater);
    float coverage = smoothstep(0.465 - dispersal * 0.03, 0.555 + dispersal * 0.04, density) * topFade * horizonFade;

    float lit = smoothstep(0.47, 0.66, density);
    if (u_quality > -0.5) {
        float above = fbmOctaves((cloudFlow + vec2(0.05, 0.11)) * 0.85, 3.0);
        lit = clamp(0.55 + (above - macro) * 2.2 + (density - 0.55) * 2.0, 0.0, 1.0);
    }
    vec3 cloudColor = mix(CLOUD_SHADOW, SKY_HIGHLIGHT, lit);

    float veil = smoothstep(0.4, 0.55, macro) * topFade * horizonFade * (1.0 - dispersal * 0.7);
    vec3 sky = mix(skyBase, mix(skyBase, SKY_HIGHLIGHT, 0.45), veil * 0.25);
    return mix(sky, cloudColor, coverage);
}

vec3 applyHaze(vec3 color, vec2 st, float heightAboveWater, float aspect) {
    float amount = 1.0 - smoothstep(0.03, 0.35, heightAboveWater);
    if (amount <= 0.0) {
        return color;
    }
    if (u_quality < -0.5) {
        return mix(color, WATER_MEDIUM, 0.45 * amount);
    }

    vec2 hazeFlow = vec2(st.x * aspect * 3.8, st.y * 7.2);
    hazeFlow += vec2(u_time * 0.12, u_time * 0.18);

    float hazeField = fbm(hazeFlow);
    float hazeSoft = smoothstep(0.32, 0.68, hazeField);
    float hazeIslands = smoothstep(0.55, 0.83, hazeField);
    float hazeCrests = clamp((hazeIslands - hazeSoft) * 1.9, 0.0, 1.0);

    color = mix(color, WATER_MEDIUM, clamp(hazeSoft * 1.25, 0.0, 1.0) * 0.6 * amount);
    color = mix(color, FOAM_HIGHLIGHT, clamp(hazeCrests + 0.25 * hazeIslands, 0.0, 1.0) * amount);
    return color;
}

vec3 paintAtmosphere(vec2 st, float heightAboveWater, float aspect) {
    return applyHaze(paintSky(st, heightAboveWater, aspect), st, heightAboveWater, aspect);
}

vec3 paintRidge(vec3 color, float depth, float peak, float shade, float thickness, float pixel) {
    float coverage = smoothstep(-pixel, pixel, depth);
    if (coverage <= 0.0) {
        return color;
    }
    float falloff = smoothstep(0.0, thickness, depth);
    float tone = shade + falloff * 0.14 - peak * 0.06;
    vec3 ridge = mix(WATER_MEDIUM, WATER_DARK, clamp(tone, 0.0, 1.0));
    float rim = (1.0 - smoothstep(0.0, pixel * 2.5, depth)) * (0.2 + 0.5 * peak);
    ridge = mix(ridge, FOAM_HIGHLIGHT, rim * 0.45);
    return mix(color, ridge, coverage);
}

vec3 paintFace(float depth, float litDepth, float height, float peak, vec2 st, float aspect, float pixel) {
    float lit = 1.0 - smoothstep(0.0, FACE_DEPTH + max(height, 0.0), litDepth);
    lit = lit * lit;
    vec3 sheen = mix(WATER_MEDIUM, WATER_DARK, 0.62 - 0.22 * peak);
    vec3 color = mix(WATER_DARK, sheen, lit * 0.8);

    float rim = 1.0 - smoothstep(0.0, pixel * 3.0, depth);
    color = mix(color, FOAM_HIGHLIGHT, rim * (0.3 + 0.55 * peak));

    float whitecap = smoothstep(0.45, 0.95, peak) * (1.0 - smoothstep(0.0, FOAM_WIDTH, depth));
    if (whitecap > 0.001 && u_quality > -0.5) {
        vec2 foamFlow = vec2(st.x * aspect * 14.0, st.y * 26.0) + vec2(u_time * 0.35, u_time * 0.2);
        float foam = smoothstep(0.42, 0.78, fbm(foamFlow));
        color = mix(color, FOAM_HIGHLIGHT, whitecap * foam * 0.6);
    }
    return color;
}

float caustics(vec2 uv, float iterations) {
    float time = u_time * CAUSTIC_SPEED + 23.0;
    vec2 p = uv * 6.2831853 - 250.0;
    vec2 i = p;
    float c = 1.0;
    const float INTENSITY = 0.005;
    float count = 0.0;
    for (int n = 0; n < 4; n++) {
        if (float(n) >= iterations) {
            break;
        }
        float t = time * (1.0 - 3.5 / float(n + 1));
        i = p + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));
        c += 1.0 / length(vec2(p.x / (sin(i.x + t) / INTENSITY), p.y / (cos(i.y + t) / INTENSITY)));
        count += 1.0;
    }
    c /= count;
    c = 1.17 - pow(c, 1.4);
    return clamp(pow(abs(c), 8.0), 0.0, 1.0);
}

float lightShafts(vec2 st, float aspect) {
    float slant = st.x / aspect + (1.0 - st.y) * 0.22;
    float drift = u_time * 0.012;
    float shafts = noise(vec2(slant * 7.0 + drift, u_time * 0.03));
    shafts = shafts * 0.6 + noise(vec2(slant * 17.0 - drift * 1.7, u_time * 0.045 + 5.0)) * 0.4;
    return smoothstep(0.45, 0.9, shafts);
}

vec3 paintUnderwater(vec3 color, vec2 st, float surfaceDepth, float depth, float aspect) {
    float submerged = smoothstep(0.02, 0.2, surfaceDepth);
    if (submerged <= 0.0) {
        return color;
    }

    float light = exp(-depth * 1.9);
    vec3 water = mix(color, WATER_DEEP, smoothstep(0.25, 1.3, depth) * 0.75 * submerged);

    float causticIterations = byQuality(4.0, 3.0, 2.0);
    vec2 causticUv = vec2(st.x, st.y * 1.6 + depth * 0.35) * 0.9;
    float pattern = caustics(causticUv, causticIterations);
    float causticAmount = pattern * light * submerged * 0.16;

    float shafts = lightShafts(st, aspect) * light * submerged * 0.06;

    water = mix(water, WATER_MEDIUM, causticAmount + shafts);
    return water;
}

// Draws one of the distant swell rows behind the front water. Each row is a
// slice of the ocean further back, compressed horizontally for perspective and
// with a smaller amplitude.
vec3 paintBackRidge(vec3 color, vec2 st, float ridgeLevel, float sliceDepth, float compression, float amplitude, float iterations, float shade, float thickness, float pixel) {
    float height = ridgeHeight(st.x, sliceDepth, compression, iterations) * SWELL_AMPLITUDE * amplitude;
    float peak = clamp(height / (CREST_REACH * amplitude), 0.0, 1.0);
    return paintRidge(color, ridgeLevel + height - st.y, peak, shade, thickness, pixel);
}

vec3 paintFrontWater(vec3 color, vec2 st, float level, float bodyDepth, float disturbance, float iterations, float aspect, float pixel) {
    float swellHeight = ridgeHeight(st.x, 0.0, 1.0, iterations) * SWELL_AMPLITUDE;
    float frontHeight = swellHeight + disturbance;
    float frontDepth = level + frontHeight - st.y;
    float frontCoverage = smoothstep(-pixel, pixel, frontDepth);
    if (frontCoverage <= 0.0) {
        return color;
    }
    float frontPeak = clamp(swellHeight / CREST_REACH + max(disturbance - 0.015, 0.0) / 0.03, 0.0, 1.0);
    float litDepth = max(frontDepth - disturbance * 0.85, 0.0);
    vec3 face = paintFace(max(frontDepth, 0.0), litDepth, swellHeight, frontPeak, st, aspect, pixel);
    face = paintUnderwater(face, st, max(frontDepth, 0.0), bodyDepth, aspect);
    return mix(color, face, frontCoverage);
}

#ifdef SUBMERGED
void main() {
    float aspect = u_resolution.x / u_resolution.y;
    vec2 st = normalizeCoords(gl_FragCoord.xy, aspect);
    float pixel = 1.0 / u_resolution.y;
    float level = WATER_LEVEL + u_transition * TRANSITION_SCALE;
    float bodyDepth = level - st.y;

    vec3 color = bodyDepth > DEEP_WATER_DEPTH
        ? paintUnderwater(WATER_DARK, st, bodyDepth, bodyDepth, aspect)
        : paintFrontWater(WATER_DARK, st, level, bodyDepth, 0.0, byQuality(12.0, 8.0, 5.0), aspect, pixel);
    gl_FragColor = vec4(color, 1.0);
}
#else
void main() {
    float aspect = u_resolution.x / u_resolution.y;
    vec2 st = normalizeCoords(gl_FragCoord.xy, aspect);
    float pixel = 1.0 / u_resolution.y;

    float level = WATER_LEVEL + u_transition * TRANSITION_SCALE;
    float farLevel = level + FAR_RIDGE_OFFSET;
    float heightAboveWater = st.y - farLevel;
    float bodyDepth = level - st.y;

    if (bodyDepth > DEEP_WATER_DEPTH) {
        gl_FragColor = vec4(paintUnderwater(WATER_DARK, st, bodyDepth, bodyDepth, aspect), 1.0);
        return;
    }

    vec3 color = paintAtmosphere(st, heightAboveWater, aspect);
    if (st.y > level + SURFACE_BAND_HEIGHT) {
        gl_FragColor = vec4(color, 1.0);
        return;
    }

    float disturbance = surfaceDisturbance(st.x);
    float waterTop = max(farLevel + CREST_REACH * 0.45, level + CREST_REACH + max(disturbance, 0.0));
    if (st.y <= waterTop + pixel * 2.0) {
        float iterations = byQuality(12.0, 8.0, 5.0);
        color = paintBackRidge(color, st, farLevel, 9.0, 2.2, 0.4, iterations - 2.0, 0.16, FAR_RIDGE_OFFSET - MID_RIDGE_OFFSET, pixel);
        color = paintBackRidge(color, st, level + MID_RIDGE_OFFSET, 4.5, 1.5, 0.65, iterations - 1.0, 0.34, MID_RIDGE_OFFSET, pixel);
        color = paintFrontWater(color, st, level, bodyDepth, disturbance, iterations, aspect, pixel);
    }
    gl_FragColor = vec4(paintDroplets(color, st, level, pixel), 1.0);
}
#endif
