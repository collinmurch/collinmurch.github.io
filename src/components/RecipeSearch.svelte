<!--
	@component
	A magnifying glass that opens into a search field while it's hovered, focused,
	or holding a search. It scales a little behind the reading text and opens to a
	set width, or to the rest of the row when that's narrower. Screen readers hear
	how many recipes match.
-->
<script>
	import Icon from "#components/Icon.svelte";

	let { query = $bindable(""), count } = $props();
</script>

<label
	class={[
		"flex h-[2.25em] cursor-pointer items-center justify-self-end overflow-hidden rounded-full border border-accent/20 bg-card/60 px-[calc(0.625em-1px)] text-[max(1rem,var(--text-prose)*0.9)] text-muted-foreground transition-[width,border-color] duration-300 ease-out focus-within:w-[min(16em,100%)] focus-within:border-accent/50 hover:w-[min(16em,100%)] hover:border-accent/35 motion-reduce:transition-none",
		query ? "w-[min(16em,100%)]" : "w-[2.25em]",
	]}
>
	<Icon name="search" class="size-[1em]" />
	<span class="sr-only">Search recipes</span>
	<input
		type="search"
		bind:value={query}
		placeholder="Search"
		class="w-full min-w-0 bg-transparent ps-[0.6em] text-foreground outline-none placeholder:text-muted-foreground/70"
	/>
</label>

<p class="sr-only" aria-live="polite">
	{query.trim() ? `${count} ${count === 1 ? "recipe" : "recipes"}` : ""}
</p>
