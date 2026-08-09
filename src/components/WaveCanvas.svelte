<script>
	import { onMount } from "svelte";
	import { waveState } from "$lib/stores/wave";

	let canvas = $state();

	const TRANSITION_DURATION = 500;

	onMount(() => {
		if (typeof window === "undefined") return;

		const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
		const prefersCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
		const hasLimitedHardware = navigator.hardwareConcurrency <= 4;
		const prefersReducedData = navigator.connection?.saveData === true;
		const useReducedQuality =
			prefersCoarsePointer || hasLimitedHardware || prefersReducedData;
		const maximumPixelRatio = useReducedQuality ? 1.25 : 1.75;
		const desiredPixelRatio = Math.min(window.devicePixelRatio || 1, maximumPixelRatio);
		const minimumPixelRatio = Math.min(desiredPixelRatio, 0.75);
		let isInitializing = false;
		let hasScene = false;
		let destroyed = false;
		let currentWaveState = 0;
		let animationFrameId = 0;
		let initializationGeneration = 0;
		let cancelDeferredInitialization = () => {};
		let destroyResources = () => {};

		let cleanupPointers = () => {};
		let unsubscribeWave = () => {};
		let removeVisibilityListener = () => {};

		const startWebGL = async () => {
			const [utilsModule, vertexShaderSource, fragmentShaderSource] = await Promise.all(
				[
					import("$lib/webgl/utils"),
					import("$lib/webgl/vertex.glsl?raw"),
					import("$lib/webgl/fragment.glsl?raw"),
				],
			);

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

		const stopRendering = () => {
			if (animationFrameId) {
				cancelAnimationFrame(animationFrameId);
				animationFrameId = 0;
			}
		};

		const teardownScene = () => {
			initializationGeneration += 1;
			stopRendering();
			cleanupPointers();
			cleanupPointers = () => {};
			unsubscribeWave();
			unsubscribeWave = () => {};
			removeVisibilityListener();
			removeVisibilityListener = () => {};
			destroyResources();
			destroyResources = () => {};
			hasScene = false;
		};

		const createScene = async () => {
			if (isInitializing || prefersReducedMotion.matches) return;
			isInitializing = true;
			const generation = ++initializationGeneration;

			let context;
			try {
				context = await startWebGL();
			} catch (error) {
				console.error("Unable to initialize the wave background", error);
			} finally {
				isInitializing = false;
			}

			const initializationWasSuperseded = generation !== initializationGeneration;
			if (
				destroyed ||
				initializationWasSuperseded ||
				!context?.gl ||
				prefersReducedMotion.matches
			) {
				context?.destroy?.();
				if (
					initializationWasSuperseded &&
					!destroyed &&
					!prefersReducedMotion.matches
				) {
					queueMicrotask(() => scheduleSceneCreation());
				}
				return;
			}

			const {
				gl,
				timeUniformLocation,
				resolutionUniformLocation,
				mouseUniformLocation,
				pointerUniformLocation,
				qualityUniformLocation,
				transitionUniformLocation,
				resizeCanvasToDisplaySize,
				setupEventListeners,
				destroy,
			} = context;

			destroyResources = destroy;
			let pixelRatio = desiredPixelRatio;
			let quality = useReducedQuality ? 0 : 1;

			const resizeCanvas = () => {
				resizeCanvasToDisplaySize(canvas, pixelRatio);
				gl.viewport(0, 0, canvas.width, canvas.height);
				gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
			};
			resizeCanvas();
			gl.clearColor(0.769, 0.867, 0.941, 1);
			gl.clear(gl.COLOR_BUFFER_BIT);
			gl.uniform1f(qualityUniformLocation, quality);

			const pos = [0, 0];
			const pointerState = { target: 0, value: 0 };
			cleanupPointers = setupEventListeners(canvas, pos, resizeCanvas, pointerState);

			const startTime = performance.now();
			let currentTransition = 0;
			let targetTransition = 0;
			let transitionStartTime = performance.now();
			let performanceWindowStart = performance.now();
			let performanceFrameCount = 0;
			let stablePerformanceWindows = 0;

			const adaptQuality = (now) => {
				performanceFrameCount += 1;
				const elapsed = now - performanceWindowStart;
				if (elapsed < 1500) return;

				const framesPerSecond = (performanceFrameCount * 1000) / elapsed;
				if (framesPerSecond < 55) {
					stablePerformanceWindows = 0;
					quality = Math.max(-1, quality - 1);
					const nextPixelRatio = Math.max(minimumPixelRatio, pixelRatio - 0.15);
					if (nextPixelRatio !== pixelRatio) {
						pixelRatio = nextPixelRatio;
						resizeCanvas();
					}
					gl.uniform1f(qualityUniformLocation, quality);
				} else if (framesPerSecond >= 58) {
					stablePerformanceWindows += 1;
					if (stablePerformanceWindows >= 3 && quality < 0) {
						quality = 0;
						stablePerformanceWindows = 0;
						gl.uniform1f(qualityUniformLocation, quality);
					} else if (stablePerformanceWindows >= 3 && pixelRatio < desiredPixelRatio) {
						pixelRatio = Math.min(desiredPixelRatio, pixelRatio + 0.1);
						stablePerformanceWindows = 0;
						resizeCanvas();
					} else if (
						stablePerformanceWindows >= 5 &&
						pixelRatio === desiredPixelRatio &&
						!useReducedQuality
					) {
						quality = 1;
						gl.uniform1f(qualityUniformLocation, quality);
					}
				} else {
					stablePerformanceWindows = 0;
				}

				performanceWindowStart = now;
				performanceFrameCount = 0;
			};

			function render(now) {
				if (
					destroyed ||
					generation !== initializationGeneration ||
					prefersReducedMotion.matches
				) {
					stopRendering();
					return;
				}

				const currentTime = (now - startTime) / 1000.0;
				const transitionTime = now - transitionStartTime;
				const transitionProgress = Math.min(transitionTime / TRANSITION_DURATION, 1);
				currentTransition =
					currentTransition +
					(targetTransition - currentTransition) * transitionProgress;

				gl.uniform1f(timeUniformLocation, currentTime);
				pointerState.value =
					pointerState.value + (pointerState.target - pointerState.value) * 0.08;
				gl.uniform2f(mouseUniformLocation, pos[0], pos[1]);
				gl.uniform1f(pointerUniformLocation, pointerState.value);
				gl.uniform1f(transitionUniformLocation, currentTransition);
				gl.drawArrays(gl.TRIANGLES, 0, 6);
				adaptQuality(now);

				animationFrameId = requestAnimationFrame(render);
			}

			const startRendering = () => {
				stopRendering();
				performanceWindowStart = performance.now();
				performanceFrameCount = 0;
				animationFrameId = requestAnimationFrame(render);
			};

			unsubscribeWave = waveState.subscribe((value) => {
				currentWaveState = value ? 1.0 : 0.0;
				targetTransition = currentWaveState;
				transitionStartTime = performance.now();
				startRendering();
			});

			const handleVisibilityChange = () => {
				if (document.hidden || prefersReducedMotion.matches) {
					stopRendering();
				} else {
					startRendering();
				}
			};

			document.addEventListener("visibilitychange", handleVisibilityChange);
			removeVisibilityListener = () =>
				document.removeEventListener("visibilitychange", handleVisibilityChange);

			hasScene = true;
			startRendering();
		};

		const scheduleSceneCreation = () => {
			cancelDeferredInitialization();
			if (destroyed || prefersReducedMotion.matches || hasScene || isInitializing)
				return;

			if ("requestIdleCallback" in window) {
				const idleId = window.requestIdleCallback(() => createScene(), {
					timeout: 800,
				});
				cancelDeferredInitialization = () => window.cancelIdleCallback(idleId);
				return;
			}

			let secondFrameId = 0;
			const firstFrameId = requestAnimationFrame(() => {
				secondFrameId = requestAnimationFrame(() => createScene());
			});
			cancelDeferredInitialization = () => {
				cancelAnimationFrame(firstFrameId);
				cancelAnimationFrame(secondFrameId);
			};
		};

		const handleMotionPreferenceChange = (event) => {
			if (event.matches) {
				waveState.set(false);
				cancelDeferredInitialization();
				teardownScene();
			} else {
				scheduleSceneCreation();
			}
		};

		const handleContextLost = (event) => {
			event.preventDefault();
			teardownScene();
		};

		const handleContextRestored = () => {
			scheduleSceneCreation();
		};

		canvas.addEventListener("webglcontextlost", handleContextLost);
		canvas.addEventListener("webglcontextrestored", handleContextRestored);

		if (prefersReducedMotion.matches) {
			waveState.set(false);
		} else {
			scheduleSceneCreation();
		}

		prefersReducedMotion.addEventListener("change", handleMotionPreferenceChange);

		return () => {
			destroyed = true;
			cancelDeferredInitialization();
			prefersReducedMotion.removeEventListener("change", handleMotionPreferenceChange);
			canvas.removeEventListener("webglcontextlost", handleContextLost);
			canvas.removeEventListener("webglcontextrestored", handleContextRestored);
			teardownScene();
		};
	});
</script>

<canvas bind:this={canvas} class="pointer-events-none fixed inset-0 -z-10 h-dvh w-dvw"
></canvas>
