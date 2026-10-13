<script>
	import CopyButton from "./CopyButton.svelte";

	/**
	 * Display math from a post, with a quiet button just right of the formula
	 * that copies its TeX source. The formula's column fits the formula and stays
	 * centered between two equal side columns, so the button follows the
	 * formula's edge until a wide formula fills the column and scrolls. The
	 * button shows while the block is hovered or focused. The formula takes
	 * focus on tap (`tabindex="-1"`), like headings, so touch screens reveal the
	 * button by tapping it.
	 */
	const { tex, children } = $props();
</script>

<div
	class="math-block group/math grid grid-cols-[minmax(2.25rem,1fr)_minmax(0,max-content)_minmax(2.25rem,1fr)] items-center gap-1"
>
	<div class="math-display col-start-2 outline-none" tabindex="-1">
		{@render children()}
	</div>
	<div
		class="justify-self-start opacity-0 transition-opacity duration-150 group-focus-within/math:opacity-100 group-hover/math:opacity-100"
	>
		<CopyButton variant="quiet" label="Copy LaTeX" text={() => tex} />
	</div>
</div>
