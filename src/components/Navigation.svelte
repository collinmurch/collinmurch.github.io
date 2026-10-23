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

<!--
	The nav and the recipes tab are centered as a pair. The tab hides behind the
	nav's right end and slides out only on the recipes pages. Its slot grows
	from nothing, so the pair stays centered, and on a narrow screen the nav
	shrinks to make room.
-->
<div class="flex max-w-full items-center">
	<nav
		aria-label="Primary navigation"
		class="pointer-events-auto relative z-30 flex h-(--nav-height) w-[calc(var(--nav-height)*10)] min-w-0 items-center gap-2 overflow-hidden rounded-full border border-border/70 bg-background/95 p-1.5 text-[calc(var(--nav-height)*0.32)] shadow-[0_15px_45px_rgba(0,0,0,0.35)] md:bg-background/80 md:backdrop-blur-xl"
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

	<div class="recipes-slot relative z-20 grid" data-shown={onRecipes || undefined}>
		<div class="flex min-w-0 justify-end">
			<a
				href="/recipes"
				aria-current={onRecipes ? "page" : undefined}
				aria-hidden={onRecipes ? undefined : "true"}
				tabindex={onRecipes ? undefined : -1}
				class="recipes-tab pointer-events-auto flex h-(--nav-height) shrink-0 items-center rounded-e-full border border-s-0 border-border/70 bg-background/95 py-1.5 ps-[calc(var(--nav-height)/2+0.375rem)] pe-1.5 text-[calc(var(--nav-height)*0.32)] shadow-[0_15px_45px_rgba(0,0,0,0.35)] outline-none focus-visible:*:ring-2 focus-visible:*:ring-ring"
			>
				<span
					class="recipes-pill inline-flex h-full items-center whitespace-nowrap rounded-full px-[2ch] font-medium tracking-wide text-foreground/80"
				>
					Recipes
				</span>
			</a>
		</div>
	</div>
</div>

<style>
	.nav-active {
		box-shadow: 0 10px 30px rgb(0 0 0 / 25%);
	}

	/* The slot overlaps the nav's rounded end once the tab is out. */
	.recipes-slot {
		grid-template-columns: 0fr;
		transition:
			grid-template-columns 450ms cubic-bezier(0.22, 1, 0.36, 1),
			margin 450ms cubic-bezier(0.22, 1, 0.36, 1);
	}

	.recipes-slot[data-shown] {
		grid-template-columns: 1fr;
		margin-inline-start: calc(var(--nav-height) / -2);
		transition-delay: 150ms;
	}

	.recipes-tab {
		visibility: hidden;
		transition: visibility 0s 450ms;
	}

	[data-shown] .recipes-tab {
		visibility: visible;
		transition: none;
	}

	.recipes-pill {
		transition:
			background-color 150ms ease,
			color 150ms ease,
			box-shadow 150ms ease;
	}

	/* Selected once it has slid out, and deselected before it slides back. */
	[data-shown] .recipes-pill {
		background-color: var(--color-primary);
		color: var(--color-primary-foreground);
		box-shadow: 0 10px 30px rgb(0 0 0 / 25%);
		transition-delay: 450ms;
	}

	@media (prefers-reduced-motion: reduce) {
		.recipes-slot,
		.recipes-slot[data-shown],
		.recipes-tab,
		.recipes-pill,
		[data-shown] .recipes-pill {
			transition: none;
		}
	}
</style>
