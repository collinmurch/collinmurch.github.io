<script>
	import { onMount } from "svelte";
	import { waveState } from "$lib/stores/wave";

	let canvas = $state();

	const IDLE_TIMEOUT = 800;

	const prefersReducedQuality = () =>
		window.matchMedia("(pointer: coarse)").matches ||
		navigator.hardwareConcurrency <= 4 ||
		navigator.connection?.saveData === true;

	const whenIdle = (callback) => {
		if ("requestIdleCallback" in window) {
			const idleId = window.requestIdleCallback(callback, { timeout: IDLE_TIMEOUT });
			return () => window.cancelIdleCallback(idleId);
		}

		let secondFrameId = 0;
		const firstFrameId = requestAnimationFrame(() => {
			secondFrameId = requestAnimationFrame(callback);
		});
		return () => {
			cancelAnimationFrame(firstFrameId);
			cancelAnimationFrame(secondFrameId);
		};
	};

	onMount(() => {
		const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
		let renderer = null;
		let generation = 0;
		let destroyed = false;
		let cancelScheduledCreation = () => {};
		let unsubscribeWave = () => {};

		const teardown = () => {
			generation += 1;
			cancelScheduledCreation();
			unsubscribeWave();
			unsubscribeWave = () => {};
			renderer?.destroy();
			renderer = null;
		};

		const createRenderer = async () => {
			const attempt = ++generation;
			try {
				const { createWaveRenderer } = await import("$lib/webgl/renderer");
				if (attempt !== generation || destroyed || reducedMotion.matches) return;
				renderer = createWaveRenderer(canvas, {
					reducedQuality: prefersReducedQuality(),
				});
			} catch (error) {
				console.error("Unable to initialize the wave background", error);
				return;
			}
			if (!renderer) return;
			unsubscribeWave = waveState.subscribe((value) =>
				renderer.setSubmerged(Boolean(value)),
			);
		};

		const scheduleCreation = () => {
			cancelScheduledCreation();
			if (destroyed || reducedMotion.matches || renderer) return;
			cancelScheduledCreation = whenIdle(createRenderer);
		};

		const handleMotionPreferenceChange = (event) => {
			if (event.matches) {
				waveState.set(false);
				teardown();
			} else {
				scheduleCreation();
			}
		};

		const handleContextLost = (event) => {
			event.preventDefault();
			teardown();
		};

		canvas.addEventListener("webglcontextlost", handleContextLost);
		canvas.addEventListener("webglcontextrestored", scheduleCreation);
		reducedMotion.addEventListener("change", handleMotionPreferenceChange);

		if (reducedMotion.matches) {
			waveState.set(false);
		} else {
			scheduleCreation();
		}

		return () => {
			destroyed = true;
			reducedMotion.removeEventListener("change", handleMotionPreferenceChange);
			canvas.removeEventListener("webglcontextlost", handleContextLost);
			canvas.removeEventListener("webglcontextrestored", scheduleCreation);
			teardown();
		};
	});
</script>

<canvas bind:this={canvas} class="pointer-events-none fixed inset-0 -z-10 h-dvh w-dvw"
></canvas>
