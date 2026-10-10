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
	class="pointer-events-auto fixed bottom-(--header-offset) left-1/2 z-30 flex -translate-x-1/2 items-center justify-center gap-2 rounded-full border border-border/60 bg-background/90 p-1.5 shadow-[0_12px_35px_rgba(0,0,0,0.35)] md:bg-background/75 md:backdrop-blur-xl"
>
	{#each links as link}
		<a
			href={link.href}
			class="group relative flex size-[calc(var(--nav-height)-0.75rem-2px)] items-center justify-center overflow-hidden rounded-full border border-transparent text-muted-foreground transition duration-200 hover:border-primary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
			target="_blank"
			rel="noopener noreferrer"
		>
			<img
				src={link.src}
				alt={link.alt}
				class="size-[55%] opacity-90 transition duration-200 group-hover:opacity-100"
			/>
			<span class="sr-only">{link.alt}</span>
		</a>
	{/each}
</nav>
