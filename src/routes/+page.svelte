<script>
	import Hero from "$components/Hero.svelte";
</script>

<Hero image="profile" alt="Portrait of Collin Murch">
	<div
		class="flex flex-col items-center gap-[calc(var(--portrait)*0.08)] text-primary text-shadow-soft landscape:items-start"
	>
		<h1 class="text-display font-light tracking-tight whitespace-nowrap">
			Collin Murch
		</h1>
		<p class="text-tagline font-light italic">Full stack software engineer</p>
	</div>
</Hero>
