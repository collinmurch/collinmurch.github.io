<script>
    import { onMount } from "svelte";
    import {
        vertexShaderSource,
        fragmentShaderSource,
    } from "$lib/webgl/shaders";
    import {
        initializeWebGL,
        resizeCanvasToDisplaySize,
        setupEventListeners,
    } from "$lib/webgl/utils";

    let canvas;
    let glContext;

    onMount(() => {
        const {
            gl,
            program,
            positionAttributeLocation,
            timeUniformLocation,
            resolutionUniformLocation,
            mouseUniformLocation,
            positionBuffer,
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

        const render = () => {
            const currentTime = (performance.now() - startTime) / 1000.0;
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
            gl.drawArrays(gl.TRIANGLES, 0, 6);

            requestAnimationFrame(render);
        };

        render();

        return () => {
            cleanup();
        };
    });
</script>

<canvas bind:this={canvas}></canvas>

<style>
    canvas {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100dvh;
        margin: 0;
        padding: 0;
    }
</style>
