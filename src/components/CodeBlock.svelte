<script>
	import BlockControls from "./BlockControls.svelte";
	import CopyButton from "./CopyButton.svelte";

	/**
	 * A highlighted code block from a post, with a copy button. `controls` adds
	 * buttons after the copy button.
	 */
	const { controls, children } = $props();

	let block = $state();
</script>

<div bind:this={block} class="code-block group/block relative">
	<BlockControls>
		<CopyButton
			label="Copy code"
			text={() => block.querySelector("pre code")?.innerText ?? ""}
		/>
		{@render controls?.()}
	</BlockControls>
	{@render children()}
</div>
