import { onMount } from "solid-js";
import { vertexShaderSource, fragmentShaderSource } from "./WaveShaders";
import styles from "./WaveCanvas.module.css";

const WaveCanvas = () => {
    let canvas;

    onMount(() => {
        const gl = canvas.getContext("webgl");
        if (!gl) {
            console.error("WebGL not supported");
            return;
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
        }

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
        }

        const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
        const program = createProgram(gl, vertexShader, fragmentShader);

        const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
        const timeUniformLocation = gl.getUniformLocation(program, "u_time");
        const resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
        const mouseUniformLocation = gl.getUniformLocation(program, "u_mouse");

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        const positions = [
            -1, -1,
            1, -1,
            -1, 1,
            -1, 1,
            1, -1,
            1, 1
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(0, 0, 0, 0);

        // Resize canvas on window resize
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        let startTime = performance.now();

        // Handle mouse and touch movement
        let mouse = [0, 0];
        const handleMouseMove = (event) => {
            mouse[0] = event.clientX;
            mouse[1] = event.clientY;
        }
        window.addEventListener('mousemove', handleMouseMove);
        const handleTouchMove = (event) => {
            const touch = event.touches[0];
            mouse[0] = touch.clientX;
            mouse[1] = touch.clientY;
        }
        window.addEventListener('touchmove', handleTouchMove);

        const render = () => {
            const currentTime = (performance.now() - startTime) / 1000.0;

            gl.clear(gl.COLOR_BUFFER_BIT);

            gl.useProgram(program);

            gl.enableVertexAttribArray(positionAttributeLocation);
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

            gl.vertexAttribPointer(
                positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

            gl.uniform1f(timeUniformLocation, currentTime);
            gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
            gl.uniform2f(mouseUniformLocation, pos[0], pos[1]);

            gl.drawArrays(gl.TRIANGLES, 0, 6);

            requestAnimationFrame(render);
        }

        render();
    });

    return (
        <canvas ref={canvas} style={styles.WaveCanvas} />
    );
};

export default WaveCanvas;
