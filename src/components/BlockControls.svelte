<script>
	/**
	 * Holds the buttons over a code block or diagram: top right, revealed while
	 * the block is hovered or focused. The block marks itself `group/block`.
	 */
	const { children } = $props();
</script>

<div
	class="absolute top-[0.85rem] right-[0.9rem] z-1 flex -translate-y-0.5 gap-[0.35rem] opacity-0 transition duration-150 group-focus-within/block:translate-y-0 group-focus-within/block:opacity-100 group-hover/block:translate-y-0 group-hover/block:opacity-100"
>
	{@render children()}
</div>
