const FRAME_TOLERANCE = 2;
const MEASUREMENT_WINDOW = 1500;
const SLOW_FPS = 55;
const SMOOTH_FPS = 58;
const PIXEL_RATIO_DROP = 0.15;
const PIXEL_RATIO_RECOVERY = 0.1;
const WINDOWS_BEFORE_RECOVERY = 3;
const WINDOWS_BEFORE_HIGH_QUALITY = 5;

/**
 * Caps the render rate below the display refresh rate. Frames are scheduled on
 * a fixed cadence rather than measured from the last frame, so displays whose
 * refresh rate is not a multiple of the target still average the target rate.
 */
export function createFramePacer() {
	let nextFrameTime = 0;
	return {
		shouldRender(now, interval) {
			if (now < nextFrameTime - FRAME_TOLERANCE) return false;
			nextFrameTime = Math.max(nextFrameTime + interval, now);
			return true;
		},
	};
}

/**
 * Lowers shader quality and pixel ratio when frames run slow and restores them
 * after sustained smooth windows. Quality runs from -1 (low) to 1 (high).
 */
export function createQualityController({
	initialQuality,
	desiredPixelRatio,
	minimumPixelRatio,
	allowHighQuality,
}) {
	let windowStart = 0;
	let frameCount = 0;
	let smoothWindows = 0;

	const controller = {
		quality: initialQuality,
		pixelRatio: desiredPixelRatio,

		reset(now) {
			windowStart = now;
			frameCount = 0;
		},

		recordFrame(now) {
			frameCount += 1;
			const elapsed = now - windowStart;
			if (elapsed < MEASUREMENT_WINDOW) return;

			const framesPerSecond = (frameCount * 1000) / elapsed;
			if (framesPerSecond < SLOW_FPS) {
				smoothWindows = 0;
				controller.quality = Math.max(-1, controller.quality - 1);
				controller.pixelRatio = Math.max(
					minimumPixelRatio,
					controller.pixelRatio - PIXEL_RATIO_DROP,
				);
			} else if (framesPerSecond >= SMOOTH_FPS) {
				smoothWindows += 1;
				recover();
			} else {
				smoothWindows = 0;
			}
			controller.reset(now);
		},
	};

	const recover = () => {
		if (smoothWindows >= WINDOWS_BEFORE_RECOVERY && controller.quality < 0) {
			controller.quality = 0;
			smoothWindows = 0;
		} else if (
			smoothWindows >= WINDOWS_BEFORE_RECOVERY &&
			controller.pixelRatio < desiredPixelRatio
		) {
			controller.pixelRatio = Math.min(
				desiredPixelRatio,
				controller.pixelRatio + PIXEL_RATIO_RECOVERY,
			);
			smoothWindows = 0;
		} else if (
			smoothWindows >= WINDOWS_BEFORE_HIGH_QUALITY &&
			controller.pixelRatio === desiredPixelRatio &&
			allowHighQuality
		) {
			controller.quality = 1;
		}
	};

	return controller;
}

/**
 * Moves `current` toward `target` by at most `step`, so the shader eases
 * between quality tiers instead of reshaping the scene in one frame.
 */
export function easeQuality(current, target, step) {
	if (current < target) return Math.min(target, current + step);
	return Math.max(target, current - step);
}
