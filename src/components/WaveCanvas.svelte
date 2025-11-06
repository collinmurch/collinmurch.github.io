<script>
    import { onMount } from "svelte";
    import { waveState } from "$lib/stores/wave";

    let canvas = $state();
    let glContext = $state();

    const TRANSITION_DURATION = 500;

    onMount(async () => {
        const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        );
        let animationFrameId = 0;

        const startWebGL = async () => {
            const [
                utilsModule,
                vertexShaderSource,
                fragmentShaderSource,
            ] = await Promise.all([
                import("$lib/webgl/utils"),
                import("$lib/webgl/vertex.glsl?raw"),
                import("$lib/webgl/fragment.glsl?raw"),
            ]);

            const {
                initializeWebGL,
                resizeCanvasToDisplaySize,
                setupEventListeners,
            } = utilsModule;

            const context =
                initializeWebGL(
                    canvas,
                    vertexShaderSource.default,
                    fragmentShaderSource.default,
                ) || {};

            return {
                ...context,
                resizeCanvasToDisplaySize,
                setupEventListeners,
            };
        };

        const deferUntilIdle = () =>
            new Promise((resolve) => {
                if ("requestIdleCallback" in window) {
                    window.requestIdleCallback(() => resolve());
                } else {
                    setTimeout(resolve, 0);
                }
            });

        await deferUntilIdle();

        const {
            gl,
            program,
            positionAttributeLocation,
            timeUniformLocation,
            resolutionUniformLocation,
            mouseUniformLocation,
            positionBuffer,
            transitionUniformLocation,
            resizeCanvasToDisplaySize,
            setupEventListeners,
        } = await startWebGL();

        if (!gl) return;

        if (prefersReducedMotion.matches) {
            waveState.set(false);
            return () => {
                cleanup();
                unsubscribe();
            };
        }

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

            animationFrameId = requestAnimationFrame(render);
        };

        const stopRendering = () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = 0;
            }
        };

        const handleVisibilityChange = () => {
            if (document.hidden || prefersReducedMotion.matches) {
                stopRendering();
            } else {
                startRendering();
            }
        };

        const startRendering = () => {
            stopRendering();
            animationFrameId = requestAnimationFrame(render);
        };

        const handleMotionChange = (event) => {
            if (event.matches) {
                waveState.set(false);
                stopRendering();
            } else {
                startRendering();
            }
        };

        prefersReducedMotion.addEventListener("change", handleMotionChange);
        document.addEventListener("visibilitychange", handleVisibilityChange);

        startRendering();

        return () => {
            cleanup();
            unsubscribe();
            stopRendering();
            prefersReducedMotion.removeEventListener("change", handleMotionChange);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    });
</script>

<canvas
    bind:this={canvas}
    class="pointer-events-none fixed inset-0 -z-10 h-dvh w-dvw"
></canvas>
