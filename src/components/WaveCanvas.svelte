<script>
    import { onMount } from "svelte";
    import { waveState } from "$lib/stores/wave";

    let canvas = $state();

    const TRANSITION_DURATION = 500;

    onMount(() => {
        if (typeof window === "undefined") return;

        const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        );
        let animationFrameId = 0;
        let isInitializing = false;
        let hasScene = false;
        let destroyed = false;

        let cleanupPointers = () => {};
        let unsubscribeWave = () => {};
        let removeVisibilityListener = () => {};

        const startWebGL = async () => {
            const [utilsModule, vertexShaderSource, fragmentShaderSource] =
                await Promise.all([
                    import("$lib/webgl/utils"),
                    import("$lib/webgl/vertex.glsl?raw"),
                    import("$lib/webgl/fragment.glsl?raw"),
                ]);

            const { initializeWebGL, resizeCanvasToDisplaySize, setupEventListeners } =
                utilsModule;

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

        const stopRendering = () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = 0;
            }
        };

        const teardownScene = () => {
            if (!hasScene) return;
            stopRendering();
            cleanupPointers();
            cleanupPointers = () => {};
            unsubscribeWave();
            unsubscribeWave = () => {};
            removeVisibilityListener();
            removeVisibilityListener = () => {};
            hasScene = false;
        };

        const createScene = async () => {
            if (isInitializing || prefersReducedMotion.matches) return;
            isInitializing = true;

            await deferUntilIdle();
            const context = await startWebGL();
            isInitializing = false;

            if (destroyed || !context?.gl || prefersReducedMotion.matches) {
                return;
            }

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
            } = context;

            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
            gl.clearColor(0, 0, 0, 0);

            const resizeCanvas = () => {
                resizeCanvasToDisplaySize(canvas);
                gl.viewport(0, 0, canvas.width, canvas.height);
            };
            resizeCanvas();

            const pos = [0, 0];
            cleanupPointers = setupEventListeners(pos, resizeCanvas);

            let startTime = performance.now();
            let currentTransition = 0;
            let targetTransition = 0;
            let transitionStartTime = performance.now();

            unsubscribeWave = waveState.subscribe((value) => {
                targetTransition = value ? 1.0 : 0.0;
                transitionStartTime = performance.now();
            });

            const render = () => {
                const currentTime = (performance.now() - startTime) / 1000.0;
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

            const startRendering = () => {
                stopRendering();
                animationFrameId = requestAnimationFrame(render);
            };

            const handleVisibilityChange = () => {
                if (document.hidden || prefersReducedMotion.matches) {
                    stopRendering();
                } else {
                    startRendering();
                }
            };

            document.addEventListener("visibilitychange", handleVisibilityChange);
            removeVisibilityListener = () =>
                document.removeEventListener(
                    "visibilitychange",
                    handleVisibilityChange,
                );

            hasScene = true;
            startRendering();
        };

        const handleMotionPreferenceChange = (event) => {
            if (event.matches) {
                waveState.set(false);
                teardownScene();
            } else {
                createScene();
            }
        };

        if (prefersReducedMotion.matches) {
            waveState.set(false);
        } else {
            createScene();
        }

        prefersReducedMotion.addEventListener("change", handleMotionPreferenceChange);

        return () => {
            destroyed = true;
            prefersReducedMotion.removeEventListener(
                "change",
                handleMotionPreferenceChange,
            );
            teardownScene();
        };
    });
</script>

<canvas bind:this={canvas} class="pointer-events-none fixed inset-0 -z-10 h-dvh w-dvw"
></canvas>
