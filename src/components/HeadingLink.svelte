<script>
	import CopyButton from "./CopyButton.svelte";

	/**
	 * Copies a link to a post heading's section. It sits after the heading's
	 * last word without changing the line's height, and shows while the heading
	 * is hovered or focused, or the button has focus. Touch screens focus the
	 * heading by tapping it. The heading marks itself `group/heading`.
	 */
	const { id, label } = $props();
</script>

<span
	class="ms-2 inline-flex h-0 items-center align-middle opacity-0 transition-opacity duration-150 group-hover/heading:opacity-100 group-focus/heading:opacity-100 focus-within:opacity-100"
>
	<CopyButton
		variant="quiet"
		icon="link"
		{label}
		copiedLabel="Link copied"
		text={() => `${location.origin}${location.pathname}#${id}`}
	/>
</span>
