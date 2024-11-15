export function initializeWebGL(
    canvas,
    vertexShaderSource,
    fragmentShaderSource,
) {
    const gl = canvas.getContext("webgl2");
    if (!gl) {
        console.error("WebGL not supported");
        return null;
    }

    const createShader = (gl, type, source) => {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    };

    const createProgram = (gl, vertexShader, fragmentShader) => {
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
    };

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(
        gl,
        gl.FRAGMENT_SHADER,
        fragmentShaderSource,
    );
    if (!vertexShader || !fragmentShader) return null;

    const program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) return null;

    const positionAttributeLocation = gl.getAttribLocation(
        program,
        "a_position",
    );
    const timeUniformLocation = gl.getUniformLocation(program, "u_time");
    const resolutionUniformLocation = gl.getUniformLocation(
        program,
        "u_resolution",
    );
    const mouseUniformLocation = gl.getUniformLocation(program, "u_mouse");

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    return {
        gl,
        program,
        positionAttributeLocation,
        timeUniformLocation,
        resolutionUniformLocation,
        mouseUniformLocation,
        positionBuffer,
    };
}

export function resizeCanvasToDisplaySize(canvas) {
    const width = window.visualViewport
        ? window.visualViewport.width
        : window.innerWidth;
    const height = window.visualViewport
        ? window.visualViewport.height
        : window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}

export function setupEventListeners(pos, resizeCanvas) {
    const handleMouseMove = (event) => {
        pos[0] = event.clientX;
        pos[1] = event.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove);

    const handleTouchMove = (event) => {
        const touch = event.touches[0];
        pos[0] = touch.clientX;
        pos[1] = touch.clientY;
    };
    window.addEventListener("touchmove", handleTouchMove);

    window.addEventListener("resize", resizeCanvas);

    return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("resize", resizeCanvas);
    };
}
