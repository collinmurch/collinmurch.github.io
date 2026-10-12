/**
 * Values shared with `fragment.glsl`. `ocean.test.js` checks that both sides
 * agree, so change them together.
 */
export const SHADER_CONSTANTS = {
	SPLASH_COUNT: 6,
	WATER_LEVEL: 0.25,
	TRANSITION_SCALE: 0.9,
	OCEAN_SCALE: 3.6,
	OCEAN_SPEED: 0.45,
	OCEAN_DRAG: 0.38,
	OCEAN_MEAN: 0.466,
	OCEAN_WEIGHT_DECAY: 0.82,
	OCEAN_FREQUENCY_GROWTH: 1.28,
	OCEAN_SPEED_GROWTH: 1.08,
	OCEAN_DIRECTION_STEP: 1232.399963,
	SWELL_AMPLITUDE: 0.15,
	DEPTH_SHADE_START: 0.25,
	DEPTH_SHADE_END: 1.3,
	DEPTH_SHADE_STRENGTH: 0.75,
};

/** Colors shared with `fragment.glsl`, as RGB channels from 0 to 1. */
export const SHADER_COLORS = {
	SKY_ZENITH: [0.627, 0.745, 0.843],
	WATER_DARK: [0.122, 0.216, 0.275],
	WATER_DEEP: [0.071, 0.173, 0.239],
};

const {
	WATER_LEVEL,
	TRANSITION_SCALE,
	OCEAN_SCALE,
	OCEAN_SPEED,
	OCEAN_DRAG,
	OCEAN_MEAN,
	OCEAN_WEIGHT_DECAY,
	OCEAN_FREQUENCY_GROWTH,
	OCEAN_SPEED_GROWTH,
	OCEAN_DIRECTION_STEP,
	SWELL_AMPLITUDE,
	DEPTH_SHADE_START,
	DEPTH_SHADE_END,
	DEPTH_SHADE_STRENGTH,
} = SHADER_CONSTANTS;

const smoothstep = (edge0, edge1, x) => {
	const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1);
	return t * t * (3 - 2 * t);
};

const toHex = (rgb) =>
	`#${rgb
		.map((channel) =>
			Math.round(channel * 255)
				.toString(16)
				.padStart(2, "0"),
		)
		.join("")}`;

/** Returns the resting water level for a page transition progress from 0 to 1. */
export function waterLevel(transition) {
	return WATER_LEVEL + transition * TRANSITION_SCALE;
}

/**
 * Returns the flat colors the scene settles to at the top and bottom edges of
 * the screen, where the shader fades its detail out. Browser chrome tinted to
 * these colors continues the scene without a seam.
 */
export function sceneEdgeColors() {
	const { SKY_ZENITH, WATER_DARK, WATER_DEEP } = SHADER_COLORS;
	const shade =
		smoothstep(DEPTH_SHADE_START, DEPTH_SHADE_END, waterLevel(1)) *
		DEPTH_SHADE_STRENGTH;
	const depths = WATER_DARK.map(
		(channel, i) => channel + (WATER_DEEP[i] - channel) * shade,
	);
	return { sky: toHex(SKY_ZENITH), water: toHex(WATER_DARK), depths: toHex(depths) };
}

/**
 * Returns how many wave octaves the shader sums at a quality from -1 to 1. The
 * count is fractional between tiers, where the last octave is partly faded in.
 */
export function swellIterations(quality) {
	return quality > 0 ? 8 + 4 * quality : 8 + 3 * quality;
}

/**
 * Mirrors the fragment shader's front swell so the pointer can be compared with
 * the surface that is actually drawn. Returns the offset from the water level
 * in shader units, or 0 when no iterations are requested.
 */
export function swellHeight(x, time, iterations) {
	if (!iterations || iterations <= 0) return 0;

	let positionX = x * OCEAN_SCALE;
	let positionY = 0;
	const phaseShift = Math.abs(positionX) * 0.1;
	const oceanTime = time * OCEAN_SPEED;
	let seed = 0;
	let frequency = 1;
	let timeMultiplier = 2;
	let weight = 1;
	let total = 0;
	let totalWeight = 0;

	for (let i = 0; i < iterations; i++) {
		const directionX = Math.sin(seed);
		const directionY = Math.cos(seed);
		const phase =
			(directionX * positionX + directionY * positionY) * frequency +
			oceanTime * timeMultiplier +
			phaseShift;
		const crest = Math.exp(Math.sin(phase) - 1);
		const slope = crest * Math.cos(phase);
		const faded = weight * Math.min(Math.max(iterations - i, 0), 1);
		positionX -= directionX * slope * faded * OCEAN_DRAG;
		positionY -= directionY * slope * faded * OCEAN_DRAG;
		total += crest * faded;
		totalWeight += faded;
		weight *= OCEAN_WEIGHT_DECAY;
		frequency *= OCEAN_FREQUENCY_GROWTH;
		timeMultiplier *= OCEAN_SPEED_GROWTH;
		seed += OCEAN_DIRECTION_STEP;
	}

	return (total / totalWeight - OCEAN_MEAN) * SWELL_AMPLITUDE;
}
