<script>
	import { afterNavigate, beforeNavigate } from "$app/navigation";
	import { page } from "$app/state";
	import { onMount } from "svelte";
	import Navigation from "#components/Navigation.svelte";
	import Socials from "#components/Socials.svelte";
	import ChromeTint from "#components/ChromeTint.svelte";
	import WaveCanvas from "#components/WaveCanvas.svelte";
	import { getTransition } from "#lib/animations/transitions";
	import { getRouteMeta, normalizeRoute } from "#lib/seo/meta";
	import { createScrollReveal } from "#lib/utils/scroll-reveal";
	import "../app.css";

	const { children } = $props();

	let currentTransition = $state(getTransition(null, page.url.pathname, true));
	let hasNavigated = $state(false);
	let prefersReducedMotion = $state(false);

	const isSubmerged = (path) => normalizeRoute(path) !== "/";

	const normalizedPath = $derived(normalizeRoute(page.url.pathname));
	const isHome = $derived(normalizedPath === "/");
	const meta = $derived(getRouteMeta(normalizedPath));

	// Every page but home is underwater. Set ahead of navigation so the water moves
	// alongside the page transition, then settled to the page actually shown.
	let submerged = $state(isSubmerged(page.url.pathname));

	const scrollReveal = createScrollReveal();
	let header = $state();
	let scrolledAway = $state(false);
	let navFocused = $state(false);
	const navHidden = $derived(!isHome && scrolledAway && !navFocused);
	let hashHideTimer;

	function syncNav() {
		const root = document.documentElement;
		scrolledAway = scrollReveal.update(window.scrollY, {
			max: root.scrollHeight - root.clientHeight,
			topZone: header.offsetTop + header.offsetHeight,
		});
	}

	onMount(() => {
		const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
		const syncReducedMotion = () => {
			prefersReducedMotion = reducedMotionQuery.matches;
		};
		syncReducedMotion();
		reducedMotionQuery.addEventListener("change", syncReducedMotion);
		window.addEventListener("scroll", syncNav, { passive: true });

		return () => {
			reducedMotionQuery.removeEventListener("change", syncReducedMotion);
			window.removeEventListener("scroll", syncNav);
			clearTimeout(hashHideTimer);
		};
	});

	beforeNavigate(({ from, to }) => {
		hasNavigated = from !== null;
		currentTransition = getTransition(
			from?.route.id,
			to?.route.id,
			prefersReducedMotion,
		);

		if (to) submerged = isSubmerged(to.url.pathname);
	});

	// Landing on a section shows the nav for a moment, then tucks it away so it
	// doesn't cover the section. A section near the top leaves it shown.
	afterNavigate(({ to }) => {
		submerged = isSubmerged(page.url.pathname);
		scrollReveal.reset(window.scrollY);
		scrolledAway = false;

		clearTimeout(hashHideTimer);
		if (!to?.url.hash) return;
		hashHideTimer = setTimeout(() => {
			if (window.scrollY <= header.offsetTop + header.offsetHeight) return;
			scrollReveal.hide(window.scrollY);
			scrolledAway = true;
		}, 500);
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

<div class="relative isolate min-h-svh overflow-hidden text-foreground">
	<WaveCanvas {submerged} />
	<ChromeTint {submerged} />

	<div class="relative z-20 flex min-h-svh flex-col">
		<header
			bind:this={header}
			onfocusin={() => (navFocused = true)}
			onfocusout={() => (navFocused = false)}
			class={[
				"pointer-events-none fixed inset-x-0 top-(--header-offset) z-30 flex justify-center pl-[calc(1rem+env(safe-area-inset-left))] pr-[calc(1rem+env(safe-area-inset-right))] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
				navHidden && "-translate-y-[calc(var(--header-height)+4rem)]",
			]}
		>
			<Navigation />
		</header>

		<main class="flex-1 min-h-0 scrollbar-reserve pt-(--header-height)">
			{#key page.url.pathname}
				<section
					class="page-shell"
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
