<script>
	import { onMount } from "svelte";

	const { submerged = false } = $props();

	let canvas = $state();
	let renderer = $state.raw(null);

	$effect(() => {
		renderer?.setSubmerged(submerged);
	});

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
		let generation = 0;
		let destroyed = false;
		let cancelScheduledCreation = () => {};

		const teardown = () => {
			generation += 1;
			cancelScheduledCreation();
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
		};

		const scheduleCreation = () => {
			cancelScheduledCreation();
			if (destroyed || reducedMotion.matches || renderer) return;
			cancelScheduledCreation = whenIdle(createRenderer);
		};

		const handleMotionPreferenceChange = (event) => {
			if (event.matches) {
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

		scheduleCreation();

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
