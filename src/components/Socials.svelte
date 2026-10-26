<script>
	import { cubicOut } from "svelte/easing";
	import { fly } from "svelte/transition";

	let { animate = false, prefersReducedMotion = false } = $props();

	const links = [
		{
			src: "/images/x.svg",
			alt: "X logo",
			href: "https://x.com/collinmurch",
		},
		{
			src: "/images/github.svg",
			alt: "GitHub logo",
			href: "https://github.com/collinmurch",
		},
		{
			src: "/images/linkedin.svg",
			alt: "LinkedIn logo",
			href: "https://linkedin.com/in/collinmurch",
		},
	];
</script>

<nav
	transition:fly={{
		y: -56,
		duration: animate && !prefersReducedMotion ? 240 : 0,
		easing: cubicOut,
	}}
	class="pointer-events-auto fixed bottom-(--header-offset) left-1/2 z-30 flex -translate-x-1/2 items-center justify-center gap-[calc(var(--social-size)*0.3)] rounded-full border border-border/60 bg-background/90 p-[calc(var(--social-size)*0.12)] shadow-[0_12px_35px_rgba(0,0,0,0.35)]"
>
	{#each links as link}
		<a
			href={link.href}
			class="group relative flex size-(--social-size) items-center justify-center overflow-hidden rounded-full transition duration-150 hover:bg-primary hover:shadow-[0_10px_30px_rgb(0_0_0/25%)] active:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
			target="_blank"
			rel="noopener noreferrer"
		>
			<img
				src={link.src}
				alt={link.alt}
				class="size-[55%] opacity-80 transition-opacity duration-150 group-hover:opacity-100 group-active:opacity-100"
			/>
			<span class="sr-only">{link.alt}</span>
		</a>
	{/each}
</nav>
