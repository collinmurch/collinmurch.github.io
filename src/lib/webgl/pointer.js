const PRESENCE_TIME_CONSTANT = 200;
const TRAIL_TIME_CONSTANT = 450;
const PRESENCE_SNAP_THRESHOLD = 0.01;

const easeToward = (current, target, delta, timeConstant) =>
	current + (target - current) * (1 - Math.exp(-delta / timeConstant));

/**
 * Tracks the pointer in screen UV coordinates (0 to 1, y up). `presence` eases
 * toward 1 while the pointer is over the page and back to 0 after it leaves;
 * `trail` lags behind `position` so the shader can draw a short wake.
 */
export function createPointerTracker() {
	const client = { x: 0, y: 0 };
	const tracker = {
		active: false,
		presence: 0,
		position: { x: 0, y: 0 },
		trail: { x: 0, y: 0 },

		move(clientX, clientY) {
			client.x = clientX;
			client.y = clientY;
			tracker.active = true;
		},

		release() {
			tracker.active = false;
		},

		update(delta, width, height) {
			tracker.position.x = client.x / width;
			tracker.position.y = 1 - client.y / height;
			tracker.presence = easeToward(
				tracker.presence,
				tracker.active ? 1 : 0,
				delta,
				PRESENCE_TIME_CONSTANT,
			);

			if (tracker.presence < PRESENCE_SNAP_THRESHOLD) {
				tracker.trail.x = tracker.position.x;
				tracker.trail.y = tracker.position.y;
			} else {
				tracker.trail.x = easeToward(
					tracker.trail.x,
					tracker.position.x,
					delta,
					TRAIL_TIME_CONSTANT,
				);
				tracker.trail.y = easeToward(
					tracker.trail.y,
					tracker.position.y,
					delta,
					TRAIL_TIME_CONSTANT,
				);
			}
		},
	};
	return tracker;
}

/** Feeds window mouse and touch events into a tracker. Returns a cleanup function. */
export function listenToPointer(tracker) {
	const passive = { passive: true };
	const handleMouseMove = (event) => tracker.move(event.clientX, event.clientY);
	const handleTouch = (event) => {
		const touch = event.touches[0];
		if (touch) tracker.move(touch.clientX, touch.clientY);
	};
	const handleRelease = () => tracker.release();

	window.addEventListener("mousemove", handleMouseMove, passive);
	window.addEventListener("touchstart", handleTouch, passive);
	window.addEventListener("touchmove", handleTouch, passive);
	window.addEventListener("touchend", handleRelease, passive);
	window.addEventListener("touchcancel", handleRelease, passive);
	window.addEventListener("mouseleave", handleRelease);
	window.addEventListener("blur", handleRelease);

	return () => {
		window.removeEventListener("mousemove", handleMouseMove, passive);
		window.removeEventListener("touchstart", handleTouch, passive);
		window.removeEventListener("touchmove", handleTouch, passive);
		window.removeEventListener("touchend", handleRelease, passive);
		window.removeEventListener("touchcancel", handleRelease, passive);
		window.removeEventListener("mouseleave", handleRelease);
		window.removeEventListener("blur", handleRelease);
	};
}
