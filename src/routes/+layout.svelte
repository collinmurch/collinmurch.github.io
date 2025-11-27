<script>
	import { beforeNavigate } from "$app/navigation";
	import { page } from "$app/stores";
	import Navigation from "$components/Navigation.svelte";
	import Socials from "$components/Socials.svelte";
	import { getTransition } from "$lib/animations/transitions";
	import { getRouteMeta, normalizeRoute } from "$lib/seo/meta";
	import "../app.css";
	import WaveCanvas from "../components/WaveCanvas.svelte";

	const { children } = $props();

	let currentTransition = $state(getTransition("/", $page.url.pathname));

	const normalizedPath = $derived(normalizeRoute($page.url.pathname));
	const meta = $derived(getRouteMeta(normalizedPath));

	beforeNavigate(({ from, to }) => {
		currentTransition = getTransition(from?.route.id, to?.route.id);
	});
</script>

<svelte:head>
	<title>{meta.title}</title>
	<meta name="description" content={meta.description} />
	<meta property="og:title" content={meta.title} />
	<meta property="og:description" content={meta.description} />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={meta.title} />
	<meta name="twitter:description" content={meta.description} />
</svelte:head>

<div class="relative isolate min-h-screen overflow-hidden text-foreground">
	<WaveCanvas />

	<div class="relative z-20 flex min-h-[100dvh] flex-col">
		<header class="pointer-events-none sticky top-4 z-30 flex justify-center px-4 pt-2">
			<Navigation />
		</header>

		<main class="flex-1 min-h-0 scrollbar-reserve">
			{#key $page.url.pathname}
				<section
					class="page-shell max-lg:landscape:pb-12 max-lg:landscape:pt-16 md:pb-16"
					in:currentTransition.transition={currentTransition.params}
				>
					{@render children()}
				</section>
			{/key}
		</main>

		{#if normalizedPath === "/"}
			<div class="pointer-events-none fixed inset-x-0 bottom-4 z-30 flex justify-center px-4">
				<Socials class="pointer-events-auto" />
			</div>
		{/if}
	</div>
</div>
