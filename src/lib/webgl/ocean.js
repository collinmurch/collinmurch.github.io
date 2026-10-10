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
} = SHADER_CONSTANTS;

/** Returns the resting water level for a page transition progress from 0 to 1. */
export function waterLevel(transition) {
	return WATER_LEVEL + transition * TRANSITION_SCALE;
}

/** Returns how many wave octaves the shader sums at a given quality tier. */
export function swellIterations(quality) {
	if (quality > 0.5) return 12;
	if (quality > -0.5) return 8;
	return 5;
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
		positionX -= directionX * slope * weight * OCEAN_DRAG;
		positionY -= directionY * slope * weight * OCEAN_DRAG;
		total += crest * weight;
		totalWeight += weight;
		weight *= OCEAN_WEIGHT_DECAY;
		frequency *= OCEAN_FREQUENCY_GROWTH;
		timeMultiplier *= OCEAN_SPEED_GROWTH;
		seed += OCEAN_DIRECTION_STEP;
	}

	return (total / totalWeight - OCEAN_MEAN) * SWELL_AMPLITUDE;
}
