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
	class="pointer-events-auto relative z-30 mx-auto flex h-(--nav-height) w-[calc(var(--nav-height)*10)] max-w-full items-center gap-2 overflow-hidden rounded-full border border-border/70 bg-background/95 p-1.5 text-[calc(var(--nav-height)*0.32)] shadow-[0_15px_45px_rgba(0,0,0,0.35)] md:bg-background/80 md:backdrop-blur-xl"
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
			class="relative z-10 inline-flex h-full flex-1 items-center justify-center whitespace-nowrap rounded-full px-3 font-medium tracking-wide text-foreground/80 outline-none transition-colors duration-150 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
