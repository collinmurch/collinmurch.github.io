<script>
	import { onNavigate } from "$app/navigation";
	import { page } from "$app/state";
	import { getSection } from "#lib/seo/meta";

	const links = [
		{ href: "/about", text: "About" },
		{ href: "/", text: "Home" },
		{ href: "/blog", text: "Blog" },
	];

	const showsRecipes = (section) => section === "/blog" || section === "/recipes";

	const activeRoute = $derived(getSection(page.url.pathname));
	const onRecipes = $derived(activeRoute === "/recipes");
	const shown = $derived(showsRecipes(activeRoute));

	// Whether the card was already out, so selecting it needn't wait for it to slide.
	let wasShown = $state(false);
	onNavigate(({ from }) => {
		wasShown = from !== null && showsRecipes(getSection(from.url.pathname));
	});
</script>

<div class="relative mx-auto w-[calc(var(--nav-height)*10)] max-w-full">
	<!--
		The recipes card sits under Blog like a card under a hand. On the blog and
		recipes pages it slides down, so it peeks from under the nav, and the part
		that shows is a link. The grid mirrors the nav's three columns.
	-->
	<div
		class="pointer-events-none absolute inset-0 grid grid-cols-3 gap-2 px-1.5"
		data-shown={shown || undefined}
		data-was-shown={wasShown || undefined}
	>
		<a
			href="/recipes"
			aria-current={onRecipes ? "page" : undefined}
			aria-hidden={shown ? undefined : "true"}
			tabindex={shown ? undefined : -1}
			class="recipes-card pointer-events-auto col-start-3 flex h-full w-max max-w-full justify-self-center rounded-full border border-border/70 bg-background/95 p-1.5 text-[calc(var(--nav-height)*0.32)] shadow-[0_15px_45px_rgba(0,0,0,0.35)] outline-none focus-visible:*:ring-2 focus-visible:*:ring-ring"
		>
			<span
				class="recipes-pill inline-flex h-full w-full items-center justify-center whitespace-nowrap rounded-full px-[2ch] font-medium tracking-wide text-foreground/80"
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

	/* Out from under the nav, still tucked under its edge, centered below Blog. */
	.recipes-card {
		visibility: hidden;
		transition:
			transform 450ms cubic-bezier(0.22, 1, 0.36, 1),
			visibility 0s 450ms;
	}

	[data-shown] .recipes-card {
		visibility: visible;
		transform: translateY(calc(var(--nav-height) * 0.7));
		transition: transform 450ms cubic-bezier(0.22, 1, 0.36, 1) 150ms;
	}

	.recipes-pill {
		transition:
			background-color 150ms ease,
			color 150ms ease,
			box-shadow 150ms ease;
	}

	.recipes-card:hover .recipes-pill {
		color: var(--color-foreground);
	}

	/* Selected once it has slid out, and deselected before it slides back. */
	.recipes-card[aria-current] .recipes-pill {
		background-color: var(--color-primary);
		color: var(--color-primary-foreground);
		box-shadow: 0 10px 30px rgb(0 0 0 / 25%);
		transition-delay: 450ms;
	}

	[data-was-shown] .recipes-card[aria-current] .recipes-pill {
		transition-delay: 0ms;
	}

	@media (prefers-reduced-motion: reduce) {
		.recipes-card,
		[data-shown] .recipes-card,
		.recipes-pill,
		.recipes-card[aria-current] .recipes-pill {
			transition: none;
		}
	}
</style>
