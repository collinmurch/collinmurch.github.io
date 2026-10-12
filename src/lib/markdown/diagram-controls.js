import { COPY_BUTTON } from "./copy-button.js";

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 4;
const ZOOM_STEP = 1.25;

const icon = (paths, className) =>
	`<svg${className ? ` class="${className}"` : ""} viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;

const button = (action, label, content) =>
	`<button type="button" class="block-btn" data-diagram-action="${action}" aria-label="${label}" title="${label}">${content}</button>`;

export const TOOLBAR = [
	`<div class="block-btn-group" role="group" aria-label="Zoom" data-when="diagram">`,
	button("out", "Zoom out", icon('<path d="M5 12h14" />')),
	button("in", "Zoom in", icon('<path d="M12 5v14M5 12h14" />')),
	button(
		"reset",
		"Recenter",
		icon('<circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" />'),
	),
	"</div>",
	button(
		"toggle",
		"Show source",
		icon('<path d="m8 7-5 5 5 5M16 7l5 5-5 5" />', "show-source-icon") +
			icon(
				'<rect x="3" y="3" width="7" height="6" rx="1.5" /><rect x="14" y="15" width="7" height="6" rx="1.5" /><path d="M6.5 9v4.5a2 2 0 0 0 2 2H14" />',
				"show-diagram-icon",
			),
	),
	COPY_BUTTON.replace("<button ", '<button data-when="source" '),
].join("");

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

function enhance(figure) {
	const viewport = figure.querySelector(".diagram-viewport");
	const svg = viewport?.querySelector("svg");
	if (!svg) return () => {};

	const controller = new AbortController();
	const { signal } = controller;
	const listen = (target, type, handler, options) =>
		target.addEventListener(type, handler, { ...options, signal });

	const toolbar = document.createElement("div");
	toolbar.className = "diagram-controls";
	toolbar.innerHTML = TOOLBAR;
	figure.append(toolbar);

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

	const toggleView = (toggle) => {
		const showSource = figure.dataset.view !== "source";
		if (showSource) {
			savedScroll = { left: viewport.scrollLeft, top: viewport.scrollTop };
			figure.dataset.view = "source";
		} else {
			delete figure.dataset.view;
			viewport.scrollLeft = savedScroll.left;
			viewport.scrollTop = savedScroll.top;
			updatePannable();
		}

		const label = showSource ? "Show diagram" : "Show source";
		toggle.setAttribute("aria-label", label);
		toggle.title = label;
	};

	const endDrag = () => {
		drag?.abort();
		drag = null;
		figure.removeAttribute("data-dragging");
	};

	listen(toolbar, "click", (event) => {
		const control = event.target.closest("[data-diagram-action]");
		const action = control?.dataset.diagramAction;
		if (action === "toggle") toggleView(control);
		else if (action === "in") setZoom(stepZoom(zoom, 1));
		else if (action === "out") setZoom(stepZoom(zoom, -1));
		else if (action === "reset") reset();
	});

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

	return () => {
		controller.abort();
		endDrag();
		cancelAnimationFrame(frame);
		resizeObserver.disconnect();
		toolbar.remove();
	};
}

/**
 * Adds a toolbar to every diagram under `root` that zooms, recenters, and
 * switches to the diagram's source, and lets the mouse drag to pan. Returns a
 * cleanup function that removes all of it.
 */
export function setupDiagrams(root) {
	const cleanups = [...(root?.querySelectorAll(".diagram") ?? [])].map(enhance);
	return () => {
		for (const cleanup of cleanups) cleanup();
	};
}
