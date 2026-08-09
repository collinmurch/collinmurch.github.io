<script>
	import { page } from "$app/state";
	import { normalizeRoute } from "$lib/seo/meta";

	const links = [
		{ href: "/about", text: "About" },
		{ href: "/", text: "Home" },
		{ href: "/blog", text: "Blog" },
	];

	function getNavSection(path) {
		const normalized = normalizeRoute(path);
		if (normalized === "/blog" || normalized.startsWith("/blog/")) {
			return "/blog";
		}
		return normalized;
	}

	const activeRoute = $derived(getNavSection(page.url.pathname));
</script>

<nav
	aria-label="Primary navigation"
	class="pointer-events-auto relative z-30 mx-auto flex w-full max-w-[min(26rem,100%)] items-center gap-2 overflow-hidden rounded-full border border-border/70 bg-background/95 px-3 py-2 text-sm shadow-[0_15px_45px_rgba(0,0,0,0.35)] md:max-w-lg md:bg-background/80 md:text-base md:backdrop-blur-xl sm:max-w-[min(30rem,100%)] max-lg:landscape:h-10 max-lg:landscape:max-w-[min(22rem,100%)] max-lg:landscape:gap-1 max-lg:landscape:px-2 max-lg:landscape:py-0 max-lg:landscape:text-xs"
>
	{#each links as link}
		{@const isActive = activeRoute === link.href}
		<a
			href={link.href}
			data-sveltekit-preload-code="viewport"
			aria-current={isActive ? "page" : undefined}
			class:bg-primary={isActive}
			class:text-primary-foreground={isActive}
			class:nav-active={isActive}
			class="relative z-10 inline-flex h-8 flex-1 items-center justify-center whitespace-nowrap rounded-full px-4 text-sm font-medium tracking-wide text-foreground/80 outline-none transition-colors duration-150 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:px-6 md:text-base max-lg:landscape:h-6 max-lg:landscape:px-3 max-lg:landscape:py-0.5 max-lg:landscape:text-xs"
		>
			{link.text}
		</a>
	{/each}
</nav>

<style>
	.nav-active {
		box-shadow: 0 10px 30px rgb(0 0 0 / 25%);
	}
</style>
