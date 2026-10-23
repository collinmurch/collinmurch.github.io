<script>
	import { page } from "$app/state";
	import { getSection } from "#lib/seo/meta";

	const links = [
		{ href: "/about", text: "About" },
		{ href: "/", text: "Home" },
		{ href: "/blog", text: "Blog" },
	];

	const activeRoute = $derived(getSection(page.url.pathname));
	const onRecipes = $derived(activeRoute === "/recipes");
</script>

<div class="relative mx-auto w-[calc(var(--nav-height)*10)] max-w-full">
	<!--
		The recipes tab hides behind the nav and only slides out from under Blog on
		the recipes pages. The clip starts at the nav's middle, so the tab vanishes
		behind the nav as it retracts. The clip lays out the nav's three columns,
		and the tab is inset half a nav height on each side so it stays clear of
		the nav's rounded end.
	-->
	<div
		class="pointer-events-none absolute -inset-x-8 top-1/2 grid grid-cols-3 gap-2 overflow-hidden px-[calc(2rem+0.375rem+1px)] pb-8"
	>
		<a
			href="/recipes"
			aria-current={onRecipes ? "page" : undefined}
			aria-hidden={onRecipes ? undefined : "true"}
			tabindex={onRecipes ? undefined : -1}
			data-shown={onRecipes || undefined}
			class="recipes-tab pointer-events-auto col-start-3 flex h-[calc(var(--nav-height)*1.6)] w-[calc(100%-var(--nav-height))] items-end justify-self-center rounded-b-[calc(var(--nav-height)*0.5)] border border-t-0 border-border/70 bg-background/95 p-1.5 pt-0 text-[calc(var(--nav-height)*0.32)] shadow-[0_15px_45px_rgba(0,0,0,0.35)] outline-none focus-visible:ring-2 focus-visible:ring-ring"
		>
			<span
				class="recipes-pill inline-flex h-[calc(var(--nav-height)*0.72)] w-full items-center justify-center rounded-full font-medium tracking-wide text-foreground/80"
			>
				Recipes
			</span>
		</a>
	</div>

	<nav
		aria-label="Primary navigation"
		class="pointer-events-auto relative z-30 flex h-(--nav-height) w-full items-center gap-2 overflow-hidden rounded-full border border-border/70 bg-background/95 p-1.5 text-[calc(var(--nav-height)*0.32)] shadow-[0_15px_45px_rgba(0,0,0,0.35)] md:bg-background/80 md:backdrop-blur-xl"
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
</div>

<style>
	.nav-active {
		box-shadow: 0 10px 30px rgb(0 0 0 / 25%);
	}

	.recipes-tab {
		transform: translateY(-100%);
		visibility: hidden;
		transition:
			transform 450ms cubic-bezier(0.22, 1, 0.36, 1),
			visibility 0s 450ms;
	}

	.recipes-tab[data-shown] {
		transform: none;
		visibility: visible;
		transition: transform 450ms cubic-bezier(0.22, 1, 0.36, 1) 150ms;
	}

	.recipes-pill {
		transition:
			background-color 150ms ease,
			color 150ms ease,
			box-shadow 150ms ease;
	}

	/* Selected once it has slid out, and deselected before it slides back. */
	.recipes-tab[data-shown] .recipes-pill {
		background-color: var(--color-primary);
		color: var(--color-primary-foreground);
		box-shadow: 0 10px 30px rgb(0 0 0 / 25%);
		transition-delay: 450ms;
	}

	@media (prefers-reduced-motion: reduce) {
		.recipes-tab,
		.recipes-tab[data-shown],
		.recipes-pill,
		.recipes-tab[data-shown] .recipes-pill {
			transition: none;
		}
	}
</style>
