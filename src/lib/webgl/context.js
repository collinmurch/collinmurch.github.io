const UNIFORM_NAMES = {
	time: "u_time",
	resolution: "u_resolution",
	quality: "u_quality",
	transition: "u_transition",
	pointer: "u_pointer",
	pointerTrail: "u_pointerTrail",
	pointerPresence: "u_pointerPresence",
	splashes: "u_splashes",
	bulge: "u_bulge",
};

// One triangle that overhangs the viewport, so no pixels along a diagonal seam
// are shaded twice.
const FULLSCREEN_TRIANGLE = new Float32Array([-1, -1, 3, -1, -1, 3]);

/**
 * Starts compiling and linking a program without waiting for the driver.
 * `status()` returns "pending", "ready", or "failed". With
 * KHR_parallel_shader_compile it never blocks; without it, the first call
 * waits for the compile as any other WebGL query would.
 */
function createScene(gl, parallelCompile, vertexSource, fragmentSource) {
	const program = gl.createProgram();
	const shaders = [
		[gl.VERTEX_SHADER, vertexSource],
		[gl.FRAGMENT_SHADER, fragmentSource],
	].map(([type, source]) => {
		const shader = gl.createShader(type);
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		gl.attachShader(program, shader);
		return shader;
	});
	gl.bindAttribLocation(program, 0, "a_position");
	gl.linkProgram(program);

	const uniforms = {};
	let status = "pending";

	const settle = () => {
		const linked = gl.getProgramParameter(program, gl.LINK_STATUS);
		if (linked) {
			for (const [key, name] of Object.entries(UNIFORM_NAMES)) {
				uniforms[key] = gl.getUniformLocation(program, name);
			}
		} else {
			for (const shader of shaders) {
				const log = gl.getShaderInfoLog(shader);
				if (log) console.error(log);
			}
			console.error(gl.getProgramInfoLog(program));
			gl.deleteProgram(program);
		}
		for (const shader of shaders) gl.deleteShader(shader);
		return linked ? "ready" : "failed";
	};

	return {
		program,
		uniforms,
		status() {
			const compiling =
				parallelCompile &&
				!gl.getProgramParameter(program, parallelCompile.COMPLETION_STATUS_KHR);
			if (status === "pending" && !compiling) status = settle();
			return status;
		},
	};
}

/**
 * Creates the WebGL context and starts compiling two scenes from the same
 * fragment source: the full surface scene and a reduced one compiled with
 * SUBMERGED defined, for once the page is fully underwater. Compiling runs in
 * the background where supported, so callers poll each scene's `status()`.
 * Returns null when WebGL is unavailable.
 */
export function initializeWebGL(canvas, vertexShaderSource, fragmentShaderSource) {
	const gl = canvas.getContext("webgl2", {
		alpha: false,
		antialias: false,
		depth: false,
		powerPreference: "default",
		premultipliedAlpha: false,
		preserveDrawingBuffer: false,
		stencil: false,
	});
	if (!gl) {
		console.error("WebGL not supported");
		return null;
	}

	const parallelCompile = gl.getExtension("KHR_parallel_shader_compile");
	const scenes = {
		surface: createScene(gl, parallelCompile, vertexShaderSource, fragmentShaderSource),
		submerged: createScene(
			gl,
			parallelCompile,
			vertexShaderSource,
			`#define SUBMERGED\n${fragmentShaderSource}`,
		),
	};

	const positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, FULLSCREEN_TRIANGLE, gl.STATIC_DRAW);
	gl.enableVertexAttribArray(0);
	gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

	return {
		gl,
		scenes,
		draw() {
			gl.drawArrays(gl.TRIANGLES, 0, 3);
		},
		destroy() {
			gl.deleteBuffer(positionBuffer);
			gl.deleteProgram(scenes.surface.program);
			gl.deleteProgram(scenes.submerged.program);
		},
	};
}

/** Returns the canvas size in CSS pixels, falling back to the viewport. */
export function canvasCssSize(canvas) {
	const viewport = window.visualViewport;
	return {
		width: canvas.clientWidth || viewport?.width || window.innerWidth,
		height: canvas.clientHeight || viewport?.height || window.innerHeight,
	};
}

/**
 * Returns the drawing buffer size for a CSS size at the given pixel ratio,
 * lowering the ratio when needed so the buffer stays within `maxPixels`.
 */
export function drawingBufferSize(cssWidth, cssHeight, pixelRatio, maxPixels) {
	const ratio = Math.min(pixelRatio, Math.sqrt(maxPixels / (cssWidth * cssHeight)));
	return { width: Math.round(cssWidth * ratio), height: Math.round(cssHeight * ratio) };
}

/**
 * Sizes the canvas drawing buffer to its CSS size at the given pixel ratio,
 * within a budget of `maxPixels`.
 */
export function resizeCanvasToDisplaySize(canvas, pixelRatio, maxPixels) {
	const css = canvasCssSize(canvas);
	const { width, height } = drawingBufferSize(
		css.width,
		css.height,
		pixelRatio,
		maxPixels,
	);

	if (canvas.width !== width || canvas.height !== height) {
		canvas.width = width;
		canvas.height = height;
	}
}

/**
 * Calls `onResize` at most once per frame while the window or visual viewport
 * resizes. Returns a cleanup function.
 */
export function observeViewportResize(onResize) {
	let frameId = 0;
	const handleResize = () => {
		if (frameId) return;
		frameId = requestAnimationFrame(() => {
			frameId = 0;
			onResize();
		});
	};
	window.addEventListener("resize", handleResize);
	window.visualViewport?.addEventListener("resize", handleResize);

	return () => {
		if (frameId) cancelAnimationFrame(frameId);
		window.removeEventListener("resize", handleResize);
		window.visualViewport?.removeEventListener("resize", handleResize);
	};
}
