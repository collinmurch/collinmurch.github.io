/**
 * Tracks scroll direction to decide whether a header should be tucked away.
 *
 * Scrolling down by more than `hideAfter` pixels hides it and scrolling up by more than
 * `showAfter` reveals it, so small jitters don't toggle it and it only tucks away once
 * the reader has settled into scrolling down. It always shows within `topZone` of the
 * top. Positions are clamped to the scrollable range, so iOS rubber-band
 * overscroll at either end doesn't read as a change of direction.
 *
 * @param {{ hideAfter?: number, showAfter?: number }} [options]
 */
export function createScrollReveal({ hideAfter = 96, showAfter = 12 } = {}) {
	let lastY = 0;
	let travel = 0;
	let hidden = false;

	return {
		/**
		 * @param {number} y The current scroll position.
		 * @param {{ max?: number, topZone?: number, hideAfter?: number }} [bounds]
		 *   `hideAfter` overrides the creation option, so it can follow the viewport.
		 * @returns {boolean} Whether the header should be hidden.
		 */
		update(
			y,
			{ max = Infinity, topZone = 0, hideAfter: hideDistance = hideAfter } = {},
		) {
			const clamped = Math.min(Math.max(y, 0), Math.max(max, 0));
			const delta = clamped - lastY;
			lastY = clamped;

			if (clamped <= topZone) {
				travel = 0;
				hidden = false;
				return hidden;
			}
			if (delta === 0) return hidden;

			if (Math.sign(delta) !== Math.sign(travel)) travel = 0;
			travel += delta;

			if (travel > hideDistance) hidden = true;
			else if (travel < -showAfter) hidden = false;
			return hidden;
		},

		/**
		 * Shows the header and treats `y` as the new starting position.
		 * @param {number} [y]
		 */
		reset(y = 0) {
			lastY = y;
			travel = 0;
			hidden = false;
		},

		/**
		 * Hides the header and treats `y` as the new starting position, so it
		 * stays hidden until the reader scrolls back up.
		 * @param {number} [y]
		 */
		hide(y = 0) {
			lastY = y;
			travel = 0;
			hidden = true;
		},
	};
}
