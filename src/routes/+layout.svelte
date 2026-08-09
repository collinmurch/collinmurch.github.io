<script>
	import { beforeNavigate } from "$app/navigation";
	import { browser } from "$app/environment";
	import { page } from "$app/state";
	import { onMount } from "svelte";
	import Navigation from "$components/Navigation.svelte";
	import Socials from "$components/Socials.svelte";
	import WaveCanvas from "$components/WaveCanvas.svelte";
	import { getTransition } from "$lib/animations/transitions";
	import { getRouteMeta, normalizeRoute } from "$lib/seo/meta";
	import { waveState } from "$lib/stores/wave";
	import "../app.css";

	const { children } = $props();

	let currentTransition = $state(getTransition(null, page.url.pathname, true));
	let hasNavigated = $state(false);
	let prefersReducedMotion = $state(false);

	const normalizedPath = $derived(normalizeRoute(page.url.pathname));
	const isHome = $derived(normalizedPath === "/");
	const meta = $derived(getRouteMeta(normalizedPath));

	$effect(() => {
		if (!browser) return;
		waveState.set(normalizedPath === "/" ? 0 : 1);
	});

	onMount(() => {
		const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
		const syncReducedMotion = () => {
			prefersReducedMotion = reducedMotionQuery.matches;
		};
		syncReducedMotion();
		reducedMotionQuery.addEventListener("change", syncReducedMotion);

		return () => {
			reducedMotionQuery.removeEventListener("change", syncReducedMotion);
		};
	});

	beforeNavigate(({ from, to }) => {
		hasNavigated = from !== null;
		currentTransition = getTransition(
			from?.route.id,
			to?.route.id,
			prefersReducedMotion,
		);

		if (browser) {
			const nextPath = normalizeRoute(to?.url?.pathname ?? normalizedPath);
			waveState.set(nextPath === "/" ? 0 : 1);
		}
	});
</script>

<svelte:head>
	{#if meta}
		<title>{meta.title}</title>
		<meta name="description" content={meta.description} />
		<meta property="og:title" content={meta.title} />
		<meta property="og:description" content={meta.description} />
		<meta name="twitter:card" content={meta.twitterCard ?? "summary"} />
		<meta name="twitter:title" content={meta.title} />
		<meta name="twitter:description" content={meta.description} />
	{/if}
</svelte:head>

<div
	class="relative isolate min-h-[calc(100*var(--page-shell-viewport-unit))] overflow-hidden text-foreground"
>
	<WaveCanvas />

	<div
		class="relative z-20 flex min-h-[calc(100*var(--page-shell-viewport-unit))] flex-col"
	>
		<header
			class="pointer-events-none fixed inset-x-0 top-4 z-30 flex justify-center pt-2 pl-[calc(1rem+env(safe-area-inset-left))] pr-[calc(1rem+env(safe-area-inset-right))]"
		>
			<Navigation />
		</header>

		<main class="flex-1 min-h-0 scrollbar-reserve pt-12 md:pt-20">
			{#key page.url.pathname}
				<section
					class="page-shell max-lg:landscape:pb-12 max-lg:landscape:pt-16 md:pb-16"
					in:currentTransition.transition={currentTransition.params}
				>
					{@render children()}
				</section>
			{/key}
		</main>

		{#if isHome}
			<Socials animate={hasNavigated} {prefersReducedMotion} />
		{/if}
	</div>
</div>
