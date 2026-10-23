<script>
	import { onMount, tick } from "svelte";
	import { enhanceDiagram } from "#lib/markdown/diagram-controls";
	import BlockControls from "./BlockControls.svelte";
	import Button from "./Button.svelte";
	import ButtonGroup from "./ButtonGroup.svelte";
	import CodeBlock from "./CodeBlock.svelte";

	/**
	 * A prerendered Mermaid diagram from a post. `children` is its viewport, and
	 * `width` and `height` are the drawing's natural size. `source` is the
	 * highlighted Mermaid, which the toggle swaps in as an ordinary `CodeBlock`.
	 */
	const { width, height, caption, source, children } = $props();

	let figure = $state();
	let showSourceButton = $state();
	let showDiagramButton = $state();
	let diagram;
	let showSource = $state(false);

	onMount(() => {
		diagram = enhanceDiagram(figure);
		return diagram.destroy;
	});

	// The figure stays mounted while hidden so zoom survives, but hiding it
	// resets its scroll, which is saved and restored around the swap. Focus
	// follows to the other view's toggle.
	async function toggleView() {
		if (!showSource) diagram?.saveScroll();
		showSource = !showSource;
		await tick();
		if (!showSource) diagram?.restoreScroll();
		(showSource ? showDiagramButton : showSourceButton)?.focus();
	}
</script>

<figure
	bind:this={figure}
	class="figure diagram group/block"
	style:--figure-width={width}
	style:--figure-height={height}
	hidden={showSource}
>
	{@render children()}
	<BlockControls>
		<ButtonGroup label="Zoom">
			<Button icon="minus" label="Zoom out" onclick={() => diagram?.zoomBy(-1)} />
			<Button icon="plus" label="Zoom in" onclick={() => diagram?.zoomBy(1)} />
			<Button icon="recenter" label="Recenter" onclick={() => diagram?.reset()} />
		</ButtonGroup>
		<Button
			icon="code"
			label="Show source"
			onclick={toggleView}
			bind:element={showSourceButton}
		/>
	</BlockControls>
	{#if caption}
		<figcaption>{caption}</figcaption>
	{/if}
</figure>

{#if showSource}
	<CodeBlock>
		{#snippet controls()}
			<Button
				icon="diagram"
				label="Show diagram"
				onclick={toggleView}
				bind:element={showDiagramButton}
			/>
		{/snippet}
		{@html source}
	</CodeBlock>
{/if}
