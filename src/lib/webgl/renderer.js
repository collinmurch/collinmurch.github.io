import vertexSource from "./vertex.glsl?raw";
import fragmentSource from "./fragment.glsl?raw";
import {
	canvasCssSize,
	initializeWebGL,
	observeViewportResize,
	resizeCanvasToDisplaySize,
} from "./context";
import { createSurfaceInteraction } from "./interaction";
import { swellIterations, waterLevel } from "./ocean";
import { createPointerTracker, listenToPointer } from "./pointer";
import { createFramePacer, createQualityController } from "./render-budget";

const TRANSITION_DURATION = 500;
const SURFACE_FRAME_INTERVAL = 1000 / 60;
const SUBMERGED_FRAME_INTERVAL = 1000 / 20;
const SUBMERGED_RESOLUTION_SCALE = 0.5;
const MINIMUM_SUBMERGED_PIXEL_RATIO = 0.5;
const MAXIMUM_PIXEL_RATIO = 1.5;
const MAXIMUM_REDUCED_PIXEL_RATIO = 1.25;
const MINIMUM_PIXEL_RATIO = 0.75;
const CLEAR_COLOR = [0.769, 0.867, 0.941];

/**
 * Renders the animated wave background into `canvas`. The water rests low on
 * the home page and rises to fill the screen elsewhere; `setSubmerged` animates
 * between the two. Rendering pauses while the page is hidden. Returns null when
 * WebGL is unavailable.
 */
export function createWaveRenderer(canvas, { reducedQuality }) {
	const context = initializeWebGL(canvas, vertexSource, fragmentSource);
	if (!context) return null;
	const { gl, scenes } = context;

	const desiredPixelRatio = Math.min(
		window.devicePixelRatio || 1,
		reducedQuality ? MAXIMUM_REDUCED_PIXEL_RATIO : MAXIMUM_PIXEL_RATIO,
	);
	const budget = createQualityController({
		initialQuality: reducedQuality ? 0 : 1,
		desiredPixelRatio,
		minimumPixelRatio: Math.min(desiredPixelRatio, MINIMUM_PIXEL_RATIO),
		allowHighQuality: !reducedQuality,
	});
	const pacer = createFramePacer();
	const pointer = createPointerTracker();
	const surface = createSurfaceInteraction();
	const surfacePointer = { active: false, x: 0, y: 0 };
	const transition = { current: 0, target: 0, startTime: performance.now() };
	const startTime = performance.now();

	let scene = scenes.surface;
	let renderPixelRatio = budget.pixelRatio;
	let animationFrameId = 0;
	let lastFrameTime = 0;
	let lastDrawTime = 0;

	const resizeCanvas = () => {
		resizeCanvasToDisplaySize(canvas, renderPixelRatio);
		gl.viewport(0, 0, canvas.width, canvas.height);
	};

	const isSubmerged = () => transition.target === 1 && transition.current === 1;

	const applyRenderMode = (submerged) => {
		const nextScene = submerged ? scenes.submerged : scenes.surface;
		if (nextScene !== scene) {
			scene = nextScene;
			gl.useProgram(scene.program);
		}

		const pixelRatio = submerged
			? Math.max(
					MINIMUM_SUBMERGED_PIXEL_RATIO,
					budget.pixelRatio * SUBMERGED_RESOLUTION_SCALE,
				)
			: budget.pixelRatio;
		if (pixelRatio !== renderPixelRatio) {
			renderPixelRatio = pixelRatio;
			resizeCanvas();
		}
	};

	const advanceTransition = (now) => {
		const progress = Math.min((now - transition.startTime) / TRANSITION_DURATION, 1);
		transition.current += (transition.target - transition.current) * progress;
	};

	const updateInteraction = (time, delta, level) => {
		const { width, height } = canvasCssSize(canvas);
		pointer.update(delta, width, height);
		surfacePointer.active = pointer.active && level < 1;
		surfacePointer.x = pointer.position.x * (width / height);
		surfacePointer.y = pointer.position.y;
		surface.update({
			time,
			delta,
			pointer: surfacePointer,
			level,
			iterations: swellIterations(budget.quality),
		});
	};

	const draw = (time) => {
		const { uniforms } = scene;
		gl.uniform1f(uniforms.time, time);
		gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
		gl.uniform1f(uniforms.quality, budget.quality);
		gl.uniform1f(uniforms.transition, transition.current);
		gl.uniform2f(uniforms.pointer, pointer.position.x, pointer.position.y);
		gl.uniform2f(uniforms.pointerTrail, pointer.trail.x, pointer.trail.y);
		gl.uniform1f(uniforms.pointerPresence, pointer.presence);
		gl.uniform4fv(uniforms.splashes, surface.splashes);
		gl.uniform2f(uniforms.bulge, surface.bulge.x, surface.bulge.height);
		gl.drawArrays(gl.TRIANGLES, 0, 6);
		lastDrawTime = time;
	};

	// Resizing the drawing buffer clears it, and the paced loop may not draw
	// again for several display frames, so repaint now to avoid a black flash.
	const handleViewportResize = () => {
		resizeCanvas();
		draw(lastDrawTime);
	};

	const renderFrame = (now) => {
		animationFrameId = requestAnimationFrame(renderFrame);

		const submerged = isSubmerged();
		const interval = submerged ? SUBMERGED_FRAME_INTERVAL : SURFACE_FRAME_INTERVAL;
		if (!pacer.shouldRender(now, interval)) return;
		const delta = lastFrameTime ? now - lastFrameTime : 0;
		lastFrameTime = now;

		applyRenderMode(submerged);
		advanceTransition(now);
		const time = (now - startTime) / 1000;
		updateInteraction(time, delta, waterLevel(transition.current));
		draw(time);

		if (submerged) {
			budget.reset(now);
		} else {
			budget.recordFrame(now);
		}
	};

	const stop = () => {
		if (!animationFrameId) return;
		cancelAnimationFrame(animationFrameId);
		animationFrameId = 0;
	};

	const start = () => {
		stop();
		if (document.hidden) return;
		lastFrameTime = 0;
		budget.reset(performance.now());
		animationFrameId = requestAnimationFrame(renderFrame);
	};

	const handleVisibilityChange = () => (document.hidden ? stop() : start());

	resizeCanvas();
	gl.clearColor(...CLEAR_COLOR, 1);
	gl.clear(gl.COLOR_BUFFER_BIT);
	const cleanups = [
		listenToPointer(pointer),
		observeViewportResize(handleViewportResize),
	];
	document.addEventListener("visibilitychange", handleVisibilityChange);

	return {
		setSubmerged(submerged) {
			transition.target = submerged ? 1 : 0;
			transition.startTime = performance.now();
			start();
		},

		destroy() {
			stop();
			document.removeEventListener("visibilitychange", handleVisibilityChange);
			for (const cleanup of cleanups) cleanup();
			context.destroy();
		},
	};
}
