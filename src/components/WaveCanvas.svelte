<script>
    import { onMount } from "svelte";
    import vertexShaderSource from "$lib/webgl/vertex.glsl?raw";
    import fragmentShaderSource from "$lib/webgl/fragment.glsl?raw";
    import { waveState } from "$lib/stores/wave";
    import {
        initializeWebGL,
        resizeCanvasToDisplaySize,
        setupEventListeners,
    } from "$lib/webgl/utils";

    let canvas = $state();
    let glContext = $state();

    const TRANSITION_DURATION = 500;

    onMount(() => {
        const {
            gl,
            program,
            positionAttributeLocation,
            timeUniformLocation,
            resolutionUniformLocation,
            mouseUniformLocation,
            positionBuffer,
            transitionUniformLocation,
        } =
            initializeWebGL(canvas, vertexShaderSource, fragmentShaderSource) ||
            {};

        if (!gl) return;

        glContext = gl;
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(0, 0, 0, 0);

        const resizeCanvas = () => {
            resizeCanvasToDisplaySize(canvas);
            gl.viewport(0, 0, canvas.width, canvas.height);
        };
        resizeCanvas();

        const pos = [0, 0];
        const cleanup = setupEventListeners(pos, resizeCanvas);

        let startTime = performance.now();
        let currentTransition = 0;
        let targetTransition = 0;
        let transitionStartTime = 0;

        const unsubscribe = waveState.subscribe((value) => {
            targetTransition = value ? 1.0 : 0.0;
            transitionStartTime = performance.now();
        });

        const render = () => {
            const currentTime = (performance.now() - startTime) / 1000.0;

            // Smooth transition animation
            const transitionTime = performance.now() - transitionStartTime;
            const transitionProgress = Math.min(
                transitionTime / TRANSITION_DURATION,
                1,
            );
            currentTransition =
                currentTransition +
                (targetTransition - currentTransition) * transitionProgress;

            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.useProgram(program);
            gl.enableVertexAttribArray(positionAttributeLocation);
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.vertexAttribPointer(
                positionAttributeLocation,
                2,
                gl.FLOAT,
                false,
                0,
                0,
            );
            gl.uniform1f(timeUniformLocation, currentTime);
            gl.uniform2f(
                resolutionUniformLocation,
                gl.canvas.width,
                gl.canvas.height,
            );
            gl.uniform2f(mouseUniformLocation, pos[0], pos[1]);
            gl.uniform1f(transitionUniformLocation, currentTransition);
            gl.drawArrays(gl.TRIANGLES, 0, 6);

            requestAnimationFrame(render);
        };

        render();

        return () => {
            cleanup();
            unsubscribe();
        };
    });
</script>

<canvas bind:this={canvas}></canvas>

<style>
    canvas {
        height: 100dvh;
        width: 100dvw;
    }
</style>
