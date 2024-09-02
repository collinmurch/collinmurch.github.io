import { onMount } from "solid-js";
import styles from "./WaveCanvas.module.css";

const WaveCanvas = () => {
    let canvas;

    onMount(() => {
        const gl = canvas.getContext("webgl");

        if (!gl) {
            console.error("WebGL not supported");
            return;
        }

        const vertexShaderSource = `
        attribute vec4 a_position;
        void main() {
            gl_Position = a_position;
        }
    `;

        const fragmentShaderSource = `
        precision mediump float;
        uniform float u_time;
        uniform vec2 u_resolution;
        uniform vec2 u_mouse;

        float wave(vec2 p, float frequency, float amplitude, float speed, float offset) {
            return sin(p.x * frequency + u_time * speed + offset + mix(-1.0, 1.0, smoothstep(0.4, 0.6, u_mouse.x / u_resolution.x))) * amplitude;

        }

        void main() {
            vec2 st = gl_FragCoord.xy / u_resolution.xy;
            st.x *= u_resolution.x / u_resolution.y; // Correct aspect ratio

            // Adjust wave properties based on mouse position
            float frequencyMultiplier = mix(1.0, 15.0, pow(abs(0.5 - (u_mouse.x / u_resolution.x)), 2.0) * 10.0);
            float amplitudeMultiplier = mix(0.25, 0.05, u_mouse.y / u_resolution.y) * 1.2;

            // Create multiple wave layers with different frequencies and amplitudes
            float wave1 = wave(st, frequencyMultiplier, amplitudeMultiplier * 0.05, 1.5, 0.0);
            float wave2 = wave(st, frequencyMultiplier * 0.7, amplitudeMultiplier * 0.07, 2.0, 1.0);
            float wave3 = wave(st, frequencyMultiplier * 0.5, amplitudeMultiplier * 0.1, 2.5, 2.0);

            // Combine the waves to create a more complex wave pattern
            float wavePattern = st.y + wave1 + wave2 + wave3 + 0.75;

            vec3 color;
            float gradientFactor;
            float mediumSectionEnd = 0.995; // Border of solid medium section between gradient and sky
            float gradientStart = 0.95; // Start of the gradient section
            float gradientEnd = mediumSectionEnd; // End of the gradient section

            if (wavePattern > 1.0) {
                color = vec3(0.902, 0.957, 0.945); // #EEF7FF, lightest
            } else if (wavePattern > mediumSectionEnd) {
                color = vec3(0.769, 0.867, 0.941); // #CDE8E5, medium
            } else if (wavePattern > gradientStart) {
                gradientFactor = (1.0 - (wavePattern - gradientStart) / (gradientEnd - gradientStart)); // Inverted gradient factor
                vec3 middleColor = vec3(0.769, 0.867, 0.941); // #CDE8E5, medium
                vec3 darkestColor = vec3(0.122, 0.216, 0.275); // #7AB2B2, darkest
                color = mix(middleColor, darkestColor, gradientFactor); // Gradient from medium to darkest (top to bottom)
            } else {
                color = vec3(0.122, 0.216, 0.275); // #7AB2B2, darkest
            }


            gl_FragColor = vec4(color, 1.0);
        }
    `;

        function createShader(gl, type, source) {
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

        function createProgram(gl, vertexShader, fragmentShader) {
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

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        }

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        let startTime = performance.now();
        let mouse = [0, 0];

        function handleMouseMove(event) {
            mouse[0] = event.clientX;
            mouse[1] = event.clientY;
        }

        window.addEventListener('mousemove', handleMouseMove);

        function render() {
            const currentTime = (performance.now() - startTime) / 1000.0;

            gl.clear(gl.COLOR_BUFFER_BIT);

            gl.useProgram(program);

            gl.enableVertexAttribArray(positionAttributeLocation);
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

            gl.vertexAttribPointer(
                positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

            gl.uniform1f(timeUniformLocation, currentTime);
            gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
            gl.uniform2f(mouseUniformLocation, mouse[0], mouse[1]);

            gl.drawArrays(gl.TRIANGLES, 0, 6);

            requestAnimationFrame(render);
        }

        render();
    });

    return (
        <canvas ref={canvas} style={styles}></canvas>
    );
};

export default WaveCanvas;
