import { SHADER_CONSTANTS, swellHeight } from "./ocean";

const { SPLASH_COUNT } = SHADER_CONSTANTS;

const BULGE_MAX_HEIGHT = 0.036;
const BULGE_REACH = 0.2;
const BULGE_BREAK_HEIGHT = 0.035;
const BULGE_CLEARANCE = 0.006;
const BULGE_STIFFNESS = 120;
const BULGE_DAMPING = 9;
const MAX_SPRING_STEP = 1 / 60;
const MAX_SPRING_DELTA = 0.1;
const ENTRY_MIN_SPEED = 0.15;
const SPLASH_COOLDOWN = 0.12;
const EXPIRED_SPLASH_TIME = -1000;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const smoothstep = (edge0, edge1, value) => {
	const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);
	return t * t * (3 - 2 * t);
};

const bulgeTarget = (gap) => {
	if (gap < 0) return BULGE_MAX_HEIGHT * smoothstep(BULGE_REACH, 0, -gap);
	return Math.max(BULGE_MAX_HEIGHT, gap + BULGE_CLEARANCE);
};

/**
 * Simulates how the water surface responds to the pointer. Coordinates are in
 * shader space: x is scaled by the aspect ratio and y runs upward from 0 to 1.
 *
 * A pointer below the surface lifts it into a springy bulge, as if held by
 * surface tension. Rising out of the water stretches the bulge until the
 * pointer breaks free and the surface pops into a splash; diving in splashes
 * as soon as the pointer meets the surface. `splashes` packs (x, start time,
 * strength, direction) per slot for upload as a vec4 uniform array.
 */
export function createSurfaceInteraction() {
	const splashes = new Float32Array(SPLASH_COUNT * 4);
	for (let slot = 0; slot < SPLASH_COUNT; slot++) {
		splashes[slot * 4 + 1] = EXPIRED_SPLASH_TIME;
	}

	const bulge = { x: 0, height: 0, velocity: 0 };
	let nextSlot = 0;
	let previous = null;
	let submerged = false;
	let lastSplash = -Infinity;

	const addSplash = (x, time, strength, direction) => {
		if (time - lastSplash <= SPLASH_COOLDOWN) return;
		const offset = nextSlot * 4;
		splashes[offset] = x;
		splashes[offset + 1] = time;
		splashes[offset + 2] = strength;
		splashes[offset + 3] = direction;
		nextSlot = (nextSlot + 1) % SPLASH_COUNT;
		lastSplash = time;
	};

	const stepBulge = (target, seconds) => {
		let remaining = Math.min(seconds, MAX_SPRING_DELTA);
		while (remaining > 0) {
			const step = Math.min(remaining, MAX_SPRING_STEP);
			const acceleration =
				(target - bulge.height) * BULGE_STIFFNESS - bulge.velocity * BULGE_DAMPING;
			bulge.velocity += acceleration * step;
			bulge.height += bulge.velocity * step;
			remaining -= step;
		}
	};

	const detectCrossing = (pointer, gap, time, seconds) => {
		const velocityX = (pointer.x - previous.x) / seconds;
		const velocityY = (pointer.y - previous.y) / seconds;
		const strength = clamp(Math.abs(velocityY) / 1.5, 0.3, 1);
		const direction = clamp(velocityX / 2, -1, 1);

		if (submerged && gap > BULGE_BREAK_HEIGHT) {
			submerged = false;
			addSplash(pointer.x, time, strength, direction);
		} else if (!submerged && gap < 0) {
			submerged = true;
			if (Math.abs(velocityY) > ENTRY_MIN_SPEED) {
				const along = previous.gap > 0 ? previous.gap / (previous.gap - gap) : 1;
				addSplash(
					previous.x + (pointer.x - previous.x) * along,
					time,
					strength,
					direction,
				);
			}
		}
	};

	const update = ({ time, delta, pointer, level, iterations = 0 }) => {
		const seconds = delta / 1000;

		if (!pointer.active) {
			previous = null;
			submerged = false;
			stepBulge(0, seconds);
			return;
		}

		bulge.x = pointer.x;
		const gap = pointer.y - (level + swellHeight(pointer.x, time, iterations));

		if (!previous) {
			submerged = gap < 0;
		} else if (seconds > 0) {
			detectCrossing(pointer, gap, time, seconds);
		}

		stepBulge(submerged ? bulgeTarget(gap) : 0, seconds);
		if (submerged && bulge.height < gap + BULGE_CLEARANCE) {
			bulge.height = gap + BULGE_CLEARANCE;
			bulge.velocity = Math.max(bulge.velocity, 0);
		}

		previous = { x: pointer.x, y: pointer.y, gap };
	};

	return { splashes, bulge, update };
}
