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

const FULLSCREEN_TRIANGLES = new Float32Array([
	-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1,
]);

function compileShader(gl, type, source) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.error(gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		return null;
	}
	return shader;
}

function linkProgram(gl, vertexShader, fragmentShader) {
	const program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.bindAttribLocation(program, 0, "a_position");
	gl.linkProgram(program);

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.error(gl.getProgramInfoLog(program));
		gl.deleteProgram(program);
		return null;
	}
	return program;
}

function createScene(gl, vertexSource, fragmentSource) {
	const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
	const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
	const program =
		vertexShader && fragmentShader
			? linkProgram(gl, vertexShader, fragmentShader)
			: null;
	if (vertexShader) gl.deleteShader(vertexShader);
	if (fragmentShader) gl.deleteShader(fragmentShader);
	if (!program) return null;

	const uniforms = {};
	for (const [key, name] of Object.entries(UNIFORM_NAMES)) {
		uniforms[key] = gl.getUniformLocation(program, name);
	}
	return { program, uniforms };
}

/**
 * Creates the WebGL context and two scenes from the same fragment source: the
 * full surface scene and a reduced one compiled with SUBMERGED defined, used
 * once the page is fully underwater. Falls back to the surface scene when the
 * reduced one fails to compile. Returns null when WebGL is unavailable.
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

	const surface = createScene(gl, vertexShaderSource, fragmentShaderSource);
	if (!surface) return null;
	const submerged =
		createScene(gl, vertexShaderSource, `#define SUBMERGED\n${fragmentShaderSource}`) ??
		surface;

	const positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, FULLSCREEN_TRIANGLES, gl.STATIC_DRAW);
	gl.enableVertexAttribArray(0);
	gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
	gl.useProgram(surface.program);

	return {
		gl,
		scenes: { surface, submerged },
		destroy() {
			gl.deleteBuffer(positionBuffer);
			gl.deleteProgram(surface.program);
			if (submerged !== surface) gl.deleteProgram(submerged.program);
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

/** Sizes the canvas drawing buffer to its CSS size at the given pixel ratio. */
export function resizeCanvasToDisplaySize(canvas, pixelRatio) {
	const { width, height } = canvasCssSize(canvas);
	const displayWidth = Math.round(width * pixelRatio);
	const displayHeight = Math.round(height * pixelRatio);

	if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
		canvas.width = displayWidth;
		canvas.height = displayHeight;
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
