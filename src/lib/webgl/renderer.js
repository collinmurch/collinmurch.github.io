import vertexSource from "./vertex.glsl?raw";
import fragmentSource from "./fragment.glsl?raw";
import {
	canvasCssSize,
	initializeWebGL,
	observeViewportResize,
	resizeCanvasToDisplaySize,
} from "./context";
import { createSurfaceInteraction } from "./interaction";
import { SHADER_COLORS, swellIterations, waterLevel } from "./ocean";
import { createPointerTracker, listenToPointer } from "./pointer";
import {
	createFramePacer,
	createQualityController,
	easeQuality,
} from "./render-budget";

const TRANSITION_DURATION = 500;
const QUALITY_TIER_DURATION = 2000;
const SURFACE_FRAME_INTERVAL = 1000 / 60;
const SUBMERGED_FRAME_INTERVAL = 1000 / 20;
const SUBMERGED_RESOLUTION_SCALE = 0.5;
const MINIMUM_SUBMERGED_PIXEL_RATIO = 0.5;
const MAXIMUM_PIXEL_RATIO = 1.5;
const MAXIMUM_REDUCED_PIXEL_RATIO = 1.25;
const MINIMUM_PIXEL_RATIO = 0.75;
const MAXIMUM_DRAWING_PIXELS = 2560 * 1440;

/**
 * Renders the animated wave background into `canvas`. The water rests low on
 * the home page and rises to fill the screen elsewhere; it starts in the state
 * given by `submerged`, and `setSubmerged` animates between the two. Rendering
 * pauses while the page is hidden. Returns null when WebGL is unavailable.
 */
export function createWaveRenderer(canvas, { reducedQuality, submerged }) {
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
	const initialLevel = submerged ? 1 : 0;
	const transition = {
		current: initialLevel,
		target: initialLevel,
		startTime: performance.now(),
	};
	const startTime = performance.now();

	let scene = null;
	let renderPixelRatio = budget.pixelRatio;
	let quality = budget.quality;
	let animationFrameId = 0;
	let lastFrameTime = 0;
	let lastDrawTime = 0;

	const resizeCanvas = () => {
		resizeCanvasToDisplaySize(canvas, renderPixelRatio, MAXIMUM_DRAWING_PIXELS);
		gl.viewport(0, 0, canvas.width, canvas.height);
	};

	const isSubmerged = () => transition.target === 1 && transition.current === 1;

	// The surface scene can draw any water level, so it stands in for the
	// reduced underwater scene until that one finishes compiling.
	const readyScene = (submerged) => {
		if (submerged && scenes.submerged.status() === "ready") return scenes.submerged;
		return scenes.surface.status() === "ready" ? scenes.surface : null;
	};

	const applyRenderMode = (nextScene, submerged) => {
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
			iterations: swellIterations(quality),
		});
	};

	const draw = (time) => {
		const { uniforms } = scene;
		gl.uniform1f(uniforms.time, time);
		gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
		gl.uniform1f(uniforms.quality, quality);
		gl.uniform1f(uniforms.transition, transition.current);
		gl.uniform2f(uniforms.pointer, pointer.position.x, pointer.position.y);
		gl.uniform2f(uniforms.pointerTrail, pointer.trail.x, pointer.trail.y);
		gl.uniform1f(uniforms.pointerPresence, pointer.presence);
		gl.uniform4fv(uniforms.splashes, surface.splashes);
		gl.uniform2f(uniforms.bulge, surface.bulge.x, surface.bulge.height);
		context.draw();
		lastDrawTime = time;
	};

	// Resizing the drawing buffer clears it, and the paced loop may not draw
	// again for several display frames, so repaint now to avoid a black flash.
	const handleViewportResize = () => {
		resizeCanvas();
		if (scene) {
			draw(lastDrawTime);
		} else {
			gl.clear(gl.COLOR_BUFFER_BIT);
		}
	};

	const renderFrame = (now) => {
		animationFrameId = requestAnimationFrame(renderFrame);

		const submerged = isSubmerged();
		const nextScene = readyScene(submerged);
		if (!nextScene) {
			if (scenes.surface.status() === "failed") stop();
			budget.reset(now);
			return;
		}
		const interval = submerged ? SUBMERGED_FRAME_INTERVAL : SURFACE_FRAME_INTERVAL;
		if (!pacer.shouldRender(now, interval)) return;
		const delta = lastFrameTime ? now - lastFrameTime : 0;
		lastFrameTime = now;

		applyRenderMode(nextScene, submerged);
		advanceTransition(now);
		quality = easeQuality(quality, budget.quality, delta / QUALITY_TIER_DURATION);
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

	// Until the first frame draws, show the page's own background color.
	resizeCanvas();
	gl.clearColor(...SHADER_COLORS.WATER_DARK, 1);
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
