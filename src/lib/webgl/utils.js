export function createShader(gl, type, source) {
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

export function createProgram(gl, vertexShader, fragmentShader) {
	const program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.error(gl.getProgramInfoLog(program));
		gl.deleteProgram(program);
		return null;
	}
	return program;
}

export function initializeWebGL(canvas, vertexShaderSource, fragmentShaderSource) {
	const gl = canvas.getContext("webgl2", {
		alpha: false,
		antialias: false,
		depth: false,
		powerPreference: "high-performance",
		premultipliedAlpha: false,
		preserveDrawingBuffer: false,
		stencil: false,
	});
	if (!gl) {
		console.error("WebGL not supported");
		return null;
	}

	const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
	const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
	if (!vertexShader || !fragmentShader) {
		if (vertexShader) gl.deleteShader(vertexShader);
		if (fragmentShader) gl.deleteShader(fragmentShader);
		return null;
	}

	const program = createProgram(gl, vertexShader, fragmentShader);
	gl.deleteShader(vertexShader);
	gl.deleteShader(fragmentShader);
	if (!program) return null;

	const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
	const timeUniformLocation = gl.getUniformLocation(program, "u_time");
	const resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
	const mouseUniformLocation = gl.getUniformLocation(program, "u_mouse");
	const pointerUniformLocation = gl.getUniformLocation(program, "u_pointer");
	const qualityUniformLocation = gl.getUniformLocation(program, "u_quality");

	const positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	const positions = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

	const transitionUniformLocation = gl.getUniformLocation(program, "u_transition");

	gl.useProgram(program);
	gl.enableVertexAttribArray(positionAttributeLocation);
	gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

	return {
		gl,
		program,
		positionAttributeLocation,
		timeUniformLocation,
		resolutionUniformLocation,
		mouseUniformLocation,
		pointerUniformLocation,
		qualityUniformLocation,
		positionBuffer,
		transitionUniformLocation,
		destroy() {
			gl.deleteBuffer(positionBuffer);
			gl.deleteProgram(program);
		},
	};
}

export function resizeCanvasToDisplaySize(canvas, pixelRatio) {
	const viewport = window.visualViewport;
	const cssWidth = canvas.clientWidth || viewport?.width || window.innerWidth;
	const cssHeight = canvas.clientHeight || viewport?.height || window.innerHeight;
	const displayWidth = Math.round(cssWidth * pixelRatio);
	const displayHeight = Math.round(cssHeight * pixelRatio);

	if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
		canvas.width = displayWidth;
		canvas.height = displayHeight;
		return true;
	}

	return false;
}

export function setupEventListeners(canvas, pos, resizeCanvas, pointerState) {
	let measuredBufferWidth = 0;
	let measuredBufferHeight = 0;
	let pointerScaleX = 1;
	let pointerScaleY = 1;

	const updatePointerScale = () => {
		const cssWidth = canvas.clientWidth || window.innerWidth;
		const cssHeight = canvas.clientHeight || window.innerHeight;
		measuredBufferWidth = canvas.width;
		measuredBufferHeight = canvas.height;
		pointerScaleX = canvas.width / cssWidth;
		pointerScaleY = canvas.height / cssHeight;
	};

	const updatePosition = (clientX, clientY) => {
		if (
			measuredBufferWidth !== canvas.width ||
			measuredBufferHeight !== canvas.height
		) {
			updatePointerScale();
		}
		pos[0] = clientX * pointerScaleX;
		pos[1] = clientY * pointerScaleY;
	};
	updatePointerScale();

	const setPointerTarget = (value) => {
		if (pointerState) pointerState.target = value;
	};

	const handleMouseMove = (event) => {
		updatePosition(event.clientX, event.clientY);
		setPointerTarget(1);
	};
	const passiveMoveOptions = { passive: true };
	window.addEventListener("mousemove", handleMouseMove, passiveMoveOptions);

	const handleMouseLeave = () => {
		setPointerTarget(0);
	};
	window.addEventListener("mouseleave", handleMouseLeave);
	window.addEventListener("blur", handleMouseLeave);

	const handleTouchMove = (event) => {
		const touch = event.touches[0];
		if (touch) updatePosition(touch.clientX, touch.clientY);
		setPointerTarget(1);
	};
	window.addEventListener("touchmove", handleTouchMove, passiveMoveOptions);
	const handleTouchStart = (event) => {
		const touch = event.touches[0];
		if (touch) updatePosition(touch.clientX, touch.clientY);
		setPointerTarget(1);
	};
	window.addEventListener("touchstart", handleTouchStart, passiveMoveOptions);
	const handleTouchEnd = () => {
		setPointerTarget(0);
	};
	window.addEventListener("touchend", handleTouchEnd, passiveMoveOptions);
	window.addEventListener("touchcancel", handleTouchEnd, passiveMoveOptions);
	let resizeFrameId = 0;
	const handleResize = () => {
		if (resizeFrameId) return;
		resizeFrameId = window.requestAnimationFrame(() => {
			resizeFrameId = 0;
			resizeCanvas();
			updatePointerScale();
		});
	};
	window.addEventListener("resize", handleResize);
	window.visualViewport?.addEventListener("resize", handleResize);

	return () => {
		if (resizeFrameId) cancelAnimationFrame(resizeFrameId);
		window.removeEventListener("mousemove", handleMouseMove, passiveMoveOptions);
		window.removeEventListener("mouseleave", handleMouseLeave);
		window.removeEventListener("blur", handleMouseLeave);
		window.removeEventListener("touchmove", handleTouchMove, passiveMoveOptions);
		window.removeEventListener("touchstart", handleTouchStart, passiveMoveOptions);
		window.removeEventListener("touchend", handleTouchEnd, passiveMoveOptions);
		window.removeEventListener("touchcancel", handleTouchEnd, passiveMoveOptions);
		window.removeEventListener("resize", handleResize);
		window.visualViewport?.removeEventListener("resize", handleResize);
	};
}
