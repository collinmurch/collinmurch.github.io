const MIN_ZOOM = 0.5;
const MAX_ZOOM = 4;
const ZOOM_STEP = 1.25;

/**
 * Keeps a zoom level within the supported range, snapping to 1 when close so
 * repeated steps land back on the natural size.
 */
export function clampZoom(zoom) {
	const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
	return Math.abs(clamped - 1) < 0.01 ? 1 : Math.round(clamped * 1000) / 1000;
}

/**
 * Zooms in (positive steps) or out (negative steps) by a fixed factor.
 */
export function stepZoom(zoom, steps) {
	return clampZoom(zoom * ZOOM_STEP ** steps);
}

/**
 * Converts a wheel delta into a zoom factor. Trackpad pinches send small
 * deltas and mouse wheels large ones, so each event is capped to keep a
 * single wheel notch from jumping.
 */
export function wheelZoomFactor(deltaY) {
	return Math.exp(-Math.max(-50, Math.min(50, deltaY)) * 0.005);
}

/**
 * Returns the scroll offset that keeps the content under `point` in place
 * after the content was scaled by `ratio`. Positions are client coordinates
 * along one axis: where the content started before and after scaling.
 */
export function anchoredScroll(scroll, start, nextStart, point, ratio) {
	return scroll + nextStart + (point - start) * ratio - point;
}

/**
 * Makes a diagram's viewport zoomable and pannable: ctrl+wheel and Safari
 * gestures zoom around the cursor, the keyboard zooms with +, -, and 0, and
 * the mouse drags to pan. Returns the actions `Diagram.svelte` binds to its
 * buttons, and `destroy`, which removes every listener.
 */
export function enhanceDiagram(figure) {
	const viewport = figure.querySelector(".diagram-viewport");
	const svg = viewport?.querySelector("svg");

	const controller = new AbortController();
	const { signal } = controller;
	const listen = (target, type, handler, options) =>
		target.addEventListener(type, handler, { ...options, signal });

	let zoom = 1;
	let gestureZoom = null;
	let pending = null;
	let frame = 0;
	let drag = null;
	let savedScroll = null;

	const updatePannable = () => {
		const pannable =
			viewport.scrollWidth > viewport.clientWidth + 1 ||
			viewport.scrollHeight > viewport.clientHeight + 1;
		figure.toggleAttribute("data-pannable", pannable);
	};

	const center = () => {
		viewport.scrollLeft = (viewport.scrollWidth - viewport.clientWidth) / 2;
		viewport.scrollTop = (viewport.scrollHeight - viewport.clientHeight) / 2;
	};

	const setZoom = (value, point) => {
		const next = clampZoom(value);
		if (next === zoom) return;

		const bounds = viewport.getBoundingClientRect();
		const x = point?.x ?? bounds.left + viewport.clientWidth / 2;
		const y = point?.y ?? bounds.top + viewport.clientHeight / 2;
		const before = svg.getBoundingClientRect();

		zoom = next;
		figure.style.setProperty("--zoom", String(zoom));

		const after = svg.getBoundingClientRect();
		const ratio = after.width / before.width;
		viewport.scrollLeft = anchoredScroll(
			viewport.scrollLeft,
			before.left,
			after.left,
			x,
			ratio,
		);
		viewport.scrollTop = anchoredScroll(
			viewport.scrollTop,
			before.top,
			after.top,
			y,
			ratio,
		);
		updatePannable();
	};

	// Pinches fire faster than the screen refreshes, so only the latest target
	// is applied, once per frame, to avoid measuring layout on every event.
	const requestZoom = (value, point) => {
		pending = { value: clampZoom(value), point };
		frame ||= requestAnimationFrame(() => {
			frame = 0;
			setZoom(pending.value, pending.point);
			pending = null;
		});
	};

	const reset = () => {
		zoom = 1;
		figure.style.removeProperty("--zoom");
		updatePannable();
		center();
	};

	const endDrag = () => {
		drag?.abort();
		drag = null;
		figure.removeAttribute("data-dragging");
	};

	listen(viewport, "keydown", (event) => {
		if (event.metaKey || event.ctrlKey || event.altKey) return;
		if (event.key === "+" || event.key === "=") setZoom(stepZoom(zoom, 1));
		else if (event.key === "-" || event.key === "_") setZoom(stepZoom(zoom, -1));
		else if (event.key === "0") reset();
		else return;
		event.preventDefault();
	});

	listen(
		viewport,
		"wheel",
		(event) => {
			if (!event.ctrlKey || gestureZoom !== null) return;
			event.preventDefault();
			const base = pending?.value ?? zoom;
			requestZoom(base * wheelZoomFactor(event.deltaY), {
				x: event.clientX,
				y: event.clientY,
			});
		},
		{ passive: false },
	);

	listen(viewport, "gesturestart", (event) => {
		event.preventDefault();
		gestureZoom = zoom;
	});

	listen(viewport, "gesturechange", (event) => {
		event.preventDefault();
		requestZoom(gestureZoom * event.scale, { x: event.clientX, y: event.clientY });
	});

	listen(viewport, "gestureend", () => {
		gestureZoom = null;
	});

	listen(viewport, "pointerdown", (event) => {
		if (event.pointerType !== "mouse" || event.button !== 0) return;
		if (!figure.hasAttribute("data-pannable")) return;

		event.preventDefault();
		viewport.focus({ preventScroll: true });
		const start = {
			x: event.clientX,
			y: event.clientY,
			left: viewport.scrollLeft,
			top: viewport.scrollTop,
		};

		drag = new AbortController();
		figure.setAttribute("data-dragging", "");
		const options = { signal: drag.signal };
		window.addEventListener(
			"pointermove",
			(move) => {
				viewport.scrollLeft = start.left - (move.clientX - start.x);
				viewport.scrollTop = start.top - (move.clientY - start.y);
			},
			options,
		);
		window.addEventListener("pointerup", endDrag, options);
		window.addEventListener("pointercancel", endDrag, options);
	});

	const resizeObserver = new ResizeObserver(updatePannable);
	resizeObserver.observe(viewport);
	updatePannable();
	center();

	return {
		zoomBy: (steps) => setZoom(stepZoom(zoom, steps)),
		reset,
		saveScroll() {
			savedScroll = { left: viewport.scrollLeft, top: viewport.scrollTop };
		},
		restoreScroll() {
			if (!savedScroll) return;
			viewport.scrollLeft = savedScroll.left;
			viewport.scrollTop = savedScroll.top;
			updatePannable();
		},
		destroy() {
			controller.abort();
			endDrag();
			cancelAnimationFrame(frame);
			resizeObserver.disconnect();
		},
	};
}
